# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Masqo** is a local redaction engine for AI workflows. Core thesis: **one privacy engine, many enforcement points**.

The product provides PII and secret masking across:
- CLI/hooks for developers
- Browser extension for AI chat users
- Web app for manual review
- Future team/enterprise features

## Architecture Strategy

### Multi-Surface Engine Design
All surfaces (CLI, extension, web app) share the same core redaction engine. Do not build separate detection/policy systems per surface.

**Core components:**
- **Engine**: TypeScript or Rust core with deterministic detectors, configurable replacement modes, local placeholder maps
- **CLI/Hook shell**: Boundary-level control for files, logs, shell output, secrets
- **Browser extension shell**: DOM-level interception for ChatGPT/Claude/Gemini workflows
- **Web app shell**: Side-by-side editor for manual sanitization

### Policy System
Single unified policy system across all surfaces:
- Supports import/export of rules
- Persona-based policy packs (Developer, General, Sales/Support, Legal/Healthcare)
- Local-first with zero required cloud processing

## Development Phases

Current repository is pre-code. Planned build sequence:

1. **Phase 1**: Core local engine + CLI/hook integration
2. **Phase 2**: Chrome extension reusing same engine
3. **Phase 3**: Web app review surface
4. **Phase 4**: Team features and enterprise connectors

## Detection Priorities

### P0 (Must-have)
- Secret/credential detection: API keys, bearer tokens, JWTs, cookies, passwords, DSNs, database URLs, cloud credentials, `.env` patterns
- Log/code sanitization: stack traces, headers, config blobs, request payloads, connection strings
- Replacement modes: redact, tokenize, partial reveal, warn, block
- Fully local execution

### P1 (Strong differentiators)
- Explainable detections with rule/pattern provenance
- Side-by-side review UX before copy/send
- Persona policy packs
- Import/export of policies and custom rules

### P2 (Expansion)
- Response placeholder restoration in AI chat workflows
- Regional data packs for country-specific identifiers
- Enterprise governance (team-wide enforcement, analytics, auditability)

## Key Design Constraints

- **Local-first**: All detection and masking must work without cloud dependencies
- **Workflow-native**: Integrate at true boundaries (file system, clipboard, DOM) not as afterthought
- **Unified policy**: Do not fragment rule systems across different surfaces
- **Explainable**: Users must understand why content was flagged
- **Trust-building**: Side-by-side review before send/copy critical for adoption
