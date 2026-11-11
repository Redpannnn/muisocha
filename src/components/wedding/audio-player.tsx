"use client";

import { useEffect, useRef, useState } from "react";
import { Music, Music2 } from "lucide-react";

/**
 * AudioPlayer — pemutar musik latar undangan.
 *
 * Musik mulai diputar otomatis saat komponen ini di-mount (yang terjadi
 * ketika tombol "Buka Undangan" ditekan — interaksi pengguna, jadi
 * kebijakan autoplay browser terpenuhi). Tombol melayang di pojok kanan
 * bawah untuk toggle play/pause. Musik di-loop.
 */
export function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  // Coba mulai playback saat mount (ada interaksi klik tombol Buka Undangan).
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.55;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setPlaying(true))
        .catch(() => {
          // Autoplay diblokir browser — user bisa tekan tombol untuk mulai.
          setPlaying(false);
        });
    }
  }, []);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => {});
    }
  }

  return (
    <>
      <audio ref={audioRef} src="/music/a-thousand-years.mp4" loop preload="auto" />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Matikan musik" : "Putar musik"}
        className="fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-[#0A183F]/85 text-white shadow-[0_8px_24px_-6px_rgba(0,0,0,0.6)] backdrop-blur-md transition-all duration-300 hover:bg-[#132B66] hover:scale-105"
      >
        {playing ? (
          <Music className="h-5 w-5 animate-pulse" />
        ) : (
          <Music2 className="h-5 w-5" />
        )}
      </button>
    </>
  );
}
