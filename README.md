# Word Impostor

A fast, lightweight multiplayer social deduction party game inspired by Jackbox and Among Us. Play with 3–12 friends in the same room using your phones or laptops.

## How to Play

1. One player creates a room and shares the code
2. Each player gets the **same secret word** — except one random **Impostor**
3. Everyone takes turns giving one-word clues **out loud**
4. After discussion, everyone **votes** on who the Impostor is
5. **Town wins** if they catch the Impostor. **Impostor wins** if they survive!

---

## Quick Start (Local Development)

### 1. Clone the repo
```bash
git clone https://github.com/your-username/word-impostor.git
cd word-impostor
```

### 2. Set up Firebase

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add Project** → follow the prompts (Analytics optional)
3. In your project, click **Build → Realtime Database**
4. Click **Create Database** → choose a region → start in **test mode**
5. Click the gear icon → **Project settings** → scroll to **Your apps**
6. Click **`</>`** (web) → register app → copy the config

### 3. Create your `.env` file
```bash
cp .env.example .env
```
Paste your Firebase values into `.env`:
```
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc
```

### 4. Install & run
```bash
npm install
npm run dev
```

Open `http://localhost:5173` — share with friends on the same WiFi!

---

## Deploy to GitHub Pages

### 1. Push to GitHub
Create a repo on GitHub and push your code.

### 2. Add Firebase secrets to GitHub
Go to your repo → **Settings → Secrets and variables → Actions** → click **New repository secret** for each:

| Secret name | Value |
|---|---|
| `VITE_FIREBASE_API_KEY` | your API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | ... |
| `VITE_FIREBASE_DATABASE_URL` | ... |
| `VITE_FIREBASE_PROJECT_ID` | ... |
| `VITE_FIREBASE_STORAGE_BUCKET` | ... |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | ... |
| `VITE_FIREBASE_APP_ID` | ... |

### 3. Enable GitHub Pages
Go to **Settings → Pages** → under **Source**, select **GitHub Actions**.

Push to `main` — the workflow builds and deploys automatically. Your game will be live at:
```
https://your-username.github.io/word-impostor/
```

---

## Firebase Security Rules (Recommended)

In Firebase console → Realtime Database → Rules, replace with:

```json
{
  "rules": {
    "rooms": {
      "$roomCode": {
        ".read": true,
        ".write": true,
        ".indexOn": ["meta/createdAt"]
      }
    }
  }
}
```

For production, you may want to add validation rules. For a private friend group, test mode rules are fine.

---

## Tech Stack

- **React 18** + **Vite 5**
- **TailwindCSS 3** — dark party-game theme
- **Firebase Realtime Database** — real-time multiplayer sync
- **React Router v6** — hash-based routing (GitHub Pages compatible)
- **Web Audio API** — procedural sound effects (no audio files needed)

---

## Features

- 🎮 Real-time multiplayer via Firebase
- 🕵️ Three impostor difficulty modes (no info / theme only / vague hint)
- ⏱ Configurable timers for discussion and voting
- 🗳 Anonymous voting with simultaneous reveal
- 🔄 Multi-round system with scoring
- 📱 Mobile-first design, works on any device
- 🔗 Shareable join links + room codes
- 📦 200+ words across 10 categories
- 🔊 Procedural sound effects
- ♾️ Endless mode
- 🚀 GitHub Pages ready (no server needed)

---

## Word Categories

| Category | Count |
|---|---|
| Food & Drinks | 20 |
| Animals | 20 |
| Jobs & Careers | 20 |
| Technology | 20 |
| Movies & TV | 20 |
| Video Games | 20 |
| Countries & Places | 20 |
| Internet Culture | 20 |
| Sports | 20 |
| Music | 20 |

---

## License

MIT — use it, remix it, host it for free.
