import { d as db, s as slides } from "../../../../../../../chunks/schema.js";
import { eq } from "drizzle-orm";
async function PUT(event) {
  try {
    const { content } = await event.request.json();
    const slideId = event.params.slideId;
    if (!slideId || !content.trim()) {
      return new Response(JSON.stringify({ error: "Slide ID and content are required" }), { status: 400 });
    }
    await db.update(slides).set({ content }).where(eq(slides.id, slideId));
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Slide Update ERROR:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
export {
  PUT
};
