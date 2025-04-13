<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";

  let presentations = [];
  let deletedPresentations = [];

  async function fetchPresentations() {
    const res = await fetch("/api/presentations");
    const data = await res.json();

    presentations = data.presentations.filter(p => !p.deletedAt);
    deletedPresentations = data.presentations.filter(p => p.deletedAt);
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
        <div class="p-5 bg-white border border-gray-300 rounded-xl shadow-lg transition transform hover:scale-105">
          <h3 class="text-lg font-semibold text-gray-700 cursor-pointer" on:click={() => openPresentation(presentation.id)}>
            {presentation.title}
          </h3>
          <button
            class="mt-3 text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
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
      <h2 class="text-2xl font-bold text-red-800 mb-4 text-center">🗑️ Törölt prezentációk (15 napig visszaállítható)</h2>

      <ul class="space-y-4">
        {#each deletedPresentations as presentation}
          <li class="p-4 bg-white rounded-lg shadow flex justify-between items-center">
            <span class="text-gray-800">{presentation.title}</span>
            <button
              class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              on:click={() => restorePresentation(presentation.id)}
            >
               Visszaállítás
            </button>
          </li>
        {/each}
      </ul>
    </div>
  {/if}
</section>
