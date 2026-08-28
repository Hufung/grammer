const MODES = {
  tighten: 'Make this text more concise and direct. Remove filler words, redundancy, and unnecessary phrases. Keep the meaning intact.',
  friendlier: 'Rewrite this text in a warmer, friendlier tone. Use casual language, contractions, and a conversational style while keeping the meaning.',
  formal: 'Rewrite this text in a formal, professional tone. Use complete sentences, avoid contractions, and adopt a polished business style.',
};

async function rewrite(text, mode) {
  const apiKey = process.env.LLM_API_KEY;
  if (!apiKey) throw new Error('LLM_API_KEY is not set');

  const baseUrl = process.env.LLM_BASE_URL || 'https://api.openai.com/v1';
  const model = process.env.LLM_MODEL || 'gpt-4o-mini';
  const systemPrompt = MODES[mode];
  if (!systemPrompt) throw new Error(`Unknown mode: ${mode}`);

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text },
      ],
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`LLM API returned ${res.status}: ${body}`);
  }

  const data = await res.json();
  return data.choices[0].message.content.trim();
}

module.exports = { rewrite, MODES };
