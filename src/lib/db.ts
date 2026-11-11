import { PrismaClient } from "@prisma/client";
import { createClient as createLibsqlClient } from "@libsql/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

/**
 * Database client — otomatis mendeteksi mode koneksi:
 *
 * - **Lokal** (dev): DATABASE_URL diawali "file:" → PrismaClient SQLite
 *   standar dengan file lokal.
 *
 * - **Produksi** (Vercel + Turso): DATABASE_URL diawali "libsql:" →
 *   gunakan adapter libSQL untuk konek ke Turso. Butuh env var:
 *     DATABASE_URL     = libsql://xxx.turso.io
 *     TURSO_AUTH_TOKEN = eyJxxx
 *
 * Debug: buka /api/debug-db untuk cek apakah env vars terbaca.
 * Setup: buka /api/setup-db untuk bikin tabel otomatis.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const dbUrl = process.env.DATABASE_URL || "";
  const authToken = process.env.TURSO_AUTH_TOKEN;

  // Produksi: Turso (libsql:// atau http://)
  // PENTING: saat pakai Driver Adapter, JANGAN kasih `datasources` —
  // adapter sudah handle koneksi, dan kombinasi keduanya bikin error
  // "Custom datasource configuration is not compatible with Driver Adapters".
  if (
    dbUrl.startsWith("libsql:") ||
    dbUrl.startsWith("http:") ||
    dbUrl.startsWith("https:")
  ) {
    const libsql = createLibsqlClient({
      url: dbUrl,
      authToken: authToken || undefined,
    });
    const adapter = new PrismaLibSql(libsql);
    return new PrismaClient({ adapter });
  }

  // Lokal: SQLite file
  if (dbUrl.startsWith("file:")) {
    return new PrismaClient({
      log: ["query"],
      datasources: { db: { url: dbUrl } },
    });
  }

  // DATABASE_URL tidak di-set — fallback dev ke SQLite lokal.
  // Di produksi tanpa env var, query akan gagal dengan error jelas
  // (lihat /api/debug-db untuk diagnose).
  const fallbackUrl = "file:./db/custom.db";
  console.warn(
    "[DB] DATABASE_URL tidak terdeteksi sebagai Turso/file. " +
      "Buka /api/debug-db untuk panduan setup."
  );
  return new PrismaClient({
    log: ["query"],
    datasources: { db: { url: fallbackUrl } },
  });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
