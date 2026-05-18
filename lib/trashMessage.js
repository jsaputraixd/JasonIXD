import { trashMessages } from "@/data/trashMessages";

/** Random trash easter-egg line (not day-seeded). */
export function pickTrashMessage() {
  return trashMessages[Math.floor(Math.random() * trashMessages.length)];
}
