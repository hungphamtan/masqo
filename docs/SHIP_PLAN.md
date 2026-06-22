# Masqo Ship Plan - v0.1.2

> Status: **READY FOR CWS SUBMISSION** - all critical security blockers fixed, npm published, web app live, extension scoped to built-in sites only
>
> Last reviewed: 2026-06-22

---

## Surfaces shipping in v0.1.0

| Surface | Description | Status |
|---|---|---|
| Chrome Extension | MV3, IIFE content script, 11 built-in AI chat sites. Custom user-added sites deferred to v0.2.0 (Shadow DOM rework needed for CWS approval). | ⏳ Pending CWS submission |
| Web App | Static Vite/React SPA, auto-scan, Privacy / Terms / How it works pages | ✅ Live at masqo.dev |
| CLI (`@masqo/cli`) | `masqo redact`, `masqo review`, `masqo config`, `masqo install-hook claude-code` | ✅ Live on npm (v0.1.0, v0.1.1) |

---

## Blockers - all resolved ✅

- [x] **CRITICAL-2** `event.preventDefault()` sync fix - paste interception now functional
- [x] **CRITICAL-1** postMessage listener leak fixed - named handler removed after use; origin validated
- [x] **CRITICAL-3** MultiEdit bypass fixed - `edits[].new_string` now extracted in `--claude-hook`
- [x] **CRITICAL-4** `customSites` schema validated via `isValidSiteConfig()` on storage read
- [x] **CRITICAL-5** `detectionHistory` moved to `chrome.storage.local` - no longer syncs to Google

---

## Recommended fixes (before v0.2.0)

- [x] Session token detector dead condition - removed unreachable ternary. `packages/engine/src/detectors/secrets/aws.ts:146`
- [x] Restrict `web_accessible_resources` matches from `<all_urls>` to built-in hostnames only. `packages/extension/public/manifest.json:35`
- [x] postMessage wildcard origin fixed - use explicit extension origin. `packages/extension/src/content/common.ts:107, sidebar.tsx:62/72`
- [x] Add `npm audit --audit-level=high` to CI. `.github/workflows/ci.yml:25`
- [ ] `loadText` double scan - `setTimeout(0)` + debounce both fire. Fix: remove setTimeout. `packages/web/src/App.tsx:91-95`
- [ ] `finalOutput` IIFE recalculates every render - wrap in `useMemo`. `packages/web/src/App.tsx:67-76`
- [ ] Tokenize module-level `tokenMap` grows unbounded. `packages/engine/src/replacers/tokenize.ts:3-4`
- [ ] Update `docs/claude-code-hook-setup.md` - describes old `--hook + $CLAUDE_FILE_PATH`, installed hook uses `--claude-hook + stdin JSON`

---

## Manual steps

### 1. Identity & legal ✅

- [x] Domain registered - `masqo.dev` (Cloudflare Registrar)
- [x] Web app deployed - `https://masqo.dev` live on Cloudflare Pages
- [x] Privacy policy live - `https://masqo.dev/privacy`
- [x] Terms live - `https://masqo.dev/terms`
- [x] Contact links live - GitHub & LinkedIn contact methods in Privacy and Terms pages

### 2. Chrome Web Store ⏳

- [ ] Create [Chrome Web Store Developer account](https://chrome.google.com/webstore/devconsole) - **$5 one-time fee**
  - Note: Vietnamese cards may get `OR_CCREU_01` error - use Wise virtual USD card as workaround
  - HSBC Vietnam credit cards have higher success rate but may still fail
- [ ] Package extension ZIP:
  ```bash
  cd /Users/Hung/masqo/packages/extension && zip -r ~/masqo-extension-0.1.2.zip dist/
  ```
- [ ] Prepare listing assets:
  - Promotional tile: 440×280 px
  - Screenshots: 1280×800 px (minimum 1, up to 5)
  - Short description: ≤132 characters
  - Full description
- [ ] Fill listing:
  - **Privacy policy URL:** `https://masqo.dev/privacy`
  - **Homepage URL:** `https://masqo.dev`
- [ ] Write `clipboardRead` permission justification:
  > "Masqo reads clipboard content only at the moment the user triggers a paste action on a supported AI chat site. It does not monitor the clipboard passively or at any other time."
- [ ] Write `activeTab` permission justification:
  > "Used solely by the popup to display whether the current tab is a supported AI chat site. No tab data is stored or transmitted."
- [ ] Write host permissions justification:
  > "Each host in host_permissions corresponds to a supported AI chat interface where Masqo intercepts paste events to scan for secrets before they are sent. No network requests are made from these origins."
- [ ] Complete Privacy Practices questionnaire in developer dashboard
- [ ] Submit ZIP → allow 1–3 business days for review

### 3. Web app hosting ✅

- [x] Connected GitHub repo `hungphamtan/masqo` to Cloudflare Pages
  - Build command: `npm run build:web`
  - Output directory: `packages/web/dist`
- [x] Custom domain `masqo.dev` configured, DNS live
- [x] SSL certificate auto-provisioned by Cloudflare

### 4. Cloudflare Web Analytics ⏳ (5 min, no consent banner needed)

- [ ] Cloudflare dashboard → `masqo.dev` → **Web Analytics** → Get snippet
- [ ] Paste `<script>` tag into `packages/web/index.html`
- [ ] Commit + push → Cloudflare Pages auto-deploys

### 5. npm - `@masqo/cli` ✅

- [x] Create npm account at [npmjs.com](https://npmjs.com) (free)
- [x] Reserve `@masqo` org scope: `npm org create masqo`
- [x] First publish: v0.1.0 and v0.1.1 live on npm
- [ ] Add `NPM_TOKEN` as GitHub Actions secret (enables automated publish on tag)

---

## 3rd-party registrations

| Service | Purpose | Cost | Status |
|---|---|---|---|
| Cloudflare Registrar | `masqo.dev` domain | ~$10/yr | ✅ Done |
| Cloudflare Pages | Web app hosting | Free | ✅ Done |
| Chrome Web Store Developer Console | Extension distribution | $5 one-time | ⏳ Pending |
| npmjs.com + `@masqo` org | CLI distribution | Free | ⏳ Pending |
| Cloudflare Web Analytics | Cookieless page view stats | Free | ⏳ Pending |
| GitHub Actions secret: `NPM_TOKEN` | Automated npm publish | Free | ⏳ Pending |

---

## What can be automated

### Already automated ✅

- [x] CI on push/PR - build, all tests, integration tests, benchmarks (`.github/workflows/ci.yml`)
- [x] Type checking on PR
- [x] GitHub Release creation on `v*.*.*` tag (`.github/workflows/release.yml`)
- [x] Cloudflare Pages auto-deploy on push to `master`

### Needs setup (one-time)

- [ ] **npm publish on tag** - Add `NPM_TOKEN` secret + step to `release.yml`:
  ```yaml
  - name: Publish @masqo/cli to npm
    run: npm publish --workspace packages/cli --access public
    env:
      NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
  ```
- [ ] **Extension ZIP packaging on tag** - Add to `release.yml`:
  ```yaml
  - name: Package extension
    run: cd packages/extension && zip -r ../../masqo-extension-${{ github.ref_name }}.zip dist/
  ```
- [ ] **Version sync from git tag** - Add to `release.yml`:
  ```yaml
  - name: Set version from tag
    run: |
      VERSION=${GITHUB_REF_NAME#v}
      npm version $VERSION --no-git-tag-version --workspace packages/cli
      jq --arg v "$VERSION" '.version = $v' packages/extension/public/manifest.json > /tmp/m.json && mv /tmp/m.json packages/extension/public/manifest.json
  ```
- [ ] **`npm audit` in CI** - Add to `ci.yml`:
  ```yaml
  - name: Audit dependencies
    run: npm audit --audit-level=high
  ```
- [ ] **CWS updates post-first-submission** - Use Chrome Web Store Publish API via GitHub Action after initial acceptance

---

## Rollback plan

**Trigger conditions:**
- Users report secrets leaking through the extension
- Chrome Web Store flags extension for policy violation
- CLI hook breaking Claude Code sessions
- Web app serving broken build

**Rollback procedure:**

| Surface | Action | RTO |
|---|---|---|
| Extension | Unpublish from CWS Developer Console | < 2h |
| Web app | Revert deployment in Cloudflare Pages (one click) | < 5 min |
| CLI | `npm unpublish @masqo/cli@<version>` within 72h or publish hotfix | < 30 min |
| CLI hook | `masqo install-hook claude-code` after fix overwrites `~/.claude/settings.json` | < 2 min |

---

## Current test status

| Package | Tests | Status |
|---|---|---|
| engine | 244 | ✅ passing |
| cli | 45 | ✅ passing |
| extension | 23 | ✅ passing |
| web | 3 | ✅ passing |
| shared | 6 | ✅ passing |
| integration-tests | 15 | ✅ passing |
| **Total** | **336** | ✅ |

---

## Post-launch (v0.2.0 and beyond)

- [ ] PII detector group (names, emails, phone numbers, SSNs)
- [ ] Response placeholder restoration in AI chat (token → original on AI reply)
- [ ] High-entropy string detection (Shannon entropy)
- [ ] Regional data packs (GDPR, HIPAA identifiers)
- [ ] Team / enterprise features (shared policies, audit log)
- [ ] Firefox extension (MV3 compatible)
- [ ] VS Code extension
