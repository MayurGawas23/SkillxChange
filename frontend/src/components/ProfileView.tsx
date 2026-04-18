"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SkillSelector from "@/components/SkillSelector";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Check, Handshake, Hourglass, Info, Pencil, Send } from "lucide-react";

interface ProfileViewProps {
  user: any;
  allSkills: any[];
  isOwnProfile: boolean;
  existingRequestStatus?: string | null;
}

export default function ProfileView({ user, allSkills, isOwnProfile, existingRequestStatus }: ProfileViewProps) {
  const router = useRouter();
  const { user: clerkUser } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // States for sending request (Viewer Flow)
  const [requestSending, setRequestSending] = useState(false);

  // States for editing (Owner Flow)
  const [bio, setBio] = useState(user.bio || "");
  const [availability, setAvailability] = useState(user.availability || "BOTH");
  const [teachSkills, setTeachSkills] = useState<any[]>(
    user.skillsOffered ? user.skillsOffered.map((sk: any) => sk.skill) : []
  );
  const [learnSkills, setLearnSkills] = useState<any[]>(
    user.skillsWanted ? user.skillsWanted.map((sk: any) => sk.skill) : []
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("http://localhost:4000/api/users/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerkId: user.clerkId,
          bio,
          availability,
          teachSkills: teachSkills.map((s: any) => s.id),
          learnSkills: learnSkills.map((s: any) => s.id)
        })
      });

      if (res.ok) {
        setIsEditing(false);
        router.refresh();
      } else {
        alert("Failed to save profile.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving profile");
    } finally {
      setSaving(false);
    }
  };

  const handleSendRequest = async () => {
    if (!clerkUser) return router.push("/sign-in");
    setRequestSending(true);
    try {
      const res = await fetch("http://localhost:4000/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderClerkId: clerkUser.id,
          receiverId: user.id,
          message: "Hi, I am interested in exchanging skills with you!"
        })
      });
      if (res.ok) {
        router.refresh();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to send request.");
      }
    } catch (e) {
      console.error(e);
      alert("Request failed.");
    } finally {
      setRequestSending(false);
    }
  };

  return (
    <main className="pt-25 pb-20 px-4 md:px-8 max-w-5xl mx-auto custom-scrollbar relative">
      {/* Cover Profile Header */}
      <div className=" flex  items-center justify-center rounded-sm bg-gradient-to-br  from-primary-container/20 via-surface-container to-secondary-container/20 aspect-[8/1] md:aspect-[8/1]  lg:aspect-[8/1]  overflow-hidden shadow-sm ">
        <div className=" inset-0 bg-white/20 dark:bg-black/20 backdrop-blur-[2px]"></div>

        {/* Absolute Profile Picture & Nav */}
        <div className="flex justify-center md:left-12  items-center gap-6 z-10 w-[calc(100%-3rem)] md:w-[calc(100%-6rem)]">
          <div className="  w-10 h-10 md:w-40 md:h-40 lg:w-20 lg:h-20 rounded-full border-4 border-surface shadow-xl bg-surface-container-lowest overflow-hidden shrink-0 flex items-center justify-center text-primary font-headline font-black text-5xl ">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span>{user.name && user.name.length > 0 ? user.name[0] : "?"}</span>
            )}
          </div>

          <div className="mb-4 flex-1 flex flex-col md:flex-row md:items-end lg:items-center justify-between gap-4">
            <div className=" backdrop-blur-md px-4 py-2  self-start md:self-end text-on-surface">
              <h1 className="text-2xl md:text-3xl font-headline font-black tracking-tight">{user.name}</h1>
              {/* <p className="text-sm font-medium opacity-80 mt-0.5 mb-6">Joined recently</p>   */}
            </div>

            {isOwnProfile ? (
              <button
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                disabled={saving}
                className="mt-4 md:mt-0 px-8 py-3 bg-on-surface dark:bg-on-surface text-surface dark:text-surface rounded-full font-bold text-sm tracking-wide shadow-lg hover:shadow-xl transition-all self-start md:self-end disabled:opacity-50"
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">
                    {isEditing ? <Check/> : <Pencil/>}
                  </span>
                  {saving ? "Saving..." : isEditing ? "Save Profile" : "Edit Profile"}
                </span>
              </button>
            ) : (() => {
              if (existingRequestStatus) {
                const label = existingRequestStatus === 'PENDING' ? 'Pending' : existingRequestStatus === 'ACCEPTED' ? 'Connected' : 'Unavailable';
                const icon = existingRequestStatus === 'PENDING' ? <Hourglass/> : existingRequestStatus === 'ACCEPTED' ? <Handshake/> : 'block';
                return (
                  <button
                    disabled
                    className="mt-4 md:mt-0 px-8 py-3 rounded-full font-bold text-sm tracking-wide bg-surface-container text-outline border ghost-border shadow-none opacity-80 self-start md:self-end cursor-not-allowed"
                  >
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">{icon}</span>
                      {label}
                    </span>
                  </button>
                );
              }
              return (
                <button
                  onClick={handleSendRequest}
                  disabled={requestSending}
                  className="mt-4 md:mt-0 px-8 py-3 rounded-full font-bold text-sm tracking-wide shadow-lg transition-all self-start md:self-end bg-primary text-on-primary hover:shadow-xl"
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]"><Send/></span>
                    {requestSending ? "Sending..." : "Show Interest"}
                  </span>
                </button>
              );
            })()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-12">
        <div className="lg:col-span-4 space-y-8">
          {/* <div className="bg-surface-container-lowest border ghost-border rounded-2xl p-8 custom-shadow flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-secondary-container/20 flex items-center justify-center mb-4 transition-all hover:scale-105">
              <span className="material-symbols-outlined text-secondary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
            </div>
            <h3 className="font-headline font-bold text-lg mb-1">Top Contributor</h3>
            <p className="text-sm text-outline mb-6">Excellent teacher rating based on {(user.rating || 0).toFixed(1)} stars</p>
            <div className="w-full bg-surface-container-low h-2 rounded-full overflow-hidden">
              <div className="bg-secondary h-full rounded-full w-4/5"></div>
            </div>
          </div> */}

          <div className="bg-surface-container-lowest border ghost-border rounded-2xl p-8 custom-shadow pb-10">
            <h3 className="font-headline font-bold text-lg mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-outline" style={{ fontVariationSettings: "'FILL' 1" }}><Info/></span> Info
            </h3>
            <div className="space-y-6">
              <div>
                <p className="text-xs uppercase tracking-widest font-bold text-outline mb-1">Availability</p>
                {isEditing ? (
                  <select
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    className="w-full bg-surface-container-low border-none rounded-lg text-sm font-medium py-3 px-4 outline-none"
                  >
                    <option value="ONLINE">Online</option>
                    <option value="OFFLINE">Offline / In-person</option>
                    <option value="BOTH">Flexible</option>
                  </select>
                ) : (
                  <p className="font-medium text-on-surface">{availability === "BOTH" ? "Flexible (Online & Offline)" : availability === "ONLINE" ? "Online only" : "Offline only"}</p>
                )}
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest font-bold text-outline mb-1">Location</p>
                <p className="font-medium text-on-surface-variant flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span> Everywhere
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          {/* About Section */}
          <section>
            <h2 className="font-headline font-extrabold text-2xl tracking-tight  text-on-surface">About Me</h2>
            {isEditing ? (
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-surface-container-low border-none rounded-sm px-5 py-1 min-h-[50px] outline-none text-on-surface custom-scrollbar"
                placeholder="Tell others about yourself..."
              />
            ) : (
              <p className="text-lg leading-relaxed text-on-surface opacity-90 max-w-3xl whitespace-pre-wrap ml-3">
                {user.bio || "No bio added yet."}
              </p>
            )}
          </section>

          {/* Specialization & Skills */}
          <section>
            {/* <h2 className="font-headline font-extrabold text-2xl tracking-tight mb-8 text-on-surface">Exchange Portfolio</h2> */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Teaching */}
              <div className="bg-primary/5 rounded-3xl p-8 border border-primary/10">
                <h3 className="font-headline font-bold text-xl mb-2 text-primary">Skills I Teach</h3>
                <p className="text-sm text-outline mb-6">Things I'm proficient at and can mentor others on.</p>

                {isEditing ? (
                  <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 shadow-sm">
                    <SkillSelector
                      label=""
                      availableSkills={allSkills}
                      selectedSkills={teachSkills}
                      onChange={setTeachSkills}
                      maxLimit={5}
                    />
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {teachSkills.map(s => (
                      <span key={s.id} className="bg-primary text-on-primary px-4 py-2 rounded-full text-[13px] font-bold shadow-sm">{s.name}</span>
                    ))}
                    {teachSkills.length === 0 && <span className="text-sm text-outline italic">None selected</span>}
                  </div>
                )}
              </div>

              {/* Learning */}
              <div className="bg-secondary/5 rounded-3xl p-8 border border-secondary/10">
                <h3 className="font-headline font-bold text-xl mb-2 text-secondary">Skills I Want to Learn</h3>
                <p className="text-sm text-outline mb-6">Things I'm looking to pick up from the community.</p>

                {isEditing ? (
                  <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 shadow-sm">
                    <SkillSelector
                      label=""
                      availableSkills={allSkills}
                      selectedSkills={learnSkills}
                      onChange={setLearnSkills}
                      maxLimit={5}
                    />
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {learnSkills.map(s => (
                      <span key={s.id} className="bg-surface-container border ghost-border px-4 py-2 rounded-full text-[13px] font-bold text-on-surface-variant hover:border-outline/50 transition-colors cursor-default">{s.name}</span>
                    ))}
                    {learnSkills.length === 0 && <span className="text-sm text-outline italic">None selected</span>}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
