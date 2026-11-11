import { NextResponse } from "next/server";

/**
 * GET /api/debug-db — diagnostic endpoint buat lihat apa yang kebaca di runtime.
 * TIDAK import db.ts. Jalan mandiri.
 */
export async function GET() {
  const rawUrl = process.env.DATABASE_URL;
  const tokenAuth = process.env.DATABASE_AUTH_TOKEN;
  const tokenTurso = process.env.TURSO_AUTH_TOKEN;
  const token = tokenAuth || tokenTurso;

  return NextResponse.json({
    // Environment vars
    env: {
      DATABASE_URL_raw: rawUrl === undefined ? "<undefined>" : `"${rawUrl}"`,
      DATABASE_URL_type: typeof rawUrl,
      DATABASE_URL_length: rawUrl ? rawUrl.length : 0,
      DATABASE_URL_starts_with: rawUrl ? rawUrl.slice(0, 15) : "",
      DATABASE_AUTH_TOKEN_set: tokenAuth ? "yes" : "no",
      TURSO_AUTH_TOKEN_set: tokenTurso ? "yes" : "no",
      token_being_used: token ? "yes (len=" + token.length + ")" : "NO",
      NODE_ENV: process.env.NODE_ENV,
    },
    // Diagnosis
    diagnosis: (() => {
      if (!rawUrl)
        return {
          status: "❌ GAGAL",
          problem: "DATABASE_URL kosong/belum di-set.",
          fix: [
            "1. Vercel Dashboard → Settings → Environment Variables",
            "2. Set: DATABASE_URL = libsql://nama-db-anda.turso.io",
            "3. Set: DATABASE_AUTH_TOKEN = eyJxxxx...  (atau TURSO_AUTH_TOKEN)",
            "4. Environment: Production",
            "5. Redeploy (uncheck 'Use Build Cache')",
          ],
        };
      if (rawUrl === "undefined" || rawUrl === "null")
        return {
          status: "❌ GAGAL",
          problem: `DATABASE_URL = literal string "${rawUrl}". Env var belum di-set dengan benar.`,
          fix: "Pastikan value benar di Vercel Environment Variables, lalu Redeploy.",
        };
      if (
        rawUrl.startsWith("libsql:") ||
        rawUrl.startsWith("http:") ||
        rawUrl.startsWith("https:")
      ) {
        if (!token)
          return {
            status: "❌ GAGAL",
            problem: "DATABASE_URL valid (Turso), tapi AUTH TOKEN belum di-set.",
            fix: "Set DATABASE_AUTH_TOKEN atau TURSO_AUTH_TOKEN di Vercel.",
          };
        return {
          status: "✅ BISA",
          problem: "DATABASE_URL valid (Turso) + token ada. Database siap konek.",
          fix: "Buka /api/setup-db untuk bikin tabel, lalu test /manage.",
        };
      }
      if (rawUrl.startsWith("file:"))
        return {
          status: "⚠️ MODE LOKAL",
          problem: "DATABASE_URL = file (local SQLite). Hanya untuk dev.",
          fix: "Set DATABASE_URL = libsql://... di Vercel buat Turso.",
        };
      return {
        status: "❌ GAGAL",
        problem: `DATABASE_URL format nggak dikenal: "${rawUrl.slice(0, 30)}..."`,
        fix: "Harus diawali libsql:// atau http(s)://",
      };
    })(),
  });
}
