const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Melayani index.html langsung dari root

// Endpoint API
app.post('/api/generate', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) return res.status(400).json({ error: 'Prompt kosong' });

  try {
    const apiKey = process.env.MODELSLAB_API_KEY;
    
    // Gunakan fetch dengan timeout agar tidak gantung
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);

    const response = await fetch('https://modelslab.com/api/v6/realtime/text2img', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key: apiKey,
        prompt: prompt,
        negative_prompt: "low quality, blurry",
        width: "512",
        height: "512",
        safety_checker: "no",
        samples: 1,
        base64: "no",
        temp: "no"
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);
    const data = await response.json();

    if (data.status === "success" || data.status === "ready") {
      return res.json({ success: true, image: data.output[0] });
    }

    res.status(500).json({ error: "API Sedang sibuk atau limit tercapai" });
  } catch (err) {
    res.status(500).json({ error: "Server Timeout/Error. Coba lagi." });
  }
});

// Jalankan server jika lokal
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server root jalan di port ${PORT}`));
}

module.exports = app;
