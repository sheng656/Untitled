import { pgTable, text, timestamp, uuid, boolean } from "drizzle-orm/pg-core";

export const events = pgTable("events", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  intro: text("intro").notNull(),
  dateStart: timestamp("date_start", { withTimezone: true }).notNull(),
  dateEnd: timestamp("date_end", { withTimezone: true }).notNull(),
  locationName: text("location_name").notNull(),
  locationAddress: text("location_address").notNull(),
  passwordHash: text("password_hash"), // optional custom password, hashed
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const submissions = pgTable("submissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventId: uuid("event_id").references(() => events.id, { onDelete: "cascade" }).notNull(),
  authorName: text("author_name").notNull(),
  type: text("type").notNull(), // poetry, food, painting, fashion, music, other
  title: text("title").notNull(),
  contentText: text("content_text"),
  mediaUrl: text("media_url"),
  mediaType: text("media_type"),
  note: text("note"),
  hidden: boolean("hidden").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
