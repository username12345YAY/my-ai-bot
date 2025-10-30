// server.js — Sagittarius AI Proxy (Full Final Version)
import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Only allow requests from Google Sites
app.use(
  cors({
    origin: [
      "https://sites.google.com",         // base domain
      "https://sites.google.com/view",    // common subdomain pattern for Google Sites
      "https://www.google.com"            // for embedded iframes
    ],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200
  })
);

// Parse JSON bodies
app.use(express.json());

// 🔐 Load Chatbase credentials from environment variables
const AGENT_ID = process.env.CHATBASE_AGENT_ID;
const API_KEY = process.env.CHATBASE_API_KEY;

if (!AGENT_ID) {
  console.error("❌ CHATBASE_AGENT_ID is not set in environment variables.");
  process.exit(1);
}

if (!API_KEY) {
  console.warn("⚠️ CHATBASE_API_KEY not found — continuing without it (for public agents only).");
}

// Serve static files (chat.html, etc.)
app.use(express.static(path.join(__dirname)));

// ✅ Forward messages securely to Chatbase API
app.post("/help", async (req, res) => {
  try {
    console.log("🟢 Incoming message:", req.body);

    const headers = { "Content-Type": "application/json" };
    if (API_KEY) headers["Authorization"] = `Bearer ${API_KEY}`;

    const response = await fetch(`https://www.chatbase.co/api/agent/${AGENT_ID}/message`, {
      method: "POST",
      headers,
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    console.log(`🟣 Chatbase responded (status ${response.status}):`, JSON.stringify(data, null, 2));

    // 🧠 Smart reply extraction — handles multiple Chatbase formats
    const reply =
      data.text ||
      data.reply ||
      data.response ||
      (data.output && data.output.text) ||
      (data.messages && data.messages[0] && data.messages[0].content) ||
      "🤔 Sagittarius did not return any text.";

    res.status(response.status).json({ text: reply });
  } catch (error) {
    console.error("🔴 Error contacting Chatbase:", error);
    res.status(500).json({ error: "Failed to reach Chatbase API" });
  }
});

// Homepage (for quick access)
app.get("/", (req, res) => {
  res.send(`
    <h1>✅ Sagittarius Proxy Server Running Securely</h1>
    <p>Visit <a href="/chat.html" target="_blank">Chatbox</a></p>
  `);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Sagittarius proxy running securely on port ${PORT}`);
});
