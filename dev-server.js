require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { SarvamAIClient } = require('sarvamai');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize Sarvam AI Client
const client = new SarvamAIClient({
  apiSubscriptionKey: process.env.SARVAM_API_KEY,
});

// Endpoint for text-to-speech
app.post('/api/tts', async (req, res) => {
    try {
        const { text, language_code, speaker, model, pace, speech_sample_rate } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        const response = await client.textToSpeech.convert({
            text: text,
            language_code: language_code || "en-IN",
            speaker: speaker || "shubh",
            model: model || "bulbul:v3",
            pace: pace || 1.0,
            speech_sample_rate: speech_sample_rate || 8000
        });

        // The SDK returns the audio array
        res.json({ audios: response.audios });

    } catch (error) {
        console.error("Sarvam API Error:", error.message || error);
        res.status(500).json({ error: 'Failed to generate speech' });
    }
});

// Serve static files from the current directory
app.use(express.static(__dirname));

app.listen(PORT, () => {
    console.log(`Backend Server running at http://localhost:${PORT}`);
});
