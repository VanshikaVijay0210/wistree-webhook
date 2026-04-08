/* eslint-disable no-undef */
import express from 'express';
import { transcribeAudioFromUrl } from './transcribe.js';
import { saveStoryToWisTree } from './wistree.js';

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.post('/api/webhook', async (req, res) => {
  const from = req.body?.From || '';
  const body = req.body?.Body || '';
  const numMedia = parseInt(req.body?.NumMedia || '0', 10);
  const mediaUrl = req.body?.MediaUrl0 || null;
  const mediaContentType = req.body?.MediaContentType0 || '';

  console.log(`📩 Message from ${from}, body: "${body}", media: ${numMedia}`);

  const twimlAck = `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`;
  res.set('Content-Type', 'text/xml');
  res.status(200).send(twimlAck);

  try {
    const isVoiceNote = numMedia > 0 && (
      mediaContentType.includes('audio') ||
      mediaContentType.includes('ogg') ||
      mediaContentType.includes('mpeg')
    );
    const isTextMessage = body.trim().length > 0;

    if (isVoiceNote) {
      console.log(`🎙️ Voice note received from ${from}, transcribing...`);
      let transcript = null;
      try {
        transcript = await transcribeAudioFromUrl(mediaUrl);
      } catch (e) {
        console.error('Transcription failed, saving without transcript:', e.message);
      }
      await saveStoryToWisTree({ from, audioUrl: mediaUrl, transcript });
      console.log(`✅ Voice story saved from ${from}`);
    } else if (isTextMessage) {
      console.log(`💬 Text message received from ${from}`);
      await saveStoryToWisTree({ from, audioUrl: null, transcript: body });
      console.log(`✅ Text story saved from ${from}`);
    } else {
      console.log(`ℹ️ Ignored message from ${from}`);
    }
  } catch (err) {
    console.error('❌ Error processing message:', err);
  }
});

app.get('/', (req, res) => res.send('🌳 WisTree Twilio webhook is running'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌳 WisTree webhook running on port ${PORT}`));
