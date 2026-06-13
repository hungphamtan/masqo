# SPEC.md

## 1. Objective

Build **Masqo**, a local-first redaction engine for AI workflows that protects sensitive data (secrets, credentials, PII, logs) before it reaches AI models.

### Target Users
- **Primary**: Developers using AI coding assistants (Claude Code, Copilot, Cursor) who need to sanitize code, logs, configs, and secrets
- **Secondary**: Non-technical users who paste content into ChatGPT/Claude/Gemini and need PII protection
- **Future**: Teams requiring shared policy enforcement and audit trails

### Core Value Proposition
One privacy engine, many enforcement points. Users get consistent redaction rules whether working via CLI hooks, browser extension, or web app review interface.

## 2. Commands

### Installation
```bash
npm install
npm run build
```

### Development
```bash
npm run dev           # Watch mode for all packages
npm run test          # Run all tests
npm run test:watch    # Watch mode for tests
npm run lint          # ESLint
npm run type-check    # TypeScript type checking
```

### Building
```bash
npm run build         # Build all packages
npm run build:engine  # Build core engine only
npm run build:cli     # Build CLI only
npm run build:ext     # Build browser extension only
npm run build:web     # Build web app only
```

### CLI Usage
```bash
# Install CLI globally
npm install -g @masqo/cli

# Redact a file
masqo redact input.log

# Redact stdin
cat secrets.txt | masqo redact

# Interactive review mode
masqo review input.txt

# Configure policy
masqo config set-policy developer
masqo config add-rule --pattern "custom-pattern" --type secret

# Claude Code hook integration
masqo install-hook claude-code
```

### Extension Development
```bash
npm run dev:ext       # Watch mode for extension
npm run load:ext      # Load unpacked extension in Chrome
```

### Web App Development
```bash
npm run dev:web       # Start local dev server
npm run preview:web   # Preview production build
```

## 3. Project Structure

```
masqo/
├── packages/
│   ├── engine/                    # Core redaction engine
│   │   ├── src/
│   │   │   ├── detectors/        # Detection implementations
│   │   │   │   ├── secrets/      # API keys, tokens, credentials
│   │   │   │   ├── pii/          # Email, phone, SSN, etc.
│   │   │   │   ├── code/         # Stack traces, headers, configs
│   │   │   │   └── index.ts      # Detector registry
│   │   │   ├── policies/         # Policy management
│   │   │   │   ├── presets/      # Developer, General, Legal, etc.
│   │   │   │   ├── parser.ts     # Policy file parser
│   │   │   │   └── manager.ts    # Policy CRUD
│   │   │   ├── replacers/        # Replacement strategies
│   │   │   │   ├── redact.ts     # Full redaction
│   │   │   │   ├── tokenize.ts   # Reversible tokens
│   │   │   │   ├── partial.ts    # Partial reveal
│   │   │   │   └── index.ts
│   │   │   ├── explainer/        # Detection provenance
│   │   │   │   └── index.ts      # "Why flagged" explanations
│   │   │   ├── engine.ts         # Main engine orchestrator
│   │   │   └── types.ts          # Shared types
│   │   ├── tests/
│   │   └── package.json
│   │
│   ├── cli/                       # CLI application
│   │   ├── src/
│   │   │   ├── commands/
│   │   │   │   ├── redact.ts
│   │   │   │   ├── review.ts
│   │   │   │   ├── config.ts
│   │   │   │   └── install-hook.ts
│   │   │   ├── ui/               # Terminal UI components
│   │   │   │   ├── review-ui.ts  # Interactive review interface
│   │   │   │   └── spinner.ts
│   │   │   └── index.ts
│   │   ├── tests/
│   │   └── package.json
│   │
│   ├── extension/                 # Browser extension
│   │   ├── src/
│   │   │   ├── background/       # Service worker
│   │   │   ├── content/          # Content scripts for AI chat sites
│   │   │   │   ├── chatgpt.ts
│   │   │   │   ├── claude.ts
│   │   │   │   ├── gemini.ts
│   │   │   │   └── common.ts
│   │   │   ├── popup/            # Extension popup UI
│   │   │   │   ├── Popup.tsx
│   │   │   │   └── index.tsx
│   │   │   ├── sidebar/          # Side-by-side review UI
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── index.tsx
│   │   │   └── storage/          # Chrome storage wrapper
│   │   ├── public/
│   │   │   └── manifest.json
│   │   ├── tests/
│   │   └── package.json
│   │
│   ├── web/                       # Web app (minimal)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Editor.tsx    # Side-by-side editor
│   │   │   │   ├── PolicyPicker.tsx
│   │   │   │   └── DetectionList.tsx
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── public/
│   │   ├── tests/
│   │   └── package.json
│   │
│   └── shared/                    # Shared utilities
│       ├── src/
│       │   ├── types.ts
│       │   └── utils.ts
│       └── package.json
│
├── docs/
│   ├── product-strategy-redaction-engine.md
│   ├── detection-patterns.md     # Detection pattern documentation
│   └── policy-format.md          # Policy file format spec
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── release.yml
│
├── CLAUDE.md
├── SPEC.md
├── README.md
├── package.json                   # Monorepo root
├── tsconfig.json                  # Base TypeScript config
└── turbo.json                     # Turborepo config
```

### Package Architecture

**@masqo/engine**: Core detection and replacement logic. Zero dependencies on Node.js or browser APIs. Exports pure functions.

**@masqo/cli**: Node.js wrapper around engine. Handles file I/O, stdin/stdout, terminal UI, config persistence.

**@masqo/extension**: Browser wrapper around engine. Handles DOM manipulation, Chrome storage, content script injection.

**@masqo/web**: React app wrapper around engine. Handles UI state, local file handling, import/export.

**@masqo/shared**: Common utilities and types used across packages.

## 4. Code Style

### TypeScript
- **Strict mode**: Enable all strict checks in tsconfig.json
- **No `any`**: Use `unknown` and type guards instead
- **Explicit return types**: All exported functions must declare return types
- **Prefer immutability**: Use `const`, `readonly`, and spread operators

### Naming Conventions
- **Files**: kebab-case (e.g., `secret-detector.ts`)
- **Classes**: PascalCase (e.g., `SecretDetector`)
- **Functions/variables**: camelCase (e.g., `detectSecrets`)
- **Constants**: SCREAMING_SNAKE_CASE (e.g., `MAX_PATTERN_LENGTH`)
- **Interfaces**: PascalCase without `I` prefix (e.g., `Detector` not `IDetector`)
- **Types**: PascalCase (e.g., `ReplacementMode`)

### Module Organization
```typescript
// detector.ts structure
import { ... } from './types'

// 1. Types specific to this module
type InternalState = { ... }

// 2. Constants
const DEFAULT_CONFIG = { ... }

// 3. Helper functions (not exported)
function parsePattern(...) { ... }

// 4. Main exports
export function detect(...): Detection[] { ... }
export class Detector { ... }
```

### Error Handling
- **Use Result types** for expected failures (parsing, validation)
- **Throw errors** only for programmer errors (null refs, invalid state)
- **Custom error classes** for domain errors (e.g., `PolicyParseError`)
- **Never silently swallow errors**

### Comments
- **Avoid obvious comments**: Code should be self-documenting
- **Document "why" not "what"**: Explain rationale for non-obvious decisions
- **JSDoc for public APIs**: All exported functions/classes must have JSDoc
- **TODOs with context**: `// TODO(username): Reason and context`

## 5. Testing Strategy

### Unit Tests
- **Framework**: Vitest
- **Coverage target**: 80% minimum for engine package
- **Location**: Co-located `__tests__` directories or `.test.ts` files
- **Naming**: `<module>.test.ts`

### Test Structure
```typescript
import { describe, it, expect } from 'vitest'

describe('SecretDetector', () => {
  describe('detectApiKeys', () => {
    it('detects AWS access keys', () => {
      // Arrange
      const input = 'AKIAIOSFODNN7EXAMPLE'

      // Act
      const result = detectApiKeys(input)

      // Assert
      expect(result).toHaveLength(1)
      expect(result[0].type).toBe('aws-access-key')
    })

    it('ignores false positives from comments', () => {
      const input = '// Example: AKIA...'
      const result = detectApiKeys(input)
      expect(result).toHaveLength(0)
    })
  })
})
```

### Test Categories

**Engine tests** (packages/engine/tests/):
- Detector accuracy (true positives, false positives, false negatives)
- Replacement strategies
- Policy parsing and validation
- Explainer output correctness

**CLI tests** (packages/cli/tests/):
- Command parsing
- File I/O operations
- Hook installation
- Config management

**Extension tests** (packages/extension/tests/):
- Content script injection
- DOM manipulation
- Storage operations
- Message passing

**Integration tests** (root-level `tests/integration/`):
- End-to-end flows (file redaction via CLI)
- Cross-package interactions (engine + CLI)
- Real-world test cases from docs/test-cases/

### Test Data
- **Golden files**: Store expected outputs in `tests/fixtures/`
- **Real patterns**: Use actual leaked credentials from public breach data (sanitized)
- **Edge cases**: Empty input, huge files, malformed data, Unicode

### Performance Tests
- Benchmark suite for detector performance
- Track regression with `vitest bench`
- Target: <100ms for 10KB input, <1s for 1MB input

## 6. Boundaries

### Always Do
- **Validate all inputs** at package boundaries (engine, CLI args, extension messages)
- **Log detection provenance** for every flagged item (pattern name, confidence, position)
- **Preserve original formatting** where possible (whitespace, indentation)
- **Support dry-run mode** for all operations
- **Make operations reversible** when using tokenization mode
- **Test with real-world data** including leaked credentials from public sources
- **Document detection patterns** in docs/detection-patterns.md
- **Version policy files** with semantic versioning

### Ask First
- **Adding new detector categories** beyond P0 scope (secrets, credentials, logs)
- **Integrating third-party detection libraries** that add significant dependency weight
- **Cloud-based detection** features (conflicts with local-first constraint)
- **Telemetry or analytics** collection (even anonymous)
- **Breaking changes** to policy file format or CLI interface
- **Auto-update mechanisms** for CLI or extension

### Never Do
- **Send content to external APIs** for detection (violates local-first principle)
- **Store unencrypted sensitive data** in config files or extension storage
- **Modify original files in-place** without explicit user confirmation
- **Auto-redact without review** in interactive modes (extension, web app)
- **Silently fail detections** — always report what was checked and what was found
- **Implement obfuscation** that obscures detection logic (transparency is critical for trust)
- **Bundle detection patterns from proprietary sources** without proper licensing

## 7. Architecture Decision Records

### ADR-001: TypeScript for Core Engine

**Status**: Accepted

**Context**: Need to choose implementation language for core redaction engine that will run in CLI (Node.js), browser extension, and web app.

**Decision**: Use TypeScript for core engine instead of Rust.

**Consequences**:
- ✅ Single codebase works across Node.js and browser without WASM compilation
- ✅ Faster development velocity, easier onboarding for contributors
- ✅ Rich ecosystem for regex, string manipulation, JSON parsing
- ✅ Can later port performance-critical detectors to Rust/WASM if needed
- ❌ Slower than native Rust for large file processing
- ❌ No memory safety guarantees from type system

**Mitigation**: Set performance benchmarks (<100ms for 10KB, <1s for 1MB). Consider Rust detectors if benchmarks fail.

---

### ADR-002: Monorepo with Turborepo

**Status**: Accepted

**Context**: Need to manage multiple packages (engine, CLI, extension, web) with shared code and coordinated builds.

**Decision**: Use monorepo with Turborepo for build orchestration.

**Consequences**:
- ✅ Single source of truth for engine logic
- ✅ Atomic commits across packages
- ✅ Parallel builds with caching
- ✅ Enforces clean dependency graph between packages
- ❌ Larger repository size
- ❌ More complex CI/CD setup

**Alternatives Considered**: Separate repos with npm packages — rejected due to versioning complexity and slower iteration.

---

### ADR-003: Shared Engine, Multiple Shells

**Status**: Accepted

**Context**: Users need consistent redaction across CLI, browser, and web workflows. Building separate detection logic per surface creates drift.

**Decision**: Single `@masqo/engine` package with zero platform dependencies. All other packages are thin shells that wrap the engine.

**Consequences**:
- ✅ Identical redaction results across all surfaces
- ✅ Single test suite covers all use cases
- ✅ Policy files portable between CLI and extension
- ✅ Easier to maintain and debug
- ❌ Engine must avoid Node.js and browser-specific APIs
- ❌ Shell packages duplicate UI logic (review interface in CLI, extension, web)

**Constraints**: Engine package cannot import `fs`, `path`, DOM APIs, or Chrome APIs.

---

### ADR-004: Local-First, Zero Cloud Dependencies

**Status**: Accepted

**Context**: Privacy tools must be trustworthy. Sending content to cloud APIs for detection defeats the purpose.

**Decision**: All detection and redaction runs locally. No network requests required.

**Consequences**:
- ✅ Users trust the tool because content never leaves their machine
- ✅ Works offline
- ✅ No API costs, rate limits, or vendor lock-in
- ✅ Faster response time (no network latency)
- ❌ Cannot leverage cloud ML models for advanced PII detection
- ❌ Detection quality limited to local regex and pattern matching
- ❌ Harder to compete with cloud-based accuracy (Google DLP, AWS Comprehend)

**Future**: May offer optional cloud integration as opt-in enhancement, but local-first remains default.

---

### ADR-005: Hybrid Detection Approach

**Status**: Accepted

**Context**: Need high-quality detection. Options: build from scratch, integrate existing libraries, or use cloud APIs.

**Decision**: Hybrid approach — custom regex detectors for core patterns + integrate battle-tested libraries (ggshield, detect-secrets) for secret detection.

**Consequences**:
- ✅ Faster time to market — don't reinvent secret patterns
- ✅ Leverage community-maintained pattern databases
- ✅ Explainability — can trace detections to specific patterns
- ✅ Flexibility — can add custom rules for domain-specific cases
- ❌ Dependency on external libraries (maintenance, licensing)
- ❌ Potential performance overhead from multiple detection passes
- ❌ Pattern conflicts between custom and library detectors

**Approach**:
- Custom detectors: logs (stack traces, headers), code patterns, domain-specific PII
- Library integration: generic secrets (API keys, tokens, credentials)
- Clear attribution in explainer output

---

### ADR-006: Policy-Based Configuration

**Status**: Accepted

**Context**: Different users have different risk profiles. Developer needs differ from legal/healthcare use cases.

**Decision**: JSON-based policy files with persona presets (Developer, General, Legal, Healthcare).

**Consequences**:
- ✅ Users can customize detection rules without code changes
- ✅ Portable policies between CLI and extension (import/export)
- ✅ Team-wide policy enforcement (future)
- ✅ Version control for policy evolution
- ❌ Complex policy syntax increases user error risk
- ❌ Need validation and helpful error messages
- ❌ Documentation burden for policy format

**Policy Structure**:
```json
{
  "name": "Developer",
  "version": "1.0.0",
  "detectors": {
    "secrets": { "enabled": true, "confidence": "high" },
    "pii": { "enabled": false }
  },
  "customRules": [
    { "pattern": "...", "type": "secret", "name": "..." }
  ],
  "replacementMode": "tokenize"
}
```

---

### ADR-007: Multiple Replacement Modes

**Status**: Accepted

**Context**: Different contexts require different redaction strategies. Full redaction may break code syntax. Tokenization allows reversibility.

**Decision**: Support 4 replacement modes: `redact`, `tokenize`, `partial`, `warn`.

**Consequences**:
- ✅ Flexibility for different use cases
- ✅ Reversible redaction with tokenization (critical for chat responses)
- ✅ Partial reveal for debugging (e.g., show last 4 digits)
- ✅ Warn-only mode for low-confidence detections
- ❌ Complexity in UI (users must understand modes)
- ❌ Token storage required for reversibility
- ❌ Security risk if tokens leak

**Modes**:
- **Redact**: Replace with `[REDACTED:type]`
- **Tokenize**: Replace with reversible placeholder, store mapping locally
- **Partial**: Show partial content (e.g., `AKIA...MPLE`)
- **Warn**: Flag but don't replace (review required)

---

### ADR-008: Explainability as First-Class Feature

**Status**: Accepted

**Context**: Users won't trust "black box" redaction. Need transparency about what was detected and why.

**Decision**: Every detection includes provenance: pattern name, confidence score, position, and rule source.

**Consequences**:
- ✅ Builds user trust through transparency
- ✅ Helps debug false positives
- ✅ Enables user feedback loop (report bad patterns)
- ✅ Differentiator vs opaque tools
- ❌ Larger output size (JSON includes metadata)
- ❌ UI complexity showing explanations
- ❌ Performance overhead tracking provenance

**Output Format**:
```json
{
  "detections": [
    {
      "type": "aws-access-key",
      "position": { "start": 10, "end": 30 },
      "confidence": 0.95,
      "pattern": "AKIA[0-9A-Z]{16}",
      "source": "detector:secrets/aws",
      "explanation": "Detected AWS access key pattern"
    }
  ]
}
```

---

### ADR-009: Side-by-Side Review UI

**Status**: Accepted

**Context**: Auto-redaction without review risks false positives. Users need to approve changes before sending to AI.

**Decision**: All interactive surfaces (CLI, extension, web) show side-by-side original/redacted view with per-detection accept/reject.

**Consequences**:
- ✅ User control and confidence
- ✅ Catch false positives before they break workflows
- ✅ Educational — users learn what's being detected
- ❌ Adds friction to workflow (one more step)
- ❌ Complex UI development (3 implementations)
- ❌ Not suitable for non-interactive CLI usage

**Implementation**: CLI uses terminal UI library (Ink), extension uses sidebar panel, web uses split pane.

---

### ADR-010: Claude Code Hook as Primary Developer Integration

**Status**: Accepted

**Context**: Developers need redaction at the boundary before content reaches AI. Post-hoc clipboard tools miss file operations, shell output, and automatic context gathering.

**Decision**: Prioritize Claude Code hook integration as first-class developer workflow.

**Consequences**:
- ✅ Intercepts content at source (files, command output)
- ✅ Automatic protection without manual copy/paste
- ✅ Natural fit for developer workflow
- ✅ Marketing differentiator (purpose-built for AI coding tools)
- ❌ Limited to Claude Code users initially
- ❌ Hook API changes could break integration
- ❌ Requires user to configure hook settings

**Future**: Add hooks for other AI coding tools (Cursor, Copilot) as they expose hook APIs.

## Acceptance Criteria

### Phase 1: Core Engine + CLI
- [ ] Detects P0 patterns: API keys (AWS, GCP, GitHub, Stripe), JWT, database URLs, `.env` vars
- [ ] Detects P0 log patterns: stack traces with file paths, auth headers, JSON config blobs
- [ ] Supports 4 replacement modes: redact, tokenize, partial, warn
- [ ] CLI accepts stdin and file inputs
- [ ] CLI outputs JSON or plain text
- [ ] Interactive review mode with side-by-side diff
- [ ] Policy files support custom regex patterns
- [ ] Explainer shows "why flagged" with pattern provenance
- [ ] Claude Code hook installs and runs on commit/file-save

### Phase 2: Chrome Extension
- [ ] Content scripts inject on ChatGPT, Claude, Gemini sites
- [ ] Detects paste events and shows review sidebar
- [ ] Popup UI shows policy selector and recent detections
- [ ] Sidebar shows side-by-side original/redacted view
- [ ] One-click accept/reject for each detection
- [ ] Sync policy with CLI via import/export
- [ ] Works offline (no network requests)

### Phase 3: Web App
- [ ] Drag-and-drop or paste to redact
- [ ] Side-by-side editor with highlighting
- [ ] Export redacted output
- [ ] Policy selector matches CLI/extension
- [ ] No server required (static hosting)
- [ ] Local storage for policy preferences

### Cross-Cutting
- [ ] All packages share same detection rules from @masqo/engine
- [ ] Policy format is JSON and human-readable
- [ ] Detection confidence scores included in output
- [ ] Works on macOS and Linux
- [ ] 80%+ test coverage for engine package
- [ ] Documentation includes example policy files for Developer/General personas
