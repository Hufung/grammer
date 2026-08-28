#!/usr/bin/env node

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const { checkText } = require('../lib/languagetool');

async function readInput() {
  const file = process.argv[2];
  if (file) {
    if (!fs.existsSync(file)) {
      console.error(`File not found: ${file}`);
      process.exit(2);
    }
    return { text: fs.readFileSync(file, 'utf-8'), source: file };
  }

  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf-8');
    process.stdin.on('data', (chunk) => (data += chunk));
    process.stdin.on('end', () => resolve({ text: data, source: 'stdin' }));
  });
}

function offsetToLine(text, offset) {
  const lines = text.slice(0, offset).split('\n');
  return lines.length;
}

async function main() {
  const { text, source } = await readInput();

  if (!text.trim()) {
    console.log('No text to check.');
    process.exit(0);
  }

  let issues;
  try {
    issues = await checkText(text);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    console.error('Is LanguageTool running? Start it with: docker-compose up -d');
    process.exit(2);
  }

  if (issues.length === 0) {
    console.log(`✓ ${source}: no issues found`);
    process.exit(0);
  }

  for (const issue of issues) {
    const line = offsetToLine(text, issue.offset);
    const snippet = issue.context.slice(
      issue.contextOffset,
      issue.contextOffset + issue.contextLength
    );
    const suggestion =
      issue.replacements.length > 0 ? ` → ${issue.replacements[0]}` : '';
    console.log(`${source}:${line}: ${issue.message} [${snippet}]${suggestion}`);
  }

  console.log(`\n${issues.length} issue(s) found.`);
  process.exit(1);
}

main();
