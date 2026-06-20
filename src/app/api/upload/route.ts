import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { checkAuth } from "@/lib/actions";

const allowedContentTypes = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  // Some devices produce HEIC/HEIF originals; these formats are uploaded as-is (no client conversion).
  // Note: many browsers cannot preview HEIC/HEIF directly, so downstream rendering may need conversion.
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

const getErrorCode = (message: string): string => {
  if (message === "Unauthorized upload request") return "AUTH_EXPIRED";
  if (message === "Invalid content type") return "UNSUPPORTED_FILE_TYPE";
  if (message === "Missing event slug") return "MISSING_EVENT_SLUG";
  if (message === "Invalid client payload") return "INVALID_CLIENT_PAYLOAD";
  return "UPLOAD_REQUEST_FAILED";
};

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as HandleUploadBody;
    if (process.env.NODE_ENV !== "production") {
      const payload = body as Record<string, unknown>;
      console.info("Upload request received", {
        contentType: payload.contentType,
        size: payload.size,
      });
    }

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        // 1. Extract the event slug from payload
        let eventSlug = "";
        try {
          if (clientPayload) {
            const payload = JSON.parse(clientPayload);
            eventSlug = payload.eventSlug || "";
          }
        } catch {
          throw new Error("Invalid client payload");
        }

        if (!eventSlug) {
          throw new Error("Missing event slug");
        }

        // 2. Validate authentication
        const isAuthed = await checkAuth(eventSlug);
        if (!isAuthed) {
          throw new Error("Unauthorized upload request");
        }

        // 3. Return allowed permissions
        return {
          allowedContentTypes,
          tokenPayload: JSON.stringify({ eventSlug }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // We handle recording in DB during form submit, so we just log here
        console.log("Blob upload completed:", blob.url, tokenPayload);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const code = getErrorCode(message);
    if (process.env.NODE_ENV !== "production") {
      console.error("Upload request failed", { code, message });
    } else {
      console.error("Upload request failed", { code });
    }

    return NextResponse.json(
      { code, error: message },
      { status: code === "AUTH_EXPIRED" ? 401 : 400 }
    );
  }
}
