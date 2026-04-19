
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ExploreFilters from "@/components/ExploreFilters";
import TopSearch from "./TopSearch";
import ThemeToggle from "@/components/ThemeToggle";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { Heart, UserStar } from "lucide-react";




export const revalidate = 0;

async function syncUserWithDatabase() {
  const user = await currentUser();
  if (!user) return null;

  const res = await fetch("${process.env.NEXT_PUBLIC_API_URL}/api/users/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      clerkId: user.id,
      name: `${user.firstName} ${user.lastName || ''}`.trim(),
      avatarUrl: user.imageUrl || null
    })
  });

  if (!res.ok) return null;
  return await res.json();
}

async function getExploreUsers(searchParams: any) {
  const params = new URLSearchParams();
  if (searchParams.teachSkill) params.append("teachSkill", searchParams.teachSkill);
  if (searchParams.learnSkill) params.append("learnSkill", searchParams.learnSkill);
  if (searchParams.availability) params.append("availability", searchParams.availability);

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users?${params.toString()}`, { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

export default async function ExplorePage({ searchParams }: { searchParams: Promise<any> }) {
  const resolvedParams = await searchParams;
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");

  const users = await getExploreUsers(resolvedParams);

  let userRequests: any[] = [];
  if (clerkUser) {
    const reqsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/requests/${clerkUser.id}`, { cache: 'no-store' });
    if (reqsRes.ok) userRequests = await reqsRes.json();
  }

  return (
  
  <>
    <NavBar/>
    <div className="h-screen bg-surface text-on-surface font-body antialiased flex flex-col overflow-hidden">    

      <main className="pt-24 pb-4 px-8 max-w-7xl mx-auto w-full flex flex-col flex-grow overflow-hidden">
        {/* Hero Search & Filters */}
        <section className="mb-6 shrink-0">
          <div className=" flex justify-between items-center w-full ">
            <h1 className="font-headline font-extrabold text-2xl md:text-4xl lg:text-2xl tracking-tight my-auto leading-[1.1] text-on-surface">
              Find your next <br /><span className="text-primary">knowledge partner.</span>
            </h1>

            <TopSearch />

          </div>
            <div className="flex flex-wrap gap-3 mt-8">
              <button className="px-6 py-2 bg-primary text-on-primary rounded-full font-headline font-bold text-sm tracking-wide shadow-lg shadow-primary/20 scale-95 active:scale-90 transition-transform">All</button>
              <button className="px-6 py-2 bg-surface-container-high hover:bg-surface-container-highest rounded-full font-headline font-bold text-sm tracking-wide transition-colors">Design</button>
              <button className="px-6 py-2 bg-surface-container-high hover:bg-surface-container-highest rounded-full font-headline font-bold text-sm tracking-wide transition-colors">Tech</button>
              <button className="px-6 py-2 bg-surface-container-high hover:bg-surface-container-highest rounded-full font-headline font-bold text-sm tracking-wide transition-colors">Art</button>
              <button className="px-6 py-2 bg-surface-container-high hover:bg-surface-container-highest rounded-full font-headline font-bold text-sm tracking-wide transition-colors">Music</button>
            </div>
        </section>
      

        <div className="flex flex-col lg:flex-row gap-12 flex-grow overflow-hidden">
          {/* Sidebar Filters */}
          <div className="shrink-0 overflow-y-auto custom-scrollbar pr-2 h-full pb-10">
            <ExploreFilters />
          </div>

          {/* User Grid */}
          <section className="flex-grow border-l-2 border-surface-container-high pl-4 overflow-y-auto custom-scrollbar pr-4 h-full pb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-8">

              {users.length === 0 ? (
                <div className="col-span-1 md:col-span-2 text-center py-20 bg-surface-container-lowest rounded-xl border ghost-border w-full">
                  <span className="material-symbols-outlined text-5xl text-outline-variant mb-4">search</span>
                  <h3 className="text-xl font-bold text-on-surface/60">No users found matching your filters</h3>
                </div>
              ) : (
                users.map((u: any) => {
                  if (u.clerkId === clerkUser.id) return null;

                  return (
                    <Link key={u.id} href={`/profile/${u.id}`}>
                      <div  className="group relative bg-surface-container-lowest rounded-sm p-8 hover:shadow-[0_40px_80px_-20px_rgba(70,72,212,0.12)] transition-all duration-300 flex flex-col max-h-2xl min-h-2xl  dark:border-0">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm flex items-center justify-center bg-primary/10">
                              {u.avatarUrl ? (
                                <img src={u.avatarUrl} alt={u.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="font-headline font-bold text-xl text-primary">{u.name[0]}</span>
                              )}
                            </div>
                            <div>
                              <h4 className="font-headline font-bold text-xl text-on-surface group-hover:text-primary transition-colors">{u.name}</h4>
                              <div className="flex items-center text-tertiary">
                                <span className="material-symbols-outlined text-[8px]" style={{ fontVariationSettings: "'FILL' 1" ,color:"green" , scale:"0.8" }}><UserStar/></span>
                                <span className="text-sm font-bold ml-1 text-green-700">{u.rating.toFixed(1)}</span>
                                <span className="text-xs text-outline-variant ml-2">({Math.floor(Math.random() * 100)} reviews)</span>
                              </div>
                            </div>
                          </div>
                          <span className="material-symbols-outlined text-outline-variant hover:text-error transition-colors cursor-pointer"><Heart/></span>
                        </div>

                        <div className="space-y-4 mb-4 flex-grow">
                          <div>
                            <p className="text-xs font-headline font-bold text-outline uppercase tracking-widest mb-2">Teaching</p>
                            <div className="flex flex-wrap gap-2">
                              {u.skillsOffered.length > 0 ? u.skillsOffered.map((sk: any) => (
                                <span key={sk.id} className="bg-surface-container text-on-surface-variant px-3 py-1 rounded-full text-xs font-medium">
                                  {sk.skill.name}
                                </span>
                              )) : <span className="text-xs text-on-surface-variant italic">Nothing listed</span>}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-headline font-bold text-outline uppercase tracking-widest mb-2">Learning</p>
                            <div className="flex flex-wrap gap-2">
                              {u.skillsWanted.length > 0 ? u.skillsWanted.map((sk: any) => (
                                <span key={sk.id} className="border border-outline-variant text-on-surface-variant px-3 py-1 rounded-full text-xs font-medium">
                                  {sk.skill.name}
                                </span>
                              )) : <span className="text-xs text-on-surface-variant italic">Nothing listed</span>}
                            </div>
                          </div>
                        </div>

                        {(() => {
                          const interaction = userRequests.find((r: any) => r.receiverId === u.id || r.senderId === u.id);
                          if (interaction) {
                            const label = interaction.status === 'PENDING' ? 'Pending' : interaction.status === 'ACCEPTED' ? 'Connected' : 'Unavailable';
                            return (
                              <button disabled className="w-full py-2 rounded-md bg-surface-container text-outline border ghost-border font-headline font-bold tracking-tight shadow-none opacity-80 cursor-not-allowed">
                                {label}
                              </button>
                            );
                          }
                          return (
                            <Link href={`/profile/${u.id}`} className="w-full">
                              <button className="w-full py-2 rounded-md bg-gradient-to-br from-primary to-primary-container text-on-primary font-headline font-bold tracking-tight shadow-xl shadow-primary/20 hover:shadow-primary/30 transform transition-all active:scale-95">
                                Show Interest
                              </button>
                            </Link>
                          );
                        })()}
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </main>        
    </div>
 
  </>
  );
}
