# @masqo/engine

Core detection and redaction engine for Masqo. Runs entirely locally - no network calls, no telemetry.

Used by `@masqo/cli`, the Masqo browser extension, and the Masqo web app.

## Install

```bash
npm install @masqo/engine
```

## Usage

```typescript
import { createEngine } from '@masqo/engine'

const engine = createEngine()

const result = engine.scan(`
  Authorization: Bearer sk-proj-abc123xyz
  DB_URL=postgres://user:password@host/db
`)

console.log(result.findings)
// [
//   { type: 'openai-api-key', value: 'sk-proj-abc123xyz', start: 25, end: 41, severity: 'critical' },
//   { type: 'database-url', value: 'postgres://...', start: 55, end: 88, severity: 'high' },
// ]

const redacted = engine.redact(result)
console.log(redacted.output)
// "Authorization: Bearer [REDACTED:openai-api-key]\n  DB_URL=[REDACTED:database-url]"
```

## Policy configuration

```typescript
import { createEngine, PolicyPreset } from '@masqo/engine'

const engine = createEngine({
  policy: PolicyPreset.Developer,   // Developer | General | Legal
  mode: 'tokenize',                 // redact | tokenize | partial | warn
})
```

## Detection coverage

Secrets: AWS, GCP, Azure, GitHub, GitLab, Stripe, Twilio, SendGrid, OpenAI, JWT, private keys, bearer tokens, database URLs, `.env` patterns, cookies, npm tokens, PyPI tokens.

PII: email addresses, phone numbers, SSNs, credit card numbers, IP addresses, passport numbers.

## Links

- GitHub: [github.com/hungphamtan/masqo](https://github.com/hungphamtan/masqo)
- CLI: [`@masqo/cli`](https://www.npmjs.com/package/@masqo/cli)
