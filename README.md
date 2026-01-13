# README – Projekt futtatása (Docker + Bun + VS Code)

Ez az útmutató lépésről lépésre bemutatja:
1) a szükséges programok telepítését/ellenőrzését   
2) Docker Engine indítását és `docker compose` futtatását  
3) a projekt indítását VS Code-ban **3 terminállal** (`bun run dev`, `bun run server.ts`, `docker compose up -m`)

---

## 1) Szükséges alkalmazások (telepítés / letöltés)

### 1.1 Docker (Docker Engine + Docker Compose)
**Docker Desktop (Windows / macOS / Linux):**  
https://www.docker.com/products/docker-desktop/

Telepítés után indítsd el a Docker Desktopot, és várd meg, amíg fut a **Docker Engine**.

> Linuxon (ha nem Desktopot használsz): Docker Engine telepítés  
> https://docs.docker.com/engine/install/  
> Post-install (sudo nélküli docker):  
> https://docs.docker.com/engine/install/linux-postinstall/

---

### 1.2 Visual Studio Code
Letöltés:  
https://code.visualstudio.com/download



---

### 1.3 Bun
Hivatalos telepítés:  
https://bun.sh/docs/installation

## Alkalmazás indítása
1. Fusson a docker desktop.
2. tölsd le zippelve a gitről a projektet, git link:https://github.com/haloee/builderofpresentation.git
3. Csomagold ki és a benne lévő mappát másold a C meghajtóra.
4. Nyisd meg a Visual Studio Code-t
5. Kattints az Open folder-ra és keresd meg a mappát és válaszd ki.
6. Kattints jobb egérgombbal a builderofpresentation mappára és válaszd ki az Open in Integral Terminal gombot, abban az esetben ha a zipből nem a belső mappát nyitottad.
7. A terminálba elöszőr írd be, hogy docker compose up -d parancsot, ezzel létrejön az image.Fontos, hogy fusson a docker.
8. Még nyiss kétszer az előbbihez hasonlóan terminált.
9. A terminálba írd be, hogy bun i parancsot, utána bun run dev parancsot.
10. A másik terminálba írd be, hogy bun run server.ts parancsot.
11. Ha nem dob hibát sehol, akkor navigálj erre a linkre: http://localhost:5173/dashboard
