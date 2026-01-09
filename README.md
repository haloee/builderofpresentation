# README – Projekt futtatása (Docker + Bun + VS Code)

Ez az útmutató lépésről lépésre bemutatja:
1) a szükséges programok telepítését/ellenőrzését  
2) `.env` fájl létrehozását  
3) Docker Engine indítását és `docker compose` futtatását  
4) a projekt indítását VS Code-ban **3 terminállal** (`bun run dev`, `bun run server.ts`, `docker compose up -m`)

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

> Megjegyzés: **Visual Studio (IDE)** nem kötelező ehhez, elég a **Visual Studio Code**.

---

### 1.3 Bun
Hivatalos telepítés:  
https://bun.sh/docs/installation

**Windows (PowerShell):**
```powershell
irm https://bun.sh/install.ps1 | iex
