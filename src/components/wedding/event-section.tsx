"use client";

import Image from "next/image";

/**
 * Section 4 — Jadwal Acara (Akad & Resepsi).
 *
 * Latar: sama dengan section 2 (wallpaper foto mempelai full-bleed +
 * overlay tipis). Semua teks pembuka section 2 dihilangkan.
 *
 * Konten:
 *  - Cover card putih opacity 20% (samar) memenuhi hampir seluruh halaman.
 *  - Di atasnya, cover card putih solid berbentuk CAPSULE (pill) dengan
 *    garis tengah sebagai pembatas:
 *      • Bagian atas → Akad (15 Maret 2026 · 08.00 - selesai)
 *      • Bagian bawah → Resepsi (16 Maret 2026 · 08.00 - 12.00)
 *  - Alamat acara sama untuk kedua acara (tanpa tombol lokasi).
 */

export function EventSection() {
  return (
    <section
      id="event"
      aria-label="Jadwal acara Akad dan Resepsi"
      className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-5 text-white sm:px-6"
    >
      {/* === Latar (sama dengan section 2: wallpaper mempelai) === */}
      <div aria-hidden className="absolute inset-0 z-0">
        <Image
          src="/images/wp_new.jpeg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-[center_38%]"
        />
      </div>
      {/* Overlay tipis agar teks kontras di atas foto */}
      <div aria-hidden className="absolute inset-0 z-10 bg-[#0A183F]/15" />
      {/* Gradien brush di batas atas — menyatu dengan dasar gelap section 3 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-[3] h-[40vh] bg-[linear-gradient(180deg,#0A183F_0%,rgba(10,24,63,0.9)_20%,rgba(10,24,63,0.55)_45%,rgba(10,24,63,0.2)_72%,rgba(10,24,63,0)_100%)]"
      />
      {/* Fade bawah */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-[20vh] bg-[linear-gradient(180deg,rgba(10,24,63,0)_0%,rgba(10,24,63,0.85)_100%)]"
      />

      {/* === Cover card putih opacity 20% (samar) — memenuhi full page, tanpa blur === */}
      <div
        aria-hidden
        className="absolute inset-0 z-[4] bg-white/20"
      />

      {/* === Konten === */}
      <div className="relative z-10 w-full max-w-md">
        {/* Cover card putih berbentuk capsule — lapisan depan, opacity 90% */}
        <div className="relative w-full max-w-[290px] mx-auto rounded-full bg-white/90 px-7 py-14 text-center shadow-[0_24px_60px_-15px_rgba(8,18,48,0.65)] sm:max-w-[300px] sm:py-16">
            {/* === Bagian atas: Akad === */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#3a4a78]">
                Acara
              </p>
              <h3 className="mt-1 font-script text-4xl leading-tight text-[#132B66] sm:text-[2.75rem]">
                Akad
              </h3>
              <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.18em] text-[#3a4a78]">
                15 Maret 2027
              </p>
              <p className="mt-1.5 text-sm font-semibold text-[#1c2a52]">
                08.00 &ndash; selesai
              </p>
              <p className="mt-2 text-[11px] font-medium leading-relaxed text-[#3a4a78]">
                Desa Sungai Toman RT 001 RW 003,
                <br />
                Kec. Salatiga, Dusun Taman Sari
              </p>
            </div>

            {/* === Garis tengah pembatas (dengan ornamen diamond) === */}
            <div
              aria-hidden
              className="relative my-8 flex items-center justify-center"
            >
              <div className="h-px w-3/4 bg-[linear-gradient(90deg,transparent,rgba(19,43,102,0.4),transparent)]" />
              <span className="absolute h-1.5 w-1.5 rotate-45 bg-[#132B66]/55" />
            </div>

            {/* === Bagian bawah: Resepsi === */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#3a4a78]">
                Acara
              </p>
              <h3 className="mt-1 font-script text-4xl leading-tight text-[#132B66] sm:text-[2.75rem]">
                Resepsi
              </h3>
              <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.18em] text-[#3a4a78]">
                16 Maret 2027
              </p>
              <p className="mt-1.5 text-sm font-semibold text-[#1c2a52]">
                08.00 &ndash; 12.00
              </p>
              <p className="mt-2 text-[11px] font-medium leading-relaxed text-[#3a4a78]">
                Desa Sungai Toman RT 001 RW 003,
                <br />
                Kec. Salatiga, Dusun Taman Sari
              </p>
            </div>
          </div>
    </div>
    </section>
  );
}
