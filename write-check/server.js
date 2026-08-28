require("dotenv").config();
const express = require("express");
const { checkText } = require("./lib/languagetool");
const { rewriteText } = require("./lib/llm");
const path = require("path");

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/check", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.json({ matches: [] });
    const matches = await checkText(text);
    res.json({ matches });
  } catch (err) {
    console.error("Check error:", err.message);
    res.status(502).json({ error: "LanguageTool unavailable", detail: err.message });
  }
});

app.post("/api/rewrite", async (req, res) => {
  try {
    const { text, mode } = req.body;
    if (!text) return res.status(400).json({ error: "text required" });
    const result = await rewriteText(text, mode);
    res.json(result);
  } catch (err) {
    console.error("Rewrite error:", err.message);
    res.status(502).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3800;
const server = app.listen(PORT, "127.0.0.1", () => {
  console.log(`WriteCheck running at http://localhost:${PORT}`);
});

module.exports = { app, server };
