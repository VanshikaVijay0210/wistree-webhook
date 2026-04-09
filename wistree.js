/* eslint-disable no-undef */
import fetch from 'node-fetch';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://aqfpknemptjzfvxoiytk.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

export async function saveStoryToWisTree({ from, audioUrl, transcript }) {
  const story = {
    audio_url: audioUrl || null,
    transcript_tamil: transcript || null,
    transcript_english: transcript || null,
    tags: 'WhatsApp,Voice Story',
    status: 'pending',
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
