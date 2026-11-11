import { NextResponse } from "next/server";
import { getClient, ensureTables } from "@/lib/migrate";

/** DELETE /api/rsvp/[id] — hapus satu RSVP. */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { ok: false, error: "ID tidak valid." },
        { status: 400 }
      );
    }
    const client = getClient();
    await ensureTables(client);
    await client.execute({ sql: "DELETE FROM RSVP WHERE id = ?", args: [id] });
    await client.close();
    return NextResponse.json({ ok: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

/** PUT /api/rsvp/[id] — perbarui satu RSVP. */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { ok: false, error: "ID tidak valid." },
        { status: 400 }
      );
    }
    const body = await request.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const attendance =
      typeof body?.attendance === "string" &&
      ["hadir", "tidak", "ragu"].includes(body.attendance)
        ? body.attendance
        : null;
    const guests =
      typeof body?.guests === "number" && body.guests >= 1
        ? Math.min(10, body.guests)
        : null;
    const message =
      typeof body?.message === "string"
        ? body.message.trim().slice(0, 1000) || null
        : null;

    const client = getClient();
    await ensureTables(client);

    if (name) {
      await client.execute({
        sql: "UPDATE RSVP SET name = ? WHERE id = ?",
        args: [name, id],
      });
    }
    if (attendance) {
      await client.execute({
        sql: "UPDATE RSVP SET attendance = ? WHERE id = ?",
        args: [attendance, id],
      });
    }
    if (guests !== null) {
      await client.execute({
        sql: "UPDATE RSVP SET guests = ? WHERE id = ?",
        args: [guests, id],
      });
    }
    if (message !== undefined) {
      await client.execute({
        sql: "UPDATE RSVP SET message = ? WHERE id = ?",
        args: [message, id],
      });
    }
    await client.close();
    return NextResponse.json({ ok: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
