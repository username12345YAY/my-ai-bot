// server.js
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch"); // ✅ proper fetch import
require("dotenv").config();

const app = express();

// ✅ strong CORS: allow GitHub Pages and any browser
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

const OPENAI_KEY = process.env.OPENAI_KEY;

// ✅ chat endpoint
app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message || "";

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a friendly, helpful AI." },
          { role: "user", content: userMessage },
        ],
      }),
    });

    const data = await aiRes.json();
    const reply = data.choices?.[0]?.message?.content || "No reply";

    res.json({ reply });
  } catch (err) {
    console.error("Error in /chat route:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ✅ important: use Render’s assigned port, not hard-coded 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`AI server running on http://localhost:${PORT}`)
);
