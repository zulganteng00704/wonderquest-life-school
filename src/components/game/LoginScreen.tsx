import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Info } from "lucide-react";
import logo from "@/assets/logo.png";

export interface Student {
  name: string;
  school: string;
}

export function LoginScreen({ onLogin }: { onLogin: (s: Student) => void }) {
  const [name, setName] = useState("");
  const [school, setSchool] = useState("");
  const ready = name.trim().length > 0 && school.trim().length > 0;

  return (
    <div className="h-full overflow-y-auto grid place-items-center p-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (ready) onLogin({ name: name.trim(), school: school.trim() });
        }}
        className="glass relative rounded-[2rem] max-w-md w-full p-6 sm:p-8 text-center anim-pop"
      >
        <Link
          to="/pengembang"
          aria-label="Informasi pengembang"
          title="Informasi pengembang"
          className="btn-3d option-btn absolute top-4 right-4 w-11 h-11 rounded-full grid place-items-center text-primary"
        >
          <Info className="w-6 h-6" strokeWidth={2.5} />
        </Link>

        <img src={logo} alt="Petualangan Nilai Tempat – Juara Angka 100" width={600} height={600} className="mx-auto h-32 sm:h-40 w-auto object-contain anim-bob" />
        <h2 className="font-heading font-bold text-2xl sm:text-3xl mt-2">Selamat Datang! 👋</h2>
        <p className="text-muted-foreground font-semibold text-sm mt-1">Isi namamu dan nama sekolahmu dulu, ya.</p>

        <div className="mt-5 flex flex-col gap-3 text-left">
          <label className="flex flex-col gap-1">
            <span className="font-heading font-bold text-sm">👦 Nama / Kelompok</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
              autoFocus
              placeholder="Contoh: Budi atau Kelompok Melati"
              className="rounded-2xl border-2 border-border bg-card px-4 py-3 font-bold outline-none focus:border-primary"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-heading font-bold text-sm">🏫 Nama Sekolah</span>
            <input
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              maxLength={60}
              placeholder="Contoh: SD Inpres 3 Birobuli"
              className="rounded-2xl border-2 border-border bg-card px-4 py-3 font-bold outline-none focus:border-primary"
            />
          </label>
        </div>

        <button type="submit" disabled={!ready} className="btn-3d bg-primary text-primary-foreground rounded-2xl w-full mt-6 py-3 font-heading font-bold text-lg">
          🚀 Masuk & Bermain
        </button>
        <p className="text-[11px] text-muted-foreground font-semibold mt-3">Data tidak disimpan — hanya dipakai selama bermain.</p>
      </form>
    </div>
  );
}
