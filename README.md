<p align="center">
  <img src="public/favicon.svg" alt="Logo Taskbir" width="72" height="72" />
</p>

<h1 align="center">Taskbir</h1>

<p align="center">
  Platform manajemen proyek dan tugas tim modern untuk freelancer, agensi, dan tim kecil.
</p>

---

## Tentang Taskbir

**Taskbir** adalah aplikasi web manajemen proyek dan tugas yang dirancang untuk menjaga alur kerja tim tetap rapi, terukur, dan transparan. Setiap tim atau klien dapat dipisahkan ke dalam **workspace** masing-masing lengkap dengan kontrol peran, tenggat waktu berjam, lampiran bukti kerja, serta laporan progres otomatis.

---

## Target Pengguna

- **Freelancer:** Memisahkan proyek tiap klien per workspace, menjaga fokus tugas harian di *My Tasks*, dan melampirkan bukti penyelesaian kerja.
- **Agensi & Project Manager:** Mengatur tim, membagi peran dan tugas, memantau keterlambatan, serta meninjau progres proyek melalui papan Kanban dan laporan.
- **Anggota Tim:** Melihat daftar tugas yang ditugaskan, memperbarui status pekerjaan secara langsung, serta berdiskusi melalui komentar tugas.

---

## Fitur & Modul Utama

- **Beranda & Autentikasi:** Halaman pengenalan produk (`/`) serta alur akun lengkap (`/login`, `/register`, `/forgot-password`, `/reset-password`) dengan cookie session `httpOnly` bertanda tangan HMAC-SHA256 dan hashing password `scryptSync`.
- **Multi-Workspace & Isolasi Data:** Setiap workspace memiliki proyek, tugas, anggota, notifikasi, dan pengaturan yang terpisah.
- **Dashboard (`/dashboard`):** Ringkasan persentase penyelesaian workspace, proyek aktif, tugas menunggu review, tugas terlambat, daftar deadline mendekat, dan aktivitas terbaru.
- **My Tasks (`/my-tasks`):** Daftar tugas pribadi dengan filter status & prioritas, perubahan status langsung, serta unggah **bukti kerja** berupa tautan (`https://...`) atau foto.
- **Projects (`/projects` & `/projects/[id]`):** Pengelolaan proyek, perhitungan progres otomatis dari rasio tugas selesai, dan pengaturan anggota proyek.
- **Kanban Board (`/kanban`):** Papan *drag-and-drop* 4 status (`To Do`, `In Progress`, `Review`, `Done`) dengan filter per proyek.
- **Calendar (`/calendar`):** Kalender bulanan untuk memantau deadline tugas dan jadwal proyek.
- **Team (`/team`):** Manajemen anggota workspace, pengaturan peran, dan ringkasan beban tugas per anggota.
- **Reports (`/reports`):** Ringkasan metrik jumlah proyek, tugas selesai, belum selesai, tugas terlambat, dan persentase progres tiap proyek.
- **Settings (`/settings`):** Pengaturan profil akun, nama & deskripsi workspace (khusus Owner), serta pembaruan password.

---

## Peran & Hak Akses (RBAC)

| Peran | Hak Akses |
| --- | --- |
| **Owner** | Mengelola pengaturan workspace, mengundang/menghapus anggota, membuat & mengelola proyek, serta menugaskan tugas ke anggota lain. |
| **Anggota** | Melihat proyek tempat ia tergabung, mengelola tugas yang ditugaskan kepadanya, memperbarui status & bukti kerja, serta menambahkan komentar. |

---

## Tech Stack

| Lapisan | Teknologi |
| --- | --- |
| **Frontend** | Nuxt 4, Vue 3 Composition API, TypeScript, Nuxt UI, Tailwind CSS v4, Lucide Icons |
| **Backend & Validasi** | Nuxt Server API (Nitro), Zod |
| **Database & ORM** | TiDB (MySQL-compatible over TLS), Drizzle ORM, `mysql2` |

---

## Struktur Direktori

```text
.
├── app/                  # Halaman, layout, komponen UI, middleware, dan composables
├── server/               # REST API handlers, services, skema database TiDB, dan utilitas auth/RBAC
├── shared/types/         # Tipe & konstanta domain bersama (status, prioritas, peran)
├── docs/                 # Dokumen PRD & arsitektur sistem
├── DESIGN.md             # Panduan sistem desain, token warna, & aturan anti-slop
├── DATABASE.md           # Dokumentasi skema TiDB, relasi tabel, & RBAC
└── AGENTS.md             # Panduan konvensi pengembangan
```

---

## Dokumentasi Terkait

- [DESIGN.md](DESIGN.md) - Sistem desain, palet warna, komponen, dan referensi Figma
- [DATABASE.md](DATABASE.md) - Skema database TiDB, relasi tabel, dan aturan RBAC
- [AGENTS.md](AGENTS.md) - Konvensi kode dan struktur pengembangan
