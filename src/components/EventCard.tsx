import Link from "next/link";
import { EventWithSubmissionCount } from "@/types";

interface EventCardProps {
  event: EventWithSubmissionCount;
}

export default function EventCard({ event }: EventCardProps) {
  const startDate = new Date(event.dateStart);
  
  // Active if is_active is true. We can also show "进行中" if date range matches
  const isOngoing = event.isActive;

  const formattedDate = startDate.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group block relative p-6 bg-paper border border-mist hover:border-ink/40 rounded-xl transition duration-300 ease-out hover:bg-paper-dark hover:shadow-sm"
    >
      {isOngoing && (
        <span className="absolute top-4 right-4 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-cinnabar/10 text-cinnabar border border-cinnabar/25 animate-pulse">
          进行中
        </span>
      )}
      <div className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-xl font-bold font-serif text-ink group-hover:text-cinnabar transition duration-200">
            {event.name}
          </h3>
          <p className="text-xs text-ink-light">
            {formattedDate} · {event.locationName}
          </p>
        </div>
        
        <p className="text-sm text-ink-light line-clamp-3 leading-relaxed whitespace-pre-wrap italic font-serif opacity-85">
          {event.intro}
        </p>

        <div className="pt-3 border-t border-mist/60 flex justify-between items-center text-xs text-ink-light">
          <span>收录作品：<strong className="text-ink font-semibold">{event.submissionCount}</strong> 件</span>
          <span className="font-serif text-cinnabar font-semibold group-hover:translate-x-1 transition-transform duration-200">
            入林观礼 →
          </span>
        </div>
      </div>
    </Link>
  );
}
