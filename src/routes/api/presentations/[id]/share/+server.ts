import { db } from '$lib/server/db';
import { presentationPermissions } from '$lib/server/db/schema';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, request }) => {
  const presentationId = params.id;
  const { userId, permission } = await request.json();

  if (!presentationId || !userId || !permission) {
    return new Response(JSON.stringify({ error: 'Hiányzó adat' }), { status: 400 });
  }

  try {
    // Frissítjük vagy beszúrjuk a jogosultságot
    await db
      .insert(presentationPermissions)
      .values({
        presentationId,
        userId,
        permission,
      })
      .onDuplicateKeyUpdate({
        set: {
          permission,
        },
      });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("Megosztási hiba:", err);
    return new Response(JSON.stringify({ error: 'Nem sikerült megosztani' }), { status: 500 });
  }
};
