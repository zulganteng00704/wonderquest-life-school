import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import profil from "@/assets/profil-pengembang.png.asset.json";

export const Route = createFileRoute("/pengembang")({
  head: () => ({
    meta: [
      { title: "Informasi Pengembang – Petualangan Nilai Tempat" },
      { name: "description", content: "Profil pengembang gim edukasi Petualangan Nilai Tempat: Arham, M.Pd, Kepala Sekolah SD Inpres 3 Birobuli." },
      { property: "og:title", content: "Informasi Pengembang – Petualangan Nilai Tempat" },
      { property: "og:description", content: "Kenali pengembang gim edukasi nilai tempat: Arham, M.Pd dari SD Inpres 3 Birobuli." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pengembang,
});

function Pengembang() {
  return (
    <div className="min-h-screen p-4 sm:p-6 grid place-items-center">
      <div className="glass rounded-[2rem] max-w-4xl w-full p-4 sm:p-6 anim-pop">
        <div className="flex items-center justify-between gap-3 mb-4">
          <Link to="/" className="btn-3d option-btn rounded-xl px-4 py-2 font-heading font-bold inline-flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" /> Kembali
          </Link>
          <h1 className="font-heading font-bold text-lg sm:text-2xl">Informasi Pengembang</h1>
        </div>
        <img
          src={profil.url}
          alt="Profil pengembang gim edukasi: Arham, M.Pd, Kepala Sekolah, SD Inpres 3 Birobuli"
          width={1672}
          height={941}
          className="w-full h-auto rounded-2xl"
        />
        <dl className="mt-4 grid sm:grid-cols-3 gap-2.5 text-center">
          <div className="banner-sky rounded-2xl px-3 py-2">
            <dt className="text-xs font-bold">Nama</dt>
            <dd className="font-heading font-bold text-lg">Arham, M.Pd</dd>
          </div>
          <div className="banner-amber rounded-2xl px-3 py-2">
            <dt className="text-xs font-bold">Jabatan</dt>
            <dd className="font-heading font-bold text-lg">Kepala Sekolah</dd>
          </div>
          <div className="banner-emerald rounded-2xl px-3 py-2">
            <dt className="text-xs font-bold">Satuan Pendidikan</dt>
            <dd className="font-heading font-bold text-lg">SD Inpres 3 Birobuli</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
