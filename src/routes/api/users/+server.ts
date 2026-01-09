import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  try {
    const allUsers = await db.select().from(users);
    return new Response(JSON.stringify({ users: allUsers }), { status: 200 });
  } catch (error) {
    console.error("Hiba a felhasználók lekérésekor:", error);
    return new Response(JSON.stringify({ error: "Hiba történt" }), { status: 500 });
  }
};
