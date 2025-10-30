// server.js
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const PORT = process.env.PORT || 3000;

// Your Chatbase Agent ID
const AGENT_ID = "V9IMj0fvC-qfKcgUKwX6A";

// Proxy middleware to forward /help requests to Chatbase
const chatbaseProxy = createProxyMiddleware({
  target: "https://chatbase.co",
  changeOrigin: true,
  pathRewrite: {
    "^/help": `/${AGENT_ID}/help`,
  },
  proxyTimeout: 5000, // timeout for proxy requests
});

// Apply the proxy route
app.use("/help", chatbaseProxy);

// Basic homepage route
app.get("/", (req, res) => {
  res.send(`
    <h1>✅ Chatbase Proxy Server Running</h1>
    <p>Try visiting <a href="/help" target="_blank">/help</a> to test the Chatbase proxy.</p>
  `);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
