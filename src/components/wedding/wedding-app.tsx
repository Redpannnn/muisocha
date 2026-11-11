"use client";

import { useCallback, useEffect, useState } from "react";
import { Cover } from "./cover";
import { CoupleSection } from "./couple-section";
import { EventSection } from "./event-section";
import { StorySection } from "./story-section";
import { RsvpSection } from "./rsvp-section";
import { ClosingSection } from "./closing-section";
import { AudioPlayer } from "./audio-player";

/**
 * Pengatur transisi antar section:
 * - Sebelum dibuka: tampilkan sampul (mode "cover") dengan tombol
 *   "Buka Undangan".
 * - Setelah tombol ditekan: rangkaian section isi yang cukup di-scroll
 *   ke bawah + musik latar mulai diputar (autoplay):
 *     section 2 → opening (QS. Ar-Rum: 21)
 *     section 3 → profil mempelai
 *     section 4 → jadwal acara (Akad & Resepsi)
 *     section 5 → kisah perjalanan kami (Our Story)
 *     section 6 → RSVP (konfirmasi kehadiran)
 *     section 7 → penutup (closing)
 */
export function WeddingApp() {
  const [opened, setOpened] = useState(false);

  // Pastikan section pembuka selalu dilihat dari atas saat pertama muncul.
  useEffect(() => {
    if (opened) {
      window.scrollTo(0, 0);
    }
  }, [opened]);

  const handleOpen = useCallback(() => setOpened(true), []);

  if (!opened) {
    return <Cover mode="cover" onOpen={handleOpen} />;
  }

  return (
    <>
      <Cover mode="opening" />
      <CoupleSection />
      <EventSection />
      <StorySection />
      <RsvpSection />
      <ClosingSection />
      <AudioPlayer />
    </>
  );
}
