# Product Strategy: Local Redaction Engine for AI Workflows

## Overview
The product opportunity is not to invent redaction from scratch, but to package it into a workflow-native privacy layer for AI use across browser chats, developer tools, and team environments. Existing products already cover local PII masking, browser extensions, enterprise redaction platforms, and open-source de-identification frameworks, which validates demand but raises the bar for differentiation.[cite:46][cite:65][cite:72] The most defensible position is a unified privacy engine that can power CLI hooks, browser extensions, and manual review flows from the same rule system.[cite:31][cite:45][cite:75]

## Product thesis
The core thesis is: **one privacy engine, many enforcement points**. Engineers often prefer hooks, proxies, or local CLIs because they sit closer to the true boundary where files, logs, shell output, secrets, and transcripts can leak to an AI model.[cite:31][cite:41][cite:44] At the same time, non-technical users still need browser and clipboard protection for ChatGPT-, Claude-, Gemini-, and Copilot-style workflows, where extensions remain the lowest-friction path.[cite:22][cite:26][cite:28]

This means the product should not be framed as only a Chrome extension or only a developer tool. It should be framed as a shared local redaction engine with multiple shells: CLI/hook for developers, extension for browser users, and later a lightweight web app for manual sanitization and review.[cite:31][cite:45][cite:46]

## Strategic posture
A practical build-vs-compete-vs-integrate posture is essential.

| Motion | Focus | Rationale |
|---|---|---|
| **Build** | Workflow shell, policy engine, review UX, multi-surface packaging | Existing tools are fragmented across libraries, extensions, and enterprise APIs, leaving room for a unified user experience.[cite:65][cite:72][cite:75] |
| **Compete selectively** | AI-chat privacy UX, developer redaction workflows | Browser AI privacy tools exist, but few own both developer hooks and browser workflows together.[cite:6][cite:22][cite:63] |
| **Integrate** | Detection libraries, enterprise connectors, platform-specific redaction stacks | Mature engines and platform APIs already handle generic detection well enough to accelerate time to market.[cite:65][cite:71][cite:75] |

The moat should come from orchestration, policy management, trust, and workflow fit rather than only raw detection accuracy. General PII detection frameworks and document redaction categories are already crowded and harder to win as a standalone entry point.[cite:65][cite:70][cite:72]

## Recommended launch sequence
The recommended launch sequence is developer-first, but not developer-only.

1. **Phase 1: Core local engine + CLI/hook integration**. Start with a TypeScript or Rust core that supports deterministic detectors, configurable replacement modes, and local placeholder maps. Ship it first as a CLI and as integrations for Claude Code-style hooks or local proxies, because advanced engineers will trust boundary-level control more than DOM-level interception.[cite:31][cite:41][cite:45]
2. **Phase 2: Chrome extension**. Reuse the same engine in a browser shell that supports one-click masking in popular AI chats, selection-based masking, and paste-then-review workflows. This broadens adoption to mixed teams and non-technical users without creating a second policy system.[cite:22][cite:26][cite:28]
3. **Phase 3: Web app review surface**. Launch a lightweight local-first web app for manual sanitization, demos, onboarding, and edge cases where users want a side-by-side editor. This is useful as a trust-building layer, but should follow the engine and extension rather than lead the strategy.[cite:48][cite:50][cite:56]
4. **Phase 4: Team features and enterprise connectors**. Add shared policy packs, audit logs, centralized configuration, and optional integrations with enterprise redaction or logging stacks once the core personal workflow is proven.[cite:47][cite:55][cite:72]

## Feature priorities
The first release should prioritize high-confidence, high-frequency masking cases over ambitious AI-heavy detection.

### P0: Must-have
- Secret and credential detection: API keys, bearer tokens, JWTs, cookies, passwords, DSNs, database URLs, cloud credentials, and `.env` patterns.[cite:31][cite:46][cite:75]
- Log and code sanitization: stack traces, headers, config blobs, request payloads, and connection strings.[cite:63][cite:75]
- Replacement modes: redact, tokenize, partial reveal, warn, or block.[cite:44][cite:75]
- Fully local execution with zero required cloud processing.[cite:46][cite:48][cite:50]

### P1: Strong differentiators
- Explainable detections: “why this was flagged” with rule or pattern provenance to build user trust.[cite:41][cite:75]
- Side-by-side review UX before copy/send for browser and web app surfaces.[cite:48][cite:56]
- Persona policy packs: Developer, General, Sales/Support, Legal/Healthcare starter templates.[cite:49][cite:72]
- Import/export of policies and custom rules across CLI and extension.[cite:65][cite:71]

### P2: Expansion
- Response placeholder restoration in supported AI chat workflows, where a masked token can be restored locally in replies.[cite:21][cite:28]
- Regional data packs, including country-specific phone and identifier formats where appropriate.[cite:48][cite:54]
- Enterprise governance features such as team-wide enforcement, analytics, and auditability.[cite:47][cite:55][cite:72]

## Positioning
The clearest market message is not “another privacy extension” and not “another PII SDK.” The stronger statement is: **A local privacy engine for AI workflows — hook, CLI, extension, and review UI — optimized for developers and usable by teams.** This positions the product above individual point tools and below heavyweight enterprise platforms, while staying grounded in a real workflow gap validated by current tools.[cite:31][cite:45][cite:46][cite:65]

## Success criteria
The early success signal is not raw install count, but repeated use in high-risk workflows: sanitizing logs, secrets, configs, and customer text before sending them to AI tools. If users adopt the CLI/hook path for engineering work and the extension path for general AI chat work, that would validate the multi-surface engine strategy and justify later investment in team and enterprise layers.[cite:31][cite:63][cite:75]
