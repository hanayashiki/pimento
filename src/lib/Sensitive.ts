import { z } from "zod";

export const Sensitive = z.string().brand("Sensitive");

export type Sensitive = z.infer<typeof Sensitive>;

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return globalThis.btoa(binary);
}

export function base64ToArrayBuffer(base64: string) {
  var binaryString = atob(base64);
  var bytes = new Uint8Array(binaryString.length);
  for (var i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export const getKey = async (hashedPassword: string, nonce: string) => {
  const keyData = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(hashedPassword + nonce),
  );

  const key = await crypto.subtle.importKey("raw", keyData, "AES-CBC", true, [
    "encrypt",
    "decrypt",
  ]);

  return key;
};

export const toSensitive = async (
  hashedPassword: string,
  nonce: string,
  text: string,
): Promise<Sensitive> => {
  const iv = crypto.getRandomValues(new Uint8Array(16));
  const data = new TextEncoder().encode(text);

  const key = await getKey(hashedPassword, nonce);

  const encrypted = await crypto.subtle.encrypt(
    {
      name: "AES-CBC",
      iv,
      length: 256,
    },
    key,
    data,
  );

  return `${arrayBufferToBase64(iv)}:${arrayBufferToBase64(
    encrypted,
  )}` as Sensitive;
};

export const fromSensitive = async (
  hashedPassword: string,
  nonce: string,
  sensitive: Sensitive,
): Promise<string> => {
  const [ivText, dataText] = sensitive.split(":");

  const iv = base64ToArrayBuffer(ivText);

  const key = await getKey(hashedPassword, nonce);

  const data = base64ToArrayBuffer(dataText);

  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-CBC",
      iv,
      length: 256,
    },
    key,
    data,
  );

  return new TextDecoder().decode(decrypted);
};

export const hashPassword = async (clearPassword: string, nonce: string) => {
  const keyData = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(clearPassword + nonce),
  );

  return arrayBufferToBase64(keyData);
};

export const setPersistHashedPassword = (v: string) => {
  localStorage.setItem("HASHED_PASSWORD", v);
};

export const getPersistHashedPassword = () =>
  localStorage.getItem("HASHED_PASSWORD");
