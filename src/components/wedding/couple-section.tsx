"use client";

import Image from "next/image";

/**
 * Section 3 — Profil Mempelai.
 *
 * Susunan (atas → bawah):
 *  1. Gambar Bismillah
 *  2. Kalimat "Maha Suci Allah ..."
 *  3. Kartu mempelai pria (putih 85%) → foto capsule → nama (font latin)
 *     → "Putra dari ..."
 *  4. Simbol "&" (warna putih)
 *  5. Kartu mempelai wanita → foto capsule → nama → "Putri dari ..."
 *
 * Latar: gradasi biru tua polos (tanpa foto dekoratif). Outline/ring
 * capsule foto mempelai memakai warna biru tua (bukan emas). Nama
 * mempelai pria dibuat satu baris di phone view. Di batas atas section
 * ada gradien brush dari navy gelap (#0A183F, sama dengan dasar bawah
 * section 2) menuju transparan supaya menyatu mulus.
 */

type PersonCardProps = {
  photo: string;
  photoAlt: string;
  name: string;
  /** Label gender: "Putra dari" / "Putri dari" */
  childLabel: string;
  parentsLine: string;
};

/** Kartu satu mempelai: foto dalam bingkai capsule + nama + garis orang tua */
function PersonCard({
  photo,
  photoAlt,
  name,
  childLabel,
  parentsLine,
}: PersonCardProps) {
  return (
    <article className="relative mx-auto w-full max-w-sm rounded-[1.75rem] border border-white/60 bg-white/85 px-5 py-7 text-center shadow-[0_18px_50px_-12px_rgba(8,18,48,0.55)] backdrop-blur-md sm:px-8 sm:py-9">
      {/* Bingkai capsule foto */}
      <div className="relative mx-auto h-72 w-44 sm:h-80 sm:w-48">
        {/* cincin dekoratif di luar capsule — warna biru tua */}
        <div
          aria-hidden
          className="absolute -inset-[6px] rounded-full bg-[linear-gradient(160deg,rgba(19,43,102,0.9)_0%,rgba(30,59,140,0.45)_45%,rgba(19,43,102,0.85)_100%)]"
        />
        {/* capsule foto */}
        <div className="relative h-full w-full overflow-hidden rounded-full ring-1 ring-white/70 shadow-[inset_0_0_18px_rgba(8,18,48,0.25)]">
          <Image
            src={photo}
            alt={photoAlt}
            fill
            sizes="192px"
            className="object-cover object-[center_22%]"
          />
        </div>
      </div>

      {/* Nama mempelai — font latin (script), satu baris di phone view */}
      <h3 className="mt-6 font-script text-[1.6rem] leading-tight whitespace-nowrap text-[#132B66] sm:text-4xl">
        {name}
      </h3>

      {/* Garis pemisah kecil — warna biru tua */}
      <span
        aria-hidden
        className="mx-auto mt-3 block h-px w-16 bg-[linear-gradient(90deg,transparent,rgba(19,43,102,0.85),transparent)]"
      />

      {/* Keterangan orang tua */}
      <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.22em] text-[#3a4a78] sm:text-xs">
        {childLabel}
      </p>
      {/* Garis orang tua — satu baris di phone view (whitespace-nowrap) */}
      <p className="mt-1.5 text-[11px] font-medium leading-relaxed whitespace-nowrap text-[#1c2a52] sm:text-[15px]">
        {parentsLine}
      </p>
    </article>
  );
}

export function CoupleSection() {
  return (
    <section
      id="couple"
      aria-label="Profil mempelai Abdul Muis dan Rosanti"
      className="relative flex min-h-dvh flex-col items-center overflow-hidden px-5 py-16 text-white sm:px-6 sm:py-20"
    >
      {/* === Latar (gradasi biru tua polos, tanpa foto dekoratif) === */}
      {/* Gradasi biru dasar */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,#2B51B0_0%,#1E3B8C_36%,#132B66_68%,#0A183F_100%)]"
      />

      {/* Cahaya lembut di tengah */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-[44%] left-1/2 z-[2] h-[52vh] w-[88vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(78,124,236,0.28),rgba(78,124,236,0)_75%)]"
      />

      {/* Gradien brush di batas atas — menyatu dengan dasar gelap section 2.
          Diperpanjang & lebih halus agar perpindahan navy→biru terlihat menyatu. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-[3] h-[42vh] bg-[linear-gradient(180deg,#0A183F_0%,rgba(10,24,63,0.94)_18%,rgba(10,24,63,0.7)_38%,rgba(10,24,63,0.35)_62%,rgba(10,24,63,0.1)_82%,rgba(10,24,63,0)_100%)]"
      />

      {/* Fade bawah agar menyatu dengan section berikutnya */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-[22vh] bg-[linear-gradient(180deg,rgba(10,24,63,0)_0%,rgba(10,24,63,0.85)_100%)]"
      />

      {/* === Konten === */}
      <div className="relative z-10 mx-auto flex w-full max-w-md flex-col items-center">
        {/* 1. Gambar Bismillah */}
        <Image
          src="/images/bismillah-new.png"
          alt="Bismillahirrahmanirrahim"
          width={869}
          height={287}
          className="anim-fade-in h-auto w-[78%] max-w-[300px] object-contain [filter:drop-shadow(0_4px_14px_rgba(0,0,0,0.35))]"
        />

        {/* 2. Kalimat pujian */}
        <p className="anim-fade-up mt-5 max-w-sm text-center text-[12.5px] font-light leading-[1.85] text-white/90 [animation-delay:150ms] sm:text-sm sm:leading-relaxed">
          Maha Suci Allah yang telah menciptakan makhluk-nya
          berpasang-pasangan. Ya Allah semoga ridho-Mu tercurah mengiringi
          pernikahan kami.
        </p>

        {/* 3. Kartu mempelai pria */}
        <div className="anim-fade-up mt-9 w-full [animation-delay:300ms]">
          <PersonCard
            photo="/images/muis-foto.jpg"
            photoAlt="Foto mempelai pria, Abdul Muis"
            name="Abdul Muis"
            childLabel="Putra dari"
            parentsLine="Bambang dan Rairah"
          />
        </div>

        {/* 4. Simbol & — warna putih */}
        <div className="anim-fade-in my-6 flex items-center justify-center [animation-delay:400ms]">
          <span className="font-script text-5xl text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)] sm:text-6xl">
            &amp;
          </span>
        </div>

        {/* 5. Kartu mempelai wanita */}
        <div className="anim-fade-up w-full [animation-delay:500ms]">
          <PersonCard
            photo="/images/rosanti-foto.jpg"
            photoAlt="Foto mempelai wanita, Rosanti"
            name="Rosanti"
            childLabel="Putri dari"
            parentsLine="Mulyadi dan Rayani"
          />
        </div>
      </div>
    </section>
  );
}
