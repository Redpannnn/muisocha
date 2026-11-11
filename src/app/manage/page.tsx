"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  Check,
  Upload,
  ExternalLink,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

/**
 * Halaman /manage — Kelola Tamu Undangan.
 *
 * Fitur:
 *  1. Import dari Excel/Contact (CSV, VCF, XLSX) — parse nama otomatis
 *  2. Input nama tamu (textarea, satu nama per baris, atau "code|nama")
 *  3. Tombol "+ TAMBAH SEMUA" untuk menambahkan semua nama sekaligus
 *  4. Daftar tamu hasil:
 *     - Salin: copy teks undangan WhatsApp
 *     - View: show/hide preview teks undangan
 *     - Edit: edit nama tamu
 *     - Remove: hapus tamu
 */

type Guest = {
  id: string;
  code: string;
  name: string;
  createdAt: string;
};

/** Link undangan (dengan code tamu) */
const INVITE_BASE = typeof window !== "undefined" ? window.location.origin : "https://danirika.memoraa-invitation.my.id";
// Untuk dev lokal, ganti ke window.location.origin:
// const INVITE_BASE = typeof window !== "undefined" ? window.location.origin : "";

/** Generate teks undangan WhatsApp untuk seorang tamu */
function buildInviteText(name: string, code: string): string {
  return `Assalamualaikum Wr. Wb.

Dengan memohon Rahmat Dan Ridha Allah SWT, Dan tanpa mengurangi rasa hormat kami, melalui media sosial ini, kami "Muis & Ocha" mengundang Bapak/Ibu/Sdr/i ${name} untuk hadir di acara pernikahan kami.

Silakan buka undangan digital kami:
${INVITE_BASE}/?to=${code}

Wassalamualaikum Wr. Wb.`;
}

export default function ManagePage() {
  const { toast } = useToast();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [namesInput, setNamesInput] = useState("");
  const [adding, setAdding] = useState(false);

  // UI state per-guest
  const [visibleMsg, setVisibleMsg] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/guests", { cache: "no-store" });
      const data = await res.json();
      if (data.ok && Array.isArray(data.data)) {
        setGuests(data.data);
      }
    } catch {
      toast({ title: "Gagal memuat data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  // === Import file (CSV/VCF/XLSX/TXT) — dikirim ke API untuk parsing ===
  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/guests/import", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Gagal memproses file.");
      }

      const names: string[] = data.names;
      if (names.length === 0) {
        toast({
          title: "Tidak ada nama ditemukan",
          description: "Pastikan format file benar (CSV/VCF/XLSX).",
          variant: "destructive",
        });
        return;
      }

      // Isi textarea dengan nama-nama hasil import
      setNamesInput((prev) => {
        const existing = prev.trim();
        return existing ? `${existing}\n${names.join("\n")}` : names.join("\n");
      });
      toast({
        title: "Import berhasil",
        description: `${names.length} nama dimuat. Klik "+ Tambah Semua".`,
      });
    } catch (err) {
      toast({
        title: "Gagal import file",
        description: err instanceof Error ? err.message : "",
        variant: "destructive",
      });
    } finally {
      // Reset input agar bisa import file yang sama lagi
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  // === Tambah semua ===
  async function handleAddAll() {
    if (!namesInput.trim()) {
      toast({ title: "Belum ada nama", variant: "destructive" });
      return;
    }
    setAdding(true);
    try {
      const res = await fetch("/api/guests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ names: namesInput }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Gagal");
      toast({
        title: "Tamu ditambahkan",
        description: `${data.count} tamu berhasil ditambahkan.`,
      });
      setNamesInput("");
      load();
    } catch (err) {
      toast({
        title: "Gagal menambah",
        description: err instanceof Error ? err.message : "",
        variant: "destructive",
      });
    } finally {
      setAdding(false);
    }
  }

  // === Salin teks undangan ===
  async function handleCopy(g: Guest) {
    const text = buildInviteText(g.name, g.code);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(g.id);
      toast({ title: "Tersalin", description: "Teks undangan disalin." });
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback: pilih teks di textarea tersembunyi
      toast({
        title: "Gagal menyalin",
        description: "Salin manual dari preview.",
        variant: "destructive",
      });
    }
  }

  // === Toggle view message ===
  function toggleView(id: string) {
    setVisibleMsg((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // === Edit ===
  function startEdit(g: Guest) {
    setEditingId(g.id);
    setEditName(g.name);
  }

  async function saveEdit(id: string) {
    if (!editName.trim()) {
      toast({ title: "Nama tidak boleh kosong", variant: "destructive" });
      return;
    }
    try {
      const res = await fetch(`/api/guests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Gagal");
      toast({ title: "Tamu diperbarui" });
      setEditingId(null);
      load();
    } catch {
      toast({ title: "Gagal mengedit", variant: "destructive" });
    }
  }

  // === Remove ===
  async function handleRemove(g: Guest) {
    if (!confirm(`Hapus "${g.name}"?`)) return;
    try {
      await fetch(`/api/guests/${g.id}`, { method: "DELETE" });
      toast({ title: "Tamu dihapus" });
      load();
    } catch {
      toast({ title: "Gagal menghapus", variant: "destructive" });
    }
  }

  // === Hapus semua ===
  async function handleClearAll() {
    if (!confirm("Hapus SEMUA tamu? Tindakan ini tidak bisa dibatalkan.")) return;
    try {
      await fetch("/api/guests/clear", { method: "DELETE" });
      toast({ title: "Semua tamu dihapus" });
      load();
    } catch {
      toast({ title: "Gagal menghapus semua", variant: "destructive" });
    }
  }

  return (
    <main className="min-h-dvh bg-[#0A183F] text-white">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        {/* Header */}
        <header className="mb-8 text-center">
          <p className="text-[11px] font-medium tracking-[0.32em] uppercase text-white/60">
            Admin
          </p>
          <h1 className="font-script text-4xl text-white sm:text-5xl">
            Kelola Tamu Undangan
          </h1>
          <p className="mt-1 text-xs font-light text-white/50">
            Muis &amp; Ocha Wedding
          </p>
          <a
            href="/"
            className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-white/60 transition-colors hover:text-white"
          >
            <ExternalLink className="h-3 w-3" />
            Lihat Undangan
          </a>
        </header>

        {/* Card: Tambah Tamu */}
        <div className="mb-6 rounded-2xl border border-white/15 bg-white/5 p-5 sm:p-6">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-white/80">
            Tambah Tamu
          </h2>

          {/* Import dropzone */}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="mb-4 flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-white/25 bg-white/5 px-4 py-6 text-center transition-colors hover:border-white/40 hover:bg-white/10"
          >
            <Upload className="h-5 w-5 text-white/50" />
            <p className="text-xs font-medium text-white/80">
              Klik untuk Import Kontak / Excel
            </p>
            <p className="text-[10px] font-light text-white/40">
              Format CSV, VCF (vCard), TXT
            </p>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.vcf,.txt"
            onChange={handleFile}
            className="hidden"
          />

          {/* Instruksi */}
          <p className="mb-2 text-[11px] font-light leading-relaxed text-white/60">
            Ketik / paste nama tamu — satu nama per baris. Kode otomatis
            dibuat dari nama. Atau pakai format{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-white/80">
              code|nama
            </code>{" "}
            untuk code custom.
          </p>

          {/* Textarea nama */}
          <Textarea
            value={namesInput}
            onChange={(e) => setNamesInput(e.target.value)}
            placeholder={"Contoh:\nBudi Santoso\nSiti Aminah\nkeluarga-besar|Keluarga Besar"}
            rows={5}
            className="resize-y border-white/15 bg-white/5 text-sm text-white placeholder:text-white/30 focus-visible:ring-white/30"
          />

          {/* Bottom row */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-[10px] font-light text-white/40">
              {namesInput.trim()
                ? `${namesInput.trim().split("\n").filter(Boolean).length} nama siap ditambah`
                : "Belum ada nama."}
            </p>
            <Button
              onClick={handleAddAll}
              disabled={adding || !namesInput.trim()}
              className="bg-[#2B51B0] text-white hover:bg-[#1E3B8C]"
            >
              {adding ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-1.5 h-4 w-4" />
              )}
              Tambah Semua
            </Button>
          </div>
        </div>

        {/* Card: Daftar Tamu */}
        <div className="rounded-2xl border border-white/15 bg-white/5 p-5 sm:p-6">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-white/80">
              Daftar Tamu
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-medium uppercase tracking-wide text-white/40">
                {guests.length} Tamu
              </span>
              {guests.length > 0 ? (
                <button
                  onClick={handleClearAll}
                  className="flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-rose-400 transition-colors hover:bg-rose-500/20"
                >
                  <Trash2 className="h-3 w-3" />
                  Hapus Semua
                </button>
              ) : null}
            </div>
          </div>

          {/* List */}
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-white/50" />
            </div>
          ) : guests.length === 0 ? (
            <p className="py-10 text-center text-xs font-light text-white/40">
              Belum ada tamu. Tambahkan di atas.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {guests.map((g, idx) => (
                <article
                  key={g.id}
                  className="rounded-xl border border-white/10 bg-white/5 p-4"
                >
                  {/* Top row */}
                  <div className="flex items-start gap-3">
                    {/* Avatar number */}
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white/70">
                      {idx + 1}
                    </span>

                    {/* Name + code (or edit input) */}
                    <div className="min-w-0 flex-1">
                      {editingId === g.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEdit(g.id);
                              if (e.key === "Escape") setEditingId(null);
                            }}
                            className="h-8 border-white/20 bg-white/5 text-sm text-white"
                            autoFocus
                          />
                          <button
                            onClick={() => saveEdit(g.id)}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                            aria-label="Simpan"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white/60 hover:bg-white/20"
                            aria-label="Batal"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <p className="font-script text-xl leading-tight text-white">
                            {g.name}
                          </p>
                          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-white/40">
                            {g.code}
                          </p>
                        </>
                      )}
                    </div>

                    {/* Action buttons (hidden during edit) */}
                    {editingId !== g.id ? (
                      <div className="flex shrink-0 items-center gap-1.5">
                        {/* Salin */}
                        <button
                          onClick={() => handleCopy(g)}
                          className="flex items-center gap-1 rounded-full bg-[#2B51B0] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-white transition-colors hover:bg-[#1E3B8C]"
                        >
                          {copiedId === g.id ? (
                            <>
                              <Check className="h-3 w-3" /> Salin
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" /> Salin
                            </>
                          )}
                        </button>
                        {/* View toggle */}
                        <button
                          onClick={() => toggleView(g.id)}
                          aria-label={visibleMsg.has(g.id) ? "Sembunyikan teks" : "Lihat teks"}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white/60 transition-colors hover:bg-white/15 hover:text-white"
                        >
                          {visibleMsg.has(g.id) ? (
                            <EyeOff className="h-3.5 w-3.5" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" />
                          )}
                        </button>
                        {/* Edit */}
                        <button
                          onClick={() => startEdit(g)}
                          aria-label={`Edit ${g.name}`}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white/60 transition-colors hover:bg-white/15 hover:text-white"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        {/* Remove */}
                        <button
                          onClick={() => handleRemove(g)}
                          aria-label={`Hapus ${g.name}`}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-rose-500/25 bg-rose-500/10 text-rose-400 transition-colors hover:bg-rose-500/20"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : null}
                  </div>

                  {/* Message preview (toggle) */}
                  {visibleMsg.has(g.id) ? (
                    <div className="mt-3 max-h-48 overflow-y-auto rounded-lg border border-white/10 bg-black/20 p-3 text-[11px] font-light leading-relaxed text-white/70 [scrollbar-width:thin]">
                      <pre className="whitespace-pre-wrap font-sans">
                        {buildInviteText(g.name, g.code)}
                      </pre>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
