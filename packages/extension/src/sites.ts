export interface SiteConfig {
  id: string
  name: string
  hostname: string
  textareaSelector: string
  builtIn: boolean
}

export const BUILT_IN_SITES: SiteConfig[] = [
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    hostname: 'chatgpt.com',
    textareaSelector: '[data-testid="prompt-textarea"], #prompt-textarea, div[contenteditable="true"]',
    builtIn: true,
  },
  {
    id: 'chatgpt-legacy',
    name: 'ChatGPT (legacy)',
    hostname: 'chat.openai.com',
    textareaSelector: '[data-testid="prompt-textarea"], #prompt-textarea, div[contenteditable="true"]',
    builtIn: true,
  },
  {
    id: 'claude',
    name: 'Claude',
    hostname: 'claude.ai',
    textareaSelector: '[contenteditable="true"], .ProseMirror, div[data-placeholder]',
    builtIn: true,
  },
  {
    id: 'gemini',
    name: 'Gemini',
    hostname: 'gemini.google.com',
    textareaSelector: 'rich-textarea, [contenteditable="true"], .ql-editor',
    builtIn: true,
  },
  {
    id: 'grok',
    name: 'Grok',
    hostname: 'grok.com',
    textareaSelector: 'textarea, [contenteditable="true"]',
    builtIn: true,
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    hostname: 'perplexity.ai',
    textareaSelector: 'textarea, [contenteditable="true"]',
    builtIn: true,
  },
  {
    id: 'manus',
    name: 'Manus',
    hostname: 'manus.im',
    textareaSelector: 'textarea, [contenteditable="true"]',
    builtIn: true,
  },
  {
    id: 'poe',
    name: 'Poe',
    hostname: 'poe.com',
    textareaSelector: 'textarea, [contenteditable="true"]',
    builtIn: true,
  },
  {
    id: 'copilot',
    name: 'Microsoft Copilot',
    hostname: 'copilot.microsoft.com',
    textareaSelector: 'textarea, [contenteditable="true"]',
    builtIn: true,
  },
  {
    id: 'you',
    name: 'You.com',
    hostname: 'you.com',
    textareaSelector: 'textarea, [contenteditable="true"]',
    builtIn: true,
  },
  {
    id: 'character-ai',
    name: 'Character.AI',
    hostname: 'character.ai',
    textareaSelector: 'textarea, [contenteditable="true"]',
    builtIn: true,
  },
]

export function matchSite(hostname: string, sites: SiteConfig[]): SiteConfig | undefined {
  return sites.find(
    (s) => hostname === s.hostname || hostname.endsWith('.' + s.hostname)
  )
}
