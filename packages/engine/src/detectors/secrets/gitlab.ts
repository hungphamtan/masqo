import type { Detection } from '@masqo/shared'

// All GitLab token prefixes
const GITLAB_TOKEN_PATTERN =
  /gl(?:pat|dt|ft|soat|rt|cbt|imt|ptt|agent|oas)-[A-Za-z0-9_-]{20,}/g
// Legacy runner registration token
const GITLAB_RUNNER_REG_PATTERN = /GR1348941[A-Za-z0-9_-]{20,}/g

export function detectGitlabSecrets(input: string): Detection[] {
  const detections: Detection[] = []

  for (const match of input.matchAll(GITLAB_TOKEN_PATTERN)) {
    if (match.index === undefined) continue
    detections.push({
      type: 'gitlab-token',
      position: { start: match.index, end: match.index + match[0].length },
      confidence: 0.97,
      pattern: 'gl[pat|dt|rt|...]- prefix',
      source: 'detector:secrets/gitlab',
      explanation: 'Detected GitLab token',
      originalText: match[0],
    })
  }

  for (const match of input.matchAll(GITLAB_RUNNER_REG_PATTERN)) {
    if (match.index === undefined) continue
    detections.push({
      type: 'gitlab-token',
      position: { start: match.index, end: match.index + match[0].length },
      confidence: 0.97,
      pattern: 'GR1348941...',
      source: 'detector:secrets/gitlab',
      explanation: 'Detected GitLab runner registration token',
      originalText: match[0],
    })
  }

  return detections
}
