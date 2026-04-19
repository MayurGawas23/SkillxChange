"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RequestActionCard({ reqItem, currentUserId }: { reqItem: any, currentUserId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const isOutgoing = reqItem.senderId === currentUserId || reqItem.sender?.clerkId === currentUserId;
  const isPending = reqItem.status === "PENDING";
  const isAccepted = reqItem.status === "ACCEPTED";
  const isRejected = reqItem.status === "REJECTED";

  const handleAction = async (status: "ACCEPTED" | "REJECTED") => {
    setLoading(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/requests/${reqItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Error updating request");
    } finally {
      setLoading(false);
    }
  };

  const otherUser = isOutgoing ? reqItem.receiver : reqItem.sender;

  return (
    <div className="bg-surface-container-lowest rounded-sm p-8 ambient-glow group hover:bg-surface-bright transition-all duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-6">
          <div className="relative flex-shrink-0">
            {otherUser?.avatarUrl ? (
              <img src={otherUser.avatarUrl} alt={otherUser.name || "User"} className="w-20 h-20 rounded-full object-cover" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center font-headline font-bold text-2xl text-primary">
                {otherUser?.name ? otherUser.name[0] : "?"}
              </div>
            )}
            <span className={`absolute bottom-1 right-1 w-4 h-4 border-2 border-white rounded-full ${isPending ? 'bg-yellow-400' : isAccepted ? 'bg-green-500' : 'bg-red-500'
              }`} title={reqItem.status}></span>
          </div>

          <div>
            <h3 className="text-xl font-headline font-bold text-on-surface">
              {isOutgoing ? `To: ${otherUser?.name}` : otherUser?.name}
            </h3>
            <p className="text-on-surface-variant text-sm mb-2">{isOutgoing ? 'Outgoing Request' : 'Incoming Request'}</p>
            <div className="flex items-center space-x-2">
              <p className="italic text-on-surface-variant leading-relaxed">
                "{reqItem.message}"
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {(!isOutgoing && isPending) ? (
            <>
              <button
                onClick={() => handleAction("REJECTED")}
                disabled={loading}
                className="px-8 py-3 rounded-full text-on-surface-variant hover:bg-surface-container-low font-semibold text-sm transition-transform active:scale-95 disabled:opacity-50"
              >
                Reject
              </button>
              <button
                onClick={() => handleAction("ACCEPTED")}
                disabled={loading}
                className="px-8 py-3 rounded-full bg-gradient-to-br from-primary to-primary-container text-on-primary font-semibold text-sm shadow-lg shadow-primary/20 transition-transform active:scale-95 disabled:opacity-50"
              >
                Accept
              </button>
            </>
          ) : (
            <span className={`font-bold text-sm px-4 py-2 rounded-full ${isAccepted ? 'text-green-600 bg-green-50' :
                isRejected ? 'text-red-600 bg-red-50' :
                  'text-yellow-600 bg-yellow-50'
              }`}>
              {isPending ? 'Pending...' : isAccepted ? 'In Progress' : 'Declined'}
            </span>
          )}
          {isAccepted && (
            <button className="p-3 rounded-full hover:bg-surface-container-low transition-colors" onClick={() => router.push('/messages')}>
              <span className="material-symbols-outlined text-on-surface-variant">chat</span>
            </button>
          )}
        </div>
      </div>
   
    </div>
  );
}
