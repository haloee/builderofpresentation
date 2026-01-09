import { d as db, p as presentations, s as slides } from "../../../../../chunks/schema.js";
import { eq } from "drizzle-orm";
async function GET(event) {
  const id = event.params.id ?? "";
  if (!id) {
    return new Response(JSON.stringify({ error: "Invalid Presentation ID" }), { status: 400 });
  }
  const presentation = await db.select().from(presentations).where(eq(presentations.id, id)).limit(1);
  const slideData = await db.select().from(slides).where(eq(slides.presentationId, id));
  if (!presentation.length) {
    return new Response(JSON.stringify({ error: "Presentation not found" }), { status: 404 });
  }
  return new Response(JSON.stringify({ presentation: presentation[0], slides: slideData }), {
    headers: { "Content-Type": "application/json" }
  });
}
export {
  GET
};
