import type { RequestHandler } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { db } from "$lib/server/db";
import { presentations } from "$lib/server/db/schema";

/**
 * GET /api/presentations
 * Listázza a bejelentkezett felhasználó prezentációit
 */
export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const userId = locals.user.id;
  const userPresentations = await db.select().from(presentations).where(eq(presentations.ownerId, userId));

  return new Response(JSON.stringify({ presentations: userPresentations }), {
    headers: { "Content-Type": "application/json" },
  });
};

/**
 * POST /api/presentations
 * Új prezentáció létrehozása
 */
export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const { title } = await request.json();
  if (!title) {
    return new Response(JSON.stringify({ error: "Title is required" }), { status: 400 });
  }

  const newPresentation = await db.insert(presentations).values({
    id: crypto.randomUUID(),
    title,
    ownerId: locals.user.id,
  });

  return new Response(JSON.stringify({ success: true, presentation: newPresentation }), {
    headers: { "Content-Type": "application/json" },
  });
};

/**
 * DELETE /api/presentations
 * Egy prezentáció törlése
 */
export const DELETE: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const { presentationId } = await request.json();
  if (!presentationId) {
    return new Response(JSON.stringify({ error: "Presentation ID is required" }), { status: 400 });
  }

  await db.delete(presentations).where(eq(presentations.id, presentationId));

  return new Response(JSON.stringify({ success: true, message: "Prezentáció törölve." }), {
    headers: { "Content-Type": "application/json" },
  });
};
