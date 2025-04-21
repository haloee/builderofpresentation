import { db } from '$lib/server/db';
import { presentations, presentationPermissions } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
  const userId = locals.user?.id;

  if (!userId) {
    return new Response(JSON.stringify({ error: 'Nincs bejelentkezett felhasználó!' }), {
      status: 401,
    });
  }

  try {
    const shared = await db
      .select({
        id: presentations.id,
        title: presentations.title,
        ownerId: presentations.ownerId,
        permission: presentationPermissions.permission,
      })
      .from(presentationPermissions)
      .innerJoin(presentations, eq(presentations.id, presentationPermissions.presentationId))
      .where(eq(presentationPermissions.userId, userId));

    return new Response(JSON.stringify({ sharedPresentations: shared }), {
      status: 200,
    });
  } catch (err) {
    console.error("Hiba a megosztott prezentációk lekérésekor:", err);
    return new Response(JSON.stringify({ error: 'Szerver hiba' }), { status: 500 });
  }
};
