# Abi Kishore — Portfolio

Vite + vanilla JS, GSAP ScrollTrigger and Lenis smooth scroll.

## Run locally
```bash
npm install
npm run dev        # http://localhost:5173
```

## Deploy to Vercel
**Option A: CLI**
```bash
npm i -g vercel
vercel            # first run links the project
vercel --prod
```

**Option B: GitHub**
Push this folder to a GitHub repo, then go to vercel.com, choose New Project and import the repo.
Vercel detects Vite automatically (build `npm run build`, output `dist`).

## Editing content
- All text is in `index.html`; each project is an `<article class="case">`.
- Project schematics are defined as data in `src/diagrams.js`.
- Colours are three CSS variables at the top of `src/style.css`: `--ink`, `--bone`, `--signal`.
- Résumé PDF and photo: `public/`.
