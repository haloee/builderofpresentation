<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { customFetch } from '$lib/fetcher'; //  Import custom fetch

  let users = [
    { id: '11111111-1111-1111-1111-111111111111', username: 'testuser' },
    { id: '2b7d0eaf-842f-4cf0-8456-bd2cf0b3659e', username: 'tesztfelhasznalo2' }
  ];

  let isLoading = true;
  let error = "";

  //  Felhasználók lekérése API-ból
  onMount(async () => {
    try {
      const res = await customFetch("/api/users"); 
      const data = await res.json();
      users = data.users;
    } catch (err) {
      console.error(" Nem sikerült lekérni a felhasználókat:", err);
      error = "Nem sikerült lekérni a felhasználókat.";
    } finally {
      isLoading = false;
    }
  });

  //  Kiválasztott felhasználó mentése és navigálás
  function selectUser(userId: string) {
    localStorage.setItem("userId", userId); // vagy selectedUserId
    goto("/dashboard");
  }
</script>

<section class="min-h-screen bg-gray-100 flex items-center justify-center p-6">
  <div class="bg-white shadow-xl rounded-xl max-w-xl w-full p-6">
    <h2 class="text-2xl font-bold text-center mb-6">Válassz felhasználót</h2>

    {#if isLoading}
      <p class="text-center">Betöltés...</p>
    {:else if error}
      <p class="text-center text-red-500">{error}</p>
    {:else if users.length === 0}
      <p class="text-center text-gray-500">Nincs elérhető felhasználó.</p>
    {:else}
      <ul class="space-y-3">
        {#each users as user}
          <li>
            <button
              on:click={() => selectUser(user.id)}
              class="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              {user.username}
            </button>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</section>
