import type { Detection } from '@masqo/shared'

// Node.js: "    at Something (/path/to/file.js:line:col)"
const NODE_STACK_FRAME = /^\s+at\s+(?:[\w.<>]+\s+)?\(?(\/[^\s:)]+:\d+(?::\d+)?)\)?/gm
// Python traceback: '  File "/path/to/file.py", line N'
const PYTHON_TRACEBACK = /^\s+File\s+"([^"]+)",\s+line\s+\d+/gm
// Java: "at com.example.Class.method(File.java:line)"
const JAVA_STACK_FRAME = /^\s+at\s+[\w.]+\([\w]+\.java:\d+\)/gm

export function detectStackTraces(input: string): Detection[] {
  const detections: Detection[] = []
  const seen = new Set<number>()

  const addDetection = (match: RegExpMatchArray, type: string, confidence: number) => {
    if (match.index === undefined) return
    if (seen.has(match.index)) return
    seen.add(match.index)
    detections.push({
      type: 'stack-trace',
      position: { start: match.index, end: match.index + match[0].length },
      confidence,
      pattern: type,
      source: 'detector:code/stacktrace',
      explanation: `Detected ${type} stack frame — may expose internal file paths`,
      originalText: match[0],
    })
  }

  for (const match of input.matchAll(NODE_STACK_FRAME)) {
    addDetection(match, 'node.js-stack-frame', 0.85)
  }
  for (const match of input.matchAll(PYTHON_TRACEBACK)) {
    addDetection(match, 'python-traceback', 0.9)
  }
  for (const match of input.matchAll(JAVA_STACK_FRAME)) {
    addDetection(match, 'java-stack-frame', 0.85)
  }

  return detections
}
