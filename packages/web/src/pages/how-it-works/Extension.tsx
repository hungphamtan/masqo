import { DetailPage } from '../../components/DetailPage.js'

export function ExtensionDetail() {
  return (
    <DetailPage
      title="Browser extension"
      lead="The Masqo extension watches paste events on AI chat sites and shows a review panel before your text is inserted — so secrets never reach the chat box."
      media={{
        src: '/media/extension',
        transcript: (
          <>
            On a supported AI chat site (ChatGPT, Claude, Gemini, Grok, Perplexity), when you
            paste text the Masqo extension intercepts it and opens a review panel. You accept or
            reject each detection, then click Paste clean to insert the redacted version. All
            scanning is local and only happens at the moment you paste.
          </>
        ),
      }}
      diagram={{
        title: 'Extension flow',
        desc: 'Four steps: you paste on an AI chat site, Masqo intercepts the paste, you review detections in a panel, then Masqo inserts the clean text.',
        steps: [
          { label: 'Paste', caption: 'You paste text into an AI chat box on a supported site.' },
          { label: 'Intercept', caption: 'The extension catches the paste before it is inserted.' },
          { label: 'Review', caption: 'A panel shows each detection to accept or reject.' },
          { label: 'Paste clean', caption: 'The redacted text is inserted into the chat.' },
        ],
      }}
      cta={{
        label: "Add to Chrome - it's free",
        href: 'https://chromewebstore.google.com/detail/masqo-secret-redaction/mfeaahjddfafgbckbilbbagbhpakhdap',
        external: true,
      }}
    >
      <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.7 }}>
        The extension uses the same detection engine as this web app. It never reads your
        clipboard passively — it only scans text at the moment you paste.
      </p>
    </DetailPage>
  )
}
