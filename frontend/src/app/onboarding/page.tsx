"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser, UserButton } from "@clerk/nextjs";
import SkillSelector, { type Skill } from "@/components/SkillSelector";

export default function OnboardingPage() {
  const { user } = useUser();
  const router = useRouter();
  
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [availability, setAvailability] = useState("BOTH");
  const [loading, setLoading] = useState(false);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [teachSkills, setTeachSkills] = useState<Skill[]>([]);
  const [learnSkills, setLearnSkills] = useState<Skill[]>([]);

  useEffect(() => {
    fetch("${process.env.NEXT_PUBLIC_API_URL}/api/skills")
      .then(res => res.json())
      .then(data => setAvailableSkills(data))
      .catch(err => console.error("Failed to load skills", err));
  }, []);

  async function handleComplete() {
    if (!user) return;
    setLoading(true);

    // Call a backend endpoint to finalize onboarding
    try {
      const res = await fetch("${process.env.NEXT_PUBLIC_API_URL}/api/users/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerkId: user.id,
          bio,
          location,
          availability,
          teachSkills: teachSkills.map((s) => s.id),
          learnSkills: learnSkills.map((s) => s.id)
        })
      });

      if (res.ok) {
        router.push("/explore");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-surface-container-low font-sans flex items-center justify-center p-4">
      <nav className="fixed w-full z-50 top-0 left-0 bg-surface/80 backdrop-blur-[20px] px-8 py-4 flex items-center justify-between border-b ghost-border">
        <div className="font-heading font-bold text-xl text-primary tracking-tight">
          SkillxChange
        </div>
        <UserButton />
      </nav>

      <div className="max-w-xl w-full bg-surface-container-lowest rounded-[2rem] p-8 custom-shadow border ghost-border mt-16">
        <h1 className="font-heading text-3xl font-bold text-on-surface mb-2">Welcome, {user.firstName}!</h1>
        <p className="text-on-surface/60 mb-8">Let's set up your profile so others can find you.</p>

        <div className="space-y-6">
          <SkillSelector 
            label="What skills can you teach?" 
            availableSkills={availableSkills} 
            selectedSkills={teachSkills} 
            onChange={setTeachSkills} 
            maxLimit={5}
          />
          
          <SkillSelector 
            label="What skills do you want to learn?" 
            availableSkills={availableSkills} 
            selectedSkills={learnSkills} 
            onChange={setLearnSkills} 
            maxLimit={5}
          />

          <div>
            <label className="block text-sm font-semibold text-on-surface mb-2">Bio</label>
            <textarea 
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell others about yourself and what you're passoniate about..."
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-4 text-on-surface focus:ring-2 focus:ring-primary/50 outline-none"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-on-surface mb-2">Location (Optional)</label>
            <input 
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. San Francisco, CA or Remote"
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-full px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/50 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-on-surface mb-2">Availability</label>
            <select 
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-full px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/50 outline-none"
            >
              <option value="BOTH">Both Online & Offline</option>
              <option value="ONLINE">Online Only</option>
              <option value="OFFLINE">In-Person Only</option>
            </select>
          </div>

          <button 
            onClick={handleComplete}
            disabled={loading}
            className="w-full bg-primary text-white font-bold py-4 rounded-full mt-8 hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Saving Profile..." : "Complete Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}
