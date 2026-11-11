"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type CoverProps = {
  /** "cover" = sampul dengan undangan tamu, "opening" = isi setelah buka undangan */
  mode?: "cover" | "opening";
  /** Dipanggil saat tombol "Buka Undangan" ditekan (hanya mode cover) */
  onOpen?: () => void;
};

/**
 * Sampul undangan: judul di tengah atas, foto mempelai setengah keluar
 * frame di kiri & kanan, lalu gradasi biru di bawah.
 *
 * Mode "cover" menampilkan teks undangan tamu + tombol "Buka Undangan",
 * sedangkan mode "opening" menampilkan ayat QS. Ar-Rum: 21 sebagai
 * pembuka isi undangan (muncul setelah tombol ditekan).
 *
 * Nama tamu diambil otomatis dari query param `?to=CODE` (code tamu
 * dari halaman /manage). Jika code cocok, nama tamu ditampilkan.
 * Jika tidak ada/tdk cocok, fallback "Tamu Undangan".
 */
export function Cover({ mode = "cover", onOpen }: CoverProps) {
  const isOpening = mode === "opening";
  const [guestName, setGuestName] = useState<string | null>(null);

  useEffect(() => {
    if (isOpening) return;
    // Baca query param ?to=CODE dari URL
    const params = new URLSearchParams(window.location.search);
    const code = params.get("to");
    if (!code) return;

    // Cari nama tamu berdasarkan code
    fetch("/api/guests", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && Array.isArray(data.data)) {
          const guest = data.data.find(
            (g: { code: string; name: string }) =>
              g.code.toUpperCase() === code.toUpperCase()
          );
          if (guest) setGuestName(guest.name);
        }
      })
      .catch(() => {});
  }, [isOpening]);

  return (
    <section
      id={isOpening ? "opening" : "cover"}
      aria-label={
        isOpening
          ? "Pembuka undangan pernikahan Muis dan Ocha"
          : "Sampul undangan pernikahan Muis dan Ocha"
      }
      className="relative flex min-h-dvh flex-col overflow-hidden text-white"
    >
      {/* Wallpaper mempelai (section 1 & section 2 memakai wallpaper yang sama) */}
      <div
        aria-hidden
        className="anim-fade-in absolute inset-0 z-0 [animation-delay:150ms]"
      >
        <Image
          src="/images/wallpaper-section1.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_38%]"
        />
      </div>

      {/* Overlay tipis agar teks kontras di atas foto */}
      <div
        aria-hidden
        className="absolute inset-0 z-10 bg-[#0A183F]/15"
      />

      {/* Gradasi gelap di bagian atas untuk judul */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[30vh] bg-[linear-gradient(180deg,rgba(10,24,63,0.62)_0%,rgba(10,24,63,0.3)_55%,rgba(10,24,63,0)_100%)]"
      />

      {/* Gradasi biru di bawah foto, menyatu dengan bagian bawah */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[46vh] bg-[linear-gradient(180deg,rgba(10,24,63,0)_0%,rgba(13,30,80,0.5)_40%,rgba(10,24,63,0.94)_75%,#0A183F_100%)]"
      />

      {/* Judul — hanya di sampul (mode cover), section pembuka polos */}
      {!isOpening ? (
        <header className="relative z-30 px-6 pt-12 text-center sm:pt-14">
          <p className="anim-fade-down text-[11px] font-medium tracking-[0.42em] uppercase text-white/90 sm:text-sm [animation-delay:100ms]">
            The Wedding Of
          </p>
          <h1 className="anim-fade-down mt-4 font-script text-5xl leading-[1.15] text-white sm:text-6xl md:text-7xl [animation-delay:250ms]">
            Muis &amp; Ocha
          </h1>
          <p className="anim-fade-down mt-4 text-[11px] font-light tracking-[0.32em] uppercase text-white/85 sm:text-sm [animation-delay:400ms]">
            Selasa, 16 Maret 2026
          </p>
        </header>
      ) : null}

      {isOpening ? (
        /* Ayat pembuka (QS. Ar-Rum: 21) */
        <div className="anim-fade-up relative z-30 mt-auto px-5 pb-[max(2.5rem,env(safe-area-inset-bottom))] text-center [animation-delay:850ms] sm:px-6">
          <p
            dir="rtl"
            lang="ar"
            className="font-arabic text-xs leading-[2.1] text-white sm:text-2xl sm:leading-[1.95]"
          >
            وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً ۚ إِنَّ فِي ذَٰلِكَ لَآيَاتٍ لِّقَوْمٍ يَتَفَكَّرُونَ
          </p>
          <p className="mx-auto mt-4 max-w-xl text-[11px] font-light leading-relaxed text-white/85 sm:text-sm">
            &ldquo;Di antara tanda-tanda (kebesaran)-Nya ialah bahwa Dia
            menciptakan pasangan-pasangan untukmu dari jenismu sendiri agar
            kamu merasa tenteram kepadanya. Dia menjadikan di antaramu rasa
            cinta dan kasih sayang. Sesungguhnya pada yang demikian itu
            benar-benar terdapat tanda-tanda bagi kaum yang berpikir.&rdquo;
          </p>
          <p className="anim-fade-up mt-4 text-[11px] font-medium tracking-[0.3em] uppercase text-white/90 [animation-delay:1100ms] sm:text-xs">
            (QS. Ar-Rum: 21)
          </p>
        </div>
      ) : (
        /* Undangan tamu + tombol */
        <div className="anim-fade-up relative z-30 mt-auto px-6 text-center [animation-delay:850ms]">
          <p className="text-sm font-light text-white/85">Kepada Yth;</p>
          <p className="mt-0.5 text-sm font-light text-white/85">
            Bapak/Ibu/Saudara/i
          </p>
          <p className="mt-1.5 text-lg font-semibold md:text-xl">
            {guestName || "Tamu Undangan"}
          </p>
          <p className="mt-0.5 text-sm font-light text-white/85">Di Tempat</p>
          <button
            type="button"
            onClick={onOpen}
            aria-label="Buka undangan pernikahan Muis dan Ocha"
            className="mt-7 mb-[max(3rem,env(safe-area-inset-bottom))] inline-block cursor-pointer rounded-full border border-white/40 bg-white/10 px-10 py-3.5 text-xs font-medium tracking-[0.3em] uppercase backdrop-blur-sm transition-all duration-300 hover:border-white/70 hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-4 focus-visible:outline-white/70"
          >
            Buka Undangan
          </button>
        </div>
      )}
    </section>
  );
}
