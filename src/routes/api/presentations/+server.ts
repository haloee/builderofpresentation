import type { RequestHandler } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { db } from "$lib/server/db";
import { presentations } from "$lib/server/db/schema";
import { presentationPermissions } from "$lib/server/db/schema";
/**
 * GET /api/presentations
 * Listázza a bejelentkezett felhasználó prezentációit
 */
export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const userId = locals.user.id;

  // Saját prezentációk lekérdezése
  const userPresentations = await db
    .select()
    .from(presentations)
    .where(eq(presentations.ownerId, userId));

  // Megosztott prezentációk lekérdezése
  const sharedWithMe = await db
    .select({
      id: presentations.id,
      title: presentations.title,
      ownerId: presentations.ownerId,
      imageFolderPath: presentations.imageFolderPath,
      createdAt: presentations.createdAt,
      deletedAt: presentations.deletedAt,
      permission: presentationPermissions.permission
    })
    .from(presentationPermissions)
    .innerJoin(presentations, eq(presentationPermissions.presentationId, presentations.id))
    .where(eq(presentationPermissions.userId, userId));

  return new Response(
    JSON.stringify({
      presentations: userPresentations,
      sharedWithMe
    }),
    { headers: { "Content-Type": "application/json" } }
  );
};

/**
 * POST /api/presentations
 * Új prezentáció létrehozása
 */
/* export const POST: RequestHandler = async ({ request, locals }) => {
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
    imageFolderPath: `/images/${crypto.randomUUID()}`, // Example value for imageFolderPath
  });

  return new Response(JSON.stringify({ success: true, presentation: newPresentation }), {
    headers: { "Content-Type": "application/json" },
  });
}; */
export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const { title } = await request.json();
  if (!title || !title.trim()) {
    return new Response(JSON.stringify({ error: "Title is required" }), { status: 400 });
  }

  const id = crypto.randomUUID();
  const imageFolderPath = `/images/${crypto.randomUUID()}`;

  // 1) beszúrás
  await db.insert(presentations).values({
    id,
    title: title.trim(),
    ownerId: locals.user.id,
    imageFolderPath
  });

  // 2) a frissen beszúrt rekord visszaolvasása
  const created = await db
    .select()
    .from(presentations)
    .where(eq(presentations.id, id))
    .limit(1);

  if (!created[0]) {
    return new Response(JSON.stringify({ error: "Insert failed" }), { status: 500 });
  }

  // 3) tényleges rekord visszaküldése
  return new Response(
    JSON.stringify({ success: true, presentation: created[0] }),
    { status: 201, headers: { "Content-Type": "application/json" } }
  );
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
