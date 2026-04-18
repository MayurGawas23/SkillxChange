"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "use-debounce";
import { Funnel } from "lucide-react";

export default function ExploreFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [availability, setAvailability] = useState(searchParams.get("availability") || "ALL");
  const [teachSkill, setTeachSkill] = useState(searchParams.get("teachSkill") || "");
  const [debouncedTeach] = useDebounce(teachSkill, 500);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let changed = false;

    if (debouncedTeach !== (params.get("teachSkill") || "")) {
      if (debouncedTeach) params.set("teachSkill", debouncedTeach);
      else params.delete("teachSkill");
      changed = true;
    }

    if (availability !== (params.get("availability") || "ALL")) {
      if (availability !== "ALL") params.set("availability", availability);
      else params.delete("availability");
      changed = true;
    }

    if (changed) {
      router.replace(`/explore?${params.toString()}`, { scroll: false });
    }
  }, [debouncedTeach, availability, router]);

  return (
    <aside className="w-full lg:w-64 flex-shrink-0">
      <div className="sticky top-32 space-y-10">
        <div>
          <h3 className="font-headline font-bold text-lg mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary"><Funnel/></span> Filters
          </h3>
          <div className="space-y-8">
            <div className="group">
              <label className="block font-headline font-bold text-sm uppercase tracking-widest text-outline mb-4">Location</label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group/item">
                  <div className="w-5 h-5 rounded border-2 border-primary flex items-center justify-center">
                    <div className="w-2.5 h-2.5 bg-primary rounded-sm"></div>
                  </div>
                  <span className="text-sm font-medium">Remote Only / Online</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block font-headline font-bold text-sm uppercase tracking-widest text-outline mb-4">Availability</label>
              <select 
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="w-full bg-surface-container-lowest border-none rounded-lg text-sm font-medium py-3 px-4 focus:ring-1 focus:ring-primary/40 outline-none cursor-pointer"
              >
                <option value="ALL">Anytime</option>
                <option value="ONLINE">Online</option>
                <option value="OFFLINE">Offline</option>
                <option value="BOTH">Flexible</option>
              </select>
            </div>
            <div>
              <label className="block font-headline font-bold text-sm uppercase tracking-widest text-outline mb-4">Skills I Teach</label>
              <div className="flex flex-col gap-2">
                <input 
                  type="text" 
                  value={teachSkill}
                  onChange={(e) => setTeachSkill(e.target.value)}
                  placeholder="Filter by skill..."
                  className="w-full bg-surface-container-lowest border-none rounded-lg text-sm font-medium py-2 px-4 focus:ring-1 focus:ring-primary/40 outline-none"
                />
              </div>
            </div>
          </div>
        </div>      
      </div>
    </aside>
  );
}
