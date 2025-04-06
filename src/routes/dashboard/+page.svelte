<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";

  let presentations = [];

  async function fetchPresentations() {
    const res = await fetch("/api/presentations");
    const data = await res.json();
    presentations = data.presentations;
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

  function openPresentation(id) {
    goto(`/editor/${id}`);
  }

  onMount(fetchPresentations);
</script>

<section class="min-h-screen bg-gray-100 p-6 flex justify-center items-center">
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
        <div class="p-5 bg-white border border-gray-300 rounded-xl shadow-lg cursor-pointer hover:bg-gray-50 transition transform hover:scale-105"
          on:click={() => openPresentation(presentation.id)}>
          <h3 class="text-lg font-semibold text-gray-700">{presentation.title}</h3>
        </div>
      {/each}
    </div>
  </div>
</section>
