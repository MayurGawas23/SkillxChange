"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import { UserButton } from "@clerk/nextjs";

export default function NavBar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Explore", href: "/explore" },
    { name: "Requests", href: "/requests" },
    { name: "Messages", href: "/messages" },
    { name: "Profile", href: "/my-profile" },
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-[0_40px_40px_rgba(0,0,0,0.04)] h-20">
      <div className="flex justify-between items-center max-w-7xl mx-auto px-8 h-full">
        
        <Link href="/" className="text-2xl font-black tracking-tighter text-zinc-900 dark:text-zinc-50 font-headline">
          SkillxChange
        </Link>

        <nav className="hidden md:flex items-center space-x-8 font-headline font-bold tracking-tight">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`pb-1 transition-all duration-300 ${
                  isActive
                    ? "text-primary dark:text-primary border-b-2 border-primary"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <UserButton />
          <div className="md:hidden">
            <span className="material-symbols-outlined text-zinc-900 dark:text-zinc-50">
              menu
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}