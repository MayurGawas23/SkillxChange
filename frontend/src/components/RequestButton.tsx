"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function RequestButton({ receiverId }: { receiverId: string }) {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleRequest = async () => {
    if (!user) return router.push("/sign-in");
    
    setLoading(true);
    try {
      const res = await fetch("http://localhost:4000/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderClerkId: user.id,
          receiverId,
          message: "I would love to exchange skills with you!"
        })
      });
      
      if (!res.ok) {
        const error = await res.json();
        alert(error.error || "Failed to send request");
        return;
      }
      
      setSuccess(true);
      setTimeout(() => router.push("/requests"), 1500);
    } catch (err) {
      console.error(err);
      alert("Network error.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <button disabled className="bg-green-500 text-white px-12 py-5 rounded-[3rem] font-bold text-lg opacity-80 cursor-not-allowed">
        Request Sent!
      </button>
    );
  }

  return (
    <button 
      onClick={handleRequest}
      disabled={loading}
      className={`bg-gradient-primary text-white px-12 py-5 rounded-[3rem] font-bold text-lg hover:scale-[0.98] transition-all duration-300 shadow-[0_0_40px_rgba(70,72,212,0.3)] ${loading ? "opacity-70" : ""}`}
    >
      {loading ? "Sending..." : "Request Skill Exchange"}
    </button>
  );
}
