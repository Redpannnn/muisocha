import { NextResponse } from "next/server";
import { getClient, genId, ensureTables } from "@/lib/migrate";

/**
 * POST /api/rsvp — simpan konfirmasi kehadiran tamu.
 * Body: { name, attendance: "hadir"|"tidak"|"ragu", guests: number, message?: string }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const attendanceRaw =
      typeof body?.attendance === "string" ? body.attendance : "";
    const guests =
      typeof body?.guests === "number" && Number.isFinite(body.guests)
        ? Math.max(1, Math.min(10, Math.floor(body.guests)))
        : 1;
    const message =
      typeof body?.message === "string"
        ? body.message.trim().slice(0, 1000) || null
        : null;

    if (!name) {
      return NextResponse.json(
        { ok: false, error: "Nama harus diisi." },
        { status: 400 }
      );
    }
    const allowed = ["hadir", "tidak", "ragu"];
    const attendance = allowed.includes(attendanceRaw) ? attendanceRaw : "ragu";

    const client = getClient();
    await ensureTables(client);
    const id = genId();
    await client.execute({
      sql: "INSERT INTO RSVP (id, name, attendance, guests, message, createdAt) VALUES (?, ?, ?, ?, ?, ?)",
      args: [id, name, attendance, guests, message, new Date().toISOString()],
    });
    await client.close();
    return NextResponse.json({ ok: true, id });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { ok: false, error: msg, hint: "Pastikan DATABASE_URL sudah benar." },
      { status: 500 }
    );
  }
}

/** GET /api/rsvp — daftar konfirmasi kehadiran (terbaru di atas). */
export async function GET() {
  try {
    const client = getClient();
    await ensureTables(client);
    const result = await client.execute(
      "SELECT id, name, attendance, guests, message, createdAt FROM RSVP ORDER BY createdAt DESC LIMIT 100"
    );
    await client.close();
    const rows = result.rows.map((r) => ({
      id: String(r.id),
      name: String(r.name),
      attendance: String(r.attendance),
      guests: Number(r.guests),
      message: r.message === null ? null : String(r.message),
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
