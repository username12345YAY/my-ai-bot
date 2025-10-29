// server.js
// Minimal Express API that proxies chat requests to OpenAI.
// Works on Render (Node 18+). Uses built-in fetch, env var OPENAI_KEY, and permissive CORS.

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// --- middleware ---
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);
app.use(express.json());

// --- config ---
const OPENAI_KEY = process.env.OPENAI_KEY; // set this in Render → Environment
const MODEL = "gpt-3.5-turbo";             // switch later to "gpt-4o-mini" if you want

// --- health check ---
app.get("/health", (_req, res) => res.json({ ok: true }));

// --- main chat endpoint ---
app.post("/chat", async (req, res) => {
  try {
    const userMessage = (req.body?.message ?? "").toString().slice(0, 4000);

    if (!OPENAI_KEY) {
      console.error("OPENAI_KEY is missing");
      return res.status(500).json({ error: "Server missing API key" });
    }
    if (!userMessage) {
      return res.status(400).json({ error: "Empty message" });
    }

    // Use built-in fetch (Node 18+). No node-fetch needed.
    const aiRes = await globalThis.fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_KEY}`,
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: "system", content: "You are a friendly, helpful AI." },
            { role: "user", content: userMessage },
          ],
        }),
      }
    );

    // If OpenAI returns non-2xx, surface the error
    if (!aiRes.ok) {
      const errText = await aiRes.text().catch(() => "(no error body)");
      console.error("OpenAI error:", aiRes.status, errText);
      return res.status(500).json({
        error: `OpenAI error ${aiRes.status}`,
        details: errText.slice(0, 1000),
      });
    }

    const data = await aiRes.json().catch(() => ({}));
    const reply = data?.choices?.[0]?.message?.content?.trim();

    return res.json({ reply: reply || "Sorry, I couldn't generate a reply." });
  } catch (err) {
    console.error("Error in /chat route:", err);
    return res.status(500).json({ error: "Server error while talking to OpenAI" });
  }
});

// --- start server (Render provides PORT) ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`AI server running on http://localhost:${PORT}`);
});
