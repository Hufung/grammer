# Personal Writing Checker Spec

## Why
Grammarly sends all text to the cloud and requires an account. A local-first writing checker keeps prose private, works offline for grammar, and adds an optional LLM rewrite pane — all without telemetry or accounts.

## What Changes
- New Node + Express project (`package.json`, `server.js`, `public/`)
- Local LanguageTool integration via its official Docker image (grammar never leaves the machine)
- Web UI: paste text → see underlined issues with hover explanations → click suggestion to apply
- LLM rewrite pane with three modes (tighten, friendlier, formal) and diff view before accepting
- Personal dictionary file (`dictionary.txt`) passed to LanguageTool on every check
- CLI mode: `check <file.md>` prints issues with line numbers, exits nonzero if any (git pre-commit hook compatible)
- `.env` file for optional LLM API key
- README with Docker setup, RAM requirements (~1 GB), and LLM key instructions

## Impact
- Affected specs: N/A (greenfield project)
- Affected code: Entire new project under `/workspace`

## ADDED Requirements

### Requirement: Grammar Engine
The system SHALL run LanguageTool locally via its official Docker image. Grammar checks SHALL never leave the user's machine.

#### Scenario: Grammar check via web UI
- **WHEN** user pastes text and clicks "Check"
- **THEN** the system sends text to the local LanguageTool API and returns issues

#### Scenario: Grammar check via CLI
- **WHEN** user runs `check <file.md>`
- **THEN** the system reads the file, sends content to LanguageTool, prints issues with line numbers, and exits nonzero if any issues found

### Requirement: Web UI
The system SHALL provide a local web page (Node + Express, bound to localhost) where the user can paste text and see LanguageTool issues underlined with hover explanations. Clicking a suggestion SHALL apply it.

#### Scenario: View issues
- **WHEN** LanguageTool returns issues
- **THEN** the text is displayed with issues underlined; hovering shows explanation; clicking applies the suggestion

### Requirement: LLM Rewrite Pane
The system SHALL provide an optional LLM rewrite pane (key in `.env`) with three buttons: tighten, friendlier, formal. A diff SHALL be shown against the original before the user accepts any rewrite.

#### Scenario: Rewrite text
- **WHEN** user selects a rewrite mode and clicks the button
- **THEN** the system sends text to the LLM API and displays a diff view comparing original vs. rewrite

#### Scenario: Accept rewrite
- **WHEN** user clicks "Accept" on the diff view
- **THEN** the rewritten text replaces the original in the editor

#### Scenario: No LLM key configured
- **WHEN** no LLM API key is in `.env`
- **THEN** the rewrite pane is disabled with a message indicating the key is needed

### Requirement: Personal Dictionary
The system SHALL maintain a `dictionary.txt` file of names and jargon that should never be flagged. This file SHALL be passed to LanguageTool on every check.

#### Scenario: Words in dictionary are not flagged
- **WHEN** text contains a word listed in `dictionary.txt`
- **THEN** LanguageTool does not flag that word

### Requirement: CLI Mode
The system SHALL provide a CLI command `check <file.md>` that prints issues with line numbers and exits nonzero if any issues are found, suitable for use as a git pre-commit hook.

#### Scenario: File with issues
- **WHEN** user runs `check file-with-errors.md`
- **THEN** the system prints each issue with its line number and exits with code 1

#### Scenario: Clean file
- **WHEN** user runs `check clean-file.md`
- **THEN** the system prints a success message and exits with code 0

### Requirement: Local-First Architecture
Everything SHALL run locally except the optional LLM call. There SHALL be no accounts, no telemetry, and no external services required for core grammar checking.

### Requirement: README Documentation
The README SHALL document: Docker setup for LanguageTool, the roughly 1 GB of RAM it requires, and where the LLM API key goes.

## REMOVED Requirements
N/A (greenfield project)

## Out of Scope
- Browser extension
- Inline suggestions inside Gmail, Docs, or Slack
- This is a destination the user pastes into, not an overlay on other apps
