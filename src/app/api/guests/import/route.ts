import { NextResponse } from "next/server";

/**
 * POST /api/guests/import — parse file CSV/VCF/TXT, return daftar nama.
 * Server-side parsing (ringan, tanpa library berat).
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { ok: false, error: "File tidak ditemukan." },
        { status: 400 }
      );
    }

    const name = file.name.toLowerCase();
    const names: string[] = [];

    if (name.endsWith(".vcf")) {
      // Parse vCard — ambil field FN
      const text = await file.text();
      const matches = text.matchAll(/^FN:(.+)$/gim);
      for (const m of matches) {
        if (m[1].trim()) names.push(m[1].trim());
      }
    } else {
      // CSV / TXT — ambil baris (atau kolom pertama)
      const text = await file.text();
      const lines = text.split(/\r?\n/);
      for (const line of lines) {
        const val = line.split(",")[0].split(";")[0].split("\t")[0].trim();
        if (val && !val.toLowerCase().match(/^(nama|name|no|email)$/)) {
          names.push(val);
        }
      }
    }

    if (names.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Tidak ada nama ditemukan dalam file." },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, names });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
