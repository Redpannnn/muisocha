"use client";

import Image from "next/image";

/**
 * Section 7 — Penutup (Closing).
 *
 * Latar: SAMA PERSIS dengan section 2/4 (wallpaper foto mempelai
 * full-bleed + overlay). Ukuran page juga sama: min-h-dvh, flex center,
 * tanpa py-16 vertikal.
 *
 * Isi: ucapan terima kasih + "Kami yang berbahagia". Di bawah sendiri:
 * "Celebrate with MemoraA" + 3 ikon sosial media (WhatsApp, Instagram,
 * TikTok) ukuran sama berjajar.
 */

const WA_NUMBER = "085183256967";
const IG_URL = "https://www.instagram.com/memoraainvitation/";
const TIKTOK_URL = "https://www.tiktok.com/@memoraainvtitation._.";

/** Link WhatsApp langsung ke nomor (format internasional tanpa +). */
const WA_LINK = `https://wa.me/62${WA_NUMBER.replace(/^0/, "")}`;

type SocialLink = {
  href: string;
  icon: string;
  alt: string;
  label: string;
  /** ukuran tampilan ikon (h & w dalam px) */
  size: number;
};

const SOCIALS: SocialLink[] = [
  { href: WA_LINK, icon: "/images/socmed-wa.png", alt: "WhatsApp MemoraA", label: "WhatsApp", size: 52 },
  { href: IG_URL, icon: "/images/socmed-ig.png", alt: "Instagram MemoraA", label: "Instagram", size: 40 },
  { href: TIKTOK_URL, icon: "/images/socmed-tiktok.png", alt: "TikTok MemoraA", label: "TikTok", size: 34 },
];

export function ClosingSection() {
  return (
    <section
      id="closing"
      aria-label="Penutup undangan pernikahan"
      className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-5 text-white sm:px-6"
    >
      {/* === Latar (SAMA dengan section 2: wallpaper mempelai) === */}
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
      {/* Cahaya lembut di tengah */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-[44%] left-1/2 z-[2] h-[52vh] w-[88vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(78,124,236,0.28),rgba(78,124,236,0)_75%)]"
      />
      {/* Gradien brush di batas atas — menyatu dengan section 7 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-[3] h-[40vh] bg-[linear-gradient(180deg,#0A183F_0%,rgba(10,24,63,0.9)_20%,rgba(10,24,63,0.55)_45%,rgba(10,24,63,0.2)_72%,rgba(10,24,63,0)_100%)]"
      />
      {/* Fade bawah */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-[20vh] bg-[linear-gradient(180deg,rgba(10,24,63,0)_0%,rgba(10,24,63,0.85)_100%)]"
      />
      {/* === Cover card putih opacity 65% — memenuhi full page, tanpa blur === */}
      <div aria-hidden className="absolute inset-0 z-[4] bg-white/65" />

      {/* === Konten === */}
      <div className="relative z-10 flex w-full max-w-md flex-col items-center px-4 pb-28 text-center">
        {/* Ucapan terima kasih — warna hitam */}
        <p className="anim-fade-up mt-2 max-w-xs text-[12.5px] font-normal leading-[1.85] text-black [animation-delay:100ms]">
          Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila
          Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu kepada
          kedua mempelai.
        </p>
        <p className="anim-fade-up mt-4 max-w-xs text-[12.5px] font-normal leading-[1.85] text-black [animation-delay:200ms]">
          Atas kehadiran dan doa restu yang diberikan, kami mengucapkan
          terima kasih.
        </p>

        {/* Tanda tangan — warna hitam */}
        <p className="anim-fade-up mt-6 text-[11px] font-semibold uppercase tracking-[0.32em] text-black [animation-delay:300ms]">
          Kami yang berbahagia
        </p>

        {/* Muis & Ocha — font latin (script), warna biru tua */}
        <p className="anim-fade-up mt-3 font-script text-5xl leading-[1.1] text-[#132B66] [animation-delay:400ms] sm:text-6xl">
          Muis &amp; Ocha
        </p>
      </div>

      {/* Celebrate with MemoraA + sosmed — ditempel ke batas bawah page */}
      <div className="anim-fade-up absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] [animation-delay:600ms]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-black">
          Celebrate with MemoraA
        </p>
        <div className="flex items-center justify-center gap-5">
          {SOCIALS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${s.label} MemoraA`}
              className="flex items-center justify-center transition-transform duration-300 hover:scale-110"
            >
              <Image
                src={s.icon}
                alt={s.alt}
                width={s.size}
                height={s.size}
                style={{ width: s.size, height: s.size }}
                className="object-contain"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
