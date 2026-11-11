"use client";

import { useEffect, useState } from "react";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";

/**
 * Section 6 — RSVP (Konfirmasi Kehadiran).
 *
 * Latar: gradien campuran biru muda, biru tua, dan hitam.
 *
 * Form (dalam kartu putih) mengirim POST /api/rsvp dengan field:
 *  - name
 *  - attendance (hadir / tidak / ragu)
 *  - guests (1-5)
 *  - message (ucapan & doa)
 *
 * Setelah sukses, form disembunyikan dan digantikan kartu ucapan
 * terima kasih. Daftar ucapan dari tamu lain ditampilkan di bawahnya.
 */

type Attendance = "hadir" | "tidak" | "ragu";

type RsvpEntry = {
  id: string;
  name: string;
  attendance: Attendance;
  guests: number;
  message: string | null;
  createdAt: string;
};

const ATTENDANCE_LABEL: Record<Attendance, string> = {
  hadir: "Hadir",
  tidak: "Tidak bisa hadir",
  ragu: "Ragu-ragu",
};

const ATTENDANCE_BADGE: Record<Attendance, string> = {
  hadir: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  tidak: "bg-rose-500/15 text-rose-700 border-rose-500/30",
  ragu: "bg-amber-500/15 text-amber-700 border-amber-500/30",
};

const ATTENDANCE_OPTIONS: { value: Attendance; label: string }[] = [
  { value: "hadir", label: "Hadir" },
  { value: "tidak", label: "Tidak bisa hadir" },
  { value: "ragu", label: "Ragu-ragu" },
];

export function RsvpSection() {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const [name, setName] = useState("");
  const [attendance, setAttendance] = useState<Attendance | "">("");
  const [guests, setGuests] = useState(1);
  const [message, setMessage] = useState("");

  // Daftar ucapan dari tamu (di-fetch dari /api/rsvp)
  const [wishes, setWishes] = useState<RsvpEntry[]>([]);
  const [loadingWishes, setLoadingWishes] = useState(true);

  async function loadWishes() {
    try {
      const res = await fetch("/api/rsvp", { cache: "no-store" });
      const data = await res.json();
      if (res.ok && data.ok && Array.isArray(data.data)) {
        setWishes(data.data);
      }
    } catch {
      // abaikan error jaringan — daftar ucapan opsional
    } finally {
      setLoadingWishes(false);
    }
  }

  // Ambil daftar ucapan saat section pertama kali dimuat
  useEffect(() => {
    loadWishes();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: "Nama belum diisi",
        description: "Silakan tulis nama Anda terlebih dahulu.",
        variant: "destructive",
      });
      return;
    }
    if (!attendance) {
      toast({
        title: "Konfirmasi kehadiran belum dipilih",
        description: "Pilih Hadir / Tidak / Ragu-ragu.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          attendance,
          guests,
          message: message.trim() || undefined,
        }),
      });
      let data: { ok?: boolean; error?: string } = {};
      try {
        data = await res.json();
      } catch {
        // Respons bukan JSON (mis. server error 500)
        throw new Error("Server tidak merespons. Coba lagi nanti.");
      }
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Gagal mengirim. Coba lagi nanti.");
      }
      setDone(true);
      // Segarkan daftar ucapan supaya pesan baru langsung muncul
      loadWishes();
      toast({
        title: "Terima kasih!",
        description: "Konfirmasi kehadiran Anda telah kami terima.",
      });
    } catch (err) {
      toast({
        title: "Gagal mengirim",
        description:
          err instanceof Error ? err.message : "Silakan coba lagi nanti.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      id="rsvp"
      aria-label="Konfirmasi kehadiran RSVP"
      className="relative flex min-h-dvh flex-col items-center overflow-hidden px-5 py-20 text-white sm:px-6 sm:py-24"
    >
      {/* === Latar: gradien biru muda + biru tua + hitam === */}
      {/* Lapisan 1: gradasi vertikal hitam → biru tua → biru muda → biru tua → hitam */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,#000000_0%,#0A183F_22%,#132B66_46%,#1E3B8C_54%,#132B66_70%,#0A183F_82%,#000000_100%)]"
      />
      {/* Lapisan 2: cahaya biru muda di tengah (radial) */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-[46%] left-1/2 z-[2] h-[56vh] w-[92vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(78,124,236,0.32),rgba(78,124,236,0)_72%)]"
      />
      {/* Gradien brush di batas atas — menyatu dengan section 5 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-[3] h-[34vh] bg-[linear-gradient(180deg,#0A183F_0%,rgba(10,24,63,0.85)_22%,rgba(10,24,63,0.4)_50%,rgba(10,24,63,0)_100%)]"
      />
      {/* Fade bawah */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-[22vh] bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.9)_100%)]"
      />

      {/* === Konten === */}
      <div className="relative z-10 mx-auto flex w-full max-w-md flex-col items-center">
        {/* Header */}
        <p className="anim-fade-down text-[11px] font-medium tracking-[0.42em] uppercase text-white/90 sm:text-sm">
          RSVP
        </p>
        <h2 className="anim-fade-down mt-3 font-script text-[2.1rem] leading-[1.1] whitespace-nowrap text-white sm:text-6xl [animation-delay:100ms]">
          Konfirmasi Kehadiran
        </h2>
        <span
          aria-hidden
          className="anim-fade-in mt-5 block h-px w-24 bg-[linear-gradient(90deg,transparent,rgba(232,197,118,0.7),transparent)]"
        />
        <p className="anim-fade-up mt-4 max-w-xs text-center text-[12.5px] font-light leading-relaxed text-white/85 [animation-delay:150ms]">
          Mohon konfirmasi kehadiran Anda agar kami dapat menyiapkan tempat
          sebaik mungkin.
        </p>

        {/* Kartu form */}
        {done ? (
          <div className="anim-fade-up mt-9 w-[85%] rounded-[1.5rem] border border-white/50 bg-white/90 px-6 py-10 text-center shadow-[0_18px_50px_-12px_rgba(0,0,0,0.65)] backdrop-blur-md sm:w-full sm:max-w-md sm:py-12">
            <p className="font-script text-4xl text-[#132B66] sm:text-5xl">
              Terima Kasih
            </p>
            <p className="mt-3 text-sm font-light leading-relaxed text-[#1c2a52]">
              Konfirmasi kehadiran Anda telah kami terima. Doa restu Anda
              adalah hadiah terindah bagi kami.
            </p>
            <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.2em] text-[#3a4a78]">
              Muis &amp; Ocha
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="anim-fade-up mt-9 w-[85%] rounded-[1.5rem] border border-white/50 bg-white/90 px-5 py-4 shadow-[0_18px_50px_-12px_rgba(0,0,0,0.65)] backdrop-blur-md sm:w-full sm:max-w-md sm:px-8 sm:py-8 [animation-delay:200ms]"
          >
            {/* Nama */}
            <div className="space-y-1">
              <Label
                htmlFor="rsvp-name"
                className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#3a4a78]"
              >
                Nama
              </Label>
              <Input
                id="rsvp-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama Anda"
                maxLength={80}
                className="h-8 border-[#132B66]/25 bg-white text-xs text-[#132B66] placeholder:text-[#3a4a78]/55 focus-visible:ring-[#132B66]/40"
              />
            </div>

            {/* Kehadiran */}
            <div className="mt-3 space-y-1.5">
              <Label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#3a4a78]">
                Konfirmasi Kehadiran
              </Label>
              <RadioGroup
                value={attendance}
                onValueChange={(v) => setAttendance(v as Attendance)}
                className="grid grid-cols-1 gap-1.5 pt-0.5"
              >
                {ATTENDANCE_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    htmlFor={`att-${opt.value}`}
                    className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-[#132B66]/15 bg-white px-3 py-1.5 text-xs font-medium text-[#1c2a52] transition-colors hover:border-[#132B66]/40 has-[:checked]:border-[#132B66] has-[:checked]:bg-[#132B66]/5"
                  >
                    <RadioGroupItem
                      id={`att-${opt.value}`}
                      value={opt.value}
                      className="h-3.5 w-3.5 border-[#132B66]/40 text-[#132B66]"
                    />
                    {opt.label}
                  </label>
                ))}
              </RadioGroup>
            </div>

            {/* Jumlah tamu */}
            <div className="mt-3 space-y-1">
              <Label
                htmlFor="rsvp-guests"
                className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#3a4a78]"
              >
                Jumlah Tamu
              </Label>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setGuests((g) => Math.max(1, g - 1))}
                  aria-label="Kurangi jumlah tamu"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[#132B66]/25 bg-white text-sm font-semibold text-[#132B66] transition-colors hover:bg-[#132B66]/5 disabled:opacity-40"
                  disabled={guests <= 1}
                >
                  &minus;
                </button>
                <Input
                  id="rsvp-guests"
                  type="number"
                  min={1}
                  max={5}
                  value={guests}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    if (Number.isFinite(n))
                      setGuests(Math.min(5, Math.max(1, Math.round(n))));
                  }}
                  className="h-8 w-14 text-center text-xs border-[#132B66]/25 bg-white text-[#132B66]"
                />
                <button
                  type="button"
                  onClick={() => setGuests((g) => Math.min(5, g + 1))}
                  aria-label="Tambah jumlah tamu"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[#132B66]/25 bg-white text-sm font-semibold text-[#132B66] transition-colors hover:bg-[#132B66]/5 disabled:opacity-40"
                  disabled={guests >= 5}
                >
                  +
                </button>
              </div>
            </div>

            {/* Ucapan & Doa */}
            <div className="mt-3 space-y-1">
              <Label
                htmlFor="rsvp-message"
                className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#3a4a78]"
              >
                Ucapan &amp; Doa
              </Label>
              <Textarea
                id="rsvp-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tuliskan ucapan dan doa untuk kami..."
                maxLength={1000}
                rows={2}
                className="resize-none border-[#132B66]/25 bg-white text-xs text-[#132B66] placeholder:text-[#3a4a78]/55 focus-visible:ring-[#132B66]/40"
              />
            </div>

            {/* Tombol kirim */}
            <Button
              type="submit"
              disabled={submitting}
              className="mt-4 w-full rounded-full bg-[#132B66] py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white shadow-[0_10px_24px_-8px_rgba(8,18,48,0.7)] transition-colors hover:bg-[#1E3B8C] disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mengirim...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Kirim Konfirmasi
                </>
              )}
            </Button>
          </form>
        )}

        {/* === Daftar ucapan dari tamu === */}
        <div className="mt-10 w-full">
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="h-px flex-1 bg-[linear-gradient(90deg,transparent,rgba(232,197,118,0.55),transparent)]"
            />
            <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-white/85">
              Ucapan Tamu
            </p>
            <span
              aria-hidden
              className="h-px flex-1 bg-[linear-gradient(90deg,transparent,rgba(232,197,118,0.55),transparent)]"
            />
          </div>

          {loadingWishes ? (
            <div className="mt-6 flex items-center justify-center gap-2 text-white/70">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-xs font-light">Memuat ucapan...</span>
            </div>
          ) : wishes.length === 0 ? (
            <p className="mt-6 text-center text-xs font-light text-white/70">
              Belum ada ucapan. Jadilah yang pertama mengirim!
            </p>
          ) : (
            <div className="mt-6 flex max-h-96 flex-col gap-3 overflow-y-auto pr-1 [scrollbar-width:thin]">
              {wishes.map((w) => (
                <article
                  key={w.id}
                  className="rounded-2xl border border-white/40 bg-white/90 px-4 py-3.5 shadow-[0_8px_24px_-10px_rgba(0,0,0,0.5)] backdrop-blur-md"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-script text-xl leading-tight text-[#132B66] sm:text-2xl">
                      {w.name}
                    </p>
                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] ${ATTENDANCE_BADGE[w.attendance]}`}
                    >
                      {ATTENDANCE_LABEL[w.attendance]}
                    </span>
                  </div>
                  {w.message ? (
                    <p className="mt-1.5 text-[12px] font-light leading-relaxed text-[#1c2a52]">
                      {w.message}
                    </p>
                  ) : null}
                  <p className="mt-2 text-[10px] font-light uppercase tracking-[0.14em] text-[#3a4a78]/70">
                    {new Date(w.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                    {w.attendance === "hadir" ? ` · ${w.guests} tamu` : ""}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
