# Web App Usage

## Run locally

```bash
cd packages/web
npm run dev        # http://localhost:5173
npm run build      # → dist/ (static files)
npm run preview    # Preview production build
```

## Deploy

The web app is a static bundle — no server required.

**Netlify:** Drag `packages/web/dist/` to netlify.com/drop

**Vercel:**
```bash
cd packages/web && npm run build
npx vercel dist/
```

**GitHub Pages:**
```bash
cd packages/web && npm run build
# Copy dist/ to gh-pages branch
```

## Features

- **Paste or type** text into the input panel
- **Drag-and-drop** a file to load it
- **Open file** button for file picker
- Choose **mode** (redact / tokenize / partial / warn)
- Choose **policy** (none / developer / general)
- Click **Scan** — detections appear below
- **Toggle** each detection to accept or reject
- **Accept all / Reject all** for bulk action
- Output panel shows live preview as you toggle
- **Copy** output to clipboard
- **Export** as `redacted.txt`

All processing runs in your browser. Nothing is sent to any server.
