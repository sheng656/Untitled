"use client";

import React, { useState } from "react";
import { Submission } from "@/types";
import { typeLabelMap } from "./TypeFilter";
import AudioPlayer from "./AudioPlayer";
import Lightbox from "./Lightbox";

interface SubmissionCardProps {
  submission: Submission;
}

export default function SubmissionCard({ submission }: SubmissionCardProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const typeColorMap: Record<string, string> = {
    poetry: "text-orchid border-orchid/20 bg-orchid/5",
    food: "text-[rgb(166,123,91)] border-[rgb(166,123,91)]/20 bg-[rgb(166,123,91)]/5",
    painting: "text-mugwort border-mugwort/20 bg-mugwort/5",
    fashion: "text-[rgb(196,145,142)] border-[rgb(196,145,142)]/20 bg-[rgb(196,145,142)]/5",
    music: "text-[rgb(107,127,166)] border-[rgb(107,127,166)]/20 bg-[rgb(107,127,166)]/5",
    other: "text-ink-light border-ink-light/20 bg-ink-light/5",
  };

  const isAudio = submission.mediaUrl && (
    submission.mediaType?.startsWith("audio/") || 
    submission.mediaUrl.endsWith(".mp3") || 
    submission.mediaUrl.endsWith(".wav") || 
    submission.mediaUrl.endsWith(".m4a") ||
    submission.mediaUrl.endsWith(".ogg")
  );

  const isVideo = submission.mediaUrl && (
    submission.mediaType?.startsWith("video/") || 
    submission.mediaUrl.endsWith(".mp4") || 
    submission.mediaUrl.endsWith(".mov") || 
    submission.mediaUrl.endsWith(".webm")
  );

  const isImage = submission.mediaUrl && !isAudio && !isVideo;

  return (
    <div className="flex flex-col bg-paper border border-mist p-6 rounded-xl hover:bg-paper-dark hover:border-ink/20 transition-all duration-300 break-inside-avoid">
      <div className="flex justify-between items-start mb-3">
        <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${typeColorMap[submission.type] || typeColorMap.other}`}>
          {typeLabelMap[submission.type] || "其他"}
        </span>
        <span className="text-[10px] text-ink-light">
          {new Date(submission.createdAt).toLocaleDateString("zh-CN", {
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>

      <div className="space-y-3">
        <div>
          <h4 className="text-lg font-bold font-serif text-ink leading-snug">
            {submission.title}
          </h4>
          <p className="text-xs text-ink-light mt-0.5 font-medium">
            作者：{submission.authorName}
          </p>
        </div>

        {/* Media Rendering */}
        {isImage && (
          <div className="relative mt-2 overflow-hidden rounded-lg border border-mist/40 bg-mist/10 aspect-video group cursor-zoom-in">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={submission.mediaUrl!}
              alt={submission.title}
              onClick={() => setIsLightboxOpen(true)}
              className="w-full h-full object-cover rounded-lg group-hover:scale-[1.02] transition-transform duration-300"
            />
          </div>
        )}

        {isAudio && (
          <div className="mt-2">
            <AudioPlayer src={submission.mediaUrl!} />
          </div>
        )}

        {isVideo && (
          <div className="mt-2 rounded-lg border border-mist/40 bg-black overflow-hidden aspect-video">
            <video
              src={submission.mediaUrl!}
              controls
              className="w-full h-full"
              preload="metadata"
            />
          </div>
        )}

        {/* Text Content */}
        {submission.contentText && (
          <div className={`text-sm text-ink leading-relaxed whitespace-pre-wrap ${
            submission.type === "poetry" 
              ? "font-serif text-center py-2.5 px-4 border-y border-mist/30 italic bg-paper-dark/30 rounded-xs" 
              : "font-sans"
          }`}>
            {submission.contentText}
          </div>
        )}

        {/* Note / 感言 */}
        {submission.note && (
          <div className="pt-3 border-t border-mist/40 text-xs text-ink-light italic">
            「 {submission.note} 」
          </div>
        )}
      </div>

      {isLightboxOpen && submission.mediaUrl && (
        <Lightbox
          src={submission.mediaUrl}
          alt={submission.title}
          onClose={() => setIsLightboxOpen(false)}
        />
      )}
    </div>
  );
}
