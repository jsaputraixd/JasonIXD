import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MANIFEST = path.join(
  __dirname,
  "..",
  "..",
  "public",
  "audio",
  "listen",
  "manifest.json"
);

function isConfigured() {
  return Boolean(
    process.env.ELEVENLABS_API_KEY && process.env.ELEVENLABS_VOICE_ID
  );
}

function hasStaticListenClips() {
  try {
    const raw = fs.readFileSync(MANIFEST, "utf8");
    const data = JSON.parse(raw);
    return Object.keys(data.entries ?? {}).length > 0;
  } catch {
    return false;
  }
}

/** Report listen/TTS availability for the client (no secrets). */
export async function GET() {
  const staticClips = hasStaticListenClips();
  const live = isConfigured();

  let provider = "browser";
  if (staticClips) provider = "static";
  else if (live) provider = "elevenlabs";

  return Response.json({ provider, staticClips, live });
}

/** Optional live fallback — prefer pre-generated MP3s in production. */
export async function POST(request) {
  if (!isConfigured()) {
    return Response.json({ error: "TTS not configured" }, { status: 503 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const text = typeof body?.text === "string" ? body.text.trim() : "";
  if (!text) {
    return Response.json({ error: "Missing text" }, { status: 400 });
  }
  if (text.length > 4000) {
    return Response.json(
      { error: "Text exceeds 4000 characters" },
      { status: 400 }
    );
  }

  const voiceId = process.env.ELEVENLABS_VOICE_ID;
  const modelId =
    process.env.ELEVENLABS_MODEL_ID || "eleven_turbo_v2_5";

  const upstream = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: modelId,
        voice_settings: {
          stability: 0.45,
          similarity_boost: 0.78,
          style: 0.15,
          use_speaker_boost: true,
        },
      }),
    }
  );

  if (!upstream.ok) {
    const detail = await upstream.text().catch(() => "");
    console.error("[tts] ElevenLabs error:", upstream.status, detail);
    return Response.json({ error: "Upstream TTS failed" }, { status: 502 });
  }

  const audio = await upstream.arrayBuffer();
  return new Response(audio, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "no-store",
    },
  });
}
