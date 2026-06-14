# Launch Checklist

## Engine ✅

- [x] 22 built-in detectors (secrets, logs, config)
- [x] 4 replacement modes: redact, tokenize, partial, warn
- [x] Policy system: parser (Zod), manager, presets (developer/general)
- [x] Custom rules via policy JSON
- [x] Explainer: confidence labels + source attribution
- [x] Detector registry (pluggable, auto-registers builtins)
- [x] Performance: 10KB <100ms, 1MB <2s
- [x] 216 unit tests passing
- [x] Build: `tsc` clean, ESM, browser-compatible (no Node-only deps)

## CLI ✅

- [x] `masqo redact` — stdin + file, all modes, --hook, --format json
- [x] `masqo review` — Ink TUI + --accept-all/--reject-all
- [x] `masqo config` — get/set-policy/add-rule, persisted to ~/.masqo/
- [x] `masqo install-hook claude-code` — idempotent hook install
- [x] 38 tests passing

## Chrome Extension ✅

- [x] Manifest V3 valid
- [x] Background service worker runs engine
- [x] Content scripts: ChatGPT, Claude.ai, Gemini
- [x] Paste interception + sidebar review UI
- [x] Popup: policy selector + detection history
- [x] Storage: chrome.storage.sync
- [x] Vite build produces loadable dist/
- [x] 8 tests passing (storage mock, manifest validation)

## Web App ✅

- [x] Static Vite+React, zero backend
- [x] Side-by-side editor (input / output)
- [x] Drag-drop + file picker
- [x] Mode + policy selectors
- [x] Per-detection accept/reject with live preview
- [x] Copy + Export (redacted.txt)
- [x] Deployable to Netlify/Vercel/GitHub Pages
- [x] 3 tests passing

## Integration ✅

- [x] CLI ↔ Engine parity: 8 secret types verified
- [x] Policy portable across API and CLI
- [x] 15 integration tests passing
- [x] Total: 280+ tests across all packages

## Performance ✅

- [x] 10KB: ~1ms (target <100ms)
- [x] 100KB: ~11ms (target <500ms)
- [x] 1MB: ~161ms (target <2000ms)

## Documentation ✅

- [x] README.md
- [x] docs/user-guide/getting-started.md
- [x] docs/user-guide/cli.md
- [x] docs/user-guide/extension.md
- [x] docs/user-guide/web-app.md
- [x] docs/user-guide/policy.md
- [x] docs/detection-patterns.md
- [x] docs/claude-code-hook-setup.md

## CI/CD ✅

- [x] .github/workflows/ci.yml (test + build + integration + benchmark)
- [x] .github/workflows/release.yml (tag → GitHub Release with dist artifacts)

## Security

- [x] All detection local — no network calls
- [x] No secret values stored in detection history (types only)
- [x] Token map in-memory only (not persisted)
- [x] Extension uses chrome.storage.sync (encrypted by Chrome)

## Remaining (post-launch)

- [ ] PII detector group (names, emails, phone numbers, SSNs)
- [ ] Response placeholder restoration in AI chat
- [ ] Team/enterprise features
- [ ] Regional data packs (GDPR, HIPAA identifiers)
- [ ] High-entropy string detection (Shannon entropy)
