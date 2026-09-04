import { DetailPage } from '../../components/DetailPage.js'

export function WebAppDetail() {
  return (
    <DetailPage
      title="The web editor"
      lead="Paste text, see every secret Masqo finds, choose what to redact, and copy clean output — all in your browser. Nothing is uploaded."
      media={{
        src: '/media/web-app',
        transcript: (
          <>
            The web editor has two panels: input on the left, redacted output on the right.
            You paste text into the input. Masqo scans it instantly and lists each detection
            with its type and confidence. You accept or reject detections, then copy or export
            the cleaned output.
          </>
        ),
      }}
      diagram={{
        title: 'Web editor flow',
        desc: 'Four steps: paste or load text, Masqo scans it, you review and accept detections, then you copy or export the clean output.',
        steps: [
          { label: 'Paste', caption: 'Paste text or drag-and-drop a file into the input panel.' },
          { label: 'Scan', caption: 'The engine scans locally and lists every detection with type and confidence.' },
          { label: 'Review', caption: 'Accept, reject, or toggle individual detections.' },
          { label: 'Clean', caption: 'Copy the redacted output to clipboard or export it as a file.' },
        ],
      }}
      cta={{ label: 'Open the editor', href: '/' }}
    >
      <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.7 }}>
        Pick a replacement mode (redact, tokenize, partial reveal, or warn) and a policy
        (General, Developer, or Default) from the toolbar to control what gets flagged and how
        it is masked.
      </p>
    </DetailPage>
  )
}
