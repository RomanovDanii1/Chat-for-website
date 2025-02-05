## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```


# Vue + FastAPI Chat Projekt

Dieses Projekt stellt einen mehrstufigen Chat bereit, den du problemlos auf jeder Webseite einbinden kannst.  
- **Automatischer Modus**: Die Kommunikation läuft über die KI (OpenAI) oder – falls keine OpenAI-Zugangsdaten in `.env` eingetragen sind – über einen einfachen „Echo“-Bot (mit ein paar Sekunden Verzögerung).  
- **Manager-Modus**: Über `/manager` hast du Zugriff auf ein Dashboard, in dem alle aktiven Chats aufgelistet sind. Du kannst bei Bedarf in das Gespräch einsteigen und Antworten anstelle der KI verfassen.

## Überblick

1. **Frontend**:  
   - Geschrieben in Vue 3, mit Komponenten für den Nutzerchat und ein Manager-Dashboard.  
   - Zeigt standardmäßig einen Button/Widget an, über den der Chat geöffnet wird.
   - Wird als Vite-Projekt gestartet oder buildet ein Production-Bundle.

2. **Backend**:  
   - Ein FastAPI-Server (Python) stellt WebSocket-/HTTP-Endpunkte bereit und kümmert sich um die KI-Integration.  
   - Das Backend befindet sich in einem separaten Repository, das du unter folgender **[Link](https://github.com/RomanovDanii1/Chat-for-website-backend/tree/main)** kopieren kannst. Dort ist bereits ein vorkonfigurierter **Docker-Container** enthalten. Du musst lediglich die `.env`-Variablen setzen und den Container starten.

### Wichtige `.env`-Variablen (Backend)

- `OPENAI_KEY` – Dein OpenAI-API-Schlüssel  
- `ASSISTANT_ID` – Die ID deines Assistant (z.B. `assistant-xxxxxx`)  
- `DATABASE_URL` – Datenbankverbindung (z.B. `postgresql+asyncpg://user:pass@host:port/db_name`)  

**Ohne** `OPENAI_KEY` und `ASSISTANT_ID` wird das Backend automatisch in den „Echo-Modus“ geschaltet.

---

