# Masqo

**Local redaction engine for AI workflows.** One privacy engine, many enforcement points.

Detect and mask secrets before they reach AI tools - fully local, zero cloud dependencies.

---

## What it does

Masqo intercepts sensitive content at every workflow boundary:

| Surface | How |
|---------|-----|
| **CLI** | `cat secrets.log \| masqo redact` |
| **Claude Code hook** | Auto-redacts files before Claude reads them |
| **Chrome extension** | Intercepts paste into ChatGPT, Claude.ai, Gemini |
| **Web app** | Side-by-side review editor, drag-drop files |

---

## Detected patterns (22 built-in detectors)

AWS keys · GCP API keys · GitHub/GitLab tokens · Stripe keys · OpenAI keys · Slack tokens · SendGrid · Twilio · NPM/PyPI tokens · Azure Storage keys · JWTs · Bearer tokens · Session cookies · Database URLs · Sentry DSNs · Private keys (RSA/EC/PGP) · `.env` secrets · Stack traces · HTTP auth headers · JSON/YAML config secrets

---

## Quick start

```bash
# Install
git clone https://github.com/your-org/masqo
cd masqo
npm install
npm run build

# CLI
echo "AWS_SECRET=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY" | masqo redact

# Interactive review
masqo review secrets.log

# Install Claude Code hook
masqo install-hook claude-code
```

---

## CLI

```bash
masqo redact [file]          # Redact stdin or file
  --mode redact|tokenize|partial|warn
  --policy developer|general
  --format text|json
  --output <file>
  --hook                     # For CI/hooks (exit 1 if secrets found)

masqo review [file]          # Interactive review (TUI)
  --accept-all               # Non-interactive accept
  --reject-all               # Non-interactive reject

masqo config set-policy developer
masqo config add-rule --pattern "CORP_[A-Z0-9]+" --type corp-secret --name "Corp"

masqo install-hook claude-code   # Wire into Claude Code
```

---

## Chrome extension

```bash
cd packages/extension
npm run build
# Load dist/ as unpacked extension in chrome://extensions
```

Paste secrets into ChatGPT, Claude.ai, or Gemini → sidebar appears → review & paste clean.

---

## Web app

```bash
cd packages/web
npm run dev      # http://localhost:5173
npm run build    # dist/ - deploy to any static host
```

Zero backend. All detection runs in the browser.

---

## Policies

```json
{
  "name": "My Policy",
  "version": "1.0.0",
  "detectors": {
    "secrets": { "enabled": true, "confidence": "high" },
    "logs": { "enabled": true },
    "pii": { "enabled": false }
  },
  "customRules": [
    { "pattern": "CORP_[A-Z0-9]{16}", "type": "corp-secret", "name": "Corp token" }
  ],
  "replacementMode": "tokenize"
}
```

| Preset | Detects | Mode |
|--------|---------|------|
| `developer` | Secrets + logs | tokenize |
| `general` | Secrets + PII | redact |

---

## Performance

| Input | Time | Target |
|-------|------|--------|
| 10KB  | ~1ms | <100ms |
| 100KB | ~11ms | <500ms |
| 1MB   | ~161ms | <2000ms |

---

## Architecture

```
packages/
  shared/      # Types: Detection, ReplacementMode, PolicyConfig
  engine/      # Core: 22 detectors, 4 replacers, policy system
  cli/         # masqo CLI (Commander.js + Ink TUI)
  extension/   # Chrome MV3 extension (Vite + React)
  web/         # Static web app (Vite + React)

tests/integration/   # Cross-package parity tests
benchmarks/          # Performance validation
docs/                # User guides + detection patterns
```

---

## Development

```bash
npm install             # Install all workspace deps
npm run build           # Build all packages (turbo)
npm run test            # Run all tests
npm run test:integration
npm run benchmark
```

---

## Docs

- [Getting Started](docs/user-guide/getting-started.md)
- [CLI Usage](docs/user-guide/cli.md)
- [Extension Usage](docs/user-guide/extension.md)
- [Web App Usage](docs/user-guide/web-app.md)
- [Policy Customization](docs/user-guide/policy.md)
- [Detection Patterns](docs/detection-patterns.md)
- [Claude Code Hook Setup](docs/claude-code-hook-setup.md)

---

## License

MIT
