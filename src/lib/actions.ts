"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { events, submissions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { submissionSchema, passwordSchema } from "./validators";

export async function checkAuth(eventSlug: string): Promise<boolean> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(`yaji_auth_${eventSlug}`);
  return authCookie?.value === "true";
}

export async function verifyPassword(
  eventSlug: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const rawPassword = formData.get("password") as string;
    const validated = passwordSchema.safeParse({ password: rawPassword });

    if (!validated.success) {
      return { success: false, error: "请输入口令" };
    }

    const { password } = validated.data;

    // Fetch the event
    const event = await db
      .select()
      .from(events)
      .where(eq(events.slug, eventSlug))
      .limit(1)
      .then((res) => res[0]);

    if (!event) {
      return { success: false, error: "活动不存在" };
    }

    let isMatch = false;
    if (event.passwordHash) {
      isMatch = await bcrypt.compare(password, event.passwordHash);
    } else {
      const defaultPassword = process.env.DEFAULT_SUBMISSION_PASSWORD || "滋兰九畹";
      isMatch = password === defaultPassword;
    }

    if (!isMatch) {
      return { success: false, error: "口令不正确" };
    }

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set({
      name: `yaji_auth_${eventSlug}`,
      value: "true",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 86400, // 24 hours
      path: "/",
      sameSite: "strict",
    });

    return { success: true };
  } catch (error) {
    console.error("Password verification error:", error);
    return { success: false, error: "验证出错，请重试" };
  }
}

export async function createSubmission(
  eventSlug: string,
  eventId: string,
  data: unknown
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Check authentication
    const isAuthed = await checkAuth(eventSlug);
    if (!isAuthed) {
      return { success: false, error: "口令已过期，请重新验证" };
    }

    // 2. Validate input
    const validated = submissionSchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "输入数据不合法",
      };
    }

    const input = validated.data;

    // 3. Insert submission
    await db.insert(submissions).values({
      eventId,
      authorName: input.authorName,
      type: input.type,
      title: input.title,
      contentText: input.contentText || null,
      mediaUrl: input.mediaUrl || null,
      mediaType: input.mediaType || null,
      note: input.note || null,
      hidden: false,
    });

    // 4. Revalidate
    revalidatePath(`/events/${eventSlug}`);

    return { success: true };
  } catch (error) {
    console.error("Create submission error:", error);
    return { success: false, error: "提交失败，请重试" };
  }
}
