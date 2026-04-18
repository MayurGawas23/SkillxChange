import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import RequestTabs from "./RequestTabs";
import ThemeToggle from "@/components/ThemeToggle";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { Wallet } from "lucide-react";

export const revalidate = 0;

async function getRequests(clerkId: string) {
  const res = await fetch(`http://localhost:4000/api/requests/${clerkId}`, { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

export default async function RequestsPage() {
  const user = await currentUser();
  if (!user) return redirect("/sign-in");

  const requests = await getRequests(user.id);
  const incoming = requests.filter((r: any) => r.sender.clerkId !== user.id);
  const outgoing = requests.filter((r: any) => r.sender.clerkId === user.id);
  
  // Some simple stats
  const pendingCount = requests.filter((r: any) => r.status === 'PENDING' && r.sender.clerkId !== user.id).length;
  const acceptedCount = requests.filter((r: any) => r.status === 'ACCEPTED').length;

  return (
  <>
    <NavBar/>
    <div className="h-screen overflow-hidden flex flex-col bg-surface font-body selection:bg-primary-fixed selection:text-primary text-on-surface">
      {/* TopNavBar */}

      <main className="pt-24 pb-4 px-6 max-w-7xl mx-auto w-full flex flex-col flex-grow overflow-hidden">
        {/* Editorial Header */}
        <header className="mb-6 shrink-0 mt-4">
          <h1 className="text-3xl font-headline font-extrabold tracking-tight leading-[1.1] mb-2 text-on-surface">
            Exchange Center
          </h1>
          <p className="text-on-surface-variant text-lg max-w-2xl leading-relaxed">
            Manage your skill trades.
          </p>
        </header>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-grow overflow-hidden pb-4">
          
          <div className="lg:col-span-8 overflow-hidden h-full"> 
            <RequestTabs incoming={incoming} outgoing={outgoing} currentUserId={user.id} />
          </div>

          <div className="lg:col-span-4 shrink-0 overflow-y-auto hidden lg:block pr-2 mt-12"> 
            <div className="bg-surface-container-low p-8 rounded-sm">
              <h4 className="text-on-surface font-headline font-bold mb-6">Status Summary</h4>
              <ul className="space-y-4">
                <li className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-sm">
                    <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                    <span className="text-on-surface-variant">Pending Incoming</span>
                  </div>
                  <span className="font-bold text-on-surface">{pendingCount.toString().padStart(2, '0')}</span>
                </li>
                <li className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-sm">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span className="text-on-surface-variant">Accepted Swaps</span>
                  </div>
                  <span className="font-bold text-on-surface">{acceptedCount.toString().padStart(2, '0')}</span>
                </li>
                <li className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-sm">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    <span className="text-on-surface-variant">Completed This Month</span>
                  </div>
                  <span className="font-bold text-on-surface">18</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
    </>
  );
}
