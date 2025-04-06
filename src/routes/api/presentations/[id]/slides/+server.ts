import { db } from "$lib/server/db";
import { slides } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import type { RequestEvent } from "@sveltejs/kit";

/**
 * GET /api/slides?presentationId=<id>
 * Egy adott prezentációhoz tartozó diák lekérése
 */
export async function GET(event: RequestEvent) {
    const url = new URL(event.request.url);
    const presentationId = url.searchParams.get("presentationId") ?? "";
  
    if (!presentationId) {
      return new Response(JSON.stringify({ error: "Presentation ID is required" }), { status: 400 });
    }
  
    const slideData = await db.select().from(slides).where(eq(slides.presentationId, presentationId));
  
    return new Response(JSON.stringify({ slides: slideData ?? [] }), {
      headers: { "Content-Type": "application/json" },
    });
  }
  

/**
 * POST /api/slides
 * Új dia hozzáadása egy prezentációhoz
 */
export async function POST(event: RequestEvent) {
    try {
      const { presentationId, content, imagePath } = await event.request.json();
  
      if (!presentationId || (!content && !imagePath)) {
        return new Response(JSON.stringify({ error: "Presentation ID and either content or imagePath are required" }), { status: 400 });
      }
  
      const newSlide = await db.insert(slides).values({
        id: crypto.randomUUID(),
        presentationId,
        content: content ?? "",
        imagePath: imagePath ?? "",
      });
  
      return new Response(JSON.stringify({ success: true, slide: newSlide }), {
        headers: { "Content-Type": "application/json" },
      });
  
    } catch (error) {
      console.error("Slide Insert ERROR:", error);
      return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
  }
  
  export async function PUT(event: RequestEvent) {
    try {
      const { content, imagePath } = await event.request.json();
      const slideId = event.params.slideId;
  
      if (!slideId || (!content && !imagePath)) {
        return new Response(JSON.stringify({ error: "Slide ID and updated data are required" }), { status: 400 });
      }
  
      await db.update(slides).set({ content, imagePath }).where(eq(slides.id, slideId));
  
      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" },
      });
  
    } catch (error) {
      console.error("Slide Update ERROR:", error);
      return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
  }
  
/**
 * DELETE /api/slides
 * Egy dia törlése
 */
export async function DELETE(event: RequestEvent) {
  const { slideId } = await event.request.json();

  if (!slideId) {
    return new Response(JSON.stringify({ error: "Slide ID is required" }), { status: 400 });
  }

  await db.delete(slides).where(eq(slides.id, slideId));

  return new Response(JSON.stringify({ success: true, message: "Slide deleted" }), {
    headers: { "Content-Type": "application/json" },
  });
}
