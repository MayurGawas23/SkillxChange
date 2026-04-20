import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ProfileView from "@/components/ProfileView";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import ThemeToggle from "@/components/ThemeToggle";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

export const revalidate = 0;

async function syncAndGetUser(user: any) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      clerkId: user.id,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      avatarUrl: user.imageUrl || null
    })
  });
  if (!res.ok) return null;
  return res.json();
}

async function getAllSkills() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/skills`, { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

export default async function MyProfilePage() {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");

  const dbUser = await syncAndGetUser(clerkUser);
  if (!dbUser) redirect("/sign-in");

  const allSkills = await getAllSkills();

  return (
  <>
     <NavBar/>
    <div className="min-h-screen bg-surface font-body selection:bg-primary-fixed selection:text-primary custom-scrollbar text-on-surface">

      <ProfileView user={dbUser} allSkills={allSkills} isOwnProfile={true} />

      
    </div>
    
    </>
  );
}
