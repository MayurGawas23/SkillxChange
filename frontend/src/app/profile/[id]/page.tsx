import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import ProfileView from "@/components/ProfileView";
import ThemeToggle from "@/components/ThemeToggle";
import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";

async function getProfileAndState(profileId: string, activeClerkId?: string) {
  // Fetch user profile
  const usersRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, { cache: 'no-store' });
  if (!usersRes.ok) return { user: null };
  const users = await usersRes.json();
  const user = users.find((u: any) => u.id === profileId);

  if (!user) return { user: null };

  // Fetch all skills
  const skillsRes = await fetch("${process.env.NEXT_PUBLIC_API_URL}/api/skills", { cache: 'no-store' });
  const allSkills = skillsRes.ok ? await skillsRes.json() : [];

  let existingRequestStatus = null;
  let activeDbUserId = null;

  if (activeClerkId) {
    // We need to fetch active clark's database ID or just use their requests endpoint
    const requestsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/requests/${activeClerkId}`, { cache: 'no-store' });
    if (requestsRes.ok) {
      const requests = await requestsRes.json();
      // Check if there is an existing interaction between the users
      const interaction = requests.find((r: any) =>
        r.receiverId === profileId || r.senderId === profileId
      );
      if (interaction) existingRequestStatus = interaction.status;
    }
  }

  return { user, allSkills, existingRequestStatus };
}

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const activeClerkUser = await currentUser();
  const { user, allSkills, existingRequestStatus } = await getProfileAndState(id, activeClerkUser?.id);

  if (!user) return <div className="p-8 text-center text-on-surface">User not found.</div>;

  const isOwner = activeClerkUser?.id === user.clerkId;

  return (
    <>
      <NavBar />
      <div className="max-h-screen bg-surface font-body selection:bg-primary-fixed selection:text-primary custom-scrollbar text-on-surface">


        <ProfileView
          user={user}
          allSkills={allSkills || []}
          isOwnProfile={isOwner}
          existingRequestStatus={existingRequestStatus}
        />

      </div>

    </>
  );
}
