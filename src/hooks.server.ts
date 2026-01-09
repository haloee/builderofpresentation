import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
  // Példa: Hardcoded user az egyszerű teszteléshez
  event.locals.user = {
    id: "2b7d0eaf-842f-4cf0-8456-bd2cf0b3659e", 
  };

  return await resolve(event);
};