<script>
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import PrezentacioView from "./PrezentacioView.svelte";
  import { marked } from "marked";

  let slides = [];
  let newSlideType = "text";
  let showPresentation = false;
  let saveTimeouts = new Map(); // Egyedi mentési időzítők a diákhoz
  let folderPath = ""; // 📌 A kiválasztott mappa elérési útvonala
  // 📌 Diák lekérése az API-ból
 async function fetchSlides() {
    const presentationId = $page.params?.id;

    if (!presentationId) {
        console.error("❌ HIBA: A `presentationId` üres vagy undefined!");
        alert("Nem található a prezentáció azonosító!");
        return;
    }

    console.log(`📌 Lekérdezzük a diák listáját: http://localhost:3000/api/presentations/${presentationId}/slides`);

    try {
        // 🔹 Diák lekérése
        const res = await fetch(`http://localhost:3000/api/presentations/${presentationId}/slides`);
        if (!res.ok) {
            const errorData = await res.json();
            console.error("⚠️ API hiba:", errorData);
            alert(`Hiba történt a diák lekérésekor: ${errorData.error}`);
            return;
        }

        const data = await res.json();
        console.log("📌 Sikeres válasz a szervertől:", data);

        if (Array.isArray(data.slides)) {
            slides = [...data.slides];
        } else {
            console.error("⚠️ Váratlan API válasz:", data);
            alert("A szerver nem megfelelő formátumú adatot küldött!");
        }

        // 🔹 Mappa elérési útvonalának lekérése
        console.log(`📌 Mappa elérési út lekérése: http://localhost:3000/api/presentations/${presentationId}/folder`);
        
        const folderRes = await fetch(`http://localhost:3000/api/presentations/${presentationId}/folder`);
        if (folderRes.ok) {
            const folderData = await folderRes.json();
            folderPath = folderData.path || "";

            if (!folderPath) {
                console.warn("⚠️ Nem található mentett mappa!");
                alert("Nincs kiválasztott mappa a prezentációhoz!");
            } else {
                console.log("📂 Mentett mappa elérési útvonala:", folderPath);
            }
        } else {
            console.warn("⚠️ Nem sikerült lekérni a mappa elérési útvonalát.");
        }

        // 🔹 Automatikus képbetöltés a megfelelő mappából
        slides = slides.map(slide => ({
            ...slide,
            imagePath: slide.imagePath ? `http://localhost:3000/images/${presentationId}/${slide.imagePath}` : null
        }));

    } catch (error) {
        console.error("⚠️ Hálózati hiba:", error);
        alert("Nem sikerült kapcsolódni a szerverhez!");
    }
}



  onMount(fetchSlides);

  // 📌 Új dia hozzáadása az API-hoz
  async function addSlide() {
    const presentationId = $page.params.id;

    if (!presentationId) {
      console.error("❌ HIBA: Nincs Presentation ID!");
      alert("Nem található a prezentáció azonosító!");
      return;
    }

    const newSlide = {
      presentationId,
      content: ["text", "text-image", "video-text"].includes(newSlideType) ? "Új szöveg" : newSlideType === "video" ? "https://www.youtube.com/watch?v=dQw4w9WgXcQ" : null,
      imagePath: ["image", "image-text"].includes(newSlideType) ? "default.png" : newSlideType === "image-base64" ? "BASE64_PLACEHOLDER" : null
    };

    console.log("📌 Új dia küldése:", JSON.stringify(newSlide));

    try {
      const res = await fetch(`http://localhost:3000/api/presentations/${presentationId}/slides`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newSlide)
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("⚠️ API hiba:", errorData);
        alert(`Hiba történt a dia hozzáadásakor: ${errorData.error}`);
        return;
      }

      const data = await res.json();
      slides = [...slides, data.slide]; // 🔹 Új dia hozzáadása
    } catch (error) {
      console.error("⚠️ Hálózati hiba:", error);
      alert("Nem sikerült kapcsolódni a szerverhez!");
    }
  }

  // 📌 Automatikus mentés egyedi diákra
  function saveSlide(slide) {
    // Meglévő időzítő törlése, ha van
    if (saveTimeouts.has(slide.id)) {
      clearTimeout(saveTimeouts.get(slide.id));
    }

    // Új időzítő létrehozása
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/presentations/${slide.presentationId}/slides/${slide.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(slide),
        });

        if (!res.ok) {
          console.error("⚠️ Hiba a dia mentés közben");
        } else {
          console.log(`✅ Dia mentve: ${slide.id}`);
        }
      } catch (error) {
        console.error("⚠️ Hálózati hiba mentés közben:", error);
      }
    }, 3000);

    // Időzítő mentése a diákhoz
    saveTimeouts.set(slide.id, timeout);
  }

  async function selectFolder() {
    try {
        const dirHandle = await window.showDirectoryPicker(); // 📌 Mappa kiválasztása
        const folderPath = dirHandle.name; // Csak a mappa neve, de ez kevés!

        console.log("📌 Kiválasztott mappa:", folderPath);

        // 📌 Mappa teljes elérési útjának lekérése a szerveren keresztül
        const presentationId = $page.params?.id;
        if (!presentationId) {
            console.error("❌ HIBA: Hiányzó Presentation ID!");
            return;
        }

        // Küldjük a szervernek a kiválasztott mappa adatát
        const res = await fetch(`http://localhost:3000/api/presentations/${presentationId}/folder`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path: folderPath })
        });

        if (!res.ok) {
            const errorData = await res.json();
            console.error("⚠️ API hiba:", errorData);
            alert(`Hiba történt a mappa mentésekor: ${errorData.error}`);
            return;
        }

        console.log("✅ Mappa sikeresen elmentve az adatbázisba!");

    } catch (error) {
        console.error("⚠️ Mappa kiválasztási hiba:", error);
        alert("Nem sikerült kiválasztani a mappát!");
    }
}



async function selectImage(slide) {
  if (!folderPath) {
    alert("📂 Nincs kiválasztva mappa! Próbáld újra az oldal frissítése után.");
    return;
  }

  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*"; // Csak képfájlok engedélyezése

  input.onchange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const fileName = file.name;
      console.log("📌 Kiválasztott kép:", fileName);

      slide.imagePath = fileName; // 🔹 Csak a fájlnevet mentjük el, az elérési út már megvan
      saveSlide(slide); // 🔹 Azonnali mentés
    }
  };

  input.click(); // 🔹 Megnyitja a fájlkezelőt
}

let selectedSlide = null;

function insertMarkdown(syntax) {
  if (selectedSlide && selectedSlide.content !== null) {
    selectedSlide.content += `\n${syntax}`;
    saveSlide(selectedSlide);
  }
}


async function deleteSlide(slide) {
  if (!confirm("Biztosan törölni szeretnéd ezt a diát?")) return;

  try {
    const url = `http://localhost:3000/api/presentations/${slide.presentationId}/slides/${slide.id}`;
    const res = await fetch(url, { method: "DELETE" });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("❌ API hiba dia törlésekor:", errorText);
      alert(`Nem sikerült törölni a diát: ${res.status} - ${res.statusText}`);
      return;
    }

    console.log("✅ Dia törölve:", slide.id);
    slides = slides.filter(s => s.id !== slide.id);
  } catch (error) {
    console.error("❌ Hálózati hiba törlés közben:", error);
  }
}

async function selectImageAsBase64(slide) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";

  input.onchange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async (e) => {
      const base64 = e.target.result;

      slide.imagePath = base64;
      saveSlide(slide); // automatikusan mentjük az adatbázisba
    };

    reader.readAsDataURL(file); // <- base64 formátumúra olvasás
  };

  input.click();
}




</script>

<section class="container my-4">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <h2 class="h3">Prezentáció szerkesztő</h2>
    <button class="btn btn-primary" on:click={() => (showPresentation = !showPresentation)}>
      {showPresentation ? "Szerkesztő nézet" : "Prezentáció nézet"}
    </button>
    <button on:click={selectFolder}>📁 Mappa kiválasztása</button>
<p>Mappa: {folderPath || "Nincs kiválasztva"}</p>

  </div>

  {#if !showPresentation}
    <div class="d-flex align-items-center gap-3 mb-4">
      <label for="slideType" class="form-label mb-0">Dia típusa:</label>
      <select id="slideType" bind:value={newSlideType} class="form-select w-auto">
        <option value="text">Csak szöveg</option>
        <option value="image">Csak kép</option>
        <option value="text-image">Szöveg + Kép</option>
        <option value="image-text">Kép + Szöveg</option>
        <option value="video">Csak videó (YouTube)</option>
        <option value="video-text">Videó + Szöveg</option>
        <option value="image-base64">Kép beágyazása (Base64)</option>
      </select>
      <button class="btn btn-success" on:click={addSlide}>➕ Új dia hozzáadása</button>
    </div>
<div class="btn-group ms-2 flex-wrap" style="gap: 4px">
  <button class="btn btn-outline-secondary btn-sm" title="Félkövér például **szöveg**" on:click={() => insertMarkdown('**félkövér**')}>B</button>
  <button class="btn btn-outline-secondary btn-sm" title="dőlt például _szöveg_" on:click={() => insertMarkdown('_dőlt_')}>I</button>
  <button class="btn btn-outline-secondary btn-sm" title="áthúzott például ~~szöveg~~" on:click={() => insertMarkdown('~~áthúzott~~')}>S</button>
  <button class="btn btn-outline-secondary btn-sm" title="címsor 1 például #szöveg" on:click={() => insertMarkdown('# Címsor 1')}>H1</button>
  <button class="btn btn-outline-secondary btn-sm" title="címsor 2 például ##szöveg" on:click={() => insertMarkdown('## Címsor 2')}>H2</button>
  <button class="btn btn-outline-secondary btn-sm" title="idézet például >szöveg" on:click={() => insertMarkdown('> idézet')}>❝</button>
  <button class="btn btn-outline-secondary btn-sm" title="lista például -szöveg" on:click={() => insertMarkdown('- listaelem')}>•</button>
  <button class="btn btn-outline-secondary btn-sm" title="link például [szöveg](link)" on:click={() => insertMarkdown('[szöveg](https://url.hu)')}>🔗</button>
  <button class="btn btn-outline-secondary btn-sm" title="kódrészlet például `szöveg`" on:click={() => insertMarkdown('`kódrészlet`')}>{"</>"}</button>
</div>

    {#each slides as slide, index}
      <form class="card p-3 mb-3 shadow-sm">
        {#if slide.imagePath !== null}
  <div class="mb-2">
    <label class="form-label">Kép kiválasztása:</label>
    <div class="d-flex gap-2">
      <input
        type="text"
        bind:value={slide.imagePath}
        placeholder="Kép neve (pl. csengo.png)"
        class="form-control"
        on:input={() => saveSlide(slide)}
      />
      

      <button class="btn btn-secondary" on:click={() => selectImage(slide)}>📂</button>
      {#if slide.imagePath === "BASE64_PLACEHOLDER" || (slide.imagePath?.startsWith("data:image"))}
  <button class="btn btn-warning" on:click={() => selectImageAsBase64(slide)}>📷 Base64 feltöltés</button>
{/if}


    </div>
  </div>
{/if}


        {#if slide.content !== null}
           <div class="mb-2">
    <label class="form-label">
      {slide.imagePath === null && slide.content?.includes("youtube.com")
        ? "YouTube link:"
        : "Szöveg:"}
    </label>

    {#if slide.imagePath === null && slide.content?.includes("youtube.com")}
      <!-- YouTube link beviteli mező -->
      
      <input
        type="text"
        bind:value={slide.content}
        class="form-control"
        on:input={() => saveSlide(slide)}
        placeholder="https://www.youtube.com/..."
      />
      
    {:else}
      <!-- Markdown textarea -->
      <div class="text-end mt-2">
  <button class="btn btn-danger btn-sm" type="button" on:click={() => deleteSlide(slide)}>
    🗑️ Dia törlése
  </button>
</div>
      <textarea
        bind:value={slide.content}
        class="form-control"
        rows="4"
        on:input={() => saveSlide(slide)}
        placeholder="Írj markdown szöveget..."
      ></textarea>
      

    {/if}
  </div>
        {/if}
      </form>
    {/each}
  {:else}
    <PrezentacioView {slides} />
  {/if}
</section>

<style>
  .editor-container {
    padding: 20px;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .add-slide {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 20px;
  }

  .slide {
    border: 1px solid #ddd;
    padding: 10px;
    margin-top: 10px;
    border-radius: 8px;
  }

  .slide-image {
    max-width: 100%;
    height: auto;
  }

  .slide-text {
    font-size: 1.2em;
    color: #333;
  }
</style>
