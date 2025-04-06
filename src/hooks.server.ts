import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
  // Példa: Hardcoded user az egyszerű teszteléshez
  event.locals.user = {
    id: "11111111-1111-1111-1111-111111111111", // Cseréld le egy valódi ID-re
  };

  return await resolve(event);
};
