import { trashMessages, trashSneakHints } from "@/data/trashMessages";

/** Random trash easter-egg line (not day-seeded). */
export function pickTrashMessage() {
  return trashMessages[Math.floor(Math.random() * trashMessages.length)];
}

/** @param {number} clickCount */
export function pickTrashMessageForClick(clickCount) {
  return trashSneakHints[clickCount] ?? pickTrashMessage();
}
