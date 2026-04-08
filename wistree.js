/* eslint-disable no-undef */
import fetch from 'node-fetch';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

const PHONE_MAP = {};

function cleanPhone(from) {
  return from.replace('whatsapp:', '').trim();
}

export async function saveStoryToWisTree({ from, audioUrl, transcript }) {
  const sender = PHONE_MAP[from] || {
    name: cleanPhone(from),
    nickname: cleanPhone(from),
    emoji: '📱',
  };

  const title = transcript
    ? generateTitle(transcript)
    : `Voice Story from ${sender.nickname}`;

  const story = {
    title,
    storyteller_name: sender.nickname,
    storyteller_emoji: sender.emoji,
    original_language: 'Auto-detected',
    transcript_original: transcript || null,
    audio_url: audioUrl || null,
    tags: ['WhatsApp', 'Voice Story'],
    love_count: 0,
    listen_count: 0,
  };

  const res = await fetch(`${SUPABASE_URL}/rest/v1/stories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify(story),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase save error: ${err}`);
  }
}

function generateTitle(transcript) {
  const words = transcript.trim().split(/\s+/).slice(0, 8).join(' ');
  return words.length > 0 ? `${words}...` : 'A Family Story';
}
