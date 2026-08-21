const { SarvamAIClient } = require('sarvamai');

module.exports = async (req, res) => {
    // CORS headers for Vercel
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const client = new SarvamAIClient({
            apiSubscriptionKey: process.env.SARVAM_API_KEY,
        });

        // Some frameworks parse the body, some don't. Fallback if it's a string:
        let body = req.body;
        if (typeof body === 'string') {
            try { body = JSON.parse(body); } catch (e) {}
        }

        const { text, language_code, speaker, model, pace, speech_sample_rate } = body;

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

        res.status(200).json({ audios: response.audios });
    } catch (error) {
        console.error("Sarvam API Error:", error.message || error);
        res.status(500).json({ error: 'Failed to generate speech', details: error.message });
    }
};
