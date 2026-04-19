"use client";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    
    if (!isSignedIn) {
      setIsVerifying(false);
      return;
    }

    const verifyUser = async () => {
      try {
        const res = await fetch("${process.env.NEXT_PUBLIC_API_URL}/api/users/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clerkId: user.id,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            avatarUrl: user.imageUrl || null
          })
        });
        
        if (res.ok) {
          const dbUser = await res.json();
          if (!dbUser.isOnboarded && pathname !== '/onboarding') {
            router.replace('/onboarding');
          } else if (dbUser.isOnboarded && (pathname === '/onboarding' || pathname === '/sign-in' || pathname === '/sign-up' || pathname === '/')) {
            router.replace('/explore');
          } else {
            setIsVerifying(false);
          }
        } else {
           // Fallback if backend throws
           setIsVerifying(false);
        }
      } catch (e) {
        console.error("AuthGuard sync failed", e);
        setIsVerifying(false);
      }
    };
    
    verifyUser();
  }, [isLoaded, isSignedIn, user, pathname, router]);

  // Block rendering children until we confirm onboarding status.
  // This prevents blank screens or flashing protected pages while syncing.
  if (isVerifying && isSignedIn) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-surface text-on-surface">
        <div className="animate-spin rounded-full h-12 w-12 border-t-[3px] border-primary mb-4"></div>
        <p className="font-headline font-bold text-outline uppercase tracking-widest text-sm">Synchronizing Atelier Profile...</p>
      </div>
    );
  }

  return <>{children}</>;
}
