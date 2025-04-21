import { db } from '$lib/server/db';
import { presentationPermissions } from '$lib/server/db/schema';
import type { RequestHandler } from './$types';
import { and, eq } from 'drizzle-orm';

export const PATCH: RequestHandler = async ({ params, request }) => {
  const presentationId = params.id;
  const userId = params.userId;
  const { permission } = await request.json();

  if (!presentationId || !userId || !permission) {
    return new Response(JSON.stringify({ error: 'Hiányzó adat' }), { status: 400 });
  }

  try {
    await db
      .update(presentationPermissions)
      .set({ permission })
      .where(
        and(
          eq(presentationPermissions.presentationId, presentationId),
          eq(presentationPermissions.userId, userId)
        )
      );

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("❌ Jogosultság módosítási hiba:", err);
    return new Response(JSON.stringify({ error: 'Nem sikerült módosítani a jogosultságot' }), {
      status: 500,
    });
  }
};
