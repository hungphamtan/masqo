import { describe, it, expect } from 'vitest'
import { BUILT_IN_SITES, matchSite } from './sites.js'

describe('BUILT_IN_SITES', () => {
  it('has 11 entries', () => {
    expect(BUILT_IN_SITES).toHaveLength(11)
  })

  it('all entries have required fields', () => {
    for (const site of BUILT_IN_SITES) {
      expect(site.id).toBeTruthy()
      expect(site.name).toBeTruthy()
      expect(site.hostname).toBeTruthy()
      expect(site.textareaSelector).toBeTruthy()
      expect(site.builtIn).toBe(true)
    }
  })

  it('ids are unique', () => {
    const ids = BUILT_IN_SITES.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('matchSite', () => {
  it('matches exact hostname', () => {
    const match = matchSite('claude.ai', BUILT_IN_SITES)
    expect(match?.id).toBe('claude')
  })

  it('matches subdomain', () => {
    const match = matchSite('www.perplexity.ai', BUILT_IN_SITES)
    expect(match?.id).toBe('perplexity')
  })

  it('returns undefined for unknown site', () => {
    expect(matchSite('example.com', BUILT_IN_SITES)).toBeUndefined()
  })

  it('matches chatgpt.com', () => {
    expect(matchSite('chatgpt.com', BUILT_IN_SITES)?.id).toBe('chatgpt')
  })

  it('matches chat.openai.com', () => {
    expect(matchSite('chat.openai.com', BUILT_IN_SITES)?.id).toBe('chatgpt-legacy')
  })
})
