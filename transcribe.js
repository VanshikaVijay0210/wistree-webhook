/* eslint-disable no-undef */
import fetch from 'node-fetch';
import FormData from 'form-data';

export async function transcribeAudioFromUrl(mediaUrl) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  const audioRes = await fetch(mediaUrl, {
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
    },
  });

  if (!audioRes.ok) {
    throw new Error(`Failed to download audio: ${audioRes.status}`);
  }

  const audioBuffer = await audioRes.buffer();

  const form = new FormData();
  form.append('file', audioBuffer, { filename: 'voice.ogg', contentType: 'audio/ogg' });
  form.append('model', 'whisper-1');
  form.append('response_format', 'text');

  const whisperRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      ...form.getHeaders(),
    },
    body: form,
  });

  if (!whisperRes.ok) {
    const err = await whisperRes.text();
    throw new Error(`Whisper error: ${err}`);
  }

  return await whisperRes.text();
}
