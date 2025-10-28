// server.js
const express = require("express");
const cors = require("cors");
const fetch = global.fetch;
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const OPENAI_KEY = process.env.OPENAI_KEY;

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
          { role: "system", content: "You are a friendly helpful AI." },
          { role: "user", content: userMessage },
        ],
      }),
    });

    const data = await aiRes.json();
    const reply = data.choices?.[0]?.message?.content || "No reply";
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(3000, () => console.log("AI server running on http://localhost:3000"));
