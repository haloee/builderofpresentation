<script>
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { marked } from "marked";
  import { tick } from "svelte";

  let slides = [];
  let isLoading = true;
  let errorMessage = null;
  

  async function fetchSlides() {
  const presentationId = $page.params.id;

  if (!presentationId) {
    console.error("❌ HIBA: A presentationId hiányzik!");
    errorMessage = "Nem található a prezentáció azonosító!";
    isLoading = false;
    return;
  }

  console.log(`📌 Diák lekérése: http://localhost:3000/api/presentations/${presentationId}/slides`);

  try {
    const res = await fetch(`http://localhost:3000/api/presentations/${presentationId}/slides`);
    if (!res.ok) {
      const errorData = await res.json();
      console.error("⚠️ API hiba:", errorData);
      errorMessage = `Hiba történt a diák lekérésekor: ${errorData.error}`;
      isLoading = false;
      return;
    }

    const data = await res.json();
    slides = data.slides;
    isLoading = false;

    await tick(); // ⏳ várjuk meg, hogy a DOM renderelje a {#each} blokkokat

    const Reveal = (await import("reveal.js")).default;
    await Reveal.initialize({
      controls: true,
      progress: true,
      slideNumber: true,
      history: true,
      transition: "slide",
      width: 1280,
      height: 800,
      margin: 0.05,
      center: true
    });

    Reveal.sync(); // 🧠 ha a render utáni frissítés kell

  } catch (error) {
    console.error("⚠️ Hálózati hiba:", error);
    errorMessage = "Nem sikerült kapcsolódni a szerverhez!";
    isLoading = false;
  }
}

  onMount(fetchSlides);
</script>

<!-- 📌 REVEAL.JS STÍLUSOK -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js/dist/reveal.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js/dist/theme/white.css">

<section class="presentation-container">
  <h2 class="h3">Prezentáció nézet</h2>
  <button on:click={() => window.location.reload()} class="btn btn-secondary">
    Frissítés
  </button>
</section>

<!-- 📌 DIÁK MEGJELENÍTÉSE REVEAL.JS-EL -->
{#if isLoading}
  <p>Betöltés...</p>
{:else if errorMessage}
  <p class="text-danger">{errorMessage}</p>
{:else}
  <div class="reveal">
    <div class="slides">
     {#each slides as slide}
    <section>
        {#if slide.imagePath}
  {#if slide.imagePath.startsWith("data:image")}
    <img src={slide.imagePath} alt="Base64 dia kép">
  {:else}
    <img src={`http://localhost:3000/images/${$page.params.id}/${slide.imagePath}`} alt="Dia kép">
  {/if}
{/if}

        {#if slide.content}
      {#if slide.content.includes("youtube.com")}
        <div class="video-container">
          <iframe width="560" height="315"
            src={"https://www.youtube.com/embed/" + slide.content.split("v=")[1]}
            title="YouTube videó"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen>
          </iframe>
        </div>
      {:else}
        <h3>{@html marked.parse(slide.content)}</h3>
      {/if}
    {/if}
    </section>
{/each}

    </div>
  </div>
{/if}

<style>
  .reveal {
    width: 100%;
    height: 68vh; /* ne fix 100vh legyen, hanem minimum annyi */
    
  }
  

  .reveal .slides section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 2rem;
  box-sizing: border-box;
  overflow: hidden;
  border: 2px dashed #888;
}

/* Kép reszponzív módon */
.reveal img {
  max-width: 100%;
  max-height: 50vh; /* max fél dia magasság */
  object-fit: contain;
  margin-bottom: 1rem;
}

/* Szöveg jól olvasható, ne törje meg az elrendezést */
.reveal h3 {
  font-size: 1.5rem;
  text-align: center;
  word-wrap: break-word;
  max-width: 100%;
  overflow-wrap: break-word;
  max-height: 40vh;
  
}

  .presentation-container {
    text-align: center;
    margin-bottom: 20px;
    
  }
  
  .video-container {
    position: relative;
    padding-bottom: 56.25%;
    height: 0;
    overflow: hidden;
  }

  .video-container iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }



</style>
