// server.js — OpenRouter version
// Express proxy that calls OpenRouter's Chat Completions API.

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);
app.use(express.json());

// ====== CONFIG ======
const OPENROUTER_KEY = process.env.OPENROUTER_KEY; // <-- set in Render
const MODEL = process.env.OPENROUTER_MODEL || "deepseek/deepseek-r1:free";
// (Optional) helps OpenRouter attribute your app
const SITE_URL = process.env.SITE_URL || "https://username12345YAY.github.io/my-ai-bot/";
const APP_TITLE = process.env.APP_TITLE || "My AI Bot";

// health check
app.get("/health", (_req, res) => res.json({ ok: true }));

app.post("/chat", async (req, res) => {
  try {
    const userMessage = (req.body?.message ?? "").toString().slice(0, 4000);

    if (!OPENROUTER_KEY) {
      console.error("OPENROUTER_KEY is missing");
      return res.status(500).json({ error: "Server missing API key" });
    }
    if (!userMessage) {
      return res.status(400).json({ error: "Empty message" });
    }

    const orRes = await globalThis.fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENROUTER_KEY}`,
          // These two headers are recommended by OpenRouter:
          "HTTP-Referer": SITE_URL, // your site or repo URL
          "X-Title": APP_TITLE,
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

    if (!orRes.ok) {
      const errText = await orRes.text().catch(() => "(no body)");
      console.error("OpenRouter error:", orRes.status, errText);
      return res.status(500).json({
        error: `OpenRouter error ${orRes.status}`,
        details: errText.slice(0, 1000),
      });
    }

    const data = await orRes.json().catch(() => ({}));
    const reply = data?.choices?.[0]?.message?.content?.trim();
    return res.json({ reply: reply || "Sorry, I couldn't generate a reply." });
  } catch (err) {
    console.error("Error in /chat route:", err);
    return res.status(500).json({ error: "Server error while talking to OpenRouter" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`AI server running on http://localhost:${PORT}`);
});
