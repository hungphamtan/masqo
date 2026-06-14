# Launch Checklist

> This file tracks feature completeness. For the full ship plan (manual steps, 3rd-party registrations, automation, rollback), see [`docs/SHIP_PLAN.md`](docs/SHIP_PLAN.md).

## Engine ✅

- [x] 22 built-in detectors (secrets, logs, config)
- [x] 4 replacement modes: redact, tokenize, partial, warn
- [x] Policy system: parser (Zod), manager, presets (developer/general)
- [x] Custom rules via policy JSON
- [x] Explainer: confidence labels + source attribution
- [x] Detector registry (pluggable, auto-registers builtins)
- [x] Performance: 10KB <100ms, 1MB <2s
- [x] 216 unit tests passing
- [x] Build: `tsc` clean, ESM, browser-compatible

## CLI ✅

- [x] `masqo redact` — stdin + file, all modes, --hook, --format json
- [x] `masqo review` — Ink TUI + --accept-all/--reject-all
- [x] `masqo config` — get/set-policy/add-rule, persisted to ~/.masqo/
- [x] `masqo install-hook claude-code` — installs `--claude-hook` stdin JSON hook
- [x] `--claude-hook` mode — reads Claude Code PreToolUse JSON, handles Write/Edit/MultiEdit
- [x] 38 tests passing

## Chrome Extension ✅

- [x] Manifest V3, version 0.1.0
- [x] Single generic IIFE content script (replaces 3 hardcoded per-site scripts)
- [x] 11 built-in AI chat sites (ChatGPT, Claude, Gemini, Grok, Perplexity, Manus, Poe, Copilot, You.com, Character.AI)
- [x] User-managed site list (popup Sites tab: toggle, add, remove)
- [x] Paste interception (synchronous preventDefault + reinsert if clean)
- [x] Sidebar review UI (accept/reject per detection)
- [x] postMessage origin validated (sidebar→content script: extension origin only)
- [x] Message listener removed after use (no accumulation across paste events)
- [x] detectionHistory in chrome.storage.local (not synced to Google)
- [x] customSites schema-validated on storage read
- [x] 23 tests passing

## Web App ✅

- [x] Static Vite+React, zero backend
- [x] Auto-scan on paste (400ms debounce, toggle on/off)
- [x] Side-by-side editor with per-detection accept/reject
- [x] How it works / Privacy / Terms pages
- [x] react-router-dom navigation
- [x] Deployable to Cloudflare Pages / Vercel / Netlify
- [x] 3 tests passing

## Integration ✅

- [x] All surfaces share single engine package
- [x] Policy portable across web, CLI, extension
- [x] 286 total tests passing

## CI/CD ✅

- [x] `.github/workflows/ci.yml` — test + build + integration + benchmark on every PR
- [x] `.github/workflows/release.yml` — tag → GitHub Release with dist artifacts

## Security ✅ (post ship-review fixes)

- [x] All detection local — no network calls
- [x] event.preventDefault() called synchronously (paste interception functional)
- [x] postMessage origin validated on content script receive path
- [x] detectionHistory not synced to Google
- [x] customSites schema-validated before use as CSS selectors
- [x] MultiEdit tool calls scanned by --claude-hook
- [x] 10MB stdin size limit in --claude-hook

## Remaining (post-launch)

- [ ] PII detector group (names, emails, phone numbers, SSNs)
- [ ] Response placeholder restoration in AI chat
- [ ] High-entropy string detection (Shannon entropy)
- [ ] Regional data packs (GDPR, HIPAA identifiers)
- [ ] Team/enterprise features
