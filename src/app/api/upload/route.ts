import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { checkAuth } from "@/lib/actions";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as HandleUploadBody;

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
        } catch (e) {
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
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
            "audio/mpeg",
            "audio/mp3",
            "audio/wav",
            "audio/ogg",
            "audio/x-m4a",
            "audio/m4a",
            "video/mp4",
            "video/quicktime",
            "video/webm",
          ],
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
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
