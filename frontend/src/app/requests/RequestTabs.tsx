"use client";

import { useState } from "react";
import RequestActionCard from "@/components/RequestActionCard";
import Link from "next/link";
import { MessageCircleWarning, MessageSquareWarning } from "lucide-react";

export default function RequestTabs({ incoming, outgoing, currentUserId }: { incoming: any[], outgoing: any[], currentUserId: string }) {
  const [tab, setTab] = useState<"incoming" | "outgoing">("incoming");

  const currentList = tab === "incoming" ? incoming : outgoing;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Selector */}
      <div className="flex space-x-4 mb-4 shrink-0">
        <button 
          onClick={() => setTab("incoming")}
          className={`px-6 py-2 rounded-full font-bold text-sm transition-colors ${tab === "incoming" ? "bg-primary text-white" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"}`}
        >
          Incoming ({incoming.length})
        </button>
        <button 
          onClick={() => setTab("outgoing")}
          className={`px-6 py-2 rounded-full font-bold text-sm transition-colors ${tab === "outgoing" ? "bg-primary text-white" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"}`}
        >
          Outgoing ({outgoing.length})
        </button>
      </div>

      {/* List Container - Scrollable */}
      <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 pb-20 space-y-4">
        {currentList.length === 0 ? (
          <div className="py-4 bg-surface-container-low rounded-sm border-2 border-dashed border-outline-variant/30 flex flex-col items-center justify-center text-center px-6 relative overflow-hidden">
            <div className="w-48 h-48 bg-surface-container-lowest rounded-full flex items-center justify-center mb-6 shadow-sm absolute -right-10 -top-10 ">
              <span className="material-symbols-outlined text-16xl text-outline-variant scale-400 "><MessageSquareWarning/></span>
            </div>
            <div className="abs">
              <h3 className="text-2xl font-headline font-bold text-on-surface mb-2">No {tab} requests</h3>
            <p className="text-on-surface-variant max-w-sm mb-8">
                Your queue is clear. Why not explore new skills and send out some requests of your own?
            </p>
            </div>
            <Link href="/explore">
              <button className="px-10 py-4 rounded-full bg-surface-container-lowest text-on-surface font-bold text-sm shadow-sm hover:shadow-md transition-all">
                  Explore Skills
              </button>
            </Link>
          </div>
        ) : (
          currentList.map((req: any) => (
            <RequestActionCard key={req.id} reqItem={req} currentUserId={currentUserId} />
          ))
        )}
      </div>
    </div>
  );
}
