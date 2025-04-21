// src/routes/api/presentations/[id]/permission/+server.ts

import type { RequestHandler } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { presentations, presentationPermissions } from "$lib/server/db/schema";
import { eq, and } from "drizzle-orm";

export const GET: RequestHandler = async ({ params, locals }) => {
  const userId = locals.user?.id;
  const presentationId = params.id;

  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401
    });
  }

  // Először ellenőrizzük, hogy ő-e a tulajdonos
  const ownPres = await db
    .select()
    .from(presentations)
    .where(and(eq(presentations.id, presentationId ?? ""), eq(presentations.ownerId, userId)))
    .limit(1);

  if (ownPres.length > 0) {
    return new Response(JSON.stringify({ permission: "edit" }));
  }

  // Ha nem tulajdonos, nézzük meg, hogy meg van-e osztva vele
  const shared = await db
    .select()
    .from(presentationPermissions)
    .where(and(
      eq(presentationPermissions.presentationId, presentationId ?? ""),
      eq(presentationPermissions.userId, userId)
    ))
    .limit(1);

  if (shared.length > 0) {
    return new Response(JSON.stringify({ permission: shared[0].permission }));
  }

  return new Response(JSON.stringify({ permission: "none" }), {
    status: 403
  });
};
