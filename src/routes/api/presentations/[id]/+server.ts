import { db } from "$lib/server/db";
import { presentations, slides } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import type { RequestEvent } from "@sveltejs/kit";

/**
 * GET /api/presentations/[id]
 * Egy adott prezentáció és diák lekérése
 */
export async function GET(event: RequestEvent) {
  const id = event.params.id ?? ""; // Ha undefined, akkor üres string lesz
  if (!id) {
    return new Response(JSON.stringify({ error: "Invalid Presentation ID" }), { status: 400 });
  }

  const presentation = await db.select().from(presentations).where(eq(presentations.id, id)).limit(1);
  const slideData = await db.select().from(slides).where(eq(slides.presentationId, id));

  if (!presentation.length) {
    return new Response(JSON.stringify({ error: "Presentation not found" }), { status: 404 });
  }

  return new Response(JSON.stringify({ presentation: presentation[0], slides: slideData }), {
    headers: { "Content-Type": "application/json" }
  });
}
