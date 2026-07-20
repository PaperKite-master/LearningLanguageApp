import { YoutubeTranscript } from 'youtube-transcript';

const YOUTUBE_ID_REGEX =
  /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;

export function extractYouTubeVideoId(url) {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(YOUTUBE_ID_REGEX);
  if (match && match[2]?.length === 11) return match[2];
  return null;
}

async function translateWithGemini(texts) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const prompt = [
    'Translate each Japanese subtitle line to natural Vietnamese for IT/learning context.',
    'Return ONLY a JSON array of Vietnamese strings in the same order as input.',
    'Do not wrap in markdown code fences.',
    JSON.stringify(texts),
  ].join('\n\n');

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2 },
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error: ${response.status} ${errText}`);
  }

  const data = await response.json();
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!raw) throw new Error('Gemini returned empty translation');

  const cleaned = raw.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
  const parsed = JSON.parse(cleaned);
  if (!Array.isArray(parsed) || parsed.length !== texts.length) {
    throw new Error('Gemini translation count mismatch');
  }
  return parsed.map((line) => String(line));
}

async function translateWithGoogleFree(text) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ja&tl=vi&dt=t&q=${encodeURIComponent(text)}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Google Translate fallback failed: ${response.status}`);
  }
  const data = await response.json();
  return data?.[0]?.map((part) => part?.[0]).join('') ?? text;
}

async function translateBatch(texts) {
  const geminiResult = await translateWithGemini(texts);
  if (geminiResult) return geminiResult;

  const results = [];
  for (const text of texts) {
    results.push(await translateWithGoogleFree(text));
    await new Promise((resolve) => setTimeout(resolve, 120));
  }
  return results;
}

function chunkArray(items, size) {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export async function generateBilingualSubtitles(videoUrl) {
  const videoId = extractYouTubeVideoId(videoUrl);
  if (!videoId) {
    const err = new Error('Invalid or missing YouTube video URL');
    err.statusCode = 400;
    throw err;
  }

  let transcript;
  try {
    transcript = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'ja' });
  } catch {
    try {
      transcript = await YoutubeTranscript.fetchTranscript(videoId);
    } catch (innerErr) {
      const err = new Error(
        'Could not fetch YouTube transcript. Ensure the video has Japanese captions enabled.'
      );
      err.statusCode = 422;
      err.cause = innerErr;
      throw err;
    }
  }

  if (!transcript?.length) {
    const err = new Error('No transcript segments found for this video');
    err.statusCode = 422;
    throw err;
  }

  const segments = transcript.map((item) => {
    const bothInteger =
      Number.isInteger(item.offset) && Number.isInteger(item.duration);
    return {
      text_ja: item.text?.trim() ?? '',
      start: bothInteger ? Number(item.offset) / 1000 : Number(item.offset ?? 0),
      duration: bothInteger ? Number(item.duration) / 1000 : Number(item.duration ?? 0),
    };
  });

  const chunks = chunkArray(segments, 20);
  const subtitles = [];

  for (const chunk of chunks) {
    const jaTexts = chunk.map((seg) => seg.text_ja);
    const viTexts = await translateBatch(jaTexts);
    chunk.forEach((seg, index) => {
      subtitles.push({
        text_ja: seg.text_ja,
        text_vi: viTexts[index] ?? seg.text_ja,
        start: seg.start,
        duration: seg.duration,
      });
    });
  }

  return subtitles;
}
