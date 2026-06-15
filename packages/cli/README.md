# @masqo/cli

Local secret redaction engine for AI workflows. Detect and mask API keys, tokens, passwords, and PII before they leak.

## Install

```bash
npm install -g @masqo/cli
```

## Usage

### Redact text

```bash
# From stdin
echo "sk-proj-abc123..." | masqo redact

# From a file
masqo redact secret.txt

# Output to file
masqo redact secret.txt -o redacted.txt
```

### Install as a Claude Code hook

Automatically scan all file writes for secrets before Claude Code commits them:

```bash
masqo install-hook claude-code
```

This writes a `PreToolUse` hook into `~/.claude/settings.json` that triggers on every `Write`, `Edit`, and `MultiEdit` tool call.

### Review mode (interactive)

```bash
masqo review secret.txt
```

### Configure policy

```bash
# Show current policy
masqo config

# Set replacement mode: redact | tokenize | partial | warn
masqo config --mode redact
```

## Replacement modes

| Mode | Example output |
|------|---------------|
| `redact` | `[REDACTED:api-key]` |
| `tokenize` | `[TOKEN_1a2b3c]` |
| `partial` | `sk-pro...c123` |
| `warn` | original text + stderr warning |

## Detection coverage

Secrets: AWS, GCP, Azure, GitHub, GitLab, Stripe, Twilio, SendGrid, OpenAI, JWT, private keys, bearer tokens, database URLs, `.env` patterns, cookies, npm tokens, PyPI tokens.

PII: email addresses, phone numbers, SSNs, credit card numbers, IP addresses, passport numbers.

## Links

- GitHub: [github.com/hungphamtan/masqo](https://github.com/hungphamtan/masqo)
- Web app: [masqo.dev](https://masqo.dev)
