const express = require("express");
const path = require("path");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const API_KEY = process.env.HF_API_KEY;

app.post("/api/generate", async (req, res) => {
  const { prompt } = req.body;

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: prompt,
          options: { wait_for_model: true } // 🔥 penting!
        })
      }
    );

    // 🔥 cek kalau bukan gambar
    const contentType = response.headers.get("content-type");

    if (!contentType || contentType.includes("application/json")) {
      const err = await response.json();
      console.log("ERROR API:", err);

      return res.json({
        image: "https://via.placeholder.com/400x300?text=Model+Loading..."
      });
    }

    // kalau sukses
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    res.json({
      image: `data:image/png;base64,${base64}`
    });

  } catch (err) {
    console.error(err);
    res.json({
      image: "https://via.placeholder.com/400x300?text=Server+Error"
    });
  }
});

module.exports = app;
