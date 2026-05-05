const express = require("express");
const fetch = require("node-fetch");
const path = require("path");

const app = express();
app.use(express.json());

// serve index.html langsung dari root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const API_KEY = "MASUKKAN_API_KEY_KAMU";

app.post("/api/generate", async (req, res) => {
  const { prompt } = req.body;

  try {
    const response = await fetch("https://api.pixazo.ai/generate", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt: prompt,
        model: "sdxl"
      })
    });

    const data = await response.json();

    res.json({
      image: data.image || data.url || ""
    });

  } catch (err) {
    res.status(500).json({ error: "Gagal generate" });
  }
});

module.exports = app;