import { handleUpload } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { checkAuth } from "@/lib/actions";

export const dynamic = "force-dynamic";

/**
 * Upload Route Handler using Vercel Blob client-side direct upload protocol.
 * This generates temporary client tokens, allowing clients to upload directly
 * to Vercel Blob, bypassing Next.js serverless payload limits (4.5MB).
 *
 * This allows uploading files up to 100MB (limit for Vercel Blob Hobby plan).
 */
export async function POST(request: Request): Promise<NextResponse> {
  const body = await request.json();

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        // 1. Extract and validate eventSlug from client-side payload
        const { eventSlug } = JSON.parse(clientPayload || "{}");
        if (!eventSlug) {
          throw new Error("Missing event slug in client payload");
        }

        // 2. Validate user auth session via cookie
        const isAuthed = await checkAuth(eventSlug);
        if (!isAuthed) {
          throw new Error("Unauthorized upload attempt");
        }

        // 3. Return the token configuration for client-side direct upload
        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
            "image/heic",
            "image/heif",
            "audio/mpeg",
            "audio/mp3",
            "audio/wav",
            "audio/ogg",
            "audio/x-m4a",
            "audio/m4a",
            "audio/mp4",
            "audio/aac",
            "video/mp4",
            "video/quicktime",
            "video/webm",
          ],
          // Vercel Blob free/hobby plan supports direct client uploads up to 100MB
          maximumSizeInBytes: 100 * 1024 * 1024,
          access: "private", // Keep access as private matching the store config
        };
      },
      onUploadCompleted: async ({ blob }) => {
        // We handle DB insertion inside the form submission flow after upload completes,
        // so we only log completion here.
        console.info("Client-side direct upload completed:", blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("Vercel Blob client token generation failed:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}
