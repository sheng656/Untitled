import { db } from "@/db";
import { events, submissions } from "@/db/schema";
import { desc, eq, sql, and } from "drizzle-orm";
import { Event, Submission, EventWithSubmissionCount } from "@/types";

export async function getEvents(): Promise<EventWithSubmissionCount[]> {
  const result = await db
    .select({
      event: events,
      submissionCount: sql<number>`cast(count(${submissions.id}) as int)`,
    })
    .from(events)
    .leftJoin(submissions, eq(events.id, submissions.eventId))
    .groupBy(events.id)
    .orderBy(desc(events.dateStart));

  return result.map((r) => ({
    ...r.event,
    submissionCount: r.submissionCount,
  }));
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
  const result = await db.select().from(events).where(eq(events.slug, slug)).limit(1);
  return result[0] || null;
}

export async function getSubmissions(
  eventId: string,
  type?: string
): Promise<Submission[]> {
  const conditions = [
    eq(submissions.eventId, eventId),
    eq(submissions.hidden, false),
  ];
  if (type && type !== "all") {
    conditions.push(eq(submissions.type, type));
  }
  return db
    .select()
    .from(submissions)
    .where(and(...conditions))
    .orderBy(desc(submissions.createdAt));
}
