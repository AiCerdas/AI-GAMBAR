const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Melayani index.html dari root

app.post('/api/generate', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt wajib diisi' });
  }

  try {
    const apiKey = process.env.MODELSLAB_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'API Key belum dikonfigurasi di server' });
    }

    // Gunakan timeout agar tidak gantung jika API luar lambat
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 28000); // Vercel limit biasanya 30s

    const response = await fetch('https://modelslab.com/api/v6/realtime/text2img', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key: apiKey,
        prompt: prompt,
        negative_prompt: "bad quality, blurry, low res, watermark",
        width: "512", 
        height: "512",
        samples: 1,
        safety_checker: "no",
        enhance_prompt: "yes",
        base64: "no",
        temp: "no"
      }),
      signal: controller.signal
    });

    clearTimeout(id);
    const data = await response.json();

    // Log status ke console Vercel untuk memantau error
    console.log("Status dari ModelsLab:", data.status);

    if (data.status === "success" || data.status === "ready") {
      const outputImage = data.output?.[0] || data.proxy_links?.[0];
      if (outputImage) {
        return res.json({ success: true, image: outputImage });
      }
    }

    if (data.status === "processing") {
      return res.status(202).json({ 
        success: false, 
        message: "Gambar sedang dibuat, coba klik lagi dalam beberapa detik." 
      });
    }

    res.status(500).json({ error: data.message || "Gagal memproses permintaan AI" });

  } catch (error) {
    console.error("Error Detail:", error.message);
    if (error.name === 'AbortError') {
      return res.status(504).json({ error: "Server AI memakan waktu terlalu lama. Coba lagi." });
    }
    res.status(500).json({ error: "Terjadi kesalahan internal pada server" });
  }
});

// Penting: Tambahkan handler untuk route utama
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Menjalankan server (Hanya jika bukan di environment serverless/Vercel)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`AbidinAI Server aktif di http://localhost:${PORT}`);
  });
}

module.exports = app;
