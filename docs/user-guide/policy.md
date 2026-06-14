# Policy Customization

## Presets

| Preset | Detects | Mode | Best for |
|--------|---------|------|----------|
| `developer` | Secrets + logs | tokenize | Dev workflows, CI, hooks |
| `general` | Secrets + PII | redact | Sharing with non-technical audience |

## Detector groups

| Group | Detectors included |
|-------|--------------------|
| `secrets` | aws, gcp, github, gitlab, stripe, jwt, bearer, cookies, database, env, privatekeys, slack, openai, sendgrid, twilio, npm, pypi, azure, basicauth |
| `logs` | stacktrace, http, config |
| `pii` | *(planned)* |

## Custom policy JSON

```json
{
  "name": "My Policy",
  "version": "1.0.0",
  "detectors": {
    "secrets": { "enabled": true, "confidence": "high" },
    "logs": { "enabled": false },
    "pii": { "enabled": false }
  },
  "customRules": [
    {
      "pattern": "CORP_[A-Z0-9]{16}",
      "type": "corp-secret",
      "name": "Corp internal token"
    }
  ],
  "replacementMode": "redact"
}
```

## Custom rules via CLI

```bash
masqo config add-rule \
  --pattern "CORP_[A-Z0-9]{16}" \
  --type corp-secret \
  --name "Corp internal token"
```

## Import/export

Policy format is the same across CLI and extension — copy the JSON to either surface.
