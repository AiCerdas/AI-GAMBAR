// server.js

import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.static("./"));

app.post("/api/generate", async (req, res) => {

  try {

    const { prompt } = req.body;

    if(!prompt){
      return res.status(400).json({
        error:"Prompt kosong"
      });
    }

    const response = await fetch(
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
      {
        method:"POST",
        headers:{
          "Authorization": `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          inputs: prompt
        })
      }
    );

    if(!response.ok){

      const errText = await response.text();

      return res.status(500).json({
        error: errText
      });
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    res.setHeader("Content-Type","image/png");
    res.send(buffer);

  } catch(err){

    res.status(500).json({
      error: err.message
    });
  }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server berjalan di port " + PORT);
});