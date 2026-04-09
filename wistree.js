/* eslint-disable no-undef */
import fetch from 'node-fetch';

const BASE44_API = `https://api.base44.com/api/apps/${process.env.BASE44_APP_ID}`;
const BASE44_HEADERS = {
  'Content-Type': 'application/json',
  'x-api-key': process.env.BASE44_API_KEY,
};

const SUPABASE_URL = 'https://aqfpknemptjzfvxoiytk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxZnBrbmVtcHRqemZ2eG9peXRrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzA5NzQzNywiZXhwIjoyMDg4NjczNDM3fQ.5vP9Jn1Wz4vy8gBBwM1pGH-W7s9A2wxzlTEca0HcpwA';
const SUPABASE_HEADERS = {
  'Content-Type': 'application/json',
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
};

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

  const [base44Result, supabaseResult] = await Promise.allSettled([
    saveToBase44(story),
    saveToSupabase(story),
  ]);

  if (base44Result.status === 'rejected') {
    console.error('❌ Base44 save failed:', base44Result.reason);
  } else {
    console.log('✅ Saved to Base44');
  }

  if (supabaseResult.status === 'rejected') {
    console.error('❌ Supabase save failed:', supabaseResult.reason);
  } else {
    console.log('✅ Saved to Supabase');
  }

  if (base44Result.status === 'rejected' && supabaseResult.status === 'rejected') {
    throw new Error('Both Base44 and Supabase saves failed');
  }

  return base44Result.value || supabaseResult.value;
}

async function saveToBase44(story) {
  const res = await fetch(`${BASE44_API}/entities/Story`, {
    method: 'POST',
    headers: BASE44_HEADERS,
    body: JSON.stringify(story),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Base44 error: ${JSON.stringify(data)}`);
  return data;
}

async function saveToSupabase(story) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/stories`, {
    method: 'POST',
    headers: { ...SUPABASE_HEADERS, 'Prefer': 'return=representation' },
    body: JSON.stringify(story),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Supabase error: ${JSON.stringify(data)}`);
  return data;
}

function generateTitle(transcript) {
  const words = transcript.trim().split(/\s+/).slice(0, 8).join(' ');
  return words.length > 0 ? `${words}...` : 'A Family Story';
}
