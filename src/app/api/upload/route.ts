import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { checkAuth } from "@/lib/actions";

const allowedContentTypes = [
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
];

// Vercel Hobby plan serverless body limit is 4.5MB; keep margin for FormData overhead
const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024;

/**
 * Server-side upload route.
 * Receives the file as FormData and uses put() from @vercel/blob to upload
 * directly on the server, avoiding CORS issues that occur with client-side
 * token exchange (handleUpload + client upload()).
 *
 * On Vercel, put() authenticates via OIDC automatically using
 * VERCEL_OIDC_TOKEN + BLOB_STORE_ID — no BLOB_READ_WRITE_TOKEN needed.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const eventSlug = formData.get("eventSlug") as string | null;

    if (!eventSlug) {
      return NextResponse.json(
        { code: "MISSING_EVENT_SLUG", error: "Missing event slug" },
        { status: 400 }
      );
    }

    if (!file || file.size === 0) {
      return NextResponse.json(
        { code: "NO_FILE", error: "No file provided" },
        { status: 400 }
      );
    }

    // 1. Validate authentication via cookie
    const isAuthed = await checkAuth(eventSlug);
    if (!isAuthed) {
      return NextResponse.json(
        { code: "AUTH_EXPIRED", error: "Unauthorized upload request" },
        { status: 401 }
      );
    }

    // 2. Validate content type
    if (!allowedContentTypes.includes(file.type)) {
      return NextResponse.json(
        { code: "UNSUPPORTED_FILE_TYPE", error: `Unsupported file type: ${file.type}` },
        { status: 400 }
      );
    }

    // 3. Validate file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { code: "FILE_TOO_LARGE", error: "File exceeds 4MB server upload limit" },
        { status: 400 }
      );
    }

    // 4. Upload to Vercel Blob via server-side put()
    //    OIDC auth is resolved automatically on Vercel when BLOB_STORE_ID is set
    const blob = await put(file.name, file, {
      access: "public",
      addRandomSuffix: true,
    });

    if (process.env.NODE_ENV !== "production") {
      console.info("Server-side blob upload completed:", blob.url);
    }

    return NextResponse.json({ url: blob.url, contentType: file.type });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Server-side upload failed:", message);
    return NextResponse.json(
      { code: "UPLOAD_FAILED", error: "Upload failed, please try again" },
      { status: 500 }
    );
  }
}
