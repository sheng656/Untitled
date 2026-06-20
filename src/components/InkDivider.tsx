import React from "react";

interface InkDividerProps {
  className?: string;
}

export default function InkDivider({ className = "" }: InkDividerProps) {
  return (
    <div className={`w-full py-2 text-ink/30 select-none ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/ink-divider.svg"
        alt="divider"
        className="w-full h-4 object-cover"
        draggable={false}
      />
    </div>
  );
}
