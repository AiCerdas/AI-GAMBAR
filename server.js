const express = require("express");
const path = require("path");

const app = express();
app.use(express.json());

// tampilkan halaman
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const API_KEY = process.env.HF_API_KEY;

app.post("/api/generate", async (req, res) => {
  const { prompt } = req.body;

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: prompt
        })
      }
    );

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    res.json({
      image: `data:image/png;base64,${base64}`
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal generate gambar" });
  }
});

module.exports = app;