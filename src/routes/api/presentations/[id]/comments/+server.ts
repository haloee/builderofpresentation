import type { RequestHandler } from "./$types";
import { db } from "$lib/server/db";
import { eq, and } from "drizzle-orm";
import {
  presentationComments,
  presentationPermissions,
  presentations,
  users
} from "$lib/server/db/schema";

/**
 * POST /api/presentations/[id]/comments
 * Új komment hozzáadása egy prezentációhoz
 */
export const POST: RequestHandler = async ({ request, params, locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const userId = locals.user.id;
  const presentationId = params.id;
  const { content } = await request.json();

  if (!content || content.trim().length === 0) {
    return new Response(JSON.stringify({ error: "A komment nem lehet üres" }), { status: 400 });
  }

  // Jogosultságellenőrzés (owner vagy megosztott)
  const hasPermission = await db.query.presentationPermissions.findFirst({
    where: and(
      eq(presentationPermissions.presentationId, presentationId),
      eq(presentationPermissions.userId, userId)
    )
  });

  const isOwner = await db.query.presentations.findFirst({
    where: eq(presentations.id, presentationId),
    columns: { ownerId: true }
  });

  if (!hasPermission && isOwner?.ownerId !== userId) {
    return new Response(JSON.stringify({ error: "Nincs jogosultság kommentelni" }), { status: 403 });
  }

  const newComment = {
    id: crypto.randomUUID(),
    presentationId,
    userId,
    content
  };

  await db.insert(presentationComments).values(newComment);

  return new Response(JSON.stringify({ success: true, comment: newComment }), {
    status: 201
  });
};

/**
 * GET /api/presentations/[id]/comments
 * Kommentek lekérése időrendi sorrendben
 */
/*export const GET: RequestHandler = async ({ params }) => {
  const presentationId = params.id;

  const comments = await db
    .select()
    .from(presentationComments)
    .where(eq(presentationComments.presentationId, presentationId))
    .orderBy(presentationComments.createdAt);

  return new Response(JSON.stringify({ comments }), {
    headers: { "Content-Type": "application/json" }
  });
};*/
export const GET: RequestHandler = async ({ params }) => {
  const presentationId = params.id;

  const comments = await db
    .select({
      id: presentationComments.id,
      presentationId: presentationComments.presentationId,
      userId: presentationComments.userId,
      username: users.username,               // ⬅️ EZT IS KÉRJÜK LE
      content: presentationComments.content,
      createdAt: presentationComments.createdAt
    })
    .from(presentationComments)
    .innerJoin(users, eq(users.id, presentationComments.userId))   // ⬅️ JOIN users
    .where(eq(presentationComments.presentationId, presentationId))
    .orderBy(presentationComments.createdAt);

  return new Response(JSON.stringify({ comments }), {
    headers: { "Content-Type": "application/json" }
  });
};
