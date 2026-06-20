import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventBySlug } from "@/lib/queries";
import { checkAuth } from "@/lib/actions";
import SubmitPageClient from "@/components/SubmitPageClient";
import InkDivider from "@/components/InkDivider";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function SubmitPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event || !event.isActive) {
    notFound();
  }

  const isAuthed = await checkAuth(slug);

  return (
    <div className="flex-1 flex flex-col max-w-xl mx-auto w-full px-6 py-12 md:py-16 space-y-8">
      {/* Navigation */}
      <nav>
        <Link
          href={`/events/${event.slug}`}
          className="text-xs font-serif text-ink-light hover:text-cinnabar transition-colors duration-200"
        >
          ← 返回作品墙
        </Link>
      </nav>

      <header className="text-center space-y-2">
        <h1 className="text-2xl font-bold font-serif text-ink">
          {event.name} · 投稿
        </h1>
        <p className="text-xs text-ink-light leading-relaxed">
          时间：{new Date(event.dateStart).toLocaleDateString("zh-CN", { month: "short", day: "numeric" })}
          {" "}·{" "}
          地点：{event.locationName}
        </p>
      </header>

      <InkDivider />

      <main>
        <SubmitPageClient
          eventId={event.id}
          eventSlug={event.slug}
          initialAuthed={isAuthed}
        />
      </main>
    </div>
  );
}
