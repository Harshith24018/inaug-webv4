// ElevenLabs TTS Configuration — DO NOT COMMIT THIS FILE
// Get your Voice ID from: https://elevenlabs.io/app/voice-library
// Search "Indian male" in the voice library and add the voice to your account

const ElevenLabsConfig = {
    apiKey: 'sk_b563c734d454c904088e1347730c63dbb624df67c50283a3',

    // Default voice — replace with an Indian Male voice ID from your ElevenLabs library
    // To find one: go to https://elevenlabs.io/app/voice-library → search "Indian Male"
    // Click "Add" on the voice → copy the Voice ID from the URL or voice settings
    voiceId: 'INDIAN_MALE_VOICE_ID_HERE',

    // Model: eleven_multilingual_v2 handles Indian accents best
    modelId: 'eleven_multilingual_v2',

    voiceSettings: {
        stability: 0.55,         // Lower = more expressive
        similarity_boost: 0.80,  // How close to original voice
        style: 0.30,             // Expressiveness
        use_speaker_boost: true
    }
};

window.ElevenLabsConfig = ElevenLabsConfig;
