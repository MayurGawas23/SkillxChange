"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "use-debounce";
import { Search, SearchCheck } from "lucide-react";

export default function TopSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [learnSkill, setLearnSkill] = useState(searchParams.get("learnSkill") || "");
  const [debouncedLearn] = useDebounce(learnSkill, 500);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (debouncedLearn !== (params.get("learnSkill") || "")) {
      if (debouncedLearn) params.set("learnSkill", debouncedLearn);
      else params.delete("learnSkill");
      router.replace(`/explore?${params.toString()}`, { scroll: false });
    }
  }, [debouncedLearn, router]);

  return (
    <div className="relative group flex  max-w-3xl w-full h-12">
      <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
        <span className="material-symbols-outlined text-outline"><Search/></span>
      </div>
      <input 
        type="text"
        value={learnSkill}
        onChange={(e) => setLearnSkill(e.target.value)}
        className="w-full pl-16 pr-8 py-2 bg-surface-container-lowest border-none rounded-xl text-lg focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all duration-300 placeholder:text-outline-variant outline-none" 
        placeholder="What do you want to learn?" 
      />
    </div>
  );
}
