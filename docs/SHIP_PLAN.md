# Masqo Ship Plan — v0.1.0

> Status: **NO-GO** — 3 critical security fixes still in progress (see Blockers)
>
> Last reviewed: 2026-06-14

---

## Surfaces shipping in v0.1.0

| Surface | Description |
|---|---|
| Chrome Extension | MV3, IIFE content script, 11 built-in AI chat sites, user-managed site list |
| Web App | Static Vite/React SPA, auto-scan, Privacy / Terms / How it works pages |
| CLI (`@masqo/cli`) | `masqo redact`, `masqo review`, `masqo config`, `masqo install-hook claude-code` |

---

## Blockers (must fix before any submission)

- [ ] **CRITICAL-2** `event.preventDefault()` called after async — paste already inserted before scan completes. Fix: call synchronously, reinsert original text if clean. `packages/extension/src/content/common.ts`
- [ ] **CRITICAL-1** `injectSidebar` postMessage listener accumulates across paste events (never removed). Fix: named handler + `removeEventListener` after accept/reject. `packages/extension/src/content/common.ts`
- [ ] **CRITICAL-3** `MultiEdit` tool calls bypass `--claude-hook` unscanned — `edits[].new_string` not extracted. Fix: add MultiEdit content extraction. `packages/cli/src/commands/redact.ts`
- [ ] **CRITICAL-4** `customSites` from `chrome.storage.sync` executed as CSS selector without schema validation. Fix: `isValidSiteConfig()` guard on storage read. `packages/extension/src/storage/index.ts`
- [ ] **CRITICAL-5** `detectionHistory` syncs to Google via `chrome.storage.sync` — violates local-first guarantee. Fix: move to `chrome.storage.local`. `packages/extension/src/storage/index.ts`

---

## Recommended fixes (before ship, not blocking)

- [ ] Session token detector dead condition — `match[0].length < 100` never true for `{100,}` regex. Fix: `if (!hasSessionContext) continue`. `packages/engine/src/detectors/secrets/aws.ts:138`
- [ ] `loadText` in web app triggers double scan — `setTimeout(0)` + debounce both fire. Fix: remove setTimeout, rely on debounce effect. `packages/web/src/App.tsx:91-95`
- [ ] `finalOutput` IIFE recalculates every render. Fix: wrap in `useMemo`. `packages/web/src/App.tsx:67-76`
- [ ] Tokenize module-level `tokenMap` shared across all Engine instances — grows unbounded. `packages/engine/src/replacers/tokenize.ts:3-4`
- [ ] Add `npm audit --audit-level=high` to CI. `.github/workflows/ci.yml`
- [ ] Add `--claude-hook` tests (Write, Edit, MultiEdit, malformed JSON, clean, empty). `packages/cli/src/commands/redact.test.ts`
- [ ] Update `docs/claude-code-hook-setup.md` — still describes `--hook + $CLAUDE_FILE_PATH`, installed hook uses `--claude-hook + stdin JSON`.
- [ ] Restrict `web_accessible_resources` matches from `<all_urls>` to built-in hostnames only.

---

## Manual steps — human must do

### 1. Identity & legal (do first — blocks everything else)

- [ ] Register domain (`masqo.dev` or `masqo.io`) — Cloudflare Registrar recommended
- [ ] Set up contact email address (referenced in Privacy and Terms pages)
- [ ] Deploy web app (step 3 below) so `https://yourdomain.com/privacy` is publicly reachable **before** Chrome Web Store submission

### 2. Chrome Web Store

- [ ] Create [Chrome Web Store Developer account](https://chrome.google.com/webstore/devconsole) — **$5 one-time fee**, Google account required
- [ ] Bump `manifest.json` version from `0.0.0` → `0.1.0` ✅ (done in security fix commit)
- [ ] Prepare listing assets:
  - Promotional tile: 440×280 px
  - Screenshots: 1280×800 px (minimum 1, up to 5)
  - Short description: ≤132 characters
  - Full description
- [ ] Write `<all_urls>` host permission justification:
  > "Masqo's content script activates on any hostname the user adds to their custom site list. Without `<all_urls>`, users cannot protect arbitrary internal tools or AI interfaces beyond the built-in list."
- [ ] Write `clipboardRead` permission justification:
  > "Masqo reads clipboard content only at the moment the user triggers a paste action. It does not monitor the clipboard passively or at any other time."
- [ ] Complete the Privacy Practices questionnaire in the developer dashboard (data handling disclosures)
- [ ] Submit extension ZIP — allow 1–3 business days for initial review
- [ ] First submission is always manual; subsequent updates can use the Publish API (see Automation section)

### 3. Web app hosting

- [ ] Connect GitHub repo to [Cloudflare Pages](https://pages.cloudflare.com/) (recommended), Vercel, or Netlify
  - Build command: `npm run build` (run from `packages/web`)
  - Output directory: `packages/web/dist`
- [ ] Set custom domain and point DNS from registrar to hosting provider
- [ ] Verify `https://yourdomain.com/privacy` and `/terms` load before CWS submission

### 4. npm — `@masqo/cli`

- [ ] Create npm account at [npmjs.com](https://npmjs.com) (free)
- [ ] Reserve `@masqo` organisation scope: `npm org create masqo`
- [ ] First publish is manual:
  ```bash
  cd packages/cli
  npm publish --access public
  ```
- [ ] Add `NPM_TOKEN` as a GitHub Actions secret (enables automated publish on tag)

---

## 3rd-party registrations needed

| Service | Purpose | Cost | Required before |
|---|---|---|---|
| Domain registrar (Cloudflare / Namecheap) | `masqo.dev` or `masqo.io` | ~$10/yr | Web app + CWS privacy URL |
| Cloudflare Pages / Vercel / Netlify | Web app hosting | Free tier | CWS submission |
| Chrome Web Store Developer Console | Extension distribution | $5 one-time | Extension launch |
| npmjs.com + `@masqo` org | CLI distribution | Free | CLI launch |
| GitHub Actions secret: `NPM_TOKEN` | Automated npm publish | Free | CLI release automation |

---

## What can be automated

### Already automated

- [x] CI on push/PR — build, all tests, integration tests, benchmarks (`.github/workflows/ci.yml`)
- [x] Type checking on PR (separate job in `ci.yml`)
- [x] GitHub Release creation on `v*.*.*` tag (`.github/workflows/release.yml`)

### Needs setup (one-time)

- [ ] **Web app deploy** — Connect repo to Cloudflare Pages / Vercel. No YAML needed — provider watches for pushes to `main` and builds automatically. PR preview deployments included.
- [ ] **npm publish on tag** — Add `NPM_TOKEN` secret, then add to `release.yml`:
  ```yaml
  - name: Publish @masqo/cli to npm
    run: npm publish --workspace packages/cli --access public
    env:
      NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
  ```
- [ ] **Extension ZIP packaging on tag** — Add to `release.yml`:
  ```yaml
  - name: Package extension
    run: cd packages/extension && zip -r ../../masqo-extension-${{ github.ref_name }}.zip dist/
  - name: Attach to release
    # reference the zip in softprops/action-gh-release files: block
  ```
- [ ] **Version sync** — Add step to `release.yml` to update `manifest.json` and `package.json` versions from the git tag before building:
  ```yaml
  - name: Set version from tag
    run: |
      VERSION=${GITHUB_REF_NAME#v}
      npm version $VERSION --no-git-tag-version --workspace packages/cli
      jq --arg v "$VERSION" '.version = $v' packages/extension/public/manifest.json > /tmp/m.json && mv /tmp/m.json packages/extension/public/manifest.json
  ```
- [ ] **`npm audit` in CI** — Add to `ci.yml`:
  ```yaml
  - name: Audit dependencies
    run: npm audit --audit-level=high
  ```
- [ ] **CWS updates (post-first-submission)** — After the extension is accepted, subsequent version updates can use the [Chrome Web Store Publish API](https://developer.chrome.com/docs/webstore/using-api/) via a GitHub Action (e.g., `nicehash/action-chrome-extension`).

---

## Rollback plan

**Trigger conditions:**
- Users report secrets leaking through the extension
- Chrome Web Store flags the extension for policy violation
- CLI hook breaking Claude Code sessions (format or exit code regression)
- Web app serving stale or broken build

**Rollback procedure:**

| Surface | Action | Time |
|---|---|---|
| Extension | Unpublish from CWS Developer Console (auto-update propagates to users within hours) | < 2h |
| Web app | Revert to previous deployment in Cloudflare Pages / Vercel (one click) | < 5 min |
| CLI | `npm unpublish @masqo/cli@<version>` within 72h, or publish hotfix patch | < 30 min |
| CLI hook | `masqo install-hook claude-code` after fix overwrites `~/.claude/settings.json` | < 2 min |

**Recovery time objective:** < 2h for extension; < 30 min for CLI hotfix publish

---

## Current test status

| Package | Tests | Status |
|---|---|---|
| engine | 216 | ✅ passing |
| cli | 38 | ✅ passing |
| extension | 23 | ✅ passing |
| web | 3 | ✅ passing |
| shared | 6 | ✅ passing |
| **Total** | **286** | ✅ |

---

## Post-launch (v0.2.0 and beyond)

- [ ] PII detector group (names, emails, phone numbers, SSNs)
- [ ] Response placeholder restoration in AI chat (token → original on AI reply)
- [ ] High-entropy string detection (Shannon entropy)
- [ ] Regional data packs (GDPR, HIPAA identifiers)
- [ ] Team / enterprise features (shared policies, audit log)
- [ ] Firefox extension (MV3 compatible)
- [ ] VS Code extension
