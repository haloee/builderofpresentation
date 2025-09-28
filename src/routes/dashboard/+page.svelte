<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";

  let presentations = [];
  let deletedPresentations = [];
  let sharedPresentations = [];

  async function fetchPresentations() {
    const res = await fetch("/api/presentations");
    const data = await res.json();

    presentations = data.presentations.filter(p => !p.deletedAt);
    deletedPresentations = data.presentations.filter(p => p.deletedAt);
    sharedPresentations = data.sharedWithMe;
  }

  async function createPresentation() {
    const title = prompt("Adj meg egy prezentációs címet:");
    if (!title) return;

    const res = await fetch("/api/presentations", {
      method: "POST",
      body: JSON.stringify({ title }),
      headers: { "Content-Type": "application/json" }
    });

    const data = await res.json();
    presentations = [...presentations, data.presentation];
  }

  async function deletePresentation(id) {
    const res = await fetch(`/api/presentations/${id}/delete`, {
      method: "PATCH"
    });

    if (res.ok) {
      await fetchPresentations();
    }
  }

  async function restorePresentation(id) {
    const res = await fetch(`/api/presentations/${id}/undelete`, {
      method: "PATCH"
    });

    if (res.ok) {
      await fetchPresentations();
    }
  }

  function openPresentation(id) {
    goto(`/editor/${id}`);
  }

  onMount(fetchPresentations);
</script>

<section class="min-h-screen bg-gray-100 p-6 flex justify-center items-start gap-12 flex-wrap">
  <div class="max-w-4xl w-full bg-white shadow-lg rounded-xl p-6">
    <h2 class="text-3xl font-bold text-gray-800 mb-6 text-center">Saját Projektek</h2>

    <div class="flex justify-between items-center mb-6">
      <button on:click={createPresentation}
        class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-lg transition">
        + Új Prezentáció
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each presentations as presentation}
        <div
  class="p-5 bg-white border border-gray-200 rounded-xl shadow-md transition hover:shadow-lg
         transform hover:scale-[1.01] flex flex-col min-h-[150px] w-full"
>
  <h3
    class="card-title text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 leading-tight
           break-words hyphens-auto overflow-hidden cursor-pointer"
    title={presentation.title}
    on:click={() => openPresentation(presentation.id)}
  >
    {presentation.title}
  </h3>

  <button
    class="mt-3 md:mt-auto text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded self-start"
    on:click={() => deletePresentation(presentation.id)}
  >
    Ideiglenes törlés
  </button>
</div>

      {/each}
    </div>
  </div>

  {#if deletedPresentations.length > 0}
  <div class="max-w-2xl w-full bg-red-50 border border-red-200 shadow-lg rounded-xl p-6">
    <h2 class="text-2xl font-bold text-red-800 mb-4 text-center">
      Törölt prezentációk (15 napig visszaállítható)
    </h2>

    <ul class="space-y-4">
      {#each deletedPresentations as presentation}
        <li class="p-4 bg-white rounded-lg shadow flex items-center gap-4">
          <!-- Cím: rugalmas, ellipszis -->
          <div class="flex-1 min-w-0">
            <span
              class="block text-gray-800 truncate"
              title={presentation.title}
            >
              {presentation.title}
            </span>
          </div>

          <!-- Gomb: ne zsugorodjon -->
          <button
            class="shrink-0 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            on:click={() => restorePresentation(presentation.id)}
          >
            Visszaállítás
          </button>
        </li>
      {/each}
    </ul>
  </div>
{/if}

  {#if sharedPresentations.length > 0}
  <div class="max-w-4xl w-full bg-blue-50 border border-blue-200 shadow-lg rounded-xl p-6">
    <h2 class="text-2xl font-bold text-blue-800 mb-4 text-center">
      Megosztott prezentációk
    </h2>

    <ul class="space-y-4">
      {#each sharedPresentations as pres}
        <li class="p-4 bg-white rounded-lg shadow flex justify-between items-center">
          <span class="text-gray-800">{pres.title}</span>
          <button
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            on:click={() => openPresentation(pres.id)}
          >
            Megnyitás
          </button>
        </li>
      {/each}
    </ul>
  </div>
{/if}
<style>
  /* 2 soros clamp „…”-al (modern böngészőkben támogatott) */
  .card-title {
    display: -webkit-box;
    -webkit-line-clamp: 2;      /* max 2 sor */
    -webkit-box-orient: vertical;
    text-overflow: ellipsis;
  }
</style>

</section>