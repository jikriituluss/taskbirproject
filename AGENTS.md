# AGENTS.md — Panduan Pengembangan Taskora

Dokumen ini menjadi acuan utama bagi developer dan AI coding agent saat mengembangkan, memelihara, atau memperluas aplikasi **Taskora** (Project & Task Management Platform).

---

## 1. Ringkasan Proyek & Tech Stack

- **Framework:** Nuxt 4 (Vue 3 Composition API, TypeScript strict)
- **UI & Styling:** Tailwind CSS v4, Nuxt UI (`@nuxt/ui`), Lucide Icons (`@iconify-json/lucide`)
- **Backend:** Nuxt Server API (Nitro) + Zod (`zod`) untuk validasi input
- **Database & ORM:** TiDB (MySQL-compatible over TLS) + Drizzle ORM (`drizzle-orm`, `mysql2`) + Drizzle Kit
- **Desain / Sinkronisasi:** Figma MCP Server (`YBZg0vOF0CTWVRDmR93tJT`)

---

## 2. Struktur Folder Utama

```text
.
├── app/
│   ├── app.vue                         # Root <UApp> + <NuxtLayout> + <NuxtPage>
│   ├── app.config.ts                   # Tema Nuxt UI (primary: indigo, neutral: slate)
│   ├── assets/css/main.css             # Entry Tailwind CSS v4 + color-scheme: light
│   ├── components/                     # Komponen UI reusable (AppModal, TaskDetailModal, TaskoraLogo, dll.)
│   ├── composables/                    # State session & formatter (useTaskoraSession, useFormatters)
│   ├── layouts/                        # Layout (dashboard.vue, auth.vue, default.vue)
│   ├── middleware/                     # Route guards (auth.ts, guest.ts)
│   └── pages/                          # Halaman Nuxt (Dashboard, My Tasks, Projects, Kanban, Calendar, Team, Reports, Settings, Login, Register)
├── server/
│   ├── api/                            # REST API handlers (validasi + auth + delegasi ke service)
│   ├── database/
│   │   ├── index.ts                    # Pool mysql2 & singleton Drizzle ORM (useDb)
│   │   ├── schema/                     # Skema 8 tabel TiDB + relasi
│   │   └── migrations/                 # File migrasi SQL dari Drizzle Kit
│   ├── services/                       # Business logic terpisah per domain
│   └── utils/                          # Auth/session/RBAC (auth.ts), validasi (validation.ts), preview data (demo-store.ts)
├── shared/types/domain.ts              # Konstanta & tipe domain bersama (role, status, prioritas)
├── docs/                               # PRD & arsitektur (PRD.md, architecture.md)
├── .gemini/rules/figma-sync.md         # Pemetaan node ID untuk sinkronisasi ke Figma
├── AGENTS.md                           # Panduan agent & konvensi kode (file ini)
├── DATABASE.md                         # Dokumentasi skema TiDB, relasi, migrasi, & RBAC
└── DESIGN.md                           # Panduan UI/UX, token warna, komponen, & Figma
```

---

## 3. Perintah Penting

```bash
# Menjalankan server pengembangan lokal
npm run dev

# Memeriksa tipe TypeScript
npm run typecheck

# Build production
npm run build

# Generate file migrasi SQL setelah mengubah server/database/schema/*
npm run db:generate

# Menjalankan migrasi ke database TiDB
npm run db:migrate
```

---

## 4. Aturan & Konvensi Pengembangan

### A. Backend & Keamanan
1. **Pemisahan Lapisan:** Handler di `server/api/` hanya melakukan validasi input (`readValidatedJson`), pemeriksaan akses (`requireAuth` / `requireWorkspaceAccess`), dan memanggil fungsi di `server/services/`.
2. **Isolasi Workspace & RBAC:** Setiap operasi workspace wajib melewati `requireWorkspaceAccess(event, workspaceId, allowedRoles?)`. Dua role yang berlaku: `owner` (**Owner**) dan `member` (**Anggota**). Hanya `owner` yang dapat mengelola workspace/anggota, membuat/mengelola proyek, dan membagikan tugas ke anggota lain.
3. **Password & Session:** Password di-hash dengan `scryptSync` + salt acak (`hashPassword`), dan session menggunakan cookie `httpOnly` bertanda tangan HMAC-SHA256 (`taskora_session`). Jangan pernah menyimpan password plaintext atau kredensial di kode.
4. **Mode Dual (TiDB vs Preview):** Endpoint API memeriksa `isDatabaseConfigured()`. Jika `.env` TiDB belum diatur, API memakai `server/utils/demo-store.ts` untuk mode preview UI; jika `.env` sudah diisi, seluruh operasi langsung membaca/menulis ke TiDB.

### B. Frontend & UI
1. **Modal Standar:** Gunakan [AppModal.vue](file:///d:/Coding/ProjectTMTKemnaker/app/components/AppModal.vue) (`<Teleport to="body">` + `v-if="open"`) untuk seluruh dialog agar tombol silang (**X**), **Batal**, *backdrop click*, dan **Esc** selalu tertutup bersih.
2. **Aturan `<USelect>`:** Jangan pernah memberi `value: ''` (string kosong) pada item `<USelect>` karena Reka UI `SelectItem` akan melempar error runtime. Gunakan nilai sentinel seperti `'__unassigned__'` lalu konversi ke `null` saat submit.
3. **Tema Terang (Light Mode):** Aplikasi menggunakan tema terang (`ui.colorMode: false` di `nuxt.config.ts` dan `color-scheme: light` di `main.css`).
4. **State UI:** Setiap halaman wajib menangani *loading state* (`USkeleton`), *error state* (`UAlert` + tombol **Coba lagi**), dan *empty state* yang terarah.

### C. Verifikasi Wajib
- Setelah mengubah kode, selalu jalankan `npm run typecheck` (dan `npm run build` jika ada perubahan struktur/komponen/SSR).
- Jika mengubah skema di `server/database/schema/`, wajib menjalankan `npm run db:generate`.
- Jika mengubah UI/komponen dan diminta menyinkronkan ke Figma, ikuti pemetaan di [figma-sync.md](file:///d:/Coding/ProjectTMTKemnaker/.gemini/rules/figma-sync.md) dan [DESIGN.md](file:///d:/Coding/ProjectTMTKemnaker/DESIGN.md).
