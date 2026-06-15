# Claude Code Hook Setup

Masqo can intercept file writes in Claude Code before they reach the AI, redacting secrets automatically.

## Quick Install

```bash
masqo install-hook claude-code
```

This adds a `PreToolUse` hook to `~/.claude/settings.json` that runs on `Write`, `Edit`, and `MultiEdit` tool calls.

## What it does

When Claude Code writes or edits a file, the hook runs:

```
masqo redact --hook < "$CLAUDE_FILE_PATH"
```

- **Exit 0**: No secrets found - Claude Code proceeds normally
- **Exit 1**: Secrets detected - Claude Code sees the redacted output in JSON format

## Manual Setup

If you prefer to configure manually, add to `~/.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "masqo redact --hook < \"$CLAUDE_FILE_PATH\""
          }
        ]
      }
    ]
  }
}
```

## Hook Output Format

When secrets are found (exit 1), the hook outputs JSON:

```json
{
  "output": "AWS key: [REDACTED:aws-access-key]",
  "detections": [
    {
      "type": "aws-access-key",
      "position": { "start": 9, "end": 29 },
      "confidence": 0.95,
      "explanation": "Detected AWS access key pattern...",
      "source": "detector:secrets/aws"
    }
  ],
  "mode": "redact"
}
```

## Performance

The hook adds < 100ms overhead for files up to 10KB. Larger files may take proportionally longer.

## Policy Configuration

Set a default policy for the hook:

```bash
masqo config set-policy developer
```

The hook respects the configured policy on every run.
