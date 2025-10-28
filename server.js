// server.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// CORS: allow GitHub Pages (and others)
app.use(cors({ origin: "*", methods: ["GET", "POST"], allowedHeaders: ["Content-Type"] }));
app.use(express.json());

const OPENAI_KEY = process.env.OPENAI_KEY;

// quick health check
app.get("/health", (_req, res) => res.json({ ok: true }));

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message || "";

    const aiRes = await globalThis.fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo", // very reliable
        messages: [
          { role: "system", content: "You are a friendly, helpful AI." },
          { role: "user", content: userMessage }
        ]
      })
    });

    const data = await aiRes.json();
    // Optional: log minimal info for debugging (safe)
    // console.log("OpenAI status:", aiRes.status, "keys:", Object.keys(data));

    const reply = data?.choices?.[0]?.message?.content?.trim();
    res.json({ reply: reply || "No reply" });
  } catch (err) {
    console.error("Error in /chat route:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`AI server running on http://localhost:${PORT}`));
