import { NextResponse } from "next/server";
import { getClient, genId, ensureTables } from "@/lib/migrate";

/**
 * POST /api/guests — tambah satu atau banyak tamu sekaligus.
 * Body: { names: string }  (nama dipisah newline; baris "code|nama" untuk custom code)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const raw = typeof body?.names === "string" ? body.names : "";

    const lines = raw
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Tidak ada nama yang diisi." },
        { status: 400 }
      );
    }

    const client = getClient();
    await ensureTables(client);
    const takenCodes = new Set<string>();
    let added = 0;

    for (const line of lines) {
      let code: string;
      let name: string;

      if (line.includes("|")) {
        const [customCode, ...rest] = line.split("|");
        code = customCode.trim().toUpperCase();
        name = rest.join("|").trim();
      } else {
        name = line;
        // Auto-generate code dari nama
        const sanitized = name.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
        const num = Math.floor(1000 + Math.random() * 9000);
        code = `${num}-${sanitized}`;
      }

      // Cek tabrakan di batch & DB
      let finalCode = code;
      let attempt = 0;
      while (takenCodes.has(finalCode)) {
        attempt++;
        finalCode = `${code}${attempt}`;
      }
      const existing = await client.execute({
        sql: "SELECT 1 FROM Guest WHERE code = ?",
        args: [finalCode],
      });
      while (existing.rows.length > 0) {
        attempt++;
        finalCode = `${code}${attempt}`;
        const re = await client.execute({
          sql: "SELECT 1 FROM Guest WHERE code = ?",
          args: [finalCode],
        });
        if (re.rows.length === 0) break;
      }
      takenCodes.add(finalCode);

      const id = genId();
      await client.execute({
        sql: "INSERT INTO Guest (id, code, name, createdAt) VALUES (?, ?, ?, ?)",
        args: [id, finalCode, name, new Date().toISOString()],
      });
      added++;
    }

    await client.close();
    return NextResponse.json({ ok: true, count: added });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { ok: false, error: msg, hint: "Pastikan DATABASE_URL sudah benar." },
      { status: 500 }
    );
  }
}

/** GET /api/guests — daftar semua tamu (urutan tambah). */
export async function GET() {
  try {
    const client = getClient();
    await ensureTables(client);
    const result = await client.execute(
      "SELECT id, code, name, createdAt FROM Guest ORDER BY createdAt ASC"
    );
    await client.close();
    const rows = result.rows.map((r) => ({
      id: String(r.id),
      code: String(r.code),
      name: String(r.name),
      createdAt: String(r.createdAt),
    }));
    return NextResponse.json({ ok: true, data: rows });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { ok: false, error: msg, hint: "Pastikan DATABASE_URL sudah benar." },
      { status: 500 }
    );
  }
}
