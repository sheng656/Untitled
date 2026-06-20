import { get } from "@vercel/blob";

export const dynamic = "force-dynamic";

/**
 * API route to proxy requests for private Vercel Blob files.
 * Since the Blob store is configured as private, the raw URLs return 403 Forbidden.
 * This route fetches the blob securely on the server using `get(..., { access: 'private' })`
 * and streams it back to the client.
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
      return new Response("Missing url parameter", { status: 400 });
    }

    // Security check: Only allow loading from Vercel Blob storage domain
    const parsedUrl = new URL(url);
    if (!parsedUrl.hostname.endsWith(".blob.vercel-storage.com")) {
      return new Response("Forbidden: Invalid media source domain", { status: 403 });
    }

    // Fetch the private blob using server credentials
    const response = await get(url, { access: "private" });
    if (!response) {
      return new Response("Blob not found", { status: 404 });
    }

    // Stream the blob content back to the client with correct MIME type and caching
    return new Response(response.stream, {
      headers: {
        "Content-Type": response.blob.contentType || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Proxy media failed:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(`Error loading media: ${errorMessage}`, { status: 500 });
  }
}
