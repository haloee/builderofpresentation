import { db } from '$lib/server/db';
import { presentations } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const PATCH: RequestHandler = async ({ params }) => {
  const id = params.id;

  if (!id) {
    return new Response(JSON.stringify({ error: 'Presentation ID is required' }), {
      status: 400
    });
  }

  try {
    await db.update(presentations)
      .set({ deletedAt: null }) // Visszaállítjuk az értéket null-ra
      .where(eq(presentations.id, id));

    return new Response(JSON.stringify({ success: true }), {
      status: 200
    });
  } catch (error) {
    console.error('HIBA visszaállítás közben:', error);
    return new Response(JSON.stringify({ error: 'Undelete failed' }), {
      status: 500
    });
  }
};
