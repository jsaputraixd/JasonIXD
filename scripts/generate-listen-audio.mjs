/**
 * Batch-generate listen.exe MP3s via ElevenLabs.
 *
 * Usage:
 *   npm run generate:listen-audio          # use remaining credits, skip when exhausted
 *   npm run generate:listen-audio:wait     # poll until monthly reset, then continue
 *
 * Requires .env.local with ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID.
 */

import fs from "fs/promises";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT_DIR = path.join(ROOT, "public", "audio", "listen");
const MANIFEST_PATH = path.join(OUT_DIR, "manifest.json");

const ELEVENLABS_BASE = "https://api.elevenlabs.io/v1";
const CHAR_BUFFER = 64;
const POLL_MS = 60 * 60 * 1000; // re-check hourly while --wait
const MAX_WAIT_MS = 40 * 24 * 60 * 60 * 1000; // bail after ~40 days

const args = new Set(process.argv.slice(2));
const WAIT_FOR_RESET = args.has("--wait");
const FORCE = args.has("--force");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatWhen(ms) {
  if (!ms || !Number.isFinite(ms)) return "unknown";
  return new Date(ms).toLocaleString();
}

async function loadCatalog() {
  const mod = await import(
    pathToFileURL(path.join(ROOT, "data", "listenScripts.js")).href
  );
  return {
    listenCatalog: mod.listenCatalog,
    hashListenText: mod.hashListenText,
  };
}

async function readManifest() {
  try {
    const raw = await fs.readFile(MANIFEST_PATH, "utf8");
    return JSON.parse(raw);
  } catch {
    return { version: 1, voiceId: null, modelId: null, entries: {} };
  }
}

async function writeManifest(manifest) {
  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
}

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    console.error(`Missing ${name}. Add it to .env.local and retry.`);
    process.exit(1);
  }
  return value;
}

async function fetchSubscription(apiKey) {
  const res = await fetch(`${ELEVENLABS_BASE}/user/subscription`, {
    headers: { "xi-api-key": apiKey },
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Subscription check failed (${res.status}): ${detail}`);
  }
  const data = await res.json();
  const used = Number(data.character_count) || 0;
  const limit = Number(data.character_limit) || 0;
  return {
    tier: data.tier ?? "unknown",
    used,
    limit,
    remaining: Math.max(0, limit - used),
    resetAtMs: data.next_character_count_reset_unix
      ? data.next_character_count_reset_unix * 1000
      : null,
  };
}

async function waitForCredits(apiKey, neededChars) {
  const started = Date.now();
  let lastRemaining = null;

  while (Date.now() - started < MAX_WAIT_MS) {
    const sub = await fetchSubscription(apiKey);
    console.log(
      `[listen-audio] Credits: ${sub.remaining.toLocaleString()} / ${sub.limit.toLocaleString()} (${sub.tier}) · reset ${formatWhen(sub.resetAtMs)}`
    );

    if (sub.remaining >= neededChars + CHAR_BUFFER) {
      return sub;
    }

    if (
      lastRemaining != null &&
      sub.remaining > lastRemaining + CHAR_BUFFER
    ) {
      console.log("[listen-audio] Credit balance increased — continuing.");
      if (sub.remaining >= neededChars + CHAR_BUFFER) return sub;
    }
    lastRemaining = sub.remaining;

    const untilReset = sub.resetAtMs ? sub.resetAtMs - Date.now() : POLL_MS;
    const waitMs = Math.min(
      Math.max(untilReset + 5000, POLL_MS),
      24 * 60 * 60 * 1000
    );
    console.log(
      `[listen-audio] Need ~${neededChars} chars; waiting ${Math.round(waitMs / 60000)} min (Ctrl+C to stop)…`
    );
    await sleep(waitMs);
  }

  throw new Error("Timed out waiting for ElevenLabs credits to reset.");
}

async function synthesize({ apiKey, voiceId, modelId, text }) {
  const res = await fetch(
    `${ELEVENLABS_BASE}/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
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

  if (res.status === 401) {
    throw new Error("Invalid ELEVENLABS_API_KEY.");
  }
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    let message = detail;
    try {
      const parsed = JSON.parse(detail);
      message = parsed?.detail?.message || parsed?.detail?.code || detail;
      if (parsed?.detail?.code === "paid_plan_required") {
        const err = new Error(
          `${message} Use a premade voice ID on the free plan (e.g. George: JBFqnCBsd6RMkjVDRZzb).`
        );
        err.code = "PAID_VOICE";
        throw err;
      }
    } catch (e) {
      if (e.code === "PAID_VOICE") throw e;
    }
    if (res.status === 429 || res.status === 402) {
      const err = new Error(
        typeof message === "string" && message
          ? message
          : "ElevenLabs quota exhausted."
      );
      err.code = "QUOTA";
      throw err;
    }
    throw new Error(`TTS failed (${res.status}): ${message}`);
  }

  return Buffer.from(await res.arrayBuffer());
}

function pendingEntries(catalog, manifest, hashListenText) {
  return catalog.filter((entry) => {
    const hash = hashListenText(entry.text);
    const saved = manifest.entries[entry.id];
    if (!FORCE && saved?.textHash === hash) return false;
    return true;
  });
}

async function main() {
  const apiKey = requireEnv("ELEVENLABS_API_KEY");
  const voiceId = requireEnv("ELEVENLABS_VOICE_ID");
  const modelId = process.env.ELEVENLABS_MODEL_ID?.trim() || "eleven_turbo_v2_5";

  const { listenCatalog, hashListenText } = await loadCatalog();
  const manifest = await readManifest();
  manifest.version = 1;
  manifest.voiceId = voiceId;
  manifest.modelId = modelId;

  const queue = pendingEntries(listenCatalog, manifest, hashListenText);

  if (!queue.length) {
    console.log("[listen-audio] All clips up to date — nothing to generate.");
    return;
  }

  console.log(
    `[listen-audio] ${queue.length} clip(s) pending:`,
    queue.map((e) => e.id).join(", ")
  );

  let sub = await fetchSubscription(apiKey);
  console.log(
    `[listen-audio] Credits: ${sub.remaining.toLocaleString()} / ${sub.limit.toLocaleString()} (${sub.tier})`
  );

  const generated = [];
  const deferred = [];

  for (let i = 0; i < queue.length; i++) {
    const entry = queue[i];
    const chars = entry.text.length;
    const hash = hashListenText(entry.text);

    if (sub.remaining < chars + CHAR_BUFFER) {
      if (WAIT_FOR_RESET) {
        console.log(
          `[listen-audio] Out of credits before "${entry.id}" — waiting for reset…`
        );
        sub = await waitForCredits(apiKey, chars);
      } else {
        deferred.push(...queue.slice(i).map((e) => e.id));
        console.log(
          `[listen-audio] Skip "${entry.id}" (${chars} chars) — only ${sub.remaining} credits left. Re-run with --wait or after reset (${formatWhen(sub.resetAtMs)}).`
        );
        break;
      }
    }

    process.stdout.write(`[listen-audio] Generating "${entry.id}" (${chars} chars)… `);

    try {
      const audio = await synthesize({
        apiKey,
        voiceId,
        modelId,
        text: entry.text,
      });
      const filename = `${entry.id}.mp3`;
      await fs.mkdir(OUT_DIR, { recursive: true });
      await fs.writeFile(path.join(OUT_DIR, filename), audio);

      manifest.entries[entry.id] = {
        textHash: hash,
        path: filename,
        charCount: chars,
        generatedAt: new Date().toISOString(),
      };
      generated.push(entry.id);

      sub = await fetchSubscription(apiKey);
      console.log(`done (${(audio.length / 1024).toFixed(1)} KB)`);
    } catch (err) {
      if (err.code === "QUOTA") {
        if (WAIT_FOR_RESET) {
          console.log("quota hit — waiting for reset…");
          sub = await waitForCredits(apiKey, chars);
          i -= 1;
          continue;
        }
        deferred.push(...queue.slice(i).map((e) => e.id));
        console.log(`quota exhausted — deferred remaining clip(s).`);
        break;
      }
      console.error(`\n[listen-audio] Failed "${entry.id}": ${err.message}`);
      deferred.push(entry.id);
    }
  }

  manifest.lastRun = {
    at: new Date().toISOString(),
    generated,
    deferred,
    remainingCredits: sub.remaining,
    resetAt: sub.resetAtMs ? new Date(sub.resetAtMs).toISOString() : null,
  };
  await writeManifest(manifest);

  console.log("\n[listen-audio] Summary");
  if (generated.length) console.log(`  Generated: ${generated.join(", ")}`);
  if (deferred.length) {
    console.log(`  Deferred:  ${deferred.join(", ")}`);
    console.log(
      "  Tip: npm run generate:listen-audio:wait  — auto-resume after monthly credits reset."
    );
  }
  if (!generated.length && !deferred.length) {
    console.log("  Nothing changed.");
  }
}

main().catch((err) => {
  console.error("[listen-audio]", err.message);
  process.exit(1);
});
