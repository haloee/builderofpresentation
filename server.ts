import { Hono } from "hono";
import fs from "fs";
import path from "path";
import { db } from "./src/lib/server/db";
import { presentations, slides } from "./src/lib/server/db/schema";
import { eq } from "drizzle-orm";
import { cors } from "hono/cors";

const app = new Hono();

// ✅ **CORS Middleware beállítása**
app.use(
    "/*",
    cors({
      origin: "*", // 🚀 Engedélyezzük a frontend elérését
      allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Engedélyezett HTTP metódusok
      allowHeaders: ["Content-Type"], // Engedélyezett fejléc
    })
  );

// 🔹 Képek kiszolgálása (Prezentációhoz tartozó képek elérése)
app.get("/images/:presentationId/:fileName", async (c) => {
    const presentationId = c.req.param("presentationId");
    const fileName = c.req.param("fileName");

    const pres = await db.select().from(presentations).where(eq(presentations.id, presentationId)).limit(1);
    if (!pres[0]) return c.text("Presentation not found", 404);

    const filePath = path.join(pres[0].imageFolderPath, fileName);
    if (fs.existsSync(filePath)) {
        const file = Bun.file(filePath);
        return new Response(await file.arrayBuffer(), {
            headers: { "Content-Type": file.type || "application/octet-stream" }
        });
    } else {
        return c.text("File not found", 404);
    }
});

// 🔹 Diák lekérése egy prezentációhoz
app.get("/api/presentations/:presentationId/slides", async (c) => {
    const presentationId = c.req.param("presentationId");

    if (!presentationId) {
        console.error("❌ HIBA: Hiányzó Presentation ID!");
        return c.json({ error: "Presentation ID is required" }, 400);
    }

    try {
        const slidesData = await db.select().from(slides).where(eq(slides.presentationId, presentationId));
        console.log("📌 Diák sikeresen lekérve:", slidesData);
        return c.json({ slides: slidesData });
    } catch (error) {
        console.error("❌ DB HIBA:", error);
        return c.json({ error: "Database error" }, 500);
    }
});




// 🔹 Dia módosítása (PUT - Automatikus mentéshez)
app.put("/api/presentations/:presentationId/slides/:slideId", async (c) => {
    const slideId = c.req.param("slideId");

    if (!slideId) return c.json({ error: "Slide ID is required" }, 400);

    try {
        const body = await c.req.json();

        console.log("🟡 PUT Body méret (karakterben):", JSON.stringify(body).length);

        const updateData: { content?: string; imagePath?: string } = {};

        if (typeof body.content === "string") {
            updateData.content = body.content;
        }
        if (typeof body.imagePath === "string") {
            updateData.imagePath = body.imagePath;
        }

        if (Object.keys(updateData).length === 0) {
            return c.json({ error: "No valid fields to update" }, 400);
        }

        await db.update(slides).set(updateData).where(eq(slides.id, slideId));
        return c.json({ success: true });

    } catch (err) {
        console.error("❌ PUT ERROR:", err);
        return c.json({ error: "Server failed to process request" }, 500);
    }
});


// 🔹 Új dia hozzáadása (POST)
app.post("/api/presentations/:presentationId/slides", async (c) => {
    const presentationId = c.req.param("presentationId");
    const { content, imagePath } = await c.req.json();

    // 📌 Ha a presentationId hiányzik
    if (!presentationId) {
        console.error("❌ HIBA: Hiányzó Presentation ID!");
        return c.json({ error: "Presentation ID is required" }, 400);
    }

    // 📌 Ha se content, se imagePath nincs elküldve
    if (content === undefined && imagePath === undefined) {
        console.error("❌ HIBA: Üres dia!");
        return c.json({ error: "At least content or imagePath are required" }, 400);
    }

    const newSlide = {
        id: crypto.randomUUID(),
        presentationId,
        content: content ?? "",
        imagePath: imagePath ?? null
    };

    try {
        await db.insert(slides).values(newSlide);
        return c.json({ slide: newSlide });
    } catch (error) {
        console.error("❌ DB HIBA:", error);
        return c.json({ error: "Database error" }, 500);
    }
});
// 🔹 **Mappa mentése az adatbázisba (POST)**
app.post("/api/presentations/:id/folder", async (c) => {
    const id = c.req.param("id");
    const { path: folderPath } = await c.req.json();

    if (!id) {
        return c.json({ error: "Presentation ID is required" }, 400);
    }
    if (!folderPath) {
        return c.json({ error: "Mappa elérési útvonala szükséges!" }, 400);
    }

    try {
        // 📌 **Valós elérési út megkeresése**
        const absolutePath = fs.realpathSync(folderPath);
        console.log(`📌 Mentett elérési út: ${absolutePath}`);

        // 📌 Módosítás az adatbázisban
        await db.update(presentations)
            .set({ imageFolderPath: absolutePath })
            .where(eq(presentations.id, id));

        return c.json({ success: true, path: absolutePath });

    } catch (error) {
        console.error("❌ DB HIBA:", error);
        return c.json({ error: "Nem sikerült elmenteni a mappa útvonalát" }, 500);
    }
});


// 🔹 Mappa elérési útvonalának lekérése (GET)
// 🔹 Mappa elérési útvonalának lekérése
app.get("/api/presentations/:id/folder", async (c) => {
    const id = c.req.param("id");

    if (!id) {
        return c.json({ error: "Presentation ID is required" }, 400);
    }

    try {
        const pres = await db.select()
            .from(presentations)
            .where(eq(presentations.id, id))
            .limit(1);

        if (!pres[0] || !pres[0].imageFolderPath) {
            return c.json({ error: "Mappa nem található" }, 404);
        }

        return c.json({ path: pres[0].imageFolderPath });

    } catch (error) {
        console.error("❌ DB HIBA:", error);
        return c.json({ error: "Nem sikerült lekérni a mappa elérési útvonalát" }, 500);
    }
});
app.get("/api/images/:presentationId/:fileName", async (c) => {
    const presentationId = c.req.param("presentationId");
    const fileName = c.req.param("fileName");

    // 🔹 Lekérjük az adatbázisból a prezentációhoz tartozó mappa elérési útvonalát
    const pres = await db.select().from(presentations).where(eq(presentations.id, presentationId)).limit(1);

    if (!pres[0] || !pres[0].imageFolderPath) {
        console.error("❌ HIBA: A prezentációhoz nem tartozik mappa!");
        return c.text("Presentation folder not found", 404);
    }

    const filePath = path.join(pres[0].imageFolderPath, fileName);

    // 🔹 Ellenőrizzük, hogy a fájl létezik-e
    if (fs.existsSync(filePath)) {
        const file = Bun.file(filePath);
        return new Response(await file.arrayBuffer(), {
            headers: { "Content-Type": file.type || "application/octet-stream" }
        });
    } else {
        console.error(`❌ HIBA: A fájl nem található: ${filePath}`);
        return c.text("File not found", 404);
    }
});

// 🔹 Dia törlése (DELETE)
// 🔹 Dia törlése
app.delete("/api/presentations/:presentationId/slides/:slideId", async (c) => {
    const slideId = c.req.param("slideId");
  
    if (!slideId) {
      return c.json({ error: "Slide ID is required" }, 400);
    }
  
    try {
      await db.delete(slides).where(eq(slides.id, slideId));
      console.log("🗑️ Dia törölve:", slideId);
      return c.json({ success: true });
    } catch (error) {
      console.error("❌ DB HIBA törlés közben:", error);
      return c.json({ error: "Nem sikerült törölni a diát" }, 500);
    }
  });
  
  app.put("/api/presentations/:presentationId/slides/:slideId", async (c) => {
    const slideId = c.req.param("slideId");
    const body = await c.req.json();

    if (!slideId) return c.json({ error: "Slide ID is required" }, 400);

    const updateData: { content?: string; imagePath?: string } = {};

    if (typeof body.content === "string") {
        updateData.content = body.content;
    }
    if (typeof body.imagePath === "string") {
        updateData.imagePath = body.imagePath;
    }

    if (Object.keys(updateData).length === 0) {
        return c.json({ error: "No valid fields to update" }, 400);
    }

    try {
        await db.update(slides).set(updateData).where(eq(slides.id, slideId));
        return c.json({ success: true });
    } catch (error) {
        console.error("❌ DB HIBA dia update közben:", error);
        return c.json({ error: "Database update failed" }, 500);
    }
});

  
  

export default app;
