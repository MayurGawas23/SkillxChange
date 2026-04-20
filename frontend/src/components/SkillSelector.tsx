"use client";

import { useState, useRef, useEffect } from "react";
import { X, Search } from "lucide-react";

export interface Skill {
  id: string;
  name: string;
}

interface SkillSelectorProps {
  label: string;
  availableSkills: Skill[];
  selectedSkills: Skill[];
  onChange: (skills: Skill[]) => void;
  maxLimit?: number;
}

export default function SkillSelector({ label, availableSkills, selectedSkills, onChange, maxLimit = 5 }: SkillSelectorProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filteredSkills = availableSkills.filter(skill => 
    skill.name.toLowerCase().includes(query.toLowerCase()) && 
    !selectedSkills.some(s => s.id === skill.id)
  );

  const exactMatchExists = availableSkills.some(skill => skill.name.toLowerCase() === query.trim().toLowerCase());

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (skill: Skill) => {
    if (selectedSkills.length >= maxLimit) return;
    onChange([...selectedSkills, skill]);
    setQuery("");
    setIsOpen(false);
  };

  const handleCreateNewSkill = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!query.trim() || selectedSkills.length >= maxLimit) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/skills`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ name: query.trim() })
      });
      if (res.ok) {
        const newSkill = await res.json();
        // Optimism: push to available via select
        onChange([...selectedSkills, newSkill]);
        setQuery("");
        setIsOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemove = (idToRemove: string) => {
    onChange(selectedSkills.filter(s => s.id !== idToRemove));
  };

  return (
    <div className="w-full relative" ref={wrapperRef}>
      <label className="block text-sm font-semibold text-on-surface mb-2">
        {label} <span className="text-on-surface/50 font-normal">({selectedSkills.length}/{maxLimit})</span>
      </label>
      
      {/* Search Input */}
      <div className="relative mb-3">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface/40" />
        <input 
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search or add a skill..."
          disabled={selectedSkills.length >= maxLimit}
          className="w-full bg-surface-container-low border border-outline-variant/30 rounded-full pl-11 pr-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/50 outline-none disabled:opacity-50"
        />
        
        {/* Dropdown Menu */}
        {isOpen && query && (
          <div className="absolute top-full left-0 w-full mt-2 bg-surface-container-low border ghost-border rounded-2xl shadow-lg z-50 max-h-48 overflow-y-auto">
            {filteredSkills.length > 0 && (
              filteredSkills.map(skill => (
                <button
                  key={skill.id}
                  onClick={(e) => { e.preventDefault(); handleSelect(skill); }}
                  className="w-full text-left px-4 py-3 hover:bg-primary/10 text-on-surface transition-colors first:rounded-t-2xl last:rounded-b-2xl font-medium"
                >
                  {skill.name}
                </button>
              ))
            )}
            {!exactMatchExists && query.trim() && (
              <button
                onClick={handleCreateNewSkill}
                className="w-full text-left px-4 py-3 hover:bg-primary/10 text-primary transition-colors font-bold border-t ghost-border"
              >
                + Add "{query.trim()}"
              </button>
            )}
            {filteredSkills.length === 0 && exactMatchExists && (
               <div className="px-4 py-3 text-on-surface/50 text-sm">Skill already added or unavailable.</div>
            )}
          </div>
        )}
      </div>

      {/* Selected Pills */}
      {selectedSkills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedSkills.map(skill => (
            <div key={skill.id} className="flex items-center gap-1 bg-surface-container-highest text-on-surface border ghost-border px-3 py-1.5 rounded-full text-sm font-medium animate-in fade-in zoom-in duration-200">
              {skill.name}
              <button 
                onClick={() => handleRemove(skill.id)}
                className="w-5 h-5 rounded-full hover:bg-on-surface/10 flex items-center justify-center transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
