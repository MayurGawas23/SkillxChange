"use client";

import { useState, useEffect } from "react";
import SkillSelector, { type Skill } from "./SkillSelector";

interface ProfileSkillsEditorProps {
  clerkId: string;
  isOwner: boolean;
  initialTeachSkills: { skill: Skill }[];
  initialLearnSkills: { skill: Skill }[];
}

export default function ProfileSkillsEditor({ clerkId, isOwner, initialTeachSkills, initialLearnSkills }: ProfileSkillsEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  
  const [teachSkills, setTeachSkills] = useState<Skill[]>(initialTeachSkills.map(ts => ts.skill));
  const [learnSkills, setLearnSkills] = useState<Skill[]>(initialLearnSkills.map(ls => ls.skill));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditing && availableSkills.length === 0) {
      fetch("http://localhost:4000/api/skills")
        .then(res => res.json())
        .then(data => setAvailableSkills(data))
        .catch(err => console.error(err));
    }
  }, [isEditing, availableSkills.length]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:4000/api/users/${clerkId}/skills`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teachSkills: teachSkills.map(s => s.id),
          learnSkills: learnSkills.map(s => s.id)
        })
      });
      if (res.ok) {
        setIsEditing(false);
        window.location.reload(); // Hard refresh to update server components safely
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {isOwner && (
        <div className="flex justify-end mb-6">
          {isEditing ? (
            <div className="flex gap-4">
              <button 
                onClick={() => setIsEditing(false)} 
                className="px-6 py-2 rounded-full font-bold text-on-surface hover:bg-surface-container transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                onClick={handleSave} 
                disabled={loading}
                className="bg-primary text-white px-6 py-2 rounded-full font-bold hover:scale-105 transition-transform disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Skills"}
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsEditing(true)} 
              className="bg-surface-container-high text-on-surface px-6 py-2 rounded-full font-bold hover:bg-surface-container-highest transition-colors"
            >
              Edit Skills
            </button>
          )}
        </div>
      )}

      {isEditing ? (
        <div className="bg-surface-container-lowest rounded-[2rem] p-8 custom-shadow border ghost-border space-y-8 animate-in fade-in slide-in-from-bottom-2">
          <SkillSelector 
            label="Skills you can teach"
            availableSkills={availableSkills}
            selectedSkills={teachSkills}
            onChange={setTeachSkills}
            maxLimit={5}
          />
          <SkillSelector 
            label="Skills you want to learn"
            availableSkills={availableSkills}
            selectedSkills={learnSkills}
            onChange={setLearnSkills}
            maxLimit={5}
          />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          {/* TEACH */}
          <div className="bg-surface-container-lowest rounded-[2rem] p-8 custom-shadow border ghost-border">
            <h2 className="font-heading text-xl font-bold mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">✓</span>
              Can Teach
            </h2>
            <div className="space-y-4">
              {teachSkills.map((skillObj: any) => (
                <div key={skillObj.id} className="p-4 rounded-xl bg-surface-container-low border ghost-border">
                  <h3 className="font-bold text-primary mb-1">{skillObj.name}</h3>
                </div>
              ))}
              {teachSkills.length === 0 && <p className="text-on-surface/50">No skills listed</p>}
            </div>
          </div>

          {/* LEARN */}
          <div className="bg-surface-container-lowest rounded-[2rem] p-8 custom-shadow border ghost-border">
            <h2 className="font-heading text-xl font-bold mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-secondary/10 text-secondary flex items-center justify-center text-sm">💡</span>
              Wants to Learn
            </h2>
            <div className="space-y-4">
              {learnSkills.map((skillObj: any) => (
                <div key={skillObj.id} className="p-4 rounded-xl bg-surface-container-low border ghost-border">
                  <h3 className="font-bold text-secondary mb-1">{skillObj.name}</h3>
                </div>
              ))}
              {learnSkills.length === 0 && <p className="text-on-surface/50">No skills listed</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
