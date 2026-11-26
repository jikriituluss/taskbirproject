# DESIGN.md - Sistem Desain & UI/UX Taskbir

Dokumen ini mendefinisikan standar visual, palet warna, tipografi, komponen, arah desain (*anti-slop*), serta sinkronisasi desain antara kode **Taskbir** dan **Figma**.

---

## 1. Identitas Visual & Arah Desain

- **Nama Produk:** Taskbir
- **Logo Resmi:** **Checkmark Monogram T**
  - Bentuk: Kotak *rounded* (`rx="14"`) berwarna Indigo `#4F46E5` berisi huruf **T** geometris putih (`#FFFFFF`) dan aksen centang lembut (`#C7D2FE`).
  - Implementasi kode: [TaskoraLogo.vue](file:///d:/Coding/ProjectTMTKemnaker/app/components/TaskoraLogo.vue) (`size`: `sm` | `md` | `lg`) dan [favicon.svg](file:///d:/Coding/ProjectTMTKemnaker/public/favicon.svg).
- **Kepribadian & Mood:** Profesional, hangat, rapi, dan fokus pada kejelasan kerja tim (*light-first SaaS*, bukan *dark-tech* generik).
- **Mode Warna:** **Light Mode wajib** (`ui.colorMode: false` di `nuxt.config.ts` dan `color-scheme: light` di `app/assets/css/main.css`).
- **Arah Anti-Slop (R-29 & R-01):**
  - **Disiplin Palet:** Gunakan maksimal 2 warna inti (**Slate** netral + **Indigo** utama) dan 1 aksen (**Amber**), plus warna status semantik (**Emerald**, **Amber**, **Rose**) hanya saat menandai status nyata.
  - **Hindari:** Gradien pelangi/biru-ungu tanpa tujuan, *blurred radial orbs* dekoratif di hero/CTA, *decorative status dot* tanpa state, karakter em dash (`—`), dan teks kontras rendah (`text-slate-400` di atas latar terang).

---

## 2. Design Tokens (Warna, Radius, & Tipografi)

Token ini diselaraskan dengan koleksi variabel Figma:

| Token | Hex / Kelas | Kegunaan |
| --- | --- | --- |
| `bg/canvas` | `#F8FAFC` (`slate-50`) | Latar belakang utama halaman & dashboard |
| `bg/surface` | `#FFFFFF` (`white`) | Kartu, Sidebar, Top Navbar, Modal |
| `bg/subtle` | `#F1F5F9` (`slate-100`) | Header tabel, kolom Kanban, badge netral |
| `border/default` | `#E2E8F0` (`slate-200`) | Garis pemisah & border kartu (`border-slate-200/90`) |
| `text/primary` | `#0F172A` (`slate-900`) | Judul halaman, heading, teks utama |
| `text/secondary` | `#475569` (`slate-600`) | Label sekunder, isi tabel, deskripsi |
| `text/muted` | `#64748B` (`slate-500`) | Subjudul, metadata, placeholder (minimal kontras WCAG AA) |
| `brand/indigo` | `#4F46E5` (`indigo-600` / `indigo-700`) | Tombol utama, menu aktif, aksen brand |
| `brand/indigo-light` | `#EEF2FF` (`indigo-50`) | Latar item navigasi aktif, badge ikon header, section tint |
| `accent/amber` | `#F59E0B` (`amber-400` / `amber-500`) | Aksen sorotan hero, garis aksen atas auth/dashboard, highlight proyek |
| `status/success` | `#059669` / `#ECFDF5` (`emerald`) | Status *Done* / *Completed* / Bukti terlampir / Aman |
| `status/warning` | `#D97706` / `#FFFBEB` (`amber`) | Status *Review* / Prioritas *Medium* |
| `status/danger` | `#E11D48` / `#FFF1F2` (`rose`) | Prioritas *High* / *Urgent* / Deadline terlambat |

### Border Radius & Elevasi
- **Kartu Auth & CTA:** `rounded-3xl` dengan aksen atas gradien Indigo-ke-Amber dan footer `bg-slate-50/80`.
- **Kartu Konten, Tabel, & Kolom Kanban:** `rounded-2xl border-slate-200/90 shadow-xs`.
- **Badge Ikon Header Halaman:** `h-11 w-11 rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100`.
- **Item Navigasi Sidebar & Kontrol Kecil:** `rounded-xl` atau `rounded-lg`.

### Tipografi
- **Font Family:** `Inter`, fallback `Plus Jakarta Sans`, `ui-sans-serif`, `system-ui`.
- **Skala Utama:**
  - Hero Beranda: `36px–48px` (`text-4xl sm:text-5xl font-extrabold tracking-tight`)
  - Judul Halaman Dalam: `24px` (`text-2xl font-bold tracking-tight`)
  - Judul Kartu / Modal: `16px` (`text-base font-semibold`)
  - Isi Tabel / Form: `13px–14px` (`text-sm`)
  - Label Grup / Header Tabel: `11px–12px` (`text-xs font-semibold uppercase tracking-wider`)

---

## 3. Struktur Halaman & Tata Letak

### A. Beranda & Autentikasi
- **Beranda (`/` — [index.vue](file:///d:/Coding/ProjectTMTKemnaker/app/pages/index.vue)):**
  - Terdiri dari `LandingNavbar`, `LandingHero`, `LandingStats`, `LandingProblems`, `LandingFeatures`, `LandingHowItWorks`, `LandingAudience`, `LandingFaq`, `LandingFinalCta`, dan `LandingFooter`.
  - Tombol masuk menggunakan label **Masuk** (bukan *Login*).
- **Halaman Auth ([auth.vue](file:///d:/Coding/ProjectTMTKemnaker/app/layouts/auth.vue)):**
  - Meliputi `/login`, `/register`, `/forgot-password`, dan `/reset-password`.
  - Seluruhnya memakai kartu `rounded-3xl` beraksen atas Indigo-ke-Amber, badge ikon di header, input `size="lg"`, dan tautan **Kembali ke Beranda** di footer kartu.

### B. Aplikasi Dalam ([dashboard.vue layout](file:///d:/Coding/ProjectTMTKemnaker/app/layouts/dashboard.vue))
- **Sidebar Kiri (`w-64`, kolapsibel ke `USlideover` di mobile):**
  - **Ruang Kerja:** `Dashboard` (`/dashboard`), `My Tasks` (`/my-tasks`)
  - **Perencanaan:** `Projects` (`/projects`), `Kanban Board` (`/kanban`), `Calendar` (`/calendar`)
  - **Tim & Analisis:** `Team` (`/team`), `Reports` (`/reports`)
  - **Footer Sidebar:** `Logout`, `Settings` (`/settings`)
- **Top Navbar (`h-16`):**
  - *Workspace Switcher* + tombol `+` ([CreateWorkspaceModal.vue](file:///d:/Coding/ProjectTMTKemnaker/app/components/CreateWorkspaceModal.vue)) + tombol ubah nama workspace (khusus Owner)
  - **Tengah Atas:** Identitas nama perusahaan/agensi aktif beserta badge role (`Owner` / `Anggota`)
  - Popover **Notifikasi** dengan indikator belum dibaca
  - Menu **Profil User**
- **Pola Konsisten Halaman Dalam:**
  - Setiap halaman (`/dashboard`, `/my-tasks`, `/projects`, `/kanban`, `/calendar`, `/team`, `/reports`, `/settings`) diawali header dengan badge ikon `rounded-2xl` + judul `text-2xl font-bold` + subjudul `text-slate-500`.

---

## 4. Standar Komponen & Interaksi

1. **Modal (`AppModal.vue`):**
   - Seluruh modal wajib menggunakan [AppModal.vue](file:///d:/Coding/ProjectTMTKemnaker/app/components/AppModal.vue) (`<Teleport to="body">` + `v-if="open"`).
   - Harus bisa ditutup via tombol silang (**X**), tombol **Batal/Tutup** (`type="button"`), klik *backdrop*, dan tombol **Esc**.
2. **Dropdown (`USelect`):**
   - Dilarang memakai `value: ''` pada item `USelect`; gunakan nilai sentinel (mis. `'__unassigned__'`) untuk opsi kosong.
3. **Bukti Penyelesaian Tugas ([TaskDetailModal.vue](file:///d:/Coding/ProjectTMTKemnaker/app/components/TaskDetailModal.vue) & [my-tasks.vue](file:///d:/Coding/ProjectTMTKemnaker/app/pages/my-tasks.vue)):**
   - Mendukung input **Link Bukti** (`https://...`) dan **Upload Foto Bukti** (maks. 2MB) dengan preview langsung.
4. **Loading, Error, & Empty States:**
   - Loading: `USkeleton` sesuai bentuk konten.
   - Error: `UAlert` dengan tombol **Coba lagi**.
   - Empty: Kartu `rounded-2xl` informatif dengan ikon dalam wadah `rounded-2xl` dan CTA langsung ke langkah berikutnya.

---

## 5. Referensi File Figma

- **Figma File Key:** `YBZg0vOF0CTWVRDmR93tJT`
- **URL:** https://www.figma.com/design/YBZg0vOF0CTWVRDmR93tJT
- **Layar Tersedia:** `00 - Logo Concepts` (`6:2`), `01 - Dashboard` (`2:20`), `02 - My Tasks` (`2:136`), `03 - Projects` (`3:2`), `04 - Kanban Board` (`3:83`), `05 - Modal Buat Tugas & Bukti` (`3:204`).
- Aturan sinkronisasi otomatis Antigravity <-> Figma tersimpan di [figma-sync.md](file:///d:/Coding/ProjectTMTKemnaker/.gemini/rules/figma-sync.md).
