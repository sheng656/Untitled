import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import * as dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

if (!process.env.DATABASE_URL) {
  console.error("Error: DATABASE_URL is not set in environment variables.");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle({ client: sql, schema });

async function main() {
  console.log("Starting database seed...");

  // 1. Insert Event
  console.log("Inserting Duanwu Event...");
  const eventResult = await db
    .insert(schema.events)
    .values({
      slug: "2026-duanwu",
      name: "首届“滋兰之九畹”大赛",
      intro: `名余曰正则兮，字余曰灵均。\n纷吾既有此内美兮，又重之以修能。\n\n6月20号，Untitled读书群将举办本群首届“滋兰之九畹”大赛。\n\n请分享任何属于您自己的美的东西（如诗词、美食、穿搭、绘画、音乐等），大家将送上挚诚的掌声与祝福。`,
      dateStart: new Date("2026-06-20T17:45:00+12:00"),
      dateEnd: new Date("2026-06-20T21:00:00+12:00"),
      locationName: "Cox's Bay Pavilion",
      locationAddress: "40 Kingsley Street, Westmere, Auckland 1022",
      isActive: true,
    })
    .onConflictDoNothing()
    .returning();

  let event = eventResult[0];

  if (!event) {
    console.log("Duanwu event already exists in DB. Retrieving it...");
    const existing = await db
      .select()
      .from(schema.events)
      .where(eq(schema.events.slug, "2026-duanwu"))
      .limit(1);
    event = existing[0];
  }

  if (!event) {
    throw new Error("Could not find or create event '2026-duanwu'.");
  }

  console.log(`Event ready: ${event.name} (${event.id})`);

  // 2. Insert Sample Submissions if none exist yet
  const existingSubmissions = await db
    .select()
    .from(schema.submissions)
    .where(eq(schema.submissions.eventId, event.id))
    .limit(1);

  if (existingSubmissions.length === 0) {
    console.log("Inserting sample submissions...");
    await db.insert(schema.submissions).values([
      {
        eventId: event.id,
        authorName: "屈子",
        type: "poetry",
        title: "《离骚》节选",
        contentText: "长太息以掩涕兮，哀民生之多艰。\n亦余心之所善兮，虽九死其犹未悔。",
        note: "哀民生之多艰，九死而不悔。",
      },
      {
        eventId: event.id,
        authorName: "灵均",
        type: "poetry",
        title: "《橘颂》节选",
        contentText: "后皇嘉树，橘徕服兮。\n受命不迁，生南国兮。\n深固难徙，更壹志兮。",
        note: "橘之贞志，深固难徙，更壹志兮。",
      },
      {
        eventId: event.id,
        authorName: "雅集客",
        type: "other",
        title: "朝饮坠露，夕餐落英",
        contentText: "朝饮木兰之坠露兮，夕餐秋菊之落英。\n在这个特别的端午佳节里，愿我们共享读书的宁静与美好。",
        note: "祝群友们端午安康！",
      },
    ]);
    console.log("Sample submissions successfully inserted.");
  } else {
    console.log("Submissions already exist for this event. Skipping sample insertions.");
  }

  console.log("Database seed completed successfully!");
}

// Helper eq since we need it for selecting
import { eq } from "drizzle-orm";

main().catch((err) => {
  console.error("Database seed failed:", err);
  process.exit(1);
});
