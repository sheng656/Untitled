import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventBySlug, getSubmissions } from "@/lib/queries";
import EventSubmissions from "@/components/EventSubmissions";
import InkDivider from "@/components/InkDivider";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 10; // Rapid revalidation to see submissions quickly

export default async function EventPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const submissions = await getSubmissions(event.id);

  const startDate = new Date(event.dateStart);
  const formattedDate = startDate.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedTime = startDate.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }) + " - " + new Date(event.dateEnd).toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-6 py-12 md:py-16 space-y-10 relative">
      {/* Navigation */}
      <nav>
        <Link
          href="/"
          className="text-xs font-serif text-ink-light hover:text-cinnabar transition-colors duration-200"
        >
          ← 返回历届雅集
        </Link>
      </nav>

      {/* Hero Header */}
      <header className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold font-serif text-ink">
            {event.name}
          </h1>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-light">
            <span>时间：{formattedDate} {formattedTime}</span>
            <span>·</span>
            <span>地点：{event.locationName} ({event.locationAddress})</span>
          </div>
        </div>

        {/* Poetic Intro Box */}
        <div className="p-6 bg-paper-dark/20 border-l-4 border-mist rounded-r-xl italic leading-relaxed text-sm text-ink-light whitespace-pre-wrap font-serif">
          {event.intro}
        </div>
      </header>

      <InkDivider />

      {/* Submissions Section */}
      <main className="space-y-6">
        <div className="flex justify-between items-center pb-2 border-b border-mist/40">
          <h2 className="text-lg font-bold font-serif text-ink">留痕壁</h2>
          <span className="text-xs text-ink-light font-medium">
            共收录 {submissions.length} 件佳作
          </span>
        </div>

        <EventSubmissions submissions={submissions} />
      </main>

      {/* Floating Submit Button */}
      {event.isActive && (
        <div className="fixed bottom-6 right-6 z-30">
          <Link
            href={`/events/${event.slug}/submit`}
            className="flex items-center space-x-2 px-5 py-3 rounded-full bg-cinnabar text-paper hover:bg-cinnabar-light shadow-lg hover:shadow-xl transition-all duration-300 font-serif font-bold text-sm tracking-wider cursor-pointer transform hover:-translate-y-0.5"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
            <span>分享我的美</span>
          </Link>
        </div>
      )}

      {/* Footer */}
      <footer className="pt-8 border-t border-mist/40 text-center text-[10px] text-ink-light/50 select-none">
        <p>Untitled 读书会 · 雅集存真</p>
      </footer>
    </div>
  );
}
