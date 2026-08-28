const fs = require('fs');
const path = require('path');

const LT_URL = process.env.LANGUAGETOOL_URL || 'http://localhost:8010/v2/check';

function loadDictionary() {
  const dictPath = path.join(__dirname, '..', 'dictionary.txt');
  if (!fs.existsSync(dictPath)) return [];
  return fs
    .readFileSync(dictPath, 'utf-8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));
}

async function checkText(text) {
  const dictionary = loadDictionary();

  const params = new URLSearchParams();
  params.append('text', text);
  params.append('language', 'en-US');
  params.append('enabledOnly', 'false');

  for (const word of dictionary) {
    params.append('disabledRules', `SPELLER_${word}`);
  }

  const res = await fetch(LT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!res.ok) {
    throw new Error(`LanguageTool returned ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();

  return data.matches.map((m) => ({
    offset: m.offset,
    length: m.length,
    message: m.message,
    replacements: m.replacements.slice(0, 5).map((r) => r.value),
    rule: m.rule.id,
    context: m.context.text,
    contextOffset: m.context.offset,
    contextLength: m.context.length,
  }));
}

module.exports = { checkText, loadDictionary };
