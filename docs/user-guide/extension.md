# Extension Usage

## Install (unpacked)

1. `cd packages/extension && npm run build`
2. Open `chrome://extensions`
3. Enable **Developer mode**
4. Click **Load unpacked** → select `packages/extension/dist/`

## How it works

When you paste text containing secrets into ChatGPT, Claude.ai, or Gemini:

1. Masqo intercepts the paste event
2. Scans the clipboard text locally (no network call)
3. If secrets found - blocks the paste and opens the review sidebar
4. You accept/reject each detection
5. Click **Paste clean** - only approved redactions applied

## Supported sites

| Site | URL |
|------|-----|
| ChatGPT | chat.openai.com, chatgpt.com |
| Claude | claude.ai |
| Gemini | gemini.google.com |

## Popup

Click the Masqo icon to:
- Switch policy preset (General / Developer)
- View recent detection history (last 10)
- Clear history

## Policy

The active policy is stored in `chrome.storage.sync` and synced across Chrome profiles.
