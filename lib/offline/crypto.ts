/**
 * Local encryption for offline content (AES-GCM).
 *
 * Security model (honest):
 * - Protects IndexedDB payloads from casual inspection on a shared device.
 * - Does NOT provide DRM. A user who controls the browser can inspect
 *   content after decryption, and calculator JS can be reverse-engineered.
 * - Authorization is enforced server-side at download time.
 *
 * Key lifecycle:
 * - Per-user, per-device CryptoKey generated in Web Crypto (non-extractable).
 * - Stored in IndexedDB keystore. Never hard-coded, never from the server.
 * - Logout deletes the key and all encrypted stores for that user.
 * - Key loss (storage cleared / new device) requires re-download. There is
 *   no recovery secret.
 * - Re-download uses the same server entitlement checks.
 */

const AES_GCM_IV_BYTES = 12;

export type EncryptedBlob = {
  v: 1;
  alg: "AES-GCM";
  iv: string;
  ciphertext: string;
};

function bytesToB64(bytes: Uint8Array): string {
  let bin = "";
  bytes.forEach((b) => {
    bin += String.fromCharCode(b);
  });
  return btoa(bin);
}

function b64ToBytes(value: string): Uint8Array {
  const bin = atob(value);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) {
    out[i] = bin.charCodeAt(i);
  }
  return out;
}

export async function generateContentKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptJson(key: CryptoKey, value: unknown): Promise<EncryptedBlob> {
  const iv = crypto.getRandomValues(new Uint8Array(AES_GCM_IV_BYTES));
  const encoded = new TextEncoder().encode(JSON.stringify(value));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    encoded,
  );
  return {
    v: 1,
    alg: "AES-GCM",
    iv: bytesToB64(iv),
    ciphertext: bytesToB64(new Uint8Array(ciphertext)),
  };
}

export async function decryptJson<T>(key: CryptoKey, blob: EncryptedBlob): Promise<T> {
  if (!blob || blob.alg !== "AES-GCM" || blob.v !== 1 || !blob.iv || !blob.ciphertext) {
    throw new Error("integrity_failed");
  }
  const iv = b64ToBytes(blob.iv);
  const ciphertext = b64ToBytes(blob.ciphertext);
  try {
    const plain = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv as BufferSource },
      key,
      ciphertext as BufferSource,
    );
    return JSON.parse(new TextDecoder().decode(plain)) as T;
  } catch {
    throw new Error("integrity_failed");
  }
}

export function isEncryptedBlob(value: unknown): value is EncryptedBlob {
  if (!value || typeof value !== "object") return false;
  const blob = value as EncryptedBlob;
  return blob.v === 1 && blob.alg === "AES-GCM" && typeof blob.iv === "string";
}
