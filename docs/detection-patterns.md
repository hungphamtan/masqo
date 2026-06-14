# Detection Patterns

All detectors run locally. Confidence scores reflect pattern specificity.

## Secrets

### AWS (`detector:secrets/aws`)
| Type | Pattern | Confidence | Example |
|------|---------|-----------|---------|
| `aws-access-key` | `AKIA[0-9A-Z]{16}` | 0.95 | `AKIAIOSFODNN7EXAMPLE` |
| `aws-secret-key` | `[A-Za-z0-9/+=]{40}` (context-boosted) | 0.85–0.95 | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `aws-session-token` | `[A-Za-z0-9/+=]{100,}` | 0.70–0.85 | Long base64 string |

### GCP (`detector:secrets/gcp`)
| Type | Pattern | Confidence |
|------|---------|-----------|
| `gcp-api-key` | `AIza[0-9A-Za-z_-]{35}` | 0.90 |
| `gcp-service-account` | `"type": "service_account"` in JSON | 0.95 |

### GitHub (`detector:secrets/github`)
| Type | Pattern | Confidence |
|------|---------|-----------|
| `github-pat` | `ghp_[A-Za-z0-9]{36}` | 0.95 |
| `github-oauth` | `gho_[A-Za-z0-9]{36}` | 0.95 |
| `github-token` | `gh[sr]_[A-Za-z0-9]{36}` | 0.95 |

### GitLab (`detector:secrets/gitlab`)
| Type | Pattern | Confidence |
|------|---------|-----------|
| `gitlab-token` | `gl[pat\|dt\|ft\|soat\|rt\|cbt\|imt\|ptt\|agent\|oas]-[A-Za-z0-9_-]{20,}` | 0.97 |
| `gitlab-token` | `GR1348941[A-Za-z0-9_-]{20,}` | 0.97 |

### Stripe (`detector:secrets/stripe`)
| Type | Pattern | Confidence |
|------|---------|-----------|
| `stripe-secret-key` | `sk_live_[A-Za-z0-9]{24,}` | 0.99 |
| `stripe-secret-key` | `sk_test_[A-Za-z0-9]{24,}` | 0.90 |
| `stripe-publishable-key` | `pk_(live\|test)_[A-Za-z0-9]{24,}` | 0.85 |

### Auth tokens
| Detector | Type | Pattern | Confidence |
|----------|------|---------|-----------|
| `jwt` | `jwt` | `eyJ[...] . [...] . [...]` (3 base64url segments) | 0.95 |
| `bearer` | `bearer-token` | `[Bb]earer\s+[token]{16,}` | 0.90 |
| `cookies` | `session-cookie` | `session=[value]{16,}` in Cookie header | 0.85 |
| `cookies` | `auth-cookie` | `auth_token=[value]{16,}` in Cookie header | 0.90 |
| `openai` | `openai-api-key` | `sk-[proj-]...T3BlbkFJ...` | 0.98 |
| `slack` | `slack-token` | `xox[abposr]-[digits]-...-[token]` | 0.95 |
| `slack` | `slack-webhook` | `hooks.slack.com/services/T.../B.../...` | 0.99 |

### Services
| Detector | Type | Pattern | Confidence |
|----------|------|---------|-----------|
| `sendgrid` | `sendgrid-api-key` | `SG.[22chars].[43chars]` | 0.99 |
| `twilio` | `twilio-account-sid` | `AC[a-z0-9]{32}` | 0.90 |
| `twilio` | `twilio-auth-token` | `SK[a-z0-9]{32}` | 0.90 |
| `npm` | `npm-auth-token` | `//<registry>/:_authToken=npm_...` | 0.95 |
| `pypi` | `pypi-token` | `pypi-AgE[...]{70+}` | 0.99 |
| `azure` | `azure-storage-key` | `AccountKey=[base64 86chars]==` | 0.97 |

### Credentials in URLs
| Detector | Type | Pattern | Confidence |
|----------|------|---------|-----------|
| `database` | `database-connection-string` | `scheme://user:pass@host` (pg/mysql/mongo/redis) | 0.95 |
| `database` | `sentry-dsn` | `https://[32hex]@o[id].ingest.sentry.io/[project]` | 0.95 |
| `basicauth` | `basic-auth-url` | `https://user:pass@host` (non-DB schemes) | 0.90 |

### Files & keys
| Detector | Type | Pattern | Confidence |
|----------|------|---------|-----------|
| `privatekeys` | `private-key` | `-----BEGIN * PRIVATE KEY-----` | 0.99 |
| `env` | `env-secret` | `KEY=value` where KEY contains SECRET/PASSWORD/TOKEN/API_KEY | 0.85 |

## Logs

### Stack traces (`detector:code/stacktrace`)
| Type | Pattern | Confidence |
|------|---------|-----------|
| `stack-trace` | Node.js: `at Fn (/path/file.js:line:col)` | 0.85 |
| `stack-trace` | Python: `File "/path", line N` | 0.90 |
| `stack-trace` | Java: `at com.example.Class.method(File.java:line)` | 0.85 |

### HTTP (`detector:code/http`)
| Type | Pattern | Confidence |
|------|---------|-----------|
| `http-auth-header` | `Authorization: Bearer/Basic/Token ...` | 0.90 |
| `http-cookie-header` | `(Set-)Cookie: ...` | 0.75 |
| `http-api-key-header` | `X-API-Key: ...` | 0.90 |
| `json-credential-field` | `"password": "value"` in JSON | 0.85 |

### Config blobs (`detector:code/config`)
| Type | Pattern | Confidence |
|------|---------|-----------|
| `config-secret` | JSON: `"password/secret/apiKey": "value"` | 0.85 |
| `config-secret` | YAML: `password: value` | 0.80 |

## Confidence scoring

| Label | Range | Meaning |
|-------|-------|---------|
| high | ≥ 0.80 | Structurally unambiguous (prefix + fixed length) |
| medium | 0.50–0.79 | Pattern matches but context-dependent |
| low | < 0.50 | Heuristic — review manually |

Use `minConfidence` in engine config or `confidence` in policy to filter by threshold.
