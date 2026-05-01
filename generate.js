const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));   // kalau mau taruh index.html di folder public nanti

// Route utama untuk generate gambar
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

    const response = await fetch('https://modelslab.com/api/v7/images/text-to-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key: apiKey,
        model_id: "flux",
        prompt: prompt,
        width: 1024,
        height: 1024,
        samples: 1,
        num_inference_steps: 25,
        guidance_scale: 7.5,
        safety_checker: "no"
      })
    });

    const data = await response.json();

    if (data.status === "success" && data.output && data.output.length > 0) {
      res.json({ success: true, image: data.output[0] });
    } else {
      res.status(500).json({ 
        error: data.message || 'Gagal generate gambar dari ModelsLab' 
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Terjadi kesalahan saat generate gambar' });
  }
});

// Route untuk cek server hidup
app.get('/', (req, res) => {
  res.send('Server Express ModelsLab berjalan!');
});

app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});

module.exports = app;   // Penting untuk Vercel