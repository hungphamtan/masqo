import type { Detection } from '@masqo/shared'

const GITHUB_PAT_PATTERN = /ghp_[A-Za-z0-9]{36}/g
const GITHUB_OAUTH_PATTERN = /gho_[A-Za-z0-9]{36}/g
const GITHUB_TOKEN_PATTERN = /gh[sr]_[A-Za-z0-9]{36}/g

export function detectGithubSecrets(input: string): Detection[] {
  const detections: Detection[] = []

  for (const match of input.matchAll(GITHUB_PAT_PATTERN)) {
    if (match.index === undefined) continue
    detections.push({
      type: 'github-pat',
      position: { start: match.index, end: match.index + match[0].length },
      confidence: 0.95,
      pattern: 'ghp_[A-Za-z0-9]{36}',
      source: 'detector:secrets/github',
      explanation: 'Detected GitHub personal access token (ghp_ prefix)',
      originalText: match[0],
    })
  }

  for (const match of input.matchAll(GITHUB_OAUTH_PATTERN)) {
    if (match.index === undefined) continue
    detections.push({
      type: 'github-oauth',
      position: { start: match.index, end: match.index + match[0].length },
      confidence: 0.95,
      pattern: 'gho_[A-Za-z0-9]{36}',
      source: 'detector:secrets/github',
      explanation: 'Detected GitHub OAuth token (gho_ prefix)',
      originalText: match[0],
    })
  }

  for (const match of input.matchAll(GITHUB_TOKEN_PATTERN)) {
    if (match.index === undefined) continue
    detections.push({
      type: 'github-token',
      position: { start: match.index, end: match.index + match[0].length },
      confidence: 0.95,
      pattern: 'gh[sr]_[A-Za-z0-9]{36}',
      source: 'detector:secrets/github',
      explanation: 'Detected GitHub token (ghs_/ghr_ prefix)',
      originalText: match[0],
    })
  }

  return detections
}
