import { requireEnvironmentVariable } from "./environment.server.ts";
import crypto from "node:crypto";

const ALGORITHM = "aes-256-ctr";
const IV_LENGTH = 16;
const SALT = crypto.randomUUID();

export function encrypt(text: string) {
  const iv = crypto.randomBytes(IV_LENGTH);

  const ENCRYPTION_KEY = crypto.scryptSync(
    requireEnvironmentVariable("ENCRYPTION_SECRET"),
    SALT,
    32
  );

  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decrypt(text: string) {
  const [ivPart, encryptedPart] = text.split(":");
  if (!ivPart || !encryptedPart) {
    throw new Error("Invalid text.");
  }

  const iv = Buffer.from(ivPart, "hex");
  const encryptedText = Buffer.from(encryptedPart, "hex");

  const ENCRYPTION_KEY = crypto.scryptSync(
    requireEnvironmentVariable("ENCRYPTION_SECRET"),
    SALT,
    32
  );

  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  const decrypted = Buffer.concat([
    decipher.update(encryptedText),
    decipher.final(),
  ]);
  return decrypted.toString();
}
