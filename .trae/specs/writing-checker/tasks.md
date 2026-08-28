# Tasks

- [x] Task 1: Project scaffolding — Initialize Node project, install dependencies, create directory structure
  - [x] SubTask 1.1: Create `package.json` with project metadata, scripts (`start`, `check`), and dependencies (express, dotenv, node-fetch, diff)
  - [x] SubTask 1.2: Create `.env.example` with `LLM_API_KEY=` placeholder
  - [x] SubTask 1.3: Create empty `dictionary.txt` with a comment explaining its purpose
  - [x] SubTask 1.4: Create `.gitignore` (node_modules, .env)

- [x] Task 2: LanguageTool integration — Create a module that talks to the local LanguageTool Docker API
  - [x] SubTask 2.1: Create `lib/languagetool.js` with a function `checkText(text, dictionary)` that POSTs to `http://localhost:8010/v2/check` with the text and disabled rules for dictionary words
  - [x] SubTask 2.2: Parse the LanguageTool response into a normalized array of `{ offset, length, message, replacements[] }`
  - [x] SubTask 2.3: Read `dictionary.txt` and pass its words as `disabledRules` or `disabledCategories` to LanguageTool on each call

- [x] Task 3: Web UI — Build the Express server and frontend
  - [x] SubTask 3.1: Create `server.js` — Express app bound to `localhost`, serves static files from `public/`, exposes `POST /api/check` endpoint
  - [x] SubTask 3.2: Create `public/index.html` — textarea for input, "Check" button, results display area, rewrite pane section
  - [x] SubTask 3.3: Create `public/style.css` — clean, readable styling for the editor, underlines, hover tooltips, diff view
  - [x] SubTask 3.4: Create `public/app.js` — frontend logic: send text to `/api/check`, render issues as underlines in a styled div, show hover tooltips with explanations, apply suggestion on click

- [x] Task 4: LLM rewrite pane — Add optional LLM-powered rewriting with diff view
  - [x] SubTask 4.1: Create `lib/llm.js` with a function `rewrite(text, mode)` that calls the LLM API (OpenAI-compatible) with a system prompt for the selected mode (tighten / friendlier / formal)
  - [x] SubTask 4.2: Add `POST /api/rewrite` endpoint to `server.js` that accepts `{ text, mode }` and returns the rewritten text
  - [x] SubTask 4.3: Add frontend UI for three rewrite buttons (tighten, friendlier, formal) and a diff view (original vs. rewrite) with Accept/Reject controls
  - [x] SubTask 4.4: Handle missing LLM key gracefully — disable rewrite pane with a message when `LLM_API_KEY` is not set

- [x] Task 5: CLI mode — Implement `check <file.md>` command
  - [x] SubTask 5.1: Create `bin/check.js` — reads a file, calls LanguageTool, prints issues with line numbers, exits 0 or 1
  - [x] SubTask 5.2: Add `"bin": { "check": "./bin/check.js" }` to `package.json` and a `check` script
  - [x] SubTask 5.3: Support reading from stdin when no file argument is given (for piping)

- [x] Task 6: Docker Compose for LanguageTool — Provide a one-command way to start LanguageTool
  - [x] SubTask 6.1: Create `docker-compose.yml` with the official `erikvl87/languagetool` image, port 8010 exposed, memory limit set to ~1 GB

- [x] Task 7: README — Document setup, usage, and architecture
  - [x] SubTask 7.1: Write README with: prerequisites (Node, Docker), quick start (docker-compose up, npm start), CLI usage, LLM key setup, RAM note (~1 GB for LanguageTool), personal dictionary usage

# Task Dependencies
- Task 2 depends on Task 1 (needs project structure and dependencies)
- Task 3 depends on Task 2 (web UI calls the LanguageTool module)
- Task 4 depends on Task 3 (LLM pane is part of the web UI)
- Task 5 depends on Task 2 (CLI calls the same LanguageTool module)
- Task 6 is independent (can be done in parallel with Tasks 2-5)
- Task 7 depends on all other tasks (documents the complete system)
