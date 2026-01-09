const handle = async ({ event, resolve }) => {
  event.locals.user = {
    id: "11111111-1111-1111-1111-111111111111"
    // Cseréld le egy valódi ID-re
  };
  return await resolve(event);
};
export {
  handle
};
