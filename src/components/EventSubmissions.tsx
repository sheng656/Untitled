"use client";

import React, { useState } from "react";
import { Submission } from "@/types";
import TypeFilter from "./TypeFilter";
import SubmissionCard from "./SubmissionCard";

interface EventSubmissionsProps {
  submissions: Submission[];
}

export default function EventSubmissions({ submissions }: EventSubmissionsProps) {
  const [activeType, setActiveType] = useState("all");

  const filteredSubmissions = submissions.filter((sub) => {
    if (activeType === "all") return true;
    return sub.type === activeType;
  });

  return (
    <div className="space-y-8">
      <TypeFilter activeType={activeType} onTypeChange={setActiveType} />

      {filteredSubmissions.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-mist/80 rounded-xl bg-paper-dark/15 space-y-2">
          <p className="text-sm font-serif text-ink-light">此类别下暂无作品</p>
          <p className="text-xs text-ink-light/60">期待您的精美分享，静候佳音...</p>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6 [column-fill:_balance]">
          {filteredSubmissions.map((sub) => (
            <SubmissionCard key={sub.id} submission={sub} />
          ))}
        </div>
      )}
    </div>
  );
}
