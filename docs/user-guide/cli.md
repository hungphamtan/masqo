# CLI Usage

## Commands

### `masqo redact [file]`

Scan and redact secrets from stdin or a file.

```bash
# Stdin
cat secrets.log | masqo redact

# File
masqo redact secrets.log

# Save to file
masqo redact secrets.log --output clean.log
```

**Flags:**

| Flag | Default | Description |
|------|---------|-------------|
| `--mode` | `redact` | `redact` \| `tokenize` \| `partial` \| `warn` |
| `--policy` | — | `developer` \| `general` (preset) |
| `--format` | `text` | `text` \| `json` |
| `--output` | stdout | Write to file |
| `--hook` | — | Non-interactive mode for CI/hooks |
| `--no-color` | — | Disable colored output |

**Replacement modes:**

| Mode | Output | Use case |
|------|--------|----------|
| `redact` | `[REDACTED:aws-access-key]` | Sharing logs |
| `tokenize` | `TOKEN_a1b2c3d4...` | Reversible (developer workflow) |
| `partial` | `AKIA...MPLE` | Preview without full exposure |
| `warn` | original + warning | Audit only |

### `masqo review [file]`

Interactive side-by-side review. Accept or reject each detection individually.

```bash
masqo review secrets.log

# Keys: Space=toggle, A=accept all, R=reject all, Enter=confirm, Q=quit

# Non-interactive flags
masqo review secrets.log --accept-all
masqo review secrets.log --reject-all
masqo review secrets.log --accept-all --output clean.log
masqo review secrets.log --accept-all --format json
```

### `masqo config`

```bash
masqo config get                              # Show current config
masqo config set-policy developer             # Set default policy
masqo config add-rule \
  --pattern "CORP_[A-Z0-9]{16}" \
  --type corp-secret \
  --name "Corp Secret"
```

Config stored at `~/.masqo/config.json`.

### `masqo install-hook claude-code`

Installs a `PreToolUse` hook in `~/.claude/settings.json`.
See [Claude Code Hook Setup](../claude-code-hook-setup.md).
