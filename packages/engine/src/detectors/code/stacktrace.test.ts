import { describe, it, expect } from 'vitest'
import { detectStackTraces } from './stacktrace.js'

describe('Stack Trace Detector', () => {
  it('detects Node.js stack trace', () => {
    const input = `Error: ENOENT: no such file or directory
    at Object.openSync (node:fs:600:3)
    at /Users/john/secret-project/api/auth.js:42:10
    at process.nextTick (node:internal/process/task_queues:140:5)`
    const result = detectStackTraces(input)
    expect(result.some((d) => d.type === 'stack-trace')).toBe(true)
  })

  it('detects Python traceback', () => {
    const input = `Traceback (most recent call last):
  File "/home/john/myapp/secret/config.py", line 42, in load_config
    return json.load(f)
json.JSONDecodeError: Expecting value`
    const result = detectStackTraces(input)
    expect(result.some((d) => d.type === 'stack-trace')).toBe(true)
  })

  it('detects Java stack trace', () => {
    const input = `java.lang.NullPointerException
    at com.example.secretapp.UserService.getUser(UserService.java:42)
    at com.example.secretapp.api.UserController.show(UserController.java:15)`
    const result = detectStackTraces(input)
    expect(result.some((d) => d.type === 'stack-trace')).toBe(true)
  })

  it('extracts file paths from stack traces', () => {
    const input = `Error: fail
    at /Users/john/private/project/src/auth.js:42:10`
    const result = detectStackTraces(input)
    expect(result.length).toBeGreaterThan(0)
  })

  it('does not flag normal code with at keyword', () => {
    const input = 'Looking at the code, we find the answer at line 42'
    const result = detectStackTraces(input)
    expect(result).toHaveLength(0)
  })

  it('includes source attribution', () => {
    const input = `Error: fail\n    at /home/user/project/index.js:1:1`
    const result = detectStackTraces(input)
    expect(result[0]?.source).toBe('detector:code/stacktrace')
  })

  it('has confidence based on pattern completeness', () => {
    const fullTrace = `Error: something failed
    at Object.fn (/Users/user/project/file.js:10:5)
    at process.main (/Users/user/project/main.js:5:3)`
    const result = detectStackTraces(fullTrace)
    expect(result[0]?.confidence).toBeGreaterThan(0.5)
  })
})
