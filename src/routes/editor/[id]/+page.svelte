<script>
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import PrezentacioView from "./PrezentacioView.svelte";
  import { marked } from "marked";
  import { goto } from '$app/navigation';
  import Tooltip from "$lib/components/Tooltip.svelte";
  import { tick } from "svelte";
  let slides = [];
  let newSlideType = "text";
  let showPresentation = false;
  let saveTimeouts = new Map(); // Egyedi mentési időzítők a diákhoz
  let allUsers = [];
  let selectedUserId = "";
  let selectedPermission = "read";
  let hasEditPermission = true;
  let showSharePanel=false;
  let comments = [];
  let newComment = "";
  let commentsVisible = false;
  let isLoadingComments = false;
  let errorLoadingComments = "";
  let folderPath = ""; // 📌 A kiválasztott mappa elérési útvonala
  let userSearch = "";
  let showUserList = false;
  let highlightedIndex = -1;
  let toggleViewBtn;
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
        
// ✅ Jogosultság lekérdezése
        try {
          const permissionRes = await fetch(`http://localhost:5173/api/presentations/${presentationId}/permission`);
          if (permissionRes.ok) {
            const permData = await permissionRes.json();
            hasEditPermission = permData.permission === "edit";
            console.log("🎯 Jogosultság:", permData.permission);
          } else {
            console.warn("⚠️ Nem sikerült lekérni a jogosultságot.");
            hasEditPermission = false;
          }
        } catch (err) {
          console.error("❌ Jogosultság lekérési hiba:", err);
          hasEditPermission = false;
        }
    } catch (error) {
        console.error("⚠️ Hálózati hiba:", error);
        alert("Nem sikerült kapcsolódni a szerverhez!");
    }
}



  onMount(async () => {
  await fetchSlides();
  await fetchUsers();
  await fetchComments();
});
 onMount(async () => {
    const shouldReopen = sessionStorage.getItem('reopenPresentation');
    if (shouldReopen === '1') {
      sessionStorage.removeItem('reopenPresentation');
      await tick(); // a DOM már készen van

      // robusztus auto-kattintás (ha a ref még nem él, várunk egy frame-et)
      const clickWhenReady = () => {
        if (toggleViewBtn) {
          toggleViewBtn.click(); // mintha a felhasználó nyomta volna meg
        } else {
          requestAnimationFrame(clickWhenReady);
        }
      };
      clickWhenReady();
    }
  });
async function fetchUsers() {
  try {
    const res = await fetch("/api/users");
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    allUsers = data.users;
  } catch (err) {
    console.error("❌ Felhasználók betöltése sikertelen:", err);
  }
}
async function sharePresentation() {
  const presentationId = $page.params.id;
  if (!presentationId || !selectedUserId || !selectedPermission) {
    alert("Hiányzó mezők a megosztáshoz.");
    return;
  }

  try {
    const res = await fetch(`/api/presentations/${presentationId}/share`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: selectedUserId,
        permission: selectedPermission
      })
    });

    if (!res.ok) {
      const error = await res.text();
      console.error("❌ Megosztási hiba:", error);
      alert("Nem sikerült megosztani a prezentációt.");
      return;
    }

    alert("✅ Prezentáció megosztva!");
  } catch (err) {
    console.error("⚠️ Hiba megosztás közben:", err);
    alert("Nem sikerült csatlakozni a szerverhez.");
  }
}
async function fetchComments() {
  const presentationId = $page.params.id;
  if (!presentationId) return;

  isLoadingComments = true;
  try {
    const res = await fetch(`/api/presentations/${presentationId}/comments`);
    const data = await res.json();
    comments = data.comments;
  } catch (err) {
    console.error("⚠️ Hiba a kommentek lekérdezésekor:", err);
    errorLoadingComments = "Nem sikerült betölteni a kommenteket.";
  } finally {
    isLoadingComments = false;
  }
}

async function postComment() {
  const presentationId = $page.params.id;
  if (!newComment.trim()) return;

  const res = await fetch(`/api/presentations/${presentationId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: newComment }),
  });

  if (res.ok) {
    newComment = "";
    await fetchComments(); // Frissítés
  } else {
    const errText = await res.text();
    console.error("❌ Komment hiba:", errText);
    alert("Nem sikerült elküldeni a kommentet.");
  }
}
function toggleComments() {
  commentsVisible = !commentsVisible;
  if (commentsVisible) fetchComments();
}
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
      content: ["text", "text-image", "video-text"].includes(newSlideType) ? "Új szöveg" :  null,
      videoPath: ["video", "video-text"].includes(newSlideType)
    ? "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    : null,
      imagePath: ["image", "image-text"].includes(newSlideType)
       ? "default.png" : newSlideType === "image-base64" ? "BASE64_PLACEHOLDER" : null
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

function goToDashboard() {
  goto('/dashboard');
}

// Szűrt lista (case-insensitive)
$: filteredUsers = userSearch
  ? allUsers.filter(u => u.username.toLowerCase().includes(userSearch.toLowerCase()))
  : allUsers;

// Bemenet változásakor töröljük a korábbi kiválasztást (nehogy rossz user maradjon)
function onUserInput(e) {
  userSearch = e.target.value;
  selectedUserId = "";
  showUserList = true;
  highlightedIndex = -1;
}

function chooseUser(user) {
  selectedUserId = user.id;
  userSearch = user.username;
  showUserList = false;
}

function onUserKeydown(e) {
  if (!showUserList) showUserList = true;

  if (e.key === "ArrowDown") {
    e.preventDefault();
    highlightedIndex = Math.min(highlightedIndex + 1, filteredUsers.length - 1);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    highlightedIndex = Math.max(highlightedIndex - 1, 0);
  } else if (e.key === "Enter") {
    e.preventDefault();
    if (filteredUsers[highlightedIndex]) {
      chooseUser(filteredUsers[highlightedIndex]);
    }
  } else if (e.key === "Escape") {
    showUserList = false;
  }
}

// Egyszerű “kívül kattintásra zárás” blur-rel (kis késleltetéssel, hogy a klikk be tudjon futni)
function closeListSoon() {
  setTimeout(() => (showUserList = false), 120);
}

async function copyToClipboard(text) {
    try {
      if ("clipboard" in navigator) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      console.log("📋 Másolva:", text);
    } catch (e) {
      console.error("❌ Másolási hiba:", e);
      alert("Nem sikerült a másolás a vágólapra.");
    }
  }
async function handlePresentationRefresh() {
    // (opcionális) frissítsd az editor nézet adatait is
    await fetchSlides();     // ha az editor is használja ugyanazt a listát

    // 1) vissza a szerkesztő nézetre
    showPresentation = false;
    await tick();

    // 2) “kattintás” a Prezentáció nézet gombra (vissza)
    toggleViewBtn?.click();
    // Ha szeretnéd, itt is hívhatsz fetchSlides()-t vagy hagyd a PrezentacioView-ra,
    // mert az onMount-ban amúgy is újra lekéri.
  }
</script>

<section class="container my-4">
  <!-- ✅ RESZPONZÍV fejléc: a gombok mobilon w-full, egymás alatt; desktopon egy sorban -->
<div class="editor-header flex flex-wrap items-center gap-3 md:gap-4 mb-4">
  <h2 class="h3 w-full sm:w-auto">Prezentáció szerkesztő</h2>

  <div class="ms-auto flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
    <button
      bind:this={toggleViewBtn}
      class="btn btn-primary w-full sm:w-auto"
      on:click={() => (showPresentation = !showPresentation)}
    >
      {showPresentation ? "Szerkesztő nézet" : "Prezentáció nézet"}
    </button>

    <button
      class="btn btn-outline-primary w-full sm:w-auto"
      on:click={() => (showSharePanel = !showSharePanel)}
      aria-expanded={showSharePanel}
      aria-controls="share-panel"
    >
      Prezentáció megosztása
    </button>
  </div>

  {#if showSharePanel}
    <!-- ✅ Megosztó panel: mobilon teljes szélesség, középre igazítva -->
    <div
      id="share-panel"
      class="card w-full sm:max-w-lg mt-1 p-3 border border-primary/60 shadow rounded mx-auto"
    >
      <h5 class="text-primary fw-bold mb-3">Prezentáció megosztása</h5>

      <!-- Mezők: mobilon egymás alatt, sm+ két oszlop -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <!-- Felhasználó kereső -->
        <div class="relative">
          <label class="form-label">Felhasználó:</label>
          <input
            type="text"
            class="form-control"
            placeholder="Kezdj el gépelni"
            value={userSearch}
            on:input={onUserInput}
            on:keydown={onUserKeydown}
            on:focus={() => (showUserList = true)}
            on:blur={closeListSoon}
            autocomplete="off"
          />

          {#if showUserList && filteredUsers.length > 0}
            <ul
              class="position-absolute w-100 bg-white border rounded mt-1 shadow"
              style="z-index: 50; max-height: 240px; overflow-y: auto;"
              role="listbox"
            >
              {#each filteredUsers as user, i}
                <li
                  role="option"
                  aria-selected={i === highlightedIndex}
                  class="px-3 py-2 cursor-pointer {i === highlightedIndex ? 'bg-primary text-white' : 'bg-white'}"
                  on:mousedown={() => chooseUser(user)}
                >
                  {user.username}
                </li>
              {/each}
            </ul>
          {:else if showUserList && userSearch.trim().length > 0}
            <div
              class="position-absolute w-100 bg-white border rounded mt-1 shadow px-3 py-2 text-muted"
              style="z-index: 50;"
            >
              Nincs találat
            </div>
          {/if}

          {#if selectedUserId}
            <div class="form-text mt-1">
              Kiválasztott: {allUsers.find(u => u.id === selectedUserId)?.username}
            </div>
          {/if}
        </div>

        <!-- Jogosultság -->
        <div>
          <label class="form-label">Jogosultság:</label>
          <select bind:value={selectedPermission} class="form-select w-full">
            <option value="read">Csak olvasás</option>
            <option value="edit">Szerkesztés</option>
          </select>
        </div>
      </div>

      <!-- Akciógombok: mobilon w-full -->
      <div class="flex flex-col sm:flex-row gap-2 justify-end mt-3">
        <button
          class="btn btn-primary w-full sm:w-auto"
          on:click={sharePresentation}
          disabled={!selectedUserId || !selectedPermission}
        >
          Megosztás
        </button>
        <button class="btn btn-secondary w-full sm:w-auto" on:click={() => (showSharePanel = false)}>
          Mégse
        </button>
      </div>
    </div>
  {/if}
</div>


  {#if !showPresentation}
  <!-- ✅ RESZPONZÍV akciósor -->
  <div class="editor-actions flex flex-wrap items-center gap-3 md:gap-4 mb-4">
    <!-- Vissza -->
    <button
      class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition w-full sm:w-auto"
      on:click={goToDashboard}
    >
      Vissza a dashboardra
    </button>

    <!-- Típusválasztó -->
    <div class="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
      <label for="slideType" class="form-label mb-0">Dia típusa:</label>
      <select id="slideType" bind:value={newSlideType} class="form-select w-full sm:w-56">
        <option value="text">Csak szöveg</option>
        <option value="video">Csak videó (YouTube)</option>
        <option value="image-base64">Kép és szöveg</option>
      </select>
    </div>

    <!-- Fő akciók: mobilon egymás alatt, desktopon jobbra -->
    <div class="md:ms-auto flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
      <button
        class="btn btn-success w-full sm:w-auto"
        on:click={addSlide}
        disabled={!hasEditPermission}
      >
        Új dia hozzáadása
      </button>

      <button
        class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded w-full sm:w-auto"
        on:click={toggleComments}
      >
        {commentsVisible ? "Kommentek elrejtése" : "Kommentek megjelenítése"}
      </button>
    </div>
  </div>

  <!-- ✅ A komment panel külön blokkban, teljes szélességen -->
  {#if commentsVisible}
    <div class="mt-2 sm:mt-3 p-4 bg-white border rounded shadow">
      <h3 class="text-xl font-bold mb-4">Kommentek</h3>

      {#if isLoadingComments}
        <p>Betöltés...</p>
      {:else if errorLoadingComments}
        <p class="text-red-500">{errorLoadingComments}</p>
      {:else if comments.length === 0}
        <p>Még nincs komment ehhez a prezentációhoz.</p>
      {:else}
        <div class="max-h-52 overflow-y-auto pr-2 border rounded-md">
          <ul class="space-y-4 px-2 py-2">
            {#each comments as comment}
              <li class="border-b pb-2">
                <div class="text-sm text-gray-600">
                  {comment.username ?? comment.userId} – {new Date(comment.createdAt).toLocaleString()}
                </div>
                <div class="text-md text-gray-800 whitespace-pre-wrap">{comment.content}</div>
              </li>
            {/each}
          </ul>
        </div>
      {/if}

      <div class="mt-4">
        <textarea
          bind:value={newComment}
          placeholder="Írj egy kommentet..."
          rows="3"
          class="w-full p-2 border rounded mb-2"
        ></textarea>
        <button
          on:click={postComment}
          class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full sm:w-auto"
        >
          Komment küldése
        </button>
      </div>
    </div>
  {/if}





    

<div class="btn-group ms-2 flex-wrap" style="gap: 4px">


<Tooltip variant="dark" text={`Félkövér: **[szöveg]**
A gomb kimásolja a megfelelő karaktereket,
csak Ctrl+V kell megnyomni a szöveg mezőben`}>
    <button type="button" class="btn btn-outline-secondary btn-sm" disabled={!hasEditPermission}
      on:click={() => copyToClipboard('**[szöveg]**')}>B</button>
  </Tooltip>

  <Tooltip variant="dark" text={`Dőlt: _[szöveg]_
A gomb kimásolja a megfelelő karaktereket,
csak Ctrl+V kell megnyomni a szöveg mezőben`}>
    <button type="button" class="btn btn-outline-secondary btn-sm" disabled={!hasEditPermission}
      on:click={() => copyToClipboard('_[szöveg]_')}>I</button>
  </Tooltip>

  <Tooltip variant="dark" text={`Félkövér+dőlt: ***[szöveg]***
A gomb kimásolja a megfelelő karaktereket,
csak Ctrl+V kell megnyomni a szöveg mezőben`}>
    <button type="button" class="btn btn-outline-secondary btn-sm" disabled={!hasEditPermission}
      on:click={() => copyToClipboard('***[szöveg]***')}>BI</button>
  </Tooltip>

  <Tooltip variant="dark" text={`Áthúzott: ~~[szöveg]~~
A gomb kimásolja a megfelelő karaktereket,
csak Ctrl+V kell megnyomni a szöveg mezőben`}>
    <button type="button" class="btn btn-outline-secondary btn-sm" disabled={!hasEditPermission}
      on:click={() => copyToClipboard('~~[szöveg]~~')}>S</button>
  </Tooltip>

  <Tooltip variant="dark" text={`Címsor 1: # [szöveg]
A gomb kimásolja a megfelelő karaktereket,
csak Ctrl+V kell megnyomni a szöveg mezőben`}>
    <button type="button" class="btn btn-outline-secondary btn-sm" disabled={!hasEditPermission}
      on:click={() => copyToClipboard('# [szöveg]')}>H1</button>
  </Tooltip>

  <Tooltip variant="dark" text={`Címsor 2: ## [szöveg]
A gomb kimásolja a megfelelő karaktereket,
csak Ctrl+V kell megnyomni a szöveg mezőben`}>
    <button type="button" class="btn btn-outline-secondary btn-sm" disabled={!hasEditPermission}
      on:click={() => copyToClipboard('## [szöveg]')}>H2</button>
  </Tooltip>

  <Tooltip variant="dark" text={`Címsor 3: ### [szöveg]
A gomb kimásolja a megfelelő karaktereket,
csak Ctrl+V kell megnyomni a szöveg mezőben`}>
    <button type="button" class="btn btn-outline-secondary btn-sm" disabled={!hasEditPermission}
      on:click={() => copyToClipboard('### [szöveg]')}>H3</button>
  </Tooltip>

  <Tooltip variant="dark" text={`Címsor 4: #### [szöveg]
A gomb kimásolja a megfelelő karaktereket,
csak Ctrl+V kell megnyomni a szöveg mezőben`}>
    <button type="button" class="btn btn-outline-secondary btn-sm" disabled={!hasEditPermission}
      on:click={() => copyToClipboard('#### [szöveg]')}>H4</button>
  </Tooltip>

  <Tooltip variant="dark" text={`Idézet: > [szöveg]
A gomb kimásolja a megfelelő karaktereket,
csak Ctrl+V kell megnyomni a szöveg mezőben`}>
    <button type="button" class="btn btn-outline-secondary btn-sm" disabled={!hasEditPermission}
      on:click={() => copyToClipboard('> [szöveg]')}>❝</button>
  </Tooltip>

  <Tooltip variant="dark" text={`Listaelem: - [szöveg]
A gomb kimásolja a megfelelő karaktereket,
csak Ctrl+V kell megnyomni a szöveg mezőben`}>
    <button type="button" class="btn btn-outline-secondary btn-sm" disabled={!hasEditPermission}
      on:click={() => copyToClipboard('- [szöveg]')}>•</button>
  </Tooltip>

  <Tooltip variant="dark" text={`Link: [szöveg](https://url.hu)
A gomb kimásolja a megfelelő karaktereket,
csak Ctrl+V kell megnyomni a szöveg mezőben`}>
    <button type="button" class="btn btn-outline-secondary btn-sm" disabled={!hasEditPermission}
      on:click={() => copyToClipboard('[szöveg](https://url.hu)')}>🔗</button>
  </Tooltip>

  <Tooltip variant="dark" text={`Kódrészlet: \`[szöveg]\`
A gomb kimásolja a megfelelő karaktereket,
csak Ctrl+V kell megnyomni a szöveg mezőben`}>
    <button type="button" class="btn btn-outline-secondary btn-sm" disabled={!hasEditPermission}
      on:click={() => copyToClipboard('`[szöveg]`')}>{"</>"}</button>
  </Tooltip>

  <Tooltip variant="dark" text={`Táblázat váz
A gomb kimásolja a megfelelő karaktereket,
csak Ctrl+V kell megnyomni a szöveg mezőben`}>
    <button type="button" class="btn btn-outline-secondary btn-sm" disabled={!hasEditPermission}
      on:click={() => copyToClipboard('| Fejléc 1 | Fejléc 2 |\n| --- | --- |\n| [szöveg] | [szöveg] |')}>⎇</button>
  </Tooltip>

  <Tooltip variant="dark" text={`Balra igazított blokk
A gomb kimásolja a megfelelő karaktereket,
csak Ctrl+V kell megnyomni a szöveg mezőben`}>
    <button type="button" class="btn btn-outline-secondary btn-sm" disabled={!hasEditPermission}
      on:click={() => copyToClipboard('<div style="text-align:left">[szöveg]</div>')}>L</button>
  </Tooltip>

  <Tooltip variant="dark" text={`Középre igazított blokk
A gomb kimásolja a megfelelő karaktereket,
csak Ctrl+V kell megnyomni a szöveg mezőben`}>
    <button type="button" class="btn btn-outline-secondary btn-sm" disabled={!hasEditPermission}
      on:click={() => copyToClipboard('<div style="text-align:center">[szöveg]</div>')}>C</button>
  </Tooltip>

  <Tooltip variant="dark" text={`Jobbra igazított blokk
A gomb kimásolja a megfelelő karaktereket,
csak Ctrl+V kell megnyomni a szöveg mezőben`}>
    <button type="button" class="btn btn-outline-secondary btn-sm" disabled={!hasEditPermission}
      on:click={() => copyToClipboard('<div style="text-align:right">[szöveg]</div>')}>R</button>
  </Tooltip>

      
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
        disabled={!hasEditPermission}
        on:input={() => saveSlide(slide)}
      />
      

      
      {#if slide.imagePath === "BASE64_PLACEHOLDER" || (slide.imagePath?.startsWith("data:image"))}
  <button class="btn btn-warning" on:click={() => selectImageAsBase64(slide)} disabled={!hasEditPermission}>kép feltöltés</button>
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
        <button class="btn btn-danger btn-sm" disabled={!hasEditPermission} type="button" on:click={() => deleteSlide(slide)}>
     Dia törlése
  </button>
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
      {#if hasEditPermission}
      <div class="text-end mt-2">
  
</div>
{/if}
      <textarea
        bind:value={slide.content}
        class="form-control"
        rows="4"
        disabled={!hasEditPermission}
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
