# Masqo MVP - Task List

## Legend
- [ ] Not started
- [>] In progress
- [x] Complete
- [!] Blocked
- [~] Skipped/Deferred

---

## PHASE 0: FOUNDATION

### Task 0.1: Initialize Monorepo
- [ ] Initialize npm workspace at root
- [ ] Create turbo.json with build pipeline
- [ ] Create base tsconfig.json with strict mode
- [ ] Create .gitignore, .prettierrc, .eslintrc.json
- [ ] Set up package directory structure

**Verify**: `npm install && npm run build && npm run lint` succeeds

---

### Task 0.2: Create Shared Package
- [ ] Create packages/shared/ with package.json
- [ ] Define core types (Detection, ReplacementMode, PolicyConfig, Position)
- [ ] Export from index.ts
- [ ] Write unit tests

**Verify**: Package builds and types are importable

---

## PHASE 1: ENGINE CORE - FIRST VERTICAL SLICE

### Task 1.1: Core Engine Types & Interfaces
- [ ] Create packages/engine/ with package.json
- [ ] Define Detector, Replacer, Detection, EngineConfig interfaces
- [ ] Create engine.ts orchestrator skeleton
- [ ] Write interface tests

**Verify**: Type checking passes, mock tests pass

---

### Task 1.2: AWS Secret Detector
- [ ] Create src/detectors/secrets/aws.ts
- [ ] Implement AWS Access Key ID pattern (AKIA...)
- [ ] Implement AWS Secret Access Key pattern
- [ ] Implement AWS Session Token pattern
- [ ] Write comprehensive tests (TP/FP/edge cases)

**Verify**: Detects `AKIAIOSFODNN7EXAMPLE`, ignores `// Example: AKIA...`

---

### Task 1.3: Replacement Strategies - All 4 Modes
- [ ] Create src/replacers/redact.ts (replace with [REDACTED:type])
- [ ] Create src/replacers/tokenize.ts (generate UUID token, store mapping)
- [ ] Create src/replacers/partial.ts (show first/last N chars)
- [ ] Create src/replacers/warn.ts (return original + warning flag)
- [ ] Export all from index.ts
- [ ] Write tests for each mode

**Verify**: All 4 modes produce expected output

---

### Task 1.4: Explainer System
- [ ] Create src/explainer/index.ts
- [ ] Implement explain(detection) returning pattern/confidence/source/explanation
- [ ] Write tests for explanation quality

**Verify**: Every detection has human-readable explanation

---

### Task 1.5: Detector Registry
- [ ] Create src/detectors/index.ts
- [ ] Implement register(name, detector), get(name), list()
- [ ] Auto-register built-in detectors
- [ ] Write registry tests

**Verify**: Can register custom detectors, retrieve by name

---

### Task 1.6: Engine Orchestrator - First Integration
- [ ] Implement engine.scan(input, config)
- [ ] Run enabled detectors, collect detections
- [ ] Apply replacement mode, attach explanations
- [ ] Write integration tests with real AWS keys
- [ ] Test all 4 replacement modes

**Verify**: End-to-end AWS detection works, <100ms for 10KB input

**CHECKPOINT 1**: Engine core works end-to-end. Proceed?

---

## PHASE 2: ENGINE CORE - COMPLETE P0 DETECTORS

### Task 2.1: Cloud Provider Secrets (GCP, GitHub, Stripe)
- [ ] Create src/detectors/secrets/gcp.ts (API keys, service account JSON)
- [ ] Create src/detectors/secrets/github.ts (PATs: ghp_, gho_)
- [ ] Create src/detectors/secrets/stripe.ts (sk_live_, sk_test_)
- [ ] Write tests for each
- [ ] Integrate into registry

**Verify**: All cloud provider keys detected

---

### Task 2.2: Auth Tokens (JWT, Bearer, Cookies)
- [ ] Create src/detectors/secrets/jwt.ts (3 base64 segments)
- [ ] Create src/detectors/secrets/bearer.ts (Bearer token patterns)
- [ ] Create src/detectors/secrets/cookies.ts (session/auth cookies)
- [ ] Write tests including edge cases

**Verify**: Detects `eyJ...` JWTs, `Authorization: Bearer ...`

---

### Task 2.3: Database & Connection Strings
- [ ] Create src/detectors/secrets/database.ts
- [ ] Implement PostgreSQL connection string detection
- [ ] Implement MySQL connection string detection
- [ ] Implement MongoDB connection string detection
- [ ] Implement Redis URL detection
- [ ] Extract credentials from URLs
- [ ] Write tests with real examples

**Verify**: Detects `postgresql://user:pass@host/db`

---

### Task 2.4: Environment Variables (.env patterns)
- [ ] Create src/detectors/secrets/env.ts
- [ ] Pattern: KEY=value where KEY contains SECRET/PASSWORD/TOKEN/API_KEY
- [ ] Extract variable name and value
- [ ] Write tests with .env files

**Verify**: Detects `API_KEY=xxx`, `DATABASE_PASSWORD=yyy`

---

### Task 2.5: Stack Trace Detector
- [ ] Create src/detectors/code/stacktrace.ts
- [ ] Detect Node.js stack traces (at /path:line:col)
- [ ] Detect Python tracebacks
- [ ] Detect Java stack traces
- [ ] Extract file paths
- [ ] Write tests with real stack traces

**Verify**: Detects `/Users/john/project/file.js:42`

---

### Task 2.6: HTTP Headers & Payloads
- [ ] Create src/detectors/code/headers.ts (Authorization, Cookie, X-API-Key)
- [ ] Create src/detectors/code/payloads.ts (JSON with password/token fields)
- [ ] Write tests with HTTP logs

**Verify**: Detects headers and JSON payloads with secrets

---

### Task 2.7: Config Blobs (JSON/YAML)
- [ ] Create src/detectors/code/config.ts
- [ ] Detect JSON objects with sensitive keys
- [ ] Detect YAML with sensitive keys
- [ ] Detect TOML with sensitive keys
- [ ] Return key path (e.g., config.api.secretKey)
- [ ] Write tests with config files

**Verify**: Detects nested secrets in config files

---

### Task 2.8: Integrate External Libraries (ggshield, detect-secrets)
- [ ] Research integration options (license, performance)
- [ ] Create src/detectors/secrets/external.ts wrapper
- [ ] Add attribution in explainer
- [ ] Benchmark performance
- [ ] Write comparison tests
- [ ] Verify license compliance

**Verify**: External patterns integrated, <2x slowdown

**Note**: May skip if too complex, use custom patterns instead

---

## PHASE 3: POLICY SYSTEM

### Task 3.1: Policy File Parser
- [ ] Create src/policies/parser.ts
- [ ] Define JSON schema for policies
- [ ] Implement parser with validation (Zod)
- [ ] Write tests for valid/invalid policies

**Verify**: Parses valid policy, rejects invalid with helpful errors

---

### Task 3.2: Policy Manager
- [ ] Create src/policies/manager.ts
- [ ] Implement loadPolicy, savePolicy, mergeRules, validatePolicy
- [ ] Write tests for all operations

**Verify**: Can load/merge/validate policies

---

### Task 3.3: Policy Presets (Developer, General)
- [ ] Create src/policies/presets/developer.json
- [ ] Create src/policies/presets/general.json
- [ ] Document preset rationale

**Verify**: Presets are valid, can load by name

---

### Task 3.4: Engine Integration with Policies
- [ ] Update engine.scan() to accept policy
- [ ] Map policy to detector enablement
- [ ] Map policy to replacement mode
- [ ] Apply custom rules from policy
- [ ] Write integration tests

**Verify**: Engine respects policy settings

**CHECKPOINT 2**: Policy system flexible enough? Proceed?

---

## PHASE 4: CLI - FIRST VERTICAL SLICE

### Task 4.1: CLI Package Structure
- [ ] Create packages/cli/ with package.json
- [ ] Add dependencies (commander, chalk, ora)
- [ ] Create src/index.ts with CLI skeleton
- [ ] Set up binary entry point
- [ ] Add to root package scripts

**Verify**: `masqo --help` works

---

### Task 4.2: Redact Command - Stdin
- [ ] Create src/commands/redact.ts
- [ ] Implement stdin reader
- [ ] Call engine.scan()
- [ ] Output to stdout
- [ ] Add flags: --mode, --policy, --format
- [ ] Write CLI tests

**Verify**: `cat file.txt | masqo redact` works

---

### Task 4.3: Redact Command - File Input
- [ ] Update redact.ts to accept file path
- [ ] Read file, pass to engine
- [ ] Add --output flag
- [ ] Handle file errors
- [ ] Write tests

**Verify**: `masqo redact input.txt --output out.txt` works

---

### Task 4.4: Config Management
- [ ] Create src/commands/config.ts
- [ ] Implement set-policy, get, add-rule subcommands
- [ ] Store config in ~/.masqo/config.json
- [ ] Load config on CLI startup
- [ ] Write tests

**Verify**: Config persists, used by default

---

### Task 4.5: Output Formatting & Spinner
- [ ] Create src/ui/spinner.ts using ora
- [ ] Add spinner for long operations
- [ ] Add progress for large files
- [ ] Color-code output (chalk)
- [ ] Write UI tests

**Verify**: Spinner and colored output work

---

## PHASE 5: CLI - INTERACTIVE REVIEW

### Task 5.1: Review Command Structure
- [ ] Create src/commands/review.ts
- [ ] Read input (file or stdin)
- [ ] Run engine scan
- [ ] Launch TUI
- [ ] Write skeleton tests

**Verify**: `masqo review file.txt` launches TUI

---

### Task 5.2: Side-by-Side View (Ink UI)
- [ ] Create src/ui/review-ui.tsx using Ink
- [ ] Implement split pane (original | redacted)
- [ ] Highlight detections
- [ ] Add navigation (arrows, j/k)
- [ ] Write UI tests

**Verify**: Side-by-side view works, scrolling works

**CHECKPOINT**: Ink UI viable? Consider alternatives if not.

---

### Task 5.3: Per-Detection Approval
- [ ] Add detection list panel
- [ ] Implement Space: toggle, A: accept all, R: reject all
- [ ] Show count (5 of 10 accepted)
- [ ] Write interaction tests

**Verify**: Can toggle individual detections

---

### Task 5.4: Review Output & Save
- [ ] Apply accepted redactions
- [ ] Output to stdout or file
- [ ] Show summary (found/applied/ignored)
- [ ] Write end-to-end tests

**Verify**: Only accepted detections redacted

---

## PHASE 6: CLI - CLAUDE CODE HOOK

### Task 6.1: Hook Installation Command
- [ ] Create src/commands/install-hook.ts
- [ ] Implement `masqo install-hook claude-code`
- [ ] Detect Claude Code config location
- [ ] Add hook to config
- [ ] Write tests

**Verify**: Hook added to Claude Code config

---

### Task 6.2: Hook Execution Mode
- [ ] Add --hook flag to redact command
- [ ] Non-interactive mode (JSON output only)
- [ ] Exit code 0=clean, 1=secrets
- [ ] Write tests

**Verify**: `masqo redact --hook` runs fast (<100ms overhead)

---

### Task 6.3: Hook Integration Testing with Claude Code
- [ ] Set up test Claude Code workspace
- [ ] Configure hook
- [ ] Test file operations trigger hook
- [ ] Document hook setup
- [ ] Write integration guide

**Verify**: Hook works in real Claude Code workflow

**Deliverable**: docs/claude-code-hook-setup.md

**CHECKPOINT 3**: CLI + hook works? Proceed to extension?

---

## PHASE 7: EXTENSION - FIRST VERTICAL SLICE

### Task 7.1: Extension Package Structure
- [ ] Create packages/extension/ with package.json
- [ ] Create public/manifest.json (Manifest V3)
- [ ] Set up build config (Vite/webpack)
- [ ] Create background service worker
- [ ] Add build scripts

**Verify**: Extension loads in Chrome (unpacked)

---

### Task 7.2: Content Script - ChatGPT Injection
- [ ] Create src/content/chatgpt.ts
- [ ] Detect ChatGPT textarea
- [ ] Intercept paste events
- [ ] Prevent paste if secrets detected
- [ ] Write tests

**Verify**: Paste interception works on chat.openai.com

---

### Task 7.3: Sidebar Review UI (React)
- [ ] Create src/sidebar/Sidebar.tsx
- [ ] Inject sidebar on detection
- [ ] Implement side-by-side view
- [ ] Highlight detections
- [ ] Add accept/reject per detection
- [ ] Add "Paste Clean" button
- [ ] Write React tests

**Verify**: Sidebar shows, paste works

**CHECKPOINT**: Sidebar injection works? Shadow DOM needed?

---

### Task 7.4: Message Passing (Content ↔ Background)
- [ ] Create src/background/index.ts
- [ ] Set up message passing (scan request/response)
- [ ] Handle errors
- [ ] Write tests

**Verify**: <50ms round trip

---

### Task 7.5: Storage Integration
- [ ] Create src/storage/index.ts
- [ ] Wrap chrome.storage.sync API
- [ ] Store policy, preferences, token mappings (encrypted)
- [ ] Write tests

**Verify**: Policy persists across sessions

---

### Task 7.6: Extension Integration Test (ChatGPT)
- [ ] Write end-to-end test
- [ ] Document test procedure

**Verify**: Full flow works on ChatGPT

---

## PHASE 8: EXTENSION - COMPLETE COVERAGE

### Task 8.1: Content Script - Claude.ai
- [ ] Create src/content/claude.ts
- [ ] Detect Claude.ai textarea
- [ ] Reuse paste interception
- [ ] Write tests

**Verify**: Works on claude.ai

---

### Task 8.2: Content Script - Gemini
- [ ] Create src/content/gemini.ts
- [ ] Detect Gemini textarea
- [ ] Reuse paste interception
- [ ] Write tests

**Verify**: Works on gemini.google.com

---

### Task 8.3: Common Content Script Utilities
- [ ] Create src/content/common.ts
- [ ] Extract shared logic (textarea detection, paste, sidebar)
- [ ] Refactor chatgpt/claude/gemini to use common
- [ ] Write tests

**Verify**: All 3 sites still work, no duplication

---

### Task 8.4: Site Detection & Auto-Injection
- [ ] Update manifest.json with content_scripts matches
- [ ] Auto-detect site, load appropriate script
- [ ] Write tests

**Verify**: Auto-activates on all 3 sites

---

### Task 8.5: Extension Performance Optimization
- [ ] Profile performance
- [ ] Optimize (lazy-load sidebar, debounce, cache policy)
- [ ] Benchmark before/after
- [ ] Document optimizations

**Verify**: Paste <50ms overhead, sidebar <200ms, memory <10MB

---

## PHASE 9: EXTENSION - POLISH

### Task 9.1: Popup UI - Policy Selector
- [ ] Create src/popup/Popup.tsx
- [ ] Policy selector dropdown
- [ ] Current policy display
- [ ] Quick stats
- [ ] Write tests

**Verify**: Popup works, can switch policy

---

### Task 9.2: Popup UI - Recent Detections
- [ ] Add recent detections list
- [ ] Store last 10 in storage
- [ ] Clear history button
- [ ] Write tests

**Verify**: Shows recent detections

---

### Task 9.3: Policy Import/Export
- [ ] Add "Export Policy" button
- [ ] Add "Import Policy" picker
- [ ] Validate imported policies
- [ ] Write tests

**Verify**: Can export/import, syncs with CLI

---

### Task 9.4: Extension Onboarding
- [ ] Detect first install
- [ ] Show onboarding page
- [ ] Write tests

**Verify**: Shows on first install

**CHECKPOINT 4**: Extension feature-complete? Proceed to web app?

---

## PHASE 10: WEB APP

### Task 10.1: Web App Structure (Vite + React)
- [ ] Create packages/web/ with package.json
- [ ] Initialize Vite + React + TypeScript
- [ ] Set up routing
- [ ] Create App.tsx skeleton
- [ ] Add build scripts

**Verify**: `npm run dev` starts server

---

### Task 10.2: Editor Component - Side-by-Side View
- [ ] Create src/components/Editor.tsx
- [ ] Implement split pane (input | output)
- [ ] Highlight detections
- [ ] Sync scroll
- [ ] Write tests

**Verify**: Side-by-side editor works

---

### Task 10.3: Detection List & Accept/Reject
- [ ] Create src/components/DetectionList.tsx
- [ ] Show detections with accept/reject
- [ ] Update editor on toggle
- [ ] Write tests

**Verify**: Detection list works, editor updates

---

### Task 10.4: Policy Picker Component
- [ ] Create src/components/PolicyPicker.tsx
- [ ] Dropdown with presets
- [ ] Custom policy editor
- [ ] Write tests

**Verify**: Can select/edit policies

---

### Task 10.5: File Operations (Drop, Export)
- [ ] Add drag-and-drop to Editor
- [ ] Handle file drop
- [ ] Add "Export" button
- [ ] Write tests

**Verify**: Drag-drop works, export downloads file

---

### Task 10.6: Web App Deployment & Hosting
- [ ] Configure Vite for production
- [ ] Test build
- [ ] Document deployment (Netlify/Vercel/GitHub Pages)
- [ ] Deploy to test environment

**Verify**: Works on static hosting

---

## PHASE 11: INTEGRATION & LAUNCH PREP

### Task 11.1: Cross-Package Integration Tests
- [ ] Create tests/integration/ directory
- [ ] Write tests: CLI→Engine, Extension→Engine, Web→Engine
- [ ] Test policy sync across surfaces
- [ ] Use real test data
- [ ] Automate tests

**Verify**: All integration tests pass

---

### Task 11.2: Performance Benchmarks
- [ ] Create benchmarks/ directory
- [ ] Implement benchmarks (10KB <100ms, 1MB <1s)
- [ ] Run in CI
- [ ] Document results

**Verify**: Meets performance targets

---

### Task 11.3: Documentation - User Guides
- [ ] Create docs/user-guide/ directory
- [ ] Write: Getting Started, CLI Usage, Extension Usage, Web Usage
- [ ] Write: Policy Customization, Troubleshooting
- [ ] Add screenshots/gifs

**Deliverable**: docs/user-guide/

---

### Task 11.4: Documentation - Detection Patterns
- [ ] Create docs/detection-patterns.md
- [ ] Document each detector (pattern, examples, confidence)
- [ ] Auto-generate from code where possible

**Deliverable**: docs/detection-patterns.md

---

### Task 11.5: CI/CD Pipeline
- [ ] Create .github/workflows/ci.yml (tests, lint, build, benchmarks)
- [ ] Create .github/workflows/release.yml (version, publish, release)
- [ ] Test workflows

**Verify**: CI runs on PR, release workflow publishes

---

### Task 11.6: README & Launch Checklist
- [ ] Write comprehensive README.md
- [ ] Create launch checklist
- [ ] Verify all acceptance criteria met
- [ ] Final review

**Deliverable**: README.md + LAUNCH_CHECKLIST.md

**CHECKPOINT 5**: All acceptance criteria met? Launch!

---

## Summary

**Total Tasks**: 69
**Estimated Duration**: 54 days solo, 6-7 weeks with 2 developers

**Parallel Tracks** (after Phase 3):
- Track A: CLI (Phases 4-6)
- Track B: Extension (Phases 7-9)
- Track C: Web (Phase 10) - after A & B
- Track D: Integration (Phase 11) - after all

**Current Status**: [ ] Not started

---

## Notes

- Use `[x]` to mark completed tasks
- Use `[>]` for in-progress tasks
- Use `[!]` for blocked tasks
- Use `[~]` for skipped/deferred tasks
- Update this file as work progresses
- Reference plan.md for detailed task descriptions
