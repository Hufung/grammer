require('dotenv').config();

const express = require('express');
const path = require('path');
const { checkText } = require('./lib/languagetool');
const { rewrite } = require('./lib/llm');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/check', async (req, res) => {
  try {
    const { text } = req.body;
    if (typeof text !== 'string') {
      return res.status(400).json({ error: 'text is required' });
    }
    const issues = await checkText(text);
    res.json({ issues });
  } catch (err) {
    console.error('Check error:', err.message);
    res.status(502).json({ error: err.message });
  }
});

app.post('/api/rewrite', async (req, res) => {
  try {
    const { text, mode } = req.body;
    if (typeof text !== 'string' || !mode) {
      return res.status(400).json({ error: 'text and mode are required' });
    }
    const result = await rewrite(text, mode);
    res.json({ result });
  } catch (err) {
    console.error('Rewrite error:', err.message);
    res.status(502).json({ error: err.message });
  }
});

app.get('/api/config', (_req, res) => {
  res.json({ llmEnabled: !!process.env.LLM_API_KEY });
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Writing Checker running at http://localhost:${PORT}`);
});
