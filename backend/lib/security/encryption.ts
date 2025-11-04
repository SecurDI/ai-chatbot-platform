/**
 * Encryption utilities for sensitive data
 * Uses crypto module for AES encryption
 */

import crypto from "crypto";
import { logger } from "@/lib/utils/logger";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

/**
 * Get encryption key from environment
 * This should be a secure random string stored in environment variables
 */
function getEncryptionKey(): string {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error("ENCRYPTION_KEY environment variable is not set");
  }
  if (key.length < 32) {
    throw new Error("ENCRYPTION_KEY must be at least 32 characters long");
  }
  return key;
}

/**
 * Derive a key from the encryption key using PBKDF2
 *
 * @param salt - Salt for key derivation
 * @returns Derived key buffer
 */
function deriveKey(salt: Buffer): Buffer {
  const key = getEncryptionKey();
  return crypto.pbkdf2Sync(key, salt, 100000, KEY_LENGTH, "sha512");
}

/**
 * Encrypt a string value
 * Uses AES-256-GCM for authenticated encryption
 *
 * @param plaintext - The text to encrypt
 * @returns Base64 encoded encrypted data with salt, IV, and auth tag
 */
export function encrypt(plaintext: string): string {
  try {
    // Generate random salt and IV
    const salt = crypto.randomBytes(SALT_LENGTH);
    const iv = crypto.randomBytes(IV_LENGTH);

    // Derive key from password and salt
    const key = deriveKey(salt);

    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    // Encrypt
    let encrypted = cipher.update(plaintext, "utf8", "base64");
    encrypted += cipher.final("base64");

    // Get auth tag
    const authTag = cipher.getAuthTag();

    // Combine salt + IV + authTag + encrypted data
    const result = Buffer.concat([
      salt,
      iv,
      authTag,
      Buffer.from(encrypted, "base64"),
    ]);

    return result.toString("base64");
  } catch (error) {
    logger.error("Encryption failed", { error });
    throw new Error("Failed to encrypt data");
  }
}

/**
 * Decrypt an encrypted string
 *
 * @param encryptedData - Base64 encoded encrypted data
 * @returns Decrypted plaintext string
 */
export function decrypt(encryptedData: string): string {
  try {
    // Decode from base64
    const buffer = Buffer.from(encryptedData, "base64");

    // Extract salt, IV, auth tag, and encrypted data
    const salt = buffer.subarray(0, SALT_LENGTH);
    const iv = buffer.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const authTag = buffer.subarray(
      SALT_LENGTH + IV_LENGTH,
      SALT_LENGTH + IV_LENGTH + TAG_LENGTH
    );
    const encrypted = buffer.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

    // Derive key
    const key = deriveKey(salt);

    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    // Decrypt
    let decrypted = decipher.update(encrypted.toString("base64"), "base64", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    logger.error("Decryption failed", { error });
    throw new Error("Failed to decrypt data");
  }
}

/**
 * Mask a sensitive value for display
 * Always returns "••••••••" regardless of input
 *
 * @param _value - The value to mask (unused, always returns masked string)
 * @returns Masked string
 */
export function maskSecret(_value?: string): string {
  return "••••••••";
}

/**
 * Generate a secure random secret
 * Useful for generating API keys, tokens, etc.
 *
 * @param length - Length of the secret in bytes (default 32)
 * @returns Hex-encoded random secret
 */
export function generateSecret(length: number = 32): string {
  return crypto.randomBytes(length).toString("hex");
}

/**
 * Hash a value using SHA-256
 * Useful for storing hashed values that don't need to be decrypted
 *
 * @param value - Value to hash
 * @returns Hex-encoded hash
 */
export function hash(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

/**
 * Compare a value with a hash
 *
 * @param value - Value to compare
 * @param hashedValue - Hash to compare against
 * @returns True if value matches hash
 */
export function compareHash(value: string, hashedValue: string): boolean {
  const valueHash = hash(value);
  return crypto.timingSafeEqual(
    Buffer.from(valueHash),
    Buffer.from(hashedValue)
  );
}
