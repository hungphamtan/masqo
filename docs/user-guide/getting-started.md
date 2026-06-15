# Getting Started

Masqo detects and redacts secrets before they reach AI tools. Runs entirely locally - no cloud, no telemetry.

## Install

```bash
# From repo root
npm install
npm run build

# Link CLI globally
npm install -g ./packages/cli
```

## Quick start

```bash
# Pipe text through masqo
echo "AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY" | masqo redact

# Redact a file
masqo redact secrets.log

# Interactive review - approve/reject each detection
masqo review secrets.log
```

## Surfaces

| Surface | Command / Path |
|---------|---------------|
| CLI | `masqo redact` / `masqo review` |
| Chrome extension | Load `packages/extension/dist/` unpacked |
| Web app | `cd packages/web && npm run dev` |

## Next steps

- [CLI Usage](cli.md)
- [Extension Usage](extension.md)
- [Web App Usage](web-app.md)
- [Policy Customization](policy.md)
- [Claude Code Hook Setup](../claude-code-hook-setup.md)
