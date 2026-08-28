const fs = require("fs");
const path = require("path");

function dictionaryWords() {
  const file = path.resolve(process.env.DICTIONARY_FILE || "./dictionary.txt");
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, "utf8").split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
}

async function checkText(text) {
  const params = new URLSearchParams({
    text,
    language: "en-US",
    enabledOnly: "false",
    dicts: dictionaryWords().join(",")
  });
  const response = await fetch(`${process.env.LT_URL || "http://localhost:8010"}/v2/check`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params
  });
  if (!response.ok) throw new Error(`LanguageTool returned ${response.status}`);
  const data = await response.json();
  return data.matches.map((match) => ({
    offset: match.offset,
    length: match.length,
    message: match.message,
    shortMessage: match.shortMessage,
    replacements: match.replacements.slice(0, 5).map((r) => r.value),
    ruleId: match.rule?.id,
    category: match.rule?.category?.name,
    context: match.context?.text
  }));
}

module.exports = { checkText };
