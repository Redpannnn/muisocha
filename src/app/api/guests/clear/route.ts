import { NextResponse } from "next/server";
import { getClient, ensureTables } from "@/lib/migrate";

/** DELETE /api/guests/clear — hapus semua tamu. */
export async function DELETE() {
  try {
    const client = getClient();
    await ensureTables(client);
    await client.execute("DELETE FROM Guest");
    await client.close();
    return NextResponse.json({ ok: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
