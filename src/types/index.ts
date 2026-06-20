import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { events, submissions } from "@/db/schema";

export type Event = InferSelectModel<typeof events>;
export type NewEvent = InferInsertModel<typeof events>;

export type Submission = InferSelectModel<typeof submissions>;
export type NewSubmission = InferInsertModel<typeof submissions>;

export type SubmissionType = "poetry" | "food" | "painting" | "fashion" | "music" | "other";

export interface EventWithSubmissionCount extends Event {
  submissionCount: number;
}
