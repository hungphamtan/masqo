import React, { useState, useEffect } from 'react'
import { Box, Text, useInput, useApp } from 'ink'
import type { Detection } from '@masqo/shared'

interface Props {
  original: string
  detections: Detection[]
  onDone: (accepted: Set<number>) => void
}

export function ReviewApp({ original, detections, onDone }: Props) {
  const { exit } = useApp()
  const [cursor, setCursor] = useState(0)
  const [accepted, setAccepted] = useState<Set<number>>(new Set(detections.map((_, i) => i)))

  useEffect(() => {
    if (detections.length === 0) {
      onDone(new Set())
      exit()
    }
  }, [])

  useInput((input, key) => {
    if (key.escape || input === 'q') {
      onDone(accepted)
      exit()
      return
    }
    if (key.return) {
      onDone(accepted)
      exit()
      return
    }
    if (key.upArrow || input === 'k') {
      setCursor((c) => Math.max(0, c - 1))
    }
    if (key.downArrow || input === 'j') {
      setCursor((c) => Math.min(detections.length - 1, c + 1))
    }
    if (input === ' ') {
      setAccepted((prev) => {
        const next = new Set(prev)
        if (next.has(cursor)) next.delete(cursor)
        else next.add(cursor)
        return next
      })
    }
    if (input === 'a') {
      setAccepted(new Set(detections.map((_, i) => i)))
    }
    if (input === 'r') {
      setAccepted(new Set())
    }
  })

  const lines = original.split('\n')

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text bold color="cyan">Masqo Review</Text>
        <Text dimColor>  {accepted.size}/{detections.length} accepted  </Text>
        <Text dimColor>[Space] toggle  [A] accept all  [R] reject all  [Enter] confirm  [Q] quit</Text>
      </Box>

      <Box flexDirection="row" gap={2}>
        {/* Left: original */}
        <Box flexDirection="column" width="50%">
          <Text bold underline>Original</Text>
          {lines.slice(0, 20).map((line, i) => (
            <Text key={i}>{line}</Text>
          ))}
        </Box>

        {/* Right: detection list */}
        <Box flexDirection="column" width="50%">
          <Text bold underline>Detections</Text>
          {detections.map((d, i) => {
            const isSelected = i === cursor
            const isAccepted = accepted.has(i)
            return (
              <Box key={i}>
                <Text color={isSelected ? 'cyan' : undefined} bold={isSelected}>
                  {isSelected ? '▶ ' : '  '}
                  {isAccepted ? '✓' : '✗'}{' '}
                </Text>
                <Text color={isAccepted ? 'green' : 'red'}>
                  {d.type}
                </Text>
                <Text dimColor> ({Math.round(d.confidence * 100)}%)</Text>
              </Box>
            )
          })}
        </Box>
      </Box>
    </Box>
  )
}
