# Writing Checker

A local-first personal writing checker. Grammar checks run entirely on your machine via LanguageTool's Docker image. An optional LLM rewrite pane can tighten, soften, or formalize your prose — that's the only part that calls the internet.

No accounts. No telemetry. No browser extension.

## Prerequisites

- **Node.js** ≥ 18
- **Docker** (for LanguageTool)
- ~**1 GB of RAM** available for the LanguageTool container

## Quick Start

```bash
# 1. Start LanguageTool (background, ~1 GB RAM)
docker-compose up -d

# 2. Install dependencies
npm install

# 3. (Optional) Configure LLM
cp .env.example .env
# Edit .env and add your LLM_API_KEY

# 4. Start the web server
npm start
# → http://localhost:3000
```

## Web UI

Open `http://localhost:3000`, paste your text, and click **Check Grammar**. Issues appear as wavy underlines — hover for an explanation, click a suggestion to apply it.

### LLM Rewrite Pane

Below the editor, three buttons let you rewrite your text:

| Button | What it does |
|--------|-------------|
| **Tighten** | Cuts filler, makes prose concise |
| **Friendlier** | Warmer, more conversational tone |
| **Formal** | Professional, polished style |

A diff view shows the changes before you accept or reject them.

**Setup:** Add your API key to `.env`:

```
LLM_API_KEY=sk-...
LLM_BASE_URL=https://api.openai.com/v1   # or any OpenAI-compatible endpoint
LLM_MODEL=gpt-4o-mini
```

If no key is set, the rewrite pane is disabled with a notice.

## CLI Mode

Check a file from the command line — great for git pre-commit hooks:

```bash
# Check a single file
node bin/check.js README.md

# Pipe from stdin
cat draft.md | node bin/check.js

# Or use the npm script
npm run check -- my-doc.md
```

Output shows issues with line numbers. Exit code is **0** if clean, **1** if issues found, **2** on error.

### Git Pre-commit Hook

```bash
# .git/hooks/pre-commit (make executable)
#!/bin/sh
node bin/check.js $(git diff --cached --name-only --diff-filter=ACM -- '*.md')
```

## Personal Dictionary

Add names, jargon, and brand terms to `dictionary.txt` (one word per line, `#` for comments). These words are excluded from spell-checking on every grammar check.

```
# dictionary.txt
Kubernetes
PostgreSQL
WebAssembly
```

## Architecture

```
├── server.js            # Express server (localhost only)
├── lib/
│   ├── languagetool.js  # LanguageTool API client
│   └── llm.js           # LLM rewrite client
├── bin/
│   └── check.js         # CLI entry point
├── public/
│   ├── index.html       # Web UI
│   ├── style.css        # Styles
│   └── app.js           # Frontend logic
├── dictionary.txt       # Personal dictionary
├── docker-compose.yml   # LanguageTool container
├── .env.example         # LLM key template
└── package.json
```

## LanguageTool Docker

The `docker-compose.yml` uses the `erikvl87/languagetool` image, which bundles the English language model. It exposes port **8010** and is configured with ~768 MB heap.

To use a different LanguageTool image or adjust memory:

```yaml
services:
  languagetool:
    image: erikvl87/languagetool
    ports:
      - "8010:8010"
    environment:
      - Java_Xmx=1024m   # increase if you have RAM to spare
```

## Out of Scope

This is a **destination** you paste text into — not a browser extension, not an overlay on Gmail/Docs/Slack. That's the honest trade against Grammarly: you get privacy and local-first grammar, but you paste instead of getting inline suggestions everywhere.
