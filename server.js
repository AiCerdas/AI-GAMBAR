const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));   // serve index.html dari root

// Endpoint Generate Gambar
app.post('/api/generate', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt diperlukan' });
  }

  try {
    const apiKey = process.env.MODELSLAB_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'MODELSLAB_API_KEY belum diatur di Vercel' });
    }

    const response = await fetch('https://modelslab.com/api/v6/realtime/text2img', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key: apiKey,
        prompt: prompt,
        negative_prompt: "blurry, low quality, deformed, ugly",
        width: 1024,
        height: 1024,
        samples: 1,
        safety_checker: false,
        instant_response: true,
        base64: false
      })
    });

    const data = await response.json();

    if (data.status === "success" && data.output && data.output.length > 0) {
      res.json({ success: true, image: data.output[0] });
    } else if (data.status === "processing") {
      res.json({ success: false, message: "Gambar sedang diproses, coba lagi sebentar" });
    } else {
      res.status(500).json({ 
        error: data.message || 'Gagal generate gambar' 
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Terjadi kesalahan saat menghubungi ModelsLab' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;