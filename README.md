<p align="center">
  <img src="public/favicon.svg" alt="Logo Taskbir" width="72" height="72" />
</p>

<h1 align="center">Taskbir</h1>

<p align="center">
  Platform manajemen proyek dan tugas tim modern berbasis <strong>Nuxt 4</strong>, <strong>Nuxt UI</strong>, <strong>Tailwind CSS v4</strong>, dan <strong>TiDB (Drizzle ORM)</strong>.
</p>

Dirancang untuk freelancer, agensi, dan tim kecil agar pekerjaan, deadline berjam, bukti penyelesaian, dan hak akses tim tetap rapi dalam satu workspace.

---

## Fitur Utama

- **Beranda & Autentikasi Lengkap:** Landing page (`/`) serta halaman `/login`, `/register`, `/forgot-password`, dan `/reset-password` dengan cookie session `httpOnly` bertanda tangan HMAC-SHA256 dan hashing password `scryptSync`.
- **Multi-Workspace & RBAC:** Pisahkan proyek per tim atau klien dengan dua peran jelas: **Owner** (mengelola workspace, anggota, proyek, dan penugasan) dan **Anggota** (mengelola tugas yang ditugaskan serta melampirkan bukti kerja).
- **Dashboard (`/dashboard`):** Ringkasan progres penyelesaian workspace, jumlah proyek aktif, tugas menunggu review, tugas terlambat, deadline mendekat, dan aktivitas terbaru.
- **My Tasks (`/my-tasks`):** Daftar tugas pribadi dengan filter status dan prioritas, pembaruan status cepat, serta unggah **bukti kerja** berupa tautan (`https://...`) atau foto.
- **Projects (`/projects` & `/projects/[id]`):** Manajemen proyek, progres otomatis berdasarkan tugas selesai, serta daftar anggota proyek.
- **Kanban Board (`/kanban`):** Papan *drag-and-drop* 4 kolom (`To Do`, `In Progress`, `Review`, `Done`).
- **Calendar (`/calendar`):** Tampilan kalender bulanan untuk memantau tenggat tugas dan jadwal proyek.
- **Team (`/team`), Reports (`/reports`), & Settings (`/settings`):** Manajemen anggota, laporan progres proyek & keterlambatan, serta pengaturan profil, workspace, dan password.
- **Mode Dual (Preview UI & TiDB):** Dapat langsung dijalankan untuk preview UI tanpa database (memakai data contoh interaktif) maupun terhubung penuh ke **TiDB** saat `.env` sudah dikonfigurasi.

---

## Tech Stack

| Lapisan | Teknologi |
| --- | --- |
| **Framework** | Nuxt 4 (`^4.5.2`), Vue 3 Composition API, TypeScript |
| **UI & Styling** | Nuxt UI (`@nuxt/ui ^4.13.0`), Tailwind CSS v4, Lucide Icons |
| **Backend & Validasi** | Nuxt Server API (Nitro), Zod (`^4.6.7`) |
| **Database & ORM** | TiDB (MySQL-compatible over TLS), Drizzle ORM (`^0.45.4`), `mysql2`, Drizzle Kit |

---

## Memulai di Lokal

### 1. Clone Repositori & Instal Dependensi

```bash
git clone https://github.com/jikriituluss/taskbirproject.git
cd taskbirproject
npm install
```

### 2. Konfigurasi Environment Variables

Salin file `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

Isi variabel utama di `.env`:

```env
NUXT_PUBLIC_APP_NAME=Taskbir
NUXT_PUBLIC_APP_URL=http://localhost:3000
NUXT_SESSION_SECRET=ganti-dengan-string-acak-minimal-32-karakter

# TiDB Cloud / MySQL-compatible
DATABASE_URL=mysql://<user>:<password>@<host>:4000/<database>
TIDB_SSL=true
```

> **Catatan:** Jika variabel TiDB belum diisi, aplikasi tetap dapat dijalankan dalam **Mode Preview UI** menggunakan data contoh interaktif.

### 3. Migrasi Database (Opsional untuk Mode TiDB)

```bash
npm run db:migrate
```

### 4. Jalankan Server Pengembangan

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`.

---

## Perintah Penting

| Perintah | Kegunaan |
| --- | --- |
| `npm run dev` | Menjalankan server pengembangan lokal |
| `npm run typecheck` | Memeriksa tipe TypeScript dengan `nuxt typecheck` |
| `npm run build` | Build aplikasi untuk produksi |
| `npm run preview` | Menjalankan hasil build produksi secara lokal |
| `npm run db:generate` | Generate file migrasi SQL dari skema Drizzle |
| `npm run db:migrate` | Menjalankan migrasi ke database TiDB |
| `npm run db:push` | Sinkronisasi skema langsung ke database |
| `npm run db:studio` | Membuka Drizzle Studio |

---

## Struktur Proyek

```text
.
├── app/
│   ├── components/       # Komponen UI (Landing, AppModal, TaskDetailModal, dll.)
│   ├── composables/      # Session & formatter (useTaskoraSession, useFormatters)
│   ├── layouts/          # Layout default, auth, dan dashboard
│   ├── middleware/       # Route guards (auth, guest)
│   └── pages/            # Halaman aplikasi (Beranda, Auth, Dashboard, Projects, Kanban, dll.)
├── server/
│   ├── api/              # REST API handlers (validasi Zod + auth/RBAC)
│   ├── database/         # Koneksi TiDB, skema Drizzle, dan migrasi
│   ├── services/         # Business logic per domain
│   └── utils/            # Auth/session/RBAC, validasi, dan demo store
├── shared/types/         # Tipe & konstanta domain bersama
├── docs/                 # Dokumen PRD & arsitektur
├── DESIGN.md             # Panduan sistem desain, token warna, & anti-slop
├── DATABASE.md           # Dokumentasi skema TiDB, relasi, & RBAC
└── AGENTS.md             # Panduan pengembangan & konvensi kode
```

---

## Dokumentasi Tambahan

- [DESIGN.md](DESIGN.md) - Sistem desain, palet warna, komponen, dan referensi Figma
- [DATABASE.md](DATABASE.md) - Skema database TiDB, relasi tabel, dan aturan RBAC
- [AGENTS.md](AGENTS.md) - Konvensi kode dan alur verifikasi pengembangan
