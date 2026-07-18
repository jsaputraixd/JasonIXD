/** Public URL prefix for pre-generated ElevenLabs clips. */
export const LISTEN_AUDIO_DIR = "/audio/listen";

export function listenAudioSrc(id) {
  return `${LISTEN_AUDIO_DIR}/${id}.mp3`;
}
