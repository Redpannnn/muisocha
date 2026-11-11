import { NextResponse } from "next/server";
import { getClient, ensureTables } from "@/lib/migrate";

/** PUT /api/guests/[id] — edit nama tamu (code auto-regenerate dari nama baru). */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";

    if (!name) {
      return NextResponse.json(
        { ok: false, error: "Nama tidak boleh kosong." },
        { status: 400 }
      );
    }

    // Generate code baru dari nama
    const sanitized = name.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
    const num = Math.floor(1000 + Math.random() * 9000);
    let code = `${num}-${sanitized}`;

    const client = getClient();
    await ensureTables(client);

    // Pastikan code unik (kecuali untuk item ini sendiri)
    for (let i = 0; i < 10; i++) {
      const existing = await client.execute({
        sql: "SELECT 1 FROM Guest WHERE code = ? AND id != ?",
        args: [code, id],
      });
      if (existing.rows.length === 0) break;
      const n2 = Math.floor(1000 + Math.random() * 9000);
      code = `${n2}-${sanitized}`;
    }

    await client.execute({
      sql: "UPDATE Guest SET name = ?, code = ? WHERE id = ?",
      args: [name, code, id],
    });
    await client.close();
    return NextResponse.json({ ok: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

/** DELETE /api/guests/[id] — hapus satu tamu. */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = getClient();
    await ensureTables(client);
    await client.execute({ sql: "DELETE FROM Guest WHERE id = ?", args: [id] });
    await client.close();
    return NextResponse.json({ ok: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
