import { createEngine } from '../packages/engine/dist/index.js'
import { ReplacementMode } from '../packages/shared/dist/index.js'

const engine = createEngine()

function repeat(str: string, targetBytes: number): string {
  const reps = Math.ceil(targetBytes / str.length)
  return str.repeat(reps).slice(0, targetBytes)
}

const CHUNK = `
Hello world. Here is some configuration:
API_KEY=sk_live_1234567890abcdef
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
DB_URL=postgresql://admin:secret123@db.example.com/prod
And some normal text that should not be flagged.
`

interface Result {
  label: string
  sizeKb: number
  ms: number
  detectionsPerRun: number
  pass: boolean
  target: number
}

function bench(label: string, sizeBytes: number, targetMs: number): Result {
  const input = repeat(CHUNK, sizeBytes)
  const RUNS = 5

  // Warmup
  engine.scan(input, { mode: ReplacementMode.Redact })

  const times: number[] = []
  let detections = 0
  for (let i = 0; i < RUNS; i++) {
    const start = performance.now()
    const r = engine.scan(input, { mode: ReplacementMode.Redact })
    times.push(performance.now() - start)
    if (i === 0) detections = r.detections.length
  }

  const avg = times.reduce((a, b) => a + b, 0) / times.length
  return {
    label,
    sizeKb: Math.round(sizeBytes / 1024),
    ms: Math.round(avg),
    detectionsPerRun: detections,
    pass: avg < targetMs,
    target: targetMs,
  }
}

console.log('\nMasqo Performance Benchmarks')
console.log('='.repeat(60))

const results: Result[] = [
  bench('10KB  input', 10 * 1024, 100),
  bench('100KB input', 100 * 1024, 500),
  bench('1MB   input', 1024 * 1024, 2000),
]

let allPass = true
for (const r of results) {
  const status = r.pass ? '✅ PASS' : '❌ FAIL'
  console.log(`${status}  ${r.label}  ${r.ms}ms / ${r.target}ms target  (${r.detectionsPerRun} detections, ${r.sizeKb}KB)`)
  if (!r.pass) allPass = false
}

console.log('='.repeat(60))
console.log(allPass ? '✅ All benchmarks passed' : '❌ Some benchmarks failed')
process.exit(allPass ? 0 : 1)
