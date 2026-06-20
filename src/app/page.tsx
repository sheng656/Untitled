import React from "react";
import { getEvents } from "@/lib/queries";
import EventCard from "@/components/EventCard";
import InkDivider from "@/components/InkDivider";

export const dynamic = "force-dynamic";

export default async function Home() {
  const eventsList = await getEvents();

  return (
    <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-6 py-12 md:py-20 space-y-12">
      {/* Header Section */}
      <header className="text-center space-y-4">
        <div className="inline-block border-y border-mist py-2 px-6">
          <h1 className="text-4xl md:text-5xl font-bold font-serif text-ink tracking-widest">
            Untitled · 雅集
          </h1>
        </div>
        <p className="text-sm md:text-base font-serif italic text-ink-light tracking-wide max-w-lg mx-auto">
          「 扈江离与辟芷兮，纫秋兰以为佩 」
        </p>
        <p className="text-xs text-ink-light/75 tracking-wider max-w-md mx-auto leading-relaxed">
          Untitled 读书群活动留痕之所，汇聚众友的诗词、美食、绘画、穿搭与雅兴。
        </p>
      </header>

      <InkDivider />

      {/* Events List */}
      <main className="flex-1 space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-serif text-ink border-l-2 border-orchid pl-3 leading-none">
            历届雅集
          </h2>
          <span className="text-xs text-ink-light">
            共举办 {eventsList.length} 场活动
          </span>
        </div>

        {eventsList.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-mist rounded-xl bg-paper-dark/10 space-y-3">
            <p className="text-sm font-serif text-ink-light">暂无雅集活动</p>
            <p className="text-xs text-ink-light/60">芳草萋萋，静候兰章...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {eventsList.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="pt-12 border-t border-mist/40 text-center text-[10px] text-ink-light/60 space-y-1 select-none">
        <p>© 2026 Untitled 读书群. 滋兰之九畹.</p>
        <p className="font-serif">修能内美，各展风华</p>
      </footer>
    </div>
  );
}
