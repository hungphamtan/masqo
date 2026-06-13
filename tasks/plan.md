# Implementation Plan: Masqo MVP

## Overview

Build Masqo MVP (Phases 1-3) using vertical slicing strategy. Each task delivers end-to-end functionality that can be tested and validated independently.

## Dependency Graph

```
Foundation Layer (0)
├── Monorepo setup
└── Shared types package

Engine Core (1)
├── Core types & interfaces
├── Detection engine
│   ├── Secret detectors
│   ├── Log detectors
│   └── Detector registry
├── Replacement strategies
│   ├── Redact
│   ├── Tokenize
│   ├── Partial
│   └── Warn
├── Policy system
│   ├── Parser
│   ├── Manager
│   └── Presets
└── Explainer

CLI Shell (2) - depends on Engine Core
├── Basic CLI structure
├── Redact command
├── Review command (interactive UI)
├── Config management
└── Claude Code hook

Extension Shell (3) - depends on Engine Core
├── Extension structure
├── Content scripts
├── Popup UI
├── Sidebar review UI
└── Storage integration

Web Shell (4) - depends on Engine Core
├── Web app structure
├── Editor component
├── Policy picker
└── Detection list

Integration & Polish (5)
├── Cross-package integration tests
├── Performance benchmarks
├── Documentation
└── CI/CD
```

## Vertical Slices Strategy

Instead of building horizontally (all detectors → all replacers → all UIs), build vertically:

**Vertical Slice = One detector type + One replacer + One surface**

This allows:
- Early end-to-end testing
- Faster feedback loops
- Demonstrable progress at each step
- Reduced integration risk

## Implementation Phases

### Phase 0: Foundation (2 tasks)
**Goal**: Monorepo structure ready for development

**Deliverable**: Can run `npm install && npm run build && npm test` successfully

---

### Phase 1: Engine Core - First Vertical Slice (6 tasks)
**Goal**: AWS secret detection working end-to-end with all replacement modes

**Deliverable**: Can detect and redact AWS keys with provenance explanation

**Vertical slice**: AWS secrets → All 4 replacement modes → JSON output

---

### Phase 2: Engine Core - Complete P0 Detectors (8 tasks)
**Goal**: All P0 secret and log patterns working

**Deliverable**: Detects all P0 patterns (API keys, JWTs, DB URLs, stack traces, headers)

**Vertical slices**:
- Cloud providers (GCP, GitHub, Stripe)
- Auth tokens (JWT, Bearer, API keys)
- Database & connection strings
- Log patterns (stack traces, headers, config blobs)

---

### Phase 3: Policy System (4 tasks)
**Goal**: Users can customize detection rules via JSON policies

**Deliverable**: Can load/save/edit policies, apply custom rules

---

### Phase 4: CLI - First Vertical Slice (5 tasks)
**Goal**: Basic CLI redacting files with AWS detector

**Deliverable**: `cat secrets.txt | masqo redact` works

**Vertical slice**: File I/O → Engine integration → Output formatting

---

### Phase 5: CLI - Interactive Review (4 tasks)
**Goal**: Side-by-side review UI in terminal

**Deliverable**: `masqo review file.log` shows interactive approval UI

---

### Phase 6: CLI - Claude Code Hook (3 tasks)
**Goal**: Hook integration working

**Deliverable**: Claude Code calls masqo on file operations

---

### Phase 7: Extension - First Vertical Slice (6 tasks)
**Goal**: ChatGPT paste interception working

**Deliverable**: Paste into ChatGPT triggers review sidebar

**Vertical slice**: Content script → Engine call → Sidebar UI

---

### Phase 8: Extension - Complete Coverage (5 tasks)
**Goal**: All AI chat sites supported

**Deliverable**: Works on ChatGPT, Claude, Gemini

---

### Phase 9: Extension - Polish (4 tasks)
**Goal**: Popup, storage, policy sync

**Deliverable**: Extension feature-complete per Phase 2 spec

---

### Phase 10: Web App (6 tasks)
**Goal**: Minimal web app for manual review

**Deliverable**: Drag-drop file → side-by-side review → export

---

### Phase 11: Integration & Launch Prep (6 tasks)
**Goal**: Production-ready MVP

**Deliverable**: CI/CD, docs, benchmarks passing

---

## Task Breakdown

### PHASE 0: FOUNDATION

#### Task 0.1: Initialize Monorepo
**Slice**: Infrastructure
**Dependencies**: None
**Estimated complexity**: Medium

**Implementation**:
1. Initialize npm workspace at root
2. Create `turbo.json` with build pipeline
3. Create base `tsconfig.json` with strict mode
4. Create `.gitignore`, `.prettierrc`, `.eslintrc.json`
5. Set up package directory structure under `packages/`

**Acceptance Criteria**:
- [ ] `npm install` succeeds from root
- [ ] `turbo.json` defines build/test/lint tasks
- [ ] TypeScript strict mode enabled
- [ ] ESLint + Prettier configured

**Verification**:
```bash
npm install
npm run build  # should pass (even with empty packages)
npm run lint   # should pass
```

---

#### Task 0.2: Create Shared Package
**Slice**: Shared types and utilities
**Dependencies**: Task 0.1
**Estimated complexity**: Small

**Implementation**:
1. Create `packages/shared/` with package.json
2. Define core types in `src/types.ts`:
   - `Detection` type
   - `ReplacementMode` enum
   - `PolicyConfig` interface
   - `Position` type
3. Export from `src/index.ts`
4. Write basic unit tests

**Acceptance Criteria**:
- [ ] Package builds successfully
- [ ] Types are exported and importable
- [ ] 100% test coverage for type utilities

**Verification**:
```bash
cd packages/shared
npm run build
npm test
```

---

### PHASE 1: ENGINE CORE - FIRST VERTICAL SLICE

#### Task 1.1: Core Engine Types & Interfaces
**Slice**: Engine foundation
**Dependencies**: Task 0.2
**Estimated complexity**: Medium

**Implementation**:
1. Create `packages/engine/` with package.json
2. Define `src/types.ts`:
   - `Detector` interface
   - `Replacer` interface
   - `Detection` result type
   - `EngineConfig` type
3. Define `src/engine.ts` main orchestrator skeleton
4. Write interface tests (mocks)

**Acceptance Criteria**:
- [ ] All core interfaces defined
- [ ] Engine orchestrator accepts config and input
- [ ] Tests verify interface contracts

**Verification**:
```bash
cd packages/engine
npm run type-check  # passes
npm test            # mock tests pass
```

---

#### Task 1.2: AWS Secret Detector (First Vertical Slice)
**Slice**: AWS secrets detection
**Dependencies**: Task 1.1
**Estimated complexity**: Medium

**Implementation**:
1. Create `src/detectors/secrets/aws.ts`
2. Implement patterns for:
   - AWS Access Key ID (AKIA...)
   - AWS Secret Access Key
   - AWS Session Token
3. Return `Detection[]` with position, type, confidence
4. Write comprehensive tests (true positives, false positives, edge cases)

**Pattern Examples**:
- Access Key: `AKIA[0-9A-Z]{16}`
- Secret Key: `[A-Za-z0-9/+=]{40}`

**Acceptance Criteria**:
- [ ] Detects real AWS keys from test fixtures
- [ ] Ignores example patterns in comments
- [ ] Handles multi-line input
- [ ] Returns accurate position info
- [ ] Test coverage >90%

**Verification**:
```bash
npm test -- aws.test.ts
# Should detect: AKIAIOSFODNN7EXAMPLE
# Should ignore: // Example: AKIA...
```

---

#### Task 1.3: Replacement Strategies - All 4 Modes
**Slice**: Redact, Tokenize, Partial, Warn
**Dependencies**: Task 1.1
**Estimated complexity**: Medium

**Implementation**:
1. Create `src/replacers/redact.ts`: Replace with `[REDACTED:type]`
2. Create `src/replacers/tokenize.ts`: Generate UUID token, store mapping
3. Create `src/replacers/partial.ts`: Show first/last N chars (e.g., `AKIA...MPLE`)
4. Create `src/replacers/warn.ts`: Return original + warning flag
5. Create `src/replacers/index.ts`: Export all strategies
6. Write tests for each mode

**Acceptance Criteria**:
- [ ] Redact mode produces `[REDACTED:aws-access-key]`
- [ ] Tokenize mode generates reversible tokens
- [ ] Partial mode shows configurable reveal (default 4 chars each side)
- [ ] Warn mode preserves original content
- [ ] All modes preserve string length context where possible

**Verification**:
```typescript
const input = 'AKIAIOSFODNN7EXAMPLE'
redact(input) // '[REDACTED:aws-access-key]'
tokenize(input) // 'TOKEN_a1b2c3d4', mapping stored
partial(input) // 'AKIA...MPLE'
warn(input) // 'AKIAIOSFODNN7EXAMPLE' + { warning: true }
```

---

#### Task 1.4: Explainer System
**Slice**: Detection provenance
**Dependencies**: Task 1.2
**Estimated complexity**: Small

**Implementation**:
1. Create `src/explainer/index.ts`
2. Implement `explain(detection)` returning:
   - Pattern name
   - Confidence score
   - Rule source (detector path)
   - Human-readable explanation
3. Write tests verifying explanation quality

**Acceptance Criteria**:
- [ ] Every detection has explanation
- [ ] Explanation includes pattern, confidence, source
- [ ] Human-readable messages (not just codes)

**Verification**:
```json
{
  "type": "aws-access-key",
  "confidence": 0.95,
  "source": "detector:secrets/aws",
  "explanation": "Detected AWS access key pattern (AKIA followed by 16 alphanumeric chars)"
}
```

---

#### Task 1.5: Detector Registry
**Slice**: Plugin system for detectors
**Dependencies**: Task 1.2
**Estimated complexity**: Small

**Implementation**:
1. Create `src/detectors/index.ts`
2. Implement registry pattern:
   - `register(name, detector)`
   - `get(name): Detector`
   - `list(): string[]`
3. Auto-register built-in detectors
4. Write tests for registry operations

**Acceptance Criteria**:
- [ ] Can register custom detectors
- [ ] Can retrieve detector by name
- [ ] Built-in detectors auto-registered
- [ ] Thread-safe (immutable after init)

**Verification**:
```typescript
const registry = createRegistry()
registry.register('aws', awsDetector)
const detector = registry.get('aws')
detector.detect(input) // works
```

---

#### Task 1.6: Engine Orchestrator - First Integration
**Slice**: End-to-end engine flow
**Dependencies**: Tasks 1.2, 1.3, 1.4, 1.5
**Estimated complexity**: Medium

**Implementation**:
1. Implement `engine.scan(input, config)`:
   - Run all enabled detectors
   - Collect detections
   - Apply replacement mode
   - Attach explanations
   - Return result object
2. Write integration tests with real AWS keys
3. Test all 4 replacement modes

**Acceptance Criteria**:
- [ ] Accepts string input and config
- [ ] Returns detections with explanations
- [ ] Applies correct replacement mode
- [ ] Handles empty input gracefully
- [ ] Performance: <100ms for 10KB input

**Verification**:
```typescript
const result = engine.scan('AWS key: AKIAIOSFODNN7EXAMPLE', {
  mode: 'redact',
  detectors: ['aws']
})
// result.output: 'AWS key: [REDACTED:aws-access-key]'
// result.detections: [{ type: 'aws-access-key', ... }]
```

---

### PHASE 2: ENGINE CORE - COMPLETE P0 DETECTORS

#### Task 2.1: Cloud Provider Secrets (GCP, GitHub, Stripe)
**Slice**: Additional cloud providers
**Dependencies**: Task 1.6
**Estimated complexity**: Medium

**Implementation**:
1. Create `src/detectors/secrets/gcp.ts`:
   - GCP API keys
   - Service account JSON keys
2. Create `src/detectors/secrets/github.ts`:
   - GitHub personal access tokens (ghp_, gho_, etc.)
   - GitHub OAuth tokens
3. Create `src/detectors/secrets/stripe.ts`:
   - Stripe secret keys (sk_live_, sk_test_)
   - Stripe publishable keys
4. Write comprehensive tests for each

**Acceptance Criteria**:
- [ ] Detects real GCP/GitHub/Stripe keys
- [ ] Low false positive rate (<5% on test corpus)
- [ ] Proper confidence scores
- [ ] Integrated into detector registry

**Verification**:
```bash
npm test -- secrets/*.test.ts
# All cloud provider detectors passing
```

---

#### Task 2.2: Auth Tokens (JWT, Bearer, Cookies)
**Slice**: Authentication credentials
**Dependencies**: Task 1.6
**Estimated complexity**: Medium

**Implementation**:
1. Create `src/detectors/secrets/jwt.ts`:
   - JWT pattern (3 base64 segments)
   - Validate structure
2. Create `src/detectors/secrets/bearer.ts`:
   - Bearer token patterns
   - Authorization header values
3. Create `src/detectors/secrets/cookies.ts`:
   - Session cookies
   - Auth cookies (common names)
4. Write tests including edge cases

**Acceptance Criteria**:
- [ ] Detects valid JWTs (eyJ...)
- [ ] Detects Bearer tokens in headers
- [ ] Detects sensitive cookie values
- [ ] Ignores example/dummy tokens

**Verification**:
```typescript
detect('Authorization: Bearer abc123...')
// Returns detection for bearer token
detect('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')
// Returns detection for JWT
```

---

#### Task 2.3: Database & Connection Strings
**Slice**: DB credentials
**Dependencies**: Task 1.6
**Estimated complexity**: Medium

**Implementation**:
1. Create `src/detectors/secrets/database.ts`:
   - PostgreSQL connection strings
   - MySQL connection strings
   - MongoDB connection strings
   - Redis URLs
   - DSNs (Sentry, etc.)
2. Extract credentials from connection strings
3. Write tests with real (sanitized) examples

**Acceptance Criteria**:
- [ ] Detects postgres://user:pass@host patterns
- [ ] Detects mysql://user:pass@host patterns
- [ ] Detects mongodb+srv://user:pass@host patterns
- [ ] Handles URL-encoded credentials

**Verification**:
```typescript
detect('postgresql://admin:secret123@localhost/db')
// Returns detection with extracted password
```

---

#### Task 2.4: Environment Variables (.env patterns)
**Slice**: .env file secrets
**Dependencies**: Task 1.6
**Estimated complexity**: Small

**Implementation**:
1. Create `src/detectors/secrets/env.ts`:
   - Pattern: `KEY=value` where KEY contains SECRET/PASSWORD/TOKEN/API_KEY
   - Extract variable name and value
   - Flag high-risk env var names
2. Write tests with common .env files

**Acceptance Criteria**:
- [ ] Detects API_KEY=xxx patterns
- [ ] Detects SECRET=xxx patterns
- [ ] Detects PASSWORD=xxx patterns
- [ ] Case-insensitive matching

**Verification**:
```
API_KEY=sk_live_123456
DATABASE_PASSWORD=hunter2
```
Both should be detected.

---

#### Task 2.5: Stack Trace Detector
**Slice**: Log sanitization - stack traces
**Dependencies**: Task 1.6
**Estimated complexity**: Medium

**Implementation**:
1. Create `src/detectors/code/stacktrace.ts`:
   - Detect common stack trace formats (Node.js, Python, Java, etc.)
   - Extract file paths that may contain sensitive dirs
   - Flag line numbers and function names that leak info
2. Write tests with real stack traces

**Acceptance Criteria**:
- [ ] Detects Node.js stack traces (at /path/to/file.js:line:col)
- [ ] Detects Python tracebacks
- [ ] Extracts file paths
- [ ] Confidence score based on pattern completeness

**Verification**:
```
Error: ENOENT
    at /Users/john/secret-project/api/auth.js:42:10
```
Should detect and flag the file path.

---

#### Task 2.6: HTTP Headers & Payloads
**Slice**: Log sanitization - HTTP content
**Dependencies**: Task 1.6
**Estimated complexity**: Medium

**Implementation**:
1. Create `src/detectors/code/headers.ts`:
   - Detect Authorization headers
   - Detect Cookie headers
   - Detect X-API-Key headers
   - Detect Set-Cookie responses
2. Create `src/detectors/code/payloads.ts`:
   - Detect JSON with password/token fields
   - Detect form data with credentials
3. Write tests with HTTP logs

**Acceptance Criteria**:
- [ ] Detects headers: `Authorization: Bearer xxx`
- [ ] Detects headers: `Cookie: session=xxx`
- [ ] Detects JSON: `{ "password": "xxx" }`
- [ ] Handles multiline logs

**Verification**:
```
POST /login HTTP/1.1
Authorization: Bearer abc123
Content-Type: application/json

{"username":"admin","password":"secret"}
```
Should detect both bearer token and password.

---

#### Task 2.7: Config Blobs (JSON/YAML)
**Slice**: Configuration sanitization
**Dependencies**: Task 1.6
**Estimated complexity**: Medium

**Implementation**:
1. Create `src/detectors/code/config.ts`:
   - Detect JSON objects with sensitive keys
   - Detect YAML with sensitive keys
   - Detect TOML with sensitive keys
   - Look for: apiKey, secretKey, password, token, credentials
2. Write parser-based detection (not just regex)
3. Write tests with config files

**Acceptance Criteria**:
- [ ] Detects nested JSON with secrets
- [ ] Detects YAML with secrets
- [ ] Handles comments in YAML/TOML
- [ ] Returns key path (e.g., `config.api.secretKey`)

**Verification**:
```json
{
  "database": {
    "password": "hunter2"
  },
  "api": {
    "secretKey": "abc123"
  }
}
```
Both secrets detected with key paths.

---

#### Task 2.8: Integrate External Libraries (ggshield, detect-secrets)
**Slice**: Leverage existing pattern databases
**Dependencies**: Task 2.7
**Estimated complexity**: Large

**Implementation**:
1. Research integration options:
   - ggshield: Can we use their patterns? License?
   - detect-secrets: Python tool, can we port patterns?
2. Create `src/detectors/secrets/external.ts`:
   - Wrapper around external library patterns
   - Attribution in explainer
3. Benchmark performance vs custom detectors
4. Write tests comparing results

**Acceptance Criteria**:
- [ ] External patterns integrated
- [ ] Attribution clear in output
- [ ] Performance acceptable (<2x slowdown)
- [ ] Can disable external detectors via config
- [ ] License compliance verified

**Verification**:
Run against known leaked credentials corpus, compare detection rates.

**Note**: May need to refactor into custom pattern database if direct integration is too complex/slow.

---

### PHASE 3: POLICY SYSTEM

#### Task 3.1: Policy File Parser
**Slice**: JSON policy parsing
**Dependencies**: Task 2.8
**Estimated complexity**: Medium

**Implementation**:
1. Create `src/policies/parser.ts`
2. Define JSON schema for policy files (based on ADR-006)
3. Implement parser with validation:
   - Schema validation (Zod or similar)
   - Custom rule validation (regex patterns)
   - Version checking
4. Write tests for valid/invalid policies

**Acceptance Criteria**:
- [ ] Parses valid policy JSON
- [ ] Rejects invalid policies with helpful errors
- [ ] Validates custom regex patterns
- [ ] Handles missing optional fields

**Verification**:
```json
{
  "name": "Developer",
  "version": "1.0.0",
  "detectors": {
    "secrets": { "enabled": true },
    "pii": { "enabled": false }
  },
  "customRules": [],
  "replacementMode": "tokenize"
}
```
Should parse successfully.

---

#### Task 3.2: Policy Manager
**Slice**: Policy CRUD operations
**Dependencies**: Task 3.1
**Estimated complexity**: Small

**Implementation**:
1. Create `src/policies/manager.ts`
2. Implement:
   - `loadPolicy(json): Policy`
   - `savePolicy(policy): string`
   - `mergeRules(base, custom): Policy`
   - `validatePolicy(policy): Result`
3. Write tests for all operations

**Acceptance Criteria**:
- [ ] Can load policy from JSON
- [ ] Can merge custom rules with base policy
- [ ] Validates policy before applying
- [ ] Returns helpful error messages

**Verification**:
```typescript
const policy = manager.loadPolicy(jsonString)
const merged = manager.mergeRules(basePolicy, customRules)
manager.validatePolicy(merged) // Ok or Error
```

---

#### Task 3.3: Policy Presets (Developer, General)
**Slice**: Persona-based defaults
**Dependencies**: Task 3.2
**Estimated complexity**: Small

**Implementation**:
1. Create `src/policies/presets/` directory
2. Create `developer.json`:
   - Secrets: enabled, high confidence
   - PII: disabled
   - Logs: enabled
   - Replacement mode: tokenize
3. Create `general.json`:
   - Secrets: enabled
   - PII: enabled, medium confidence
   - Logs: disabled
   - Replacement mode: redact
4. Document preset rationale

**Acceptance Criteria**:
- [ ] Developer preset focuses on code/logs/secrets
- [ ] General preset includes PII protection
- [ ] Presets are valid policy files
- [ ] Can load presets by name

**Verification**:
```typescript
const devPolicy = loadPreset('developer')
const genPolicy = loadPreset('general')
```

---

#### Task 3.4: Engine Integration with Policies
**Slice**: Apply policies to engine config
**Dependencies**: Task 3.3
**Estimated complexity**: Medium

**Implementation**:
1. Update `engine.scan()` to accept policy
2. Map policy to detector enablement
3. Map policy to replacement mode
4. Apply custom rules from policy
5. Write integration tests

**Acceptance Criteria**:
- [ ] Engine respects policy detector settings
- [ ] Engine uses policy replacement mode
- [ ] Custom rules from policy are applied
- [ ] Policy can disable built-in detectors

**Verification**:
```typescript
const policy = loadPreset('developer')
engine.scan(input, { policy })
// Only secret and log detectors run
// Uses tokenize mode
```

---

### PHASE 4: CLI - FIRST VERTICAL SLICE

#### Task 4.1: CLI Package Structure
**Slice**: CLI foundation
**Dependencies**: Task 3.4
**Estimated complexity**: Small

**Implementation**:
1. Create `packages/cli/` with package.json
2. Add dependencies: commander, chalk, ora (spinner)
3. Create `src/index.ts` with basic CLI skeleton
4. Set up binary entry point
5. Add to root package scripts

**Acceptance Criteria**:
- [ ] Can run `npm run cli -- --help`
- [ ] Package builds successfully
- [ ] Binary executable works
- [ ] Commander.js initialized

**Verification**:
```bash
cd packages/cli
npm run build
./bin/masqo --help
```

---

#### Task 4.2: Redact Command - Stdin
**Slice**: Pipe input to redact
**Dependencies**: Task 4.1
**Estimated complexity**: Medium

**Implementation**:
1. Create `src/commands/redact.ts`
2. Implement stdin reader
3. Call engine.scan()
4. Output redacted text to stdout
5. Add flags: `--mode`, `--policy`, `--format` (text/json)
6. Write CLI tests

**Acceptance Criteria**:
- [ ] `cat file.txt | masqo redact` works
- [ ] `--mode redact|tokenize|partial|warn` works
- [ ] `--policy developer` works
- [ ] `--format json` outputs JSON
- [ ] Handles large input (streams)

**Verification**:
```bash
echo "AWS key: AKIAIOSFODNN7EXAMPLE" | masqo redact
# Output: AWS key: [REDACTED:aws-access-key]

echo "AWS key: AKIAIOSFODNN7EXAMPLE" | masqo redact --format json
# Output: JSON with detections
```

---

#### Task 4.3: Redact Command - File Input
**Slice**: Read from file
**Dependencies**: Task 4.2
**Estimated complexity**: Small

**Implementation**:
1. Update `redact.ts` to accept file path argument
2. Read file, pass to engine, output result
3. Add flag: `--output` to write to file
4. Handle file errors gracefully
5. Write tests with temp files

**Acceptance Criteria**:
- [ ] `masqo redact input.txt` works
- [ ] `masqo redact input.txt --output out.txt` works
- [ ] Handles missing files with error message
- [ ] Preserves file encoding (UTF-8)

**Verification**:
```bash
masqo redact secrets.log
# Prints redacted output

masqo redact secrets.log --output clean.log
# Writes to file
```

---

#### Task 4.4: Config Management
**Slice**: Persistent configuration
**Dependencies**: Task 4.1
**Estimated complexity**: Small

**Implementation**:
1. Create `src/commands/config.ts`
2. Implement:
   - `masqo config set-policy <name>`
   - `masqo config get`
   - `masqo config add-rule --pattern <p> --type <t>`
3. Store config in `~/.masqo/config.json`
4. Load config on CLI startup
5. Write config tests

**Acceptance Criteria**:
- [ ] Can set default policy
- [ ] Can view current config
- [ ] Can add custom rules
- [ ] Config persists between runs

**Verification**:
```bash
masqo config set-policy developer
masqo config get
# Shows: policy=developer

masqo redact file.txt
# Uses developer policy by default
```

---

#### Task 4.5: Output Formatting & Spinner
**Slice**: Better UX
**Dependencies**: Task 4.3
**Estimated complexity**: Small

**Implementation**:
1. Create `src/ui/spinner.ts` using ora
2. Add spinner for long operations
3. Add progress indicator for large files
4. Color-code output (chalk):
   - Red for secrets detected
   - Yellow for warnings
   - Green for clean
5. Write UI tests (snapshot)

**Acceptance Criteria**:
- [ ] Spinner shows during processing
- [ ] Colored output in terminal
- [ ] Progress for files >1MB
- [ ] Can disable colors with --no-color

**Verification**:
```bash
masqo redact large-file.log
# Shows spinner and progress
```

---

### PHASE 5: CLI - INTERACTIVE REVIEW

#### Task 5.1: Review Command Structure
**Slice**: Interactive mode foundation
**Dependencies**: Task 4.5
**Estimated complexity**: Medium

**Implementation**:
1. Create `src/commands/review.ts`
2. Read input (file or stdin)
3. Run engine scan
4. Launch interactive UI (TUI)
5. Write skeleton tests

**Acceptance Criteria**:
- [ ] `masqo review file.txt` launches TUI
- [ ] Detects all secrets/logs in file
- [ ] Can exit gracefully (Ctrl+C)

**Verification**:
```bash
masqo review secrets.log
# Opens TUI
```

---

#### Task 5.2: Side-by-Side View (Ink UI)
**Slice**: Split pane display
**Dependencies**: Task 5.1
**Estimated complexity**: Large

**Implementation**:
1. Create `src/ui/review-ui.tsx` using Ink
2. Implement split pane layout:
   - Left: Original text with highlights
   - Right: Redacted text
3. Highlight detections in different colors
4. Add navigation (arrow keys, j/k)
5. Write UI component tests

**Acceptance Criteria**:
- [ ] Shows original and redacted side-by-side
- [ ] Highlights detections
- [ ] Scrolling works
- [ ] Responsive to terminal size

**Verification**:
Manual testing in terminal at different sizes.

---

#### Task 5.3: Per-Detection Approval
**Slice**: Accept/reject each detection
**Dependencies**: Task 5.2
**Estimated complexity**: Medium

**Implementation**:
1. Add detection list panel
2. Implement:
   - Space: toggle accept/reject
   - A: accept all
   - R: reject all
   - Enter: confirm and apply
3. Show running count of accepted vs rejected
4. Write interaction tests

**Acceptance Criteria**:
- [ ] Can navigate between detections
- [ ] Can toggle individual detections
- [ ] Can accept/reject all
- [ ] Shows count (e.g., "5 of 10 accepted")

**Verification**:
Manual testing with file containing multiple secrets.

---

#### Task 5.4: Review Output & Save
**Slice**: Apply changes
**Dependencies**: Task 5.3
**Estimated complexity**: Small

**Implementation**:
1. After user confirms, apply accepted redactions
2. Output to stdout or file (--output flag)
3. Show summary:
   - Detections found
   - Detections applied
   - Detections ignored
4. Write end-to-end tests

**Acceptance Criteria**:
- [ ] Only accepted detections are redacted
- [ ] Rejected detections stay original
- [ ] Summary is accurate
- [ ] Can save to file

**Verification**:
```bash
masqo review secrets.log --output clean.log
# Review, accept some, reject others
# clean.log contains partial redaction
```

---

### PHASE 6: CLI - CLAUDE CODE HOOK

#### Task 6.1: Hook Installation Command
**Slice**: Hook setup
**Dependencies**: Task 4.5
**Estimated complexity**: Medium

**Implementation**:
1. Create `src/commands/install-hook.ts`
2. Implement `masqo install-hook claude-code`
3. Detect Claude Code config location
4. Add masqo hook to config
5. Verify hook syntax
6. Write tests with mock config

**Acceptance Criteria**:
- [ ] Detects Claude Code config file
- [ ] Adds hook correctly
- [ ] Doesn't duplicate if already installed
- [ ] Provides clear success/error messages

**Verification**:
```bash
masqo install-hook claude-code
# Hook added to Claude Code config
```

---

#### Task 6.2: Hook Execution Mode
**Slice**: Non-interactive hook mode
**Dependencies**: Task 6.1
**Estimated complexity**: Small

**Implementation**:
1. Add `--hook` flag to redact command
2. Hook mode:
   - No interactive prompts
   - Auto-apply policy
   - JSON output only
   - Exit code indicates detections found
3. Write hook integration tests

**Acceptance Criteria**:
- [ ] `masqo redact --hook` runs non-interactively
- [ ] Outputs JSON for parsing
- [ ] Exit code 0 = clean, 1 = secrets found
- [ ] Fast (<100ms overhead)

**Verification**:
```bash
cat file.txt | masqo redact --hook
echo $?  # Check exit code
```

---

#### Task 6.3: Hook Integration Testing with Claude Code
**Slice**: End-to-end hook validation
**Dependencies**: Task 6.2
**Estimated complexity**: Medium

**Implementation**:
1. Set up test Claude Code workspace
2. Configure hook
3. Test file operations trigger hook
4. Test hook output is valid
5. Document hook configuration
6. Write integration guide

**Acceptance Criteria**:
- [ ] Hook triggers on file save in Claude Code
- [ ] Output is parsed correctly by Claude Code
- [ ] Secrets are redacted before Claude sees them
- [ ] Performance is acceptable

**Verification**:
Manual testing with Claude Code in test workspace.

**Deliverable**: docs/claude-code-hook-setup.md

---

### PHASE 7: EXTENSION - FIRST VERTICAL SLICE

#### Task 7.1: Extension Package Structure
**Slice**: Extension foundation
**Dependencies**: Task 3.4 (engine must be complete)
**Estimated complexity**: Medium

**Implementation**:
1. Create `packages/extension/` with package.json
2. Create `public/manifest.json` (Manifest V3)
3. Set up build config (Vite or webpack for bundling)
4. Create basic background service worker
5. Add build scripts

**Acceptance Criteria**:
- [ ] Manifest V3 valid
- [ ] Extension loads in Chrome (unpacked)
- [ ] Background service worker initializes
- [ ] Build process works

**Verification**:
```bash
cd packages/extension
npm run build
# Load unpacked in chrome://extensions
```

---

#### Task 7.2: Content Script - ChatGPT Injection
**Slice**: First AI chat site integration
**Dependencies**: Task 7.1
**Estimated complexity**: Medium

**Implementation**:
1. Create `src/content/chatgpt.ts`
2. Detect ChatGPT textarea
3. Intercept paste events
4. On paste:
   - Get clipboard text
   - Run engine scan
   - If detections, prevent default paste
   - Show sidebar UI
5. Write content script tests

**Acceptance Criteria**:
- [ ] Detects ChatGPT textarea on page load
- [ ] Intercepts paste events
- [ ] Prevents paste if secrets detected
- [ ] Works on chat.openai.com

**Verification**:
1. Load extension in Chrome
2. Open chat.openai.com
3. Copy text with AWS key
4. Paste into textarea
5. Should trigger interception

---

#### Task 7.3: Sidebar Review UI (React)
**Slice**: Extension review interface
**Dependencies**: Task 7.2
**Estimated complexity**: Large

**Implementation**:
1. Create `src/sidebar/Sidebar.tsx`
2. Inject sidebar on detection
3. Implement side-by-side view:
   - Original text (left)
   - Redacted text (right)
4. Highlight detections
5. Add accept/reject per detection
6. Add "Paste Clean" button
7. Write React component tests

**Acceptance Criteria**:
- [ ] Sidebar appears on right side of page
- [ ] Shows original vs redacted
- [ ] Highlights detections with colors
- [ ] Can accept/reject each detection
- [ ] "Paste Clean" pastes redacted version

**Verification**:
Manual testing in ChatGPT with test secrets.

---

#### Task 7.4: Message Passing (Content ↔ Background)
**Slice**: Extension architecture
**Dependencies**: Task 7.3
**Estimated complexity**: Small

**Implementation**:
1. Create `src/background/index.ts`
2. Set up message passing:
   - Content → Background: "scan this text"
   - Background: runs engine, returns detections
   - Background → Content: results
3. Handle errors gracefully
4. Write message passing tests

**Acceptance Criteria**:
- [ ] Content script can request scan
- [ ] Background runs engine and returns results
- [ ] Errors are propagated correctly
- [ ] Performance: <50ms round trip

**Verification**:
Test with Chrome extension debugging tools.

---

#### Task 7.5: Storage Integration
**Slice**: Persist settings
**Dependencies**: Task 7.1
**Estimated complexity**: Small

**Implementation**:
1. Create `src/storage/index.ts`
2. Wrap chrome.storage.sync API
3. Store:
   - Current policy
   - User preferences
   - Token mappings (encrypted)
4. Write storage tests (mock chrome API)

**Acceptance Criteria**:
- [ ] Policy persists across sessions
- [ ] Token mappings encrypted before storage
- [ ] Preferences sync across Chrome instances
- [ ] Handles storage quota errors

**Verification**:
```typescript
await storage.setPolicy(policy)
const loaded = await storage.getPolicy()
// loaded === policy
```

---

#### Task 7.6: Extension Integration Test (ChatGPT)
**Slice**: End-to-end extension flow
**Dependencies**: Tasks 7.2, 7.3, 7.4, 7.5
**Estimated complexity**: Small

**Implementation**:
1. Write end-to-end test:
   - Load extension
   - Navigate to ChatGPT
   - Trigger paste with secrets
   - Verify sidebar appears
   - Accept detections
   - Verify clean paste
2. Document test procedure

**Acceptance Criteria**:
- [ ] Full flow works on ChatGPT
- [ ] No console errors
- [ ] Performance acceptable
- [ ] UX smooth

**Verification**:
Manual test checklist executed.

---

### PHASE 8: EXTENSION - COMPLETE COVERAGE

#### Task 8.1: Content Script - Claude.ai
**Slice**: Claude chat integration
**Dependencies**: Task 7.6
**Estimated complexity**: Small

**Implementation**:
1. Create `src/content/claude.ts`
2. Detect Claude.ai textarea (different DOM structure)
3. Reuse paste interception logic
4. Test on claude.ai
5. Write tests

**Acceptance Criteria**:
- [ ] Works on claude.ai
- [ ] Same UX as ChatGPT integration

**Verification**:
Manual test on claude.ai.

---

#### Task 8.2: Content Script - Gemini
**Slice**: Gemini chat integration
**Dependencies**: Task 7.6
**Estimated complexity**: Small

**Implementation**:
1. Create `src/content/gemini.ts`
2. Detect Gemini textarea
3. Reuse paste interception logic
4. Test on gemini.google.com
5. Write tests

**Acceptance Criteria**:
- [ ] Works on gemini.google.com
- [ ] Same UX as ChatGPT integration

**Verification**:
Manual test on Gemini.

---

#### Task 8.3: Common Content Script Utilities
**Slice**: DRY refactor
**Dependencies**: Tasks 8.1, 8.2
**Estimated complexity**: Small

**Implementation**:
1. Create `src/content/common.ts`
2. Extract shared logic:
   - Textarea detection
   - Paste interception
   - Sidebar injection
3. Refactor chatgpt.ts, claude.ts, gemini.ts to use common
4. Write tests for common utilities

**Acceptance Criteria**:
- [ ] No code duplication between site scripts
- [ ] All 3 sites still work
- [ ] Easier to add new sites

**Verification**:
All 3 sites tested and working.

---

#### Task 8.4: Site Detection & Auto-Injection
**Slice**: Automatic activation
**Dependencies**: Task 8.3
**Estimated complexity**: Small

**Implementation**:
1. Update manifest.json with content_scripts matches
2. Auto-detect site and load appropriate script
3. Add site-specific config if needed
4. Write tests

**Acceptance Criteria**:
- [ ] Extension auto-activates on ChatGPT/Claude/Gemini
- [ ] No manual activation needed
- [ ] Doesn't inject on irrelevant sites

**Verification**:
Load extension, navigate to each site, verify auto-activation.

---

#### Task 8.5: Extension Performance Optimization
**Slice**: Speed & efficiency
**Dependencies**: Task 8.4
**Estimated complexity**: Medium

**Implementation**:
1. Profile extension performance
2. Optimize:
   - Lazy-load sidebar UI
   - Debounce paste events
   - Cache policy in memory
   - Minimize DOM queries
3. Benchmark before/after
4. Document optimizations

**Acceptance Criteria**:
- [ ] Paste interception <50ms overhead
- [ ] Sidebar opens <200ms
- [ ] Memory usage <10MB
- [ ] No jank on typing

**Verification**:
Chrome DevTools performance profiling.

---

### PHASE 9: EXTENSION - POLISH

#### Task 9.1: Popup UI - Policy Selector
**Slice**: Extension popup
**Dependencies**: Task 7.5
**Estimated complexity**: Medium

**Implementation**:
1. Create `src/popup/Popup.tsx`
2. Implement UI:
   - Policy selector dropdown
   - Current policy name
   - Quick stats (detections today)
   - Link to options page
3. Write React tests

**Acceptance Criteria**:
- [ ] Popup shows current policy
- [ ] Can switch policy
- [ ] Shows detection stats
- [ ] Matches extension design guidelines

**Verification**:
Click extension icon, verify popup.

---

#### Task 9.2: Popup UI - Recent Detections
**Slice**: Detection history
**Dependencies**: Task 9.1
**Estimated complexity**: Small

**Implementation**:
1. Add recent detections list to popup
2. Store last 10 detections in storage
3. Display:
   - Detection type
   - Site
   - Timestamp
4. Clear history button
5. Write tests

**Acceptance Criteria**:
- [ ] Shows last 10 detections
- [ ] Updates in real-time
- [ ] Can clear history
- [ ] Privacy: no actual secret values stored

**Verification**:
Trigger detections, check popup shows them.

---

#### Task 9.3: Policy Import/Export
**Slice**: Policy portability
**Dependencies**: Task 9.1
**Estimated complexity**: Small

**Implementation**:
1. Add "Export Policy" button to popup
2. Download policy as JSON file
3. Add "Import Policy" file picker
4. Validate imported policy
5. Write import/export tests

**Acceptance Criteria**:
- [ ] Can export current policy
- [ ] Can import valid policy
- [ ] Invalid policies rejected with error
- [ ] Policy syncs with CLI (same format)

**Verification**:
1. Export policy from extension
2. Import in CLI
3. Verify same behavior

---

#### Task 9.4: Extension Onboarding
**Slice**: First-run experience
**Dependencies**: Task 9.3
**Estimated complexity**: Small

**Implementation**:
1. Detect first install
2. Show onboarding page:
   - Welcome message
   - Policy selection
   - Supported sites
   - Privacy explanation (local-first)
3. Write onboarding tests

**Acceptance Criteria**:
- [ ] Shows on first install only
- [ ] Explains value proposition
- [ ] Helps user choose policy
- [ ] Can skip and set later

**Verification**:
Fresh install in new Chrome profile.

---

### PHASE 10: WEB APP

#### Task 10.1: Web App Structure (Vite + React)
**Slice**: Web app foundation
**Dependencies**: Task 3.4 (engine)
**Estimated complexity**: Small

**Implementation**:
1. Create `packages/web/` with package.json
2. Initialize Vite + React + TypeScript
3. Set up routing (React Router)
4. Create App.tsx skeleton
5. Add build scripts

**Acceptance Criteria**:
- [ ] `npm run dev` starts dev server
- [ ] `npm run build` produces static bundle
- [ ] Can deploy to static hosting
- [ ] TypeScript strict mode enabled

**Verification**:
```bash
cd packages/web
npm run dev
# Open http://localhost:5173
```

---

#### Task 10.2: Editor Component - Side-by-Side View
**Slice**: Main UI component
**Dependencies**: Task 10.1
**Estimated complexity**: Large

**Implementation**:
1. Create `src/components/Editor.tsx`
2. Implement split pane:
   - Left: textarea for input (or file drop)
   - Right: readonly output with redactions
3. Highlight detections
4. Sync scroll between panes
5. Write React tests

**Acceptance Criteria**:
- [ ] Side-by-side editor works
- [ ] Highlights detections
- [ ] Scroll syncs between panes
- [ ] Responsive (mobile-friendly)

**Verification**:
Paste text with secrets, verify highlighting.

---

#### Task 10.3: Detection List & Accept/Reject
**Slice**: Interactive detection management
**Dependencies**: Task 10.2
**Estimated complexity**: Medium

**Implementation**:
1. Create `src/components/DetectionList.tsx`
2. Show list of detections:
   - Type
   - Position
   - Explanation
   - Accept/Reject checkbox
3. Update editor highlights on toggle
4. Write tests

**Acceptance Criteria**:
- [ ] Shows all detections
- [ ] Can toggle accept/reject
- [ ] Editor updates in real-time
- [ ] Shows count (e.g., "5 of 10 accepted")

**Verification**:
Toggle detections, verify editor updates.

---

#### Task 10.4: Policy Picker Component
**Slice**: Policy selection UI
**Dependencies**: Task 10.1
**Estimated complexity**: Small

**Implementation**:
1. Create `src/components/PolicyPicker.tsx`
2. Dropdown with presets (Developer, General)
3. "Custom" option → JSON editor
4. Validate custom policies
5. Write tests

**Acceptance Criteria**:
- [ ] Can select preset
- [ ] Can edit custom policy
- [ ] Invalid policies show error
- [ ] Policy persists in localStorage

**Verification**:
Select different policies, verify detection changes.

---

#### Task 10.5: File Operations (Drop, Export)
**Slice**: File handling
**Dependencies**: Task 10.3
**Estimated complexity**: Medium

**Implementation**:
1. Add drag-and-drop to Editor
2. Handle file drop:
   - Read file
   - Run scan
   - Show in editor
3. Add "Export" button:
   - Download redacted output
   - Filename: original + "-redacted"
4. Write file handling tests

**Acceptance Criteria**:
- [ ] Drag-drop file works
- [ ] Export downloads redacted file
- [ ] Handles large files (stream)
- [ ] Preserves file encoding

**Verification**:
1. Drop secrets.log
2. Review detections
3. Export clean.log
4. Verify content correct

---

#### Task 10.6: Web App Deployment & Hosting
**Slice**: Static hosting
**Dependencies**: Task 10.5
**Estimated complexity**: Small

**Implementation**:
1. Configure Vite for production build
2. Test build output
3. Document deployment:
   - Netlify
   - Vercel
   - GitHub Pages
4. Add deploy script
5. Deploy to test environment

**Acceptance Criteria**:
- [ ] Build produces optimized bundle
- [ ] Works on static hosting
- [ ] No server required
- [ ] HTTPS enforced

**Verification**:
Deploy to Netlify, test functionality.

---

### PHASE 11: INTEGRATION & LAUNCH PREP

#### Task 11.1: Cross-Package Integration Tests
**Slice**: End-to-end testing
**Dependencies**: All previous phases
**Estimated complexity**: Large

**Implementation**:
1. Create `tests/integration/` directory
2. Write tests:
   - CLI → Engine → Output
   - Extension → Engine → Storage
   - Web → Engine → Export
   - Policy sync across surfaces
3. Use real test data (leaked credentials corpus)
4. Automate test runs

**Acceptance Criteria**:
- [ ] All surfaces use same engine
- [ ] Same input → same detections on all surfaces
- [ ] Policies portable between surfaces
- [ ] Integration tests pass

**Verification**:
```bash
npm run test:integration
# All tests pass
```

---

#### Task 11.2: Performance Benchmarks
**Slice**: Performance validation
**Dependencies**: Task 11.1
**Estimated complexity**: Medium

**Implementation**:
1. Create `benchmarks/` directory
2. Implement benchmarks:
   - 10KB input target: <100ms
   - 1MB input target: <1s
   - Memory usage
   - False positive rate
3. Run benchmarks in CI
4. Document results

**Acceptance Criteria**:
- [ ] Meets performance targets
- [ ] No regressions detected
- [ ] Benchmarks run in CI
- [ ] Results published

**Verification**:
```bash
npm run benchmark
# All targets met
```

---

#### Task 11.3: Documentation - User Guides
**Slice**: End-user documentation
**Dependencies**: All features complete
**Estimated complexity**: Medium

**Implementation**:
1. Create `docs/user-guide/` directory
2. Write guides:
   - Getting Started
   - CLI Usage
   - Extension Usage
   - Web App Usage
   - Policy Customization
   - Troubleshooting
3. Add screenshots/gifs
4. Review for clarity

**Acceptance Criteria**:
- [ ] Comprehensive user guides
- [ ] Examples for common tasks
- [ ] Clear troubleshooting steps
- [ ] Visual aids included

**Deliverable**: docs/user-guide/

---

#### Task 11.4: Documentation - Detection Patterns
**Slice**: Pattern documentation
**Dependencies**: All detectors complete
**Estimated complexity**: Small

**Implementation**:
1. Create `docs/detection-patterns.md`
2. Document each detector:
   - Pattern regex
   - Examples (true positives)
   - Counter-examples (false positives avoided)
   - Confidence score logic
3. Auto-generate from code where possible

**Acceptance Criteria**:
- [ ] All patterns documented
- [ ] Examples are accurate
- [ ] Explains confidence scoring
- [ ] Kept in sync with code

**Deliverable**: docs/detection-patterns.md

---

#### Task 11.5: CI/CD Pipeline
**Slice**: Automation
**Dependencies**: All packages complete
**Estimated complexity**: Medium

**Implementation**:
1. Create `.github/workflows/ci.yml`:
   - Run tests on PR
   - Type checking
   - Linting
   - Build all packages
   - Run benchmarks
2. Create `.github/workflows/release.yml`:
   - Version bump
   - Build packages
   - Publish to npm
   - Create GitHub release
3. Test workflows

**Acceptance Criteria**:
- [ ] CI runs on every PR
- [ ] Tests must pass before merge
- [ ] Release workflow publishes packages
- [ ] Semantic versioning enforced

**Verification**:
Create test PR, verify CI runs.

---

#### Task 11.6: README & Launch Checklist
**Slice**: Final polish
**Dependencies**: All tasks complete
**Estimated complexity**: Small

**Implementation**:
1. Write comprehensive README.md:
   - Project overview
   - Installation instructions
   - Quick start
   - Features
   - Contributing guidelines
   - License
2. Create launch checklist:
   - All acceptance criteria met
   - Docs complete
   - Tests passing
   - Performance targets met
   - Security review complete
3. Final review

**Acceptance Criteria**:
- [ ] README clear and comprehensive
- [ ] Launch checklist complete
- [ ] All acceptance criteria verified
- [ ] Ready for public release

**Deliverable**: README.md + LAUNCH_CHECKLIST.md

---

## Risk Management

### High-Risk Tasks
1. **Task 2.8**: External library integration may be complex/slow
   - **Mitigation**: Build custom pattern database as fallback
   - **Checkpoint**: After Task 2.7, evaluate if worth proceeding

2. **Task 5.2**: Ink UI may have limitations for complex layout
   - **Mitigation**: Prototype early, consider alternatives (blessed, react-ink)
   - **Checkpoint**: After Task 5.1, validate approach

3. **Task 7.3**: Extension sidebar injection may conflict with site CSS
   - **Mitigation**: Use Shadow DOM, namespace all styles
   - **Checkpoint**: After Task 7.2, test on multiple sites

4. **Task 11.2**: Performance targets may not be met
   - **Mitigation**: Profile early, optimize hot paths, consider Rust detectors
   - **Checkpoint**: After Task 1.6, run initial benchmarks

### Checkpoints

**Checkpoint 1**: After Phase 1 (Task 1.6)
- Verify: Engine core works end-to-end
- Decision: Proceed to full P0 detectors or adjust architecture?

**Checkpoint 2**: After Phase 3 (Task 3.4)
- Verify: Policy system flexible enough for all use cases
- Decision: Proceed to CLI or refactor policy schema?

**Checkpoint 3**: After Phase 6 (Task 6.3)
- Verify: CLI + hook works in real workflow
- Decision: Proceed to extension or iterate on CLI UX?

**Checkpoint 4**: After Phase 9 (Task 9.4)
- Verify: Extension feature-complete and performant
- Decision: Proceed to web app or polish extension?

**Checkpoint 5**: After Phase 11 (Task 11.6)
- Verify: All acceptance criteria met
- Decision: Launch or additional iteration?

## Success Metrics

### Phase 1 Success
- AWS secrets detected with >95% accuracy
- All 4 replacement modes working
- Performance: <100ms for 10KB input

### Phase 2 Success
- All P0 patterns detected
- False positive rate <5%
- Engine test coverage >80%

### Phase 3 Success
- Policy system intuitive
- Preset policies cover common use cases
- Custom rules work correctly

### Phase 4-6 Success (CLI)
- CLI intuitive for developers
- Claude Code hook works seamlessly
- Interactive review UX smooth

### Phase 7-9 Success (Extension)
- Extension works on ChatGPT, Claude, Gemini
- Paste interception <50ms overhead
- Sidebar UX polished

### Phase 10 Success (Web)
- Web app works without server
- Drag-drop UX intuitive
- Export produces correct output

### Phase 11 Success (Launch)
- All acceptance criteria met
- Documentation complete
- CI/CD working
- Ready for public release

## Timeline Estimate

**Phase 0**: 2 days
**Phase 1**: 5 days
**Phase 2**: 8 days
**Phase 3**: 3 days
**Phase 4**: 4 days
**Phase 5**: 5 days
**Phase 6**: 3 days
**Phase 7**: 6 days
**Phase 8**: 4 days
**Phase 9**: 4 days
**Phase 10**: 5 days
**Phase 11**: 5 days

**Total**: ~54 days (solo developer, ~11 weeks)

With 2 developers working in parallel on independent phases, can reduce to ~6-7 weeks.

## Parallelization Opportunities

After Phase 3 (engine + policy complete), these can run in parallel:
- **Track A**: CLI (Phases 4-6)
- **Track B**: Extension (Phases 7-9)

After both complete:
- **Track C**: Web (Phase 10)

Final integration (Phase 11) requires all tracks complete.
