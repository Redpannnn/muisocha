import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";

/**
 * GET /api/setup-db — auto-create tabel RSVP & Guest di Turso/SQLite.
 *
 * SELF-CONTAINED: bikin koneksi sendiri pakai @libsql/client (NGGAK pakai
 * Prisma). Jadi walau Prisma ada masalah, endpoint ini tetap jalan.
 *
 * Buat tabel + index pakai raw SQL. Aman dipanggil berkali-kali.
 */
export async function GET() {
  const results: string[] = [];
  const url = process.env.DATABASE_URL;
  // Support DATABASE_AUTH_TOKEN dan TURSO_AUTH_TOKEN (alias)
  const token =
    process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN;

  // Validate env
  if (!url || url === "undefined" || url === "null") {
    return NextResponse.json(
      {
        ok: false,
        error: `DATABASE_URL tidak valid: "${url}". Set DATABASE_URL=libsql://... di env var.`,
        details: results,
        hint: "Buka /api/debug-db untuk lihat status env vars.",
      },
      { status: 500 }
    );
  }
  if (
    !url.startsWith("libsql:") &&
    !url.startsWith("http:") &&
    !url.startsWith("https:") &&
    !url.startsWith("file:")
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: `DATABASE_URL format nggak didukung: "${url.slice(0, 30)}...". Harus libsql:// atau http(s)://`,
        details: results,
      },
      { status: 500 }
    );
  }

  let client;
  try {
    client = createClient({ url, authToken: token });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: `Gagal bikin libsql client: ${err instanceof Error ? err.message : String(err)}`,
        details: results,
      },
      { status: 500 }
    );
  }

  try {
    // Test connection
    await client.execute("SELECT 1");
    results.push("✓ Koneksi database berhasil");

    // Create RSVP table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS "RSVP" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "attendance" TEXT NOT NULL,
        "guests" INTEGER NOT NULL DEFAULT 1,
        "message" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    results.push("✓ Tabel RSVP siap");

    // Create Guest table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS "Guest" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "code" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    results.push("✓ Tabel Guest siap");

    // Create unique index on Guest.code
    try {
      await client.execute(
        `CREATE UNIQUE INDEX IF NOT EXISTS "Guest_code_key" ON "Guest"("code")`
      );
      results.push("✓ Index Guest.code siap");
    } catch {
      // index mungkin udah ada
    }

    return NextResponse.json({
      ok: true,
      message: "Setup selesai! Tabel RSVP & Guest siap dipakai.",
      dbUrl: url.replace(/:\/\/[^@]*/, "://***"),
      details: results,
      nextStep: "Sekarang test: buka /manage → tambah tamu, dan isi form RSVP di undangan.",
    });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        ok: false,
        error: errMsg,
        dbUrl: url.replace(/:\/\/[^@]*/, "://***"),
        details: results,
        hint: "Cek apakah Turso DB URL & token bener. Buka /api/debug-db buat lihat env vars.",
      },
      { status: 500 }
    );
  } finally {
    if (client) {
      try {
        await client.close();
      } catch {
        // ignore
      }
    }
  }
}
