# Chrome Web Store Listing - Masqo

## Short description (132 char max)

> Detect and redact API keys, tokens, and secrets before pasting into AI chats. Runs 100% locally — no data ever leaves your browser.

**Length: 128 chars** ✓

---

## Full description

```
Masqo intercepts paste events on AI chat interfaces and scans the text for secrets — API keys, JWTs, database connection strings, private keys, and 20+ other patterns — before it reaches the model.

Everything runs locally in your browser. No accounts. No servers. No telemetry. The extension never reads your clipboard passively; it only scans text at the exact moment you paste into a supported site.

╋ HOW IT WORKS

1. You paste into ChatGPT, Claude, Gemini, Grok, Perplexity, or another supported chat
2. Masqo's detection engine scans the text using deterministic pattern rules + entropy heuristics
3. A review panel appears showing each detection with type, confidence score, and a preview
4. You accept, reject, or toggle each finding individually
5. Click "Paste clean" — only the redacted version is inserted

╋ WHAT IT DETECTS

• AWS access & secret keys
• GCP service account keys
• GitHub & GitLab tokens
• Stripe, OpenAI, Anthropic API keys
• Bearer tokens & JWTs
• Database connection strings (PostgreSQL, MySQL, MongoDB, Redis)
• Private keys (RSA, EC, SSH)
• HTTP Basic Auth credentials
• Cookie headers
• .env secret assignments
• Slack, Twilio, Sendgrid keys
• npm & PyPI tokens
• Stack traces with embedded tokens
• HTTP request headers
• Email addresses, phone numbers, SSNs, credit cards, public IPs

╋ POLICIES

Pick the policy that matches your workflow:

• General (default): Secrets + PII, medium-confidence threshold
• Developer: Secrets + logs only, tokenize mode (stable placeholders for AI context)
• Default: All detectors, all confidence levels, maximum coverage

╋ REPLACEMENT MODES

• Redact: Replace with [REDACTED:type]
• Tokenize: Replace with stable [JWT_1] placeholders for AI-readable structure
• Partial: Show first/last characters, mask the middle
• Warn only: Flag without changing output

╋ SUPPORTED SITES

ChatGPT, Claude, Gemini, Grok, Perplexity, Manus, Poe, Microsoft Copilot, You.com, Character.AI, plus legacy chat.openai.com.

╋ PRIVACY GUARANTEE

Masqo does not:
✗ Send your text to any server
✗ Read your clipboard outside of paste events
✗ Track usage or collect analytics
✗ Load remote code or remote configuration
✗ Require an account or login

All detection rules and the redaction engine are bundled into the extension itself. The only network access Chrome grants this extension is for the extension's own update channel managed by the Chrome Web Store.

╋ OPEN SOURCE

Source code: https://github.com/hungphamtan/masqo
Web demo: https://masqo.dev
Privacy policy: https://masqo.dev/privacy
Terms: https://masqo.dev/terms

Built with TypeScript. MIT licensed. Contributions welcome.
```

---

## Per-permission justifications

### `storage`
> Stores your selected policy preset (General / Developer / Default), the list of supported sites you have toggled off, and a local-only history of the last 10 detection types seen (for the popup's "Recent detections" panel). Synced via `chrome.storage.sync` for preferences; detection history uses `chrome.storage.local` and never syncs to Google.

### `clipboardRead`
> Required to read the text payload at the exact moment the user triggers a paste action on a supported AI chat site. Masqo does not monitor the clipboard passively, at intervals, or on any non-paste event. Reading happens only inside the paste event handler and only on the 11 supported hostnames.

### `clipboardWrite`
> Used to write the user-approved redacted version back to the destination input on the supported chat site after the user clicks "Paste clean" in the review panel. Triggered exclusively by an explicit user action in our UI.

### `activeTab`
> Used only by the popup UI to check whether the currently active tab is a supported AI chat site, so the popup can show an "active" indicator. No tab data is stored, transmitted, or read beyond the hostname at the moment the user opens the popup.

### Host permissions (11 specific origins)
> Each entry in `host_permissions` corresponds to one supported AI chat interface (ChatGPT, Claude, Gemini, Grok, Perplexity, Manus, Poe, Microsoft Copilot, You.com, Character.AI, plus legacy chat.openai.com). Required to inject the paste-event listener and the inline review panel into the page. Masqo does not make any network requests from these origins — it only reads the user's own paste input and writes the redacted version back to the same input.

---

## Privacy Practices questionnaire answers

### "What user data does your extension collect?"
**Answer:** None.

The extension does not collect, transmit, or persist any user data outside the user's own browser local storage. All detection happens client-side using bundled JavaScript rules.

### "Do you transfer user data to third parties?"
**Answer:** No.

The extension makes zero outbound network requests. The detection engine is fully bundled. No analytics, no error reporting, no telemetry.

### "Personally identifiable information"
**Answer:** Not collected.

(Note: while Masqo *detects* PII patterns in user-pasted text to help redact them, it never stores, transmits, or has access to that content outside the user's own browser session. Detection runs in memory and discards the input after the paste event resolves.)

### "Health information"
**Answer:** Not collected.

### "Financial and payment information"
**Answer:** Not collected.

(Same note as PII: Masqo *detects* credit card patterns to redact them, but never stores or transmits them.)

### "Authentication information"
**Answer:** Not collected.

(Same note: detects but never stores or transmits.)

### "Personal communications"
**Answer:** Not collected.

(Same note: scans paste content in-memory only; never stores or transmits.)

### "Location"
**Answer:** Not collected.

### "Web history"
**Answer:** Not collected.

The extension only knows the hostname of the active tab at the moment the popup opens (via `activeTab`), and this is used solely to show an "active site" indicator in the popup UI. It is not stored or transmitted.

### "User activity"
**Answer:** Not collected.

The extension records the *types* of detections (e.g., "jwt", "aws-key") in a local-only history list of the last 10 entries, for the popup's "Recent detections" UI. The original detected text is never stored. This list lives in `chrome.storage.local` and never syncs to Google or any third party. Users can clear it from the popup at any time.

### "Website content"
**Answer:** Not collected.

The paste-event handler reads the text the user is actively pasting, scans it in memory, displays detections, and discards the input. Nothing is persisted.

### Single Purpose statement
> "Masqo detects and redacts secrets and other sensitive patterns in text that the user is about to paste into supported AI chat interfaces, helping users avoid leaking credentials and personal data to AI models."

### Permission justifications

(See "Per-permission justifications" section above.)

### Remote code disclosure
> "The extension contains no remote code. The detection engine, all detector rules, and all UI assets are bundled at build time. No scripts are fetched at runtime."

### Data usage compliance certification
☑ I certify that the extension's data handling complies with the Chrome Web Store Developer Program Policies, including the Limited Use requirements.
