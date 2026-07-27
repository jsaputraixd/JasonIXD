/** v2 — SF globe pin (invalidates earlier orbit-key collects). */
const STORAGE_KEY = "mobile-vault-key-v2";
export const VAULT_KEY_EVENT = "mobile-vault-key";

export function hasVaultKey() {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function collectVaultKey() {
  if (typeof window === "undefined") return false;
  if (hasVaultKey()) return false;
  try {
    window.localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    /* ignore quota */
  }
  window.dispatchEvent(
    new CustomEvent(VAULT_KEY_EVENT, { detail: { collected: true } })
  );
  return true;
}

export function subscribeVaultKey(listener) {
  if (typeof window === "undefined") return () => {};
  const onStorage = (e) => {
    if (e.key === STORAGE_KEY) listener(hasVaultKey());
  };
  const onCustom = () => listener(hasVaultKey());
  window.addEventListener("storage", onStorage);
  window.addEventListener(VAULT_KEY_EVENT, onCustom);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(VAULT_KEY_EVENT, onCustom);
  };
}
