/**
 * Self-healing migration helper — CREATE TABLE IF NOT EXISTS untuk Guest &
 * RSVP tiap kali dipanggil. Aman & idempotent.
 *
 * Kenapa file ini ada: API guests & rsvp pakai @libsql/client langsung
 * (BUKAN Prisma). Kalau database file baru / ke-reset / schema belum pernah
 * di-push, tabel Guest & RSVP belum ada → error "no such table".
 *
 * Helper ini dipanggil di awal tiap route handler biar tabel otomatis ke-create
 * kalau belum ada. Jadi user nggak perlu manual hit /api/setup dulu.
 */
import { createClient } from "@libsql/client";
import type { Client } from "@libsql/client";

/** Bikin @libsql/client dari env. */
export function getClient(): Client {
  const url = process.env.DATABASE_URL;
  // Support DATABASE_AUTH_TOKEN dan TURSO_AUTH_TOKEN (alias)
  const token =
    process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN;
  if (
    !url ||
    (!url.startsWith("libsql:") &&
      !url.startsWith("http:") &&
      !url.startsWith("https:") &&
      !url.startsWith("file:"))
  ) {
    throw new Error(
      `DATABASE_URL tidak valid: "${url}". Set DATABASE_URL=libsql://... atau file:...`
    );
  }
  return createClient({ url, authToken: token });
}

/** Cuid-like id generator. */
export function genId(): string {
  return (
    "c" +
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 10)
  );
}

/**
 * Pastikan tabel RSVP & Guest (plus index unique code) sudah ada.
 * Aman dipanggil berkali-kali (IF NOT EXISTS).
 */
export async function ensureTables(client: Client): Promise<void> {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS "RSVP" (
      "id"        TEXT NOT NULL PRIMARY KEY,
      "name"      TEXT NOT NULL,
      "attendance" TEXT NOT NULL,
      "guests"    INTEGER NOT NULL DEFAULT 1,
      "message"   TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await client.execute(`
    CREATE TABLE IF NOT EXISTS "Guest" (
      "id"        TEXT NOT NULL PRIMARY KEY,
      "code"      TEXT NOT NULL,
      "name"      TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  // Index unique code — pakai try/catch biar nggak crash kalau index udah ada.
  try {
    await client.execute(
      `CREATE UNIQUE INDEX IF NOT EXISTS "Guest_code_key" ON "Guest"("code")`
    );
  } catch {
    // ignore — index udah ada
  }
}
