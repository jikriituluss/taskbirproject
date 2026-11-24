# DESIGN.md — Sistem Desain & UI/UX Taskora

Dokumen ini mendefinisikan standar visual, palet warna, tipografi, komponen, serta sinkronisasi desain antara kode **Taskora** dan **Figma**.

---

## 1. Identitas Visual & Logo

- **Nama Produk:** Taskora
- **Logo Resmi:** **Opsi 1 — Checkmark Monogram T**
  - Bentuk: Kotak *rounded* (`rx="14"`) berwarna Indigo `#4F46E5` berisi huruf **T** geometris putih (`#FFFFFF`) dan aksen centang lembut (`#C7D2FE`).
  - Implementasi kode: [TaskoraLogo.vue](file:///d:/Coding/ProjectTMTKemnaker/app/components/TaskoraLogo.vue) (`size`: `sm` | `md` | `lg`) dan [favicon.svg](file:///d:/Coding/ProjectTMTKemnaker/public/favicon.svg).
- **Gaya Desain:** SaaS modern, minimalis, bersih, dan terstruktur (terinspirasi dari kerapian Linear, Asana, dan ClickUp).
- **Mode Warna:** **Light Mode wajib** (`ui.colorMode: false` di `nuxt.config.ts` dan `color-scheme: light` di `app/assets/css/main.css`) agar tampilan selalu cerah dengan latar putih dan abu-abu muda.

---

## 2. Design Tokens (Warna & Tipografi)

Token ini diselaraskan dengan koleksi variabel **`Taskora Tokens`** di Figma:

| Token | Hex | Kegunaan |
| --- | --- | --- |
| `bg/canvas` | `#F8FAFC` (`slate-50`) | Latar belakang utama halaman |
| `bg/surface` | `#FFFFFF` (`white`) | Kartu, Sidebar, Top Navbar, Modal |
| `bg/subtle` | `#F1F5F9` (`slate-100`) | Header tabel, kolom Kanban, badge netral |
| `border/default` | `#E2E8F0` (`slate-200`) | Garis pemisah & border kartu |
| `text/primary` | `#0F172A` (`slate-900`) | Judul halaman, heading, teks utama |
| `text/secondary` | `#475569` (`slate-600`) | Label sekunder, isi tabel |
| `text/muted` | `#64748B` (`slate-500`) | Subjudul, metadata, placeholder |
| `brand/indigo` | `#4F46E5` (`indigo-600`) | Tombol utama, menu aktif, aksen brand |
| `brand/indigo-light` | `#EEF2FF` (`indigo-50`) | Latar item navigasi aktif, badge info |
| `brand/violet` | `#7C3AED` (`violet-600`) | Aksen proyek/kalender |
| `status/success` | `#059669` / `#ECFDF5` | Status *Done* / *Completed* / Bukti terlampir |
| `status/warning` | `#D97706` / `#FFFBEB` | Status *Review* / Prioritas *Medium* |
| `status/danger` | `#E11D48` / `#FFF1F2` | Prioritas *High* / Deadline terlambat |

### Tipografi
- **Font Family:** `Inter`, fallback `Plus Jakarta Sans`, `ui-sans-serif`, `system-ui`.
- **Skala Utama:**
  - Judul Halaman: `24px` (`text-2xl font-bold tracking-tight`)
  - Judul Kartu / Modal: `16px` (`text-base font-semibold`)
  - Isi Tabel / Form: `13px–14px` (`text-sm`)
  - Label Grup / Header Tabel: `11px–12px` (`text-xs font-semibold uppercase tracking-wider`)

---

## 3. Tata Letak & Navigasi ([dashboard.vue](file:///d:/Coding/ProjectTMTKemnaker/app/layouts/dashboard.vue))

- **Sidebar Kiri (`w-64`, kolapsibel ke `USlideover` di mobile):**
  - **Ruang Kerja:** `Dashboard` (`/`), `My Tasks` (`/my-tasks`)
  - **Perencanaan:** `Projects` (`/projects`), `Kanban Board` (`/kanban`), `Calendar` (`/calendar`)
  - **Tim & Analisis:** `Team` (`/team`), `Reports` (`/reports`)
  - **Footer Sidebar:** `Settings` (`/settings`).
- **Top Navbar (`h-16`):**
  - *Workspace Switcher* + tombol `+` ([CreateWorkspaceModal.vue](file:///d:/Coding/ProjectTMTKemnaker/app/components/CreateWorkspaceModal.vue))
  - **Tengah Atas:** Identitas nama perusahaan/agensi aktif beserta badge role (`Owner` / `Anggota`)
  - Popover **Notifikasi** dengan indikator belum dibaca
  - Menu **Profil User** & tombol **Logout**

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
   - Empty: Kartu informatif dengan CTA langsung ke langkah berikutnya.

---

## 5. Referensi File Figma

- **Figma File Key:** `YBZg0vOF0CTWVRDmR93tJT`
- **URL:** https://www.figma.com/design/YBZg0vOF0CTWVRDmR93tJT
- **Layar Tersedia:** `00 — Logo Concepts` (`6:2`), `01 — Dashboard` (`2:20`), `02 — My Tasks` (`2:136`), `03 — Projects` (`3:2`), `04 — Kanban Board` (`3:83`), `05 — Modal Buat Tugas & Bukti` (`3:204`).
- Aturan sinkronisasi otomatis Antigravity ↔ Figma tersimpan di [figma-sync.md](file:///d:/Coding/ProjectTMTKemnaker/.gemini/rules/figma-sync.md).
