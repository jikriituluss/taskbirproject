# Product Requirements Document (PRD) — Taskora

**Versi:** 1.0  
**Tanggal:** 23 November 2026  
**Produk:** Taskora — Project & Task Management Platform  
**Target Pengguna:** Freelancer, Agensi, dan Tim Kecil

---

## 1. Ringkasan Eksekutif

**Taskora** adalah aplikasi web manajemen proyek dan tugas berbasis multi-workspace yang dirancang untuk membantu freelancer, agensi, dan tim kecil mengelola proyek, tugas, kolaborasi tim, tenggat waktu, serta progres pekerjaan secara terstruktur dalam satu platform SaaS yang modern, cepat, dan mudah digunakan.

---

## 2. Masalah & Tujuan Produk

### 2.1 Masalah yang Diselesaikan
1. Tim kecil dan freelancer sering mencampuradukkan komunikasi tugas di chat tanpa struktur status yang jelas.
2. Kurangnya visibilitas progres proyek secara real-time (mana tugas yang *To Do*, *In Progress*, *Review*, atau *Done*).
3. Sulit melacak tenggat waktu lintas proyek dan mengidentifikasi tugas yang terlambat.
4. Tidak adanya pemisahan ruang kerja (*workspace*) dan hak akses antar klien/tim.

### 2.2 Tujuan Produk
- Menyediakan alur manajemen proyek dan tugas terpusat berbasis workspace yang terisolasi.
- Memberikan visualisasi kerja yang fleksibel melalui **Daftar Tugas**, **Kanban Board** (*drag-and-drop*), **Kalender**, dan **Laporan Progres**.
- Menjamin keamanan data melalui autentikasi, password hashing, validasi input, dan kontrol akses berbasis role (*RBAC*).

---

## 3. Target Pengguna & Persona

| Persona | Kebutuhan Utama |
| --- | --- |
| **Freelancer** | Mengelola proyek klien secara terpisah per workspace, memantau deadline, dan menjaga fokus tugas harian. |
| **Agency Lead / Project Manager** | Mengatur tim, membagi tugas dengan prioritas jelas, memantau progres proyek, dan melihat laporan keterlambatan. |
| **Anggota Tim (Developer/Designer/dll)** | Melihat daftar tugas yang ditugaskan kepadanya, memperbarui status di Kanban Board, dan berdiskusi melalui komentar tugas. |

---

## 4. Role Pengguna & Matriks Hak Akses (RBAC)

Setiap pengguna hanya dapat mengakses data pada workspace tempat mereka terdaftar sebagai anggota (`workspace_members`).

| Fitur / Aksi | Owner | Admin | Member |
| --- | :---: | :---: | :---: |
| Mengelola pengaturan & menghapus workspace | Ya | Tidak | Tidak |
| Mengundang & menghapus anggota workspace | Ya | Tidak | Tidak |
| Mengubah role anggota (`owner`/`admin`/`member`) | Ya | Tidak | Tidak |
| Membuat, mengubah, dan menghapus proyek | Ya | Ya | Tidak |
| Menambahkan/menghapus anggota proyek | Ya | Ya | Tidak |
| Melihat proyek di workspace | Ya | Ya | Ya |
| Membuat & menghapus tugas | Ya | Ya | Terbatas (tugas sendiri / proyek terkait) |
| Mengubah semua tugas di workspace | Ya | Ya | Tidak |
| Mengubah status/detail tugas yang menjadi tanggung jawabnya | Ya | Ya | Ya |
| Menambahkan komentar pada tugas | Ya | Ya | Ya |
| Melihat Dashboard, Kalender, dan Reports workspace | Ya | Ya | Ya |

---

## 5. Ruang Lingkup Fitur & Kebutuhan Fungsional

### A. Authentication & Session
- **Register:** Pengguna mendaftar dengan nama, email unik, dan password (disimpan dalam bentuk hash aman, bukan plaintext). Saat registrasi, sistem dapat membuat workspace default atau mengarahkan pembuatan workspace awal.
- **Login & Logout:** Autentikasi berbasis session/cookie terenkripsi (`httpOnly`, `sameSite`).
- **Proteksi Halaman:** Route middleware mencegah pengguna yang belum login mengakses halaman dashboard dan API terproteksi.

### B. Dashboard
Menampilkan ringkasan operasional workspace aktif secara *real-time* dari TiDB:
- Kartu metrik: **Total Proyek**, **Proyek Aktif**, **Total Tugas**, dan **Tugas Selesai**.
- Daftar **Tugas Mendekati Deadline** (diurutkan berdasarkan tenggat terdekat yang belum selesai).
- **Aktivitas Terbaru** (perubahan status, pembuatan tugas, komentar, atau pembaruan proyek).
- **Grafik Progres Pekerjaan** (distribusi status tugas / persentase penyelesaian).

### C. Project Management
- CRUD Proyek: membuat, melihat, mengubah, dan menghapus proyek.
- Atribut proyek: Nama, Deskripsi, Tanggal Mulai (`start_date`), Deadline (`due_date`), dan Status (`planned`, `active`, `on_hold`, `completed`, `archived`).
- Perhitungan **Progres Proyek** otomatis berdasarkan rasio tugas berstatus `done` terhadap total tugas pada proyek tersebut.
- Manajemen **Anggota Proyek** (`project_members`) untuk menugaskan anggota workspace ke proyek tertentu.

### D. Task Management & My Tasks
- CRUD Tugas: membuat, melihat, mengubah, dan menghapus tugas dalam proyek.
- Atribut tugas:
  - Judul & Deskripsi
  - Penanggung jawab (`assignee_id`)
  - Deadline (`due_date`)
  - Prioritas: `low`, `medium`, `high`
  - Status: `todo`, `in_progress`, `review`, `done`
- Komentar tugas (`task_comments`) untuk kolaborasi tim.
- Halaman **My Tasks** untuk menampilkan semua tugas yang ditugaskan kepada pengguna yang sedang login.

### E. Kanban Board
- Papan Kanban interaktif dengan 4 kolom status: **To Do**, **In Progress**, **Review**, dan **Done**.
- Filter berdasarkan proyek, prioritas, atau penanggung jawab.
- **Drag-and-drop** antar kolom maupun pengurutan posisi (`position`) dalam kolom, dengan penyimpanan langsung ke database TiDB melalui Nuxt Server API.

### F. Team Management
- Melihat daftar seluruh anggota pada workspace aktif beserta role-nya.
- Mengundang anggota baru ke workspace.
- Mengatur dan memperbarui role anggota (khusus **Owner**).
- Melihat daftar tugas yang sedang ditangani oleh masing-masing anggota.

### G. Calendar
- Tampilan kalender bulanan/mingguan yang menampilkan:
  - **Deadline tugas** (dengan indikator prioritas/status).
  - **Jadwal proyek** (`start_date` – `due_date`).
- Klik item kalender untuk membuka detail tugas atau proyek terkait.

### H. Reports
Menampilkan laporan analitik workspace:
- Jumlah total proyek.
- Jumlah tugas selesai (`done`).
- Jumlah tugas belum selesai (`todo`, `in_progress`, `review`).
- Jumlah tugas terlambat (*overdue*: `due_date < sekarang` dan status bukan `done`).
- Persentase progres masing-masing proyek.

### I. Settings & Notifications
- **Settings:** Pengaturan profil pengguna dan pengaturan workspace (nama, deskripsi, slug).
- **Notifications:** Pencatatan notifikasi aktivitas (`task_assigned`, `task_status_changed`, `task_commented`, `task_due_soon`, `workspace_invited`, `project_added`) dengan status baca (`is_read`).

---

## 6. Spesifikasi UI/UX & Navigasi

- **Gaya Desain:** SaaS modern, minimalis, profesional (terinspirasi dari kerapian Linear, Asana, dan ClickUp tanpa menyalin tampilannya).
- **Palet Warna:** Utama **Indigo / Violet**, latar belakang **putih & abu-abu muda** (`slate-50`).
- **Tata Letak:**
  - **Sidebar kiri** (kolapsibel di mobile/tablet) dengan menu:
    1. `Dashboard`
    2. `My Tasks`
    3. `Projects`
    4. `Kanban Board`
    5. `Calendar`
    6. `Team`
    7. `Reports`
    8. `Settings`
  - **Navbar atas** (workspace switcher, pencarian cepat/aksi, notifikasi, menu profil & logout).
- **Kualitas State UI:** Setiap halaman dan komponen wajib menyediakan *loading state*, *error state*, dan *empty state* yang informatif.
- **Responsif:** Mendukung desktop, tablet, dan mobile.

---

## 7. Arsitektur Teknis & Database

### 7.1 Tech Stack
- **Frontend:** Nuxt 4, Vue 3 Composition API, TypeScript, Tailwind CSS v4, Nuxt UI, Lucide Icons.
- **Backend:** Nuxt Server API (Nitro) dengan validasi `zod`.
- **Database:** TiDB (MySQL-compatible over TLS) + Drizzle ORM + Drizzle Kit Migrations.

### 7.2 Skema Database (8 Tabel Utama)
1. `users` — data akun pengguna dan `password_hash`.
2. `workspaces` — identitas ruang kerja dan `owner_id`.
3. `workspace_members` — relasi user-workspace beserta `role`.
4. `projects` — proyek dalam workspace beserta status dan rentang tanggal.
5. `project_members` — anggota yang tergabung dalam proyek.
6. `tasks` — tugas dengan `status`, `priority`, `position`, `assignee_id`, `due_date`, `completed_at`.
7. `task_comments` — komentar pada setiap tugas.
8. `notifications` — notifikasi per user dan workspace.

---

## 8. Kebutuhan Non-Fungsional

1. **Keamanan:**
   - Password wajib di-hash (mis. `scrypt` / `bcrypt` / `argon2`).
   - Seluruh kredensial database dan `NUXT_SESSION_SECRET` disimpan di environment variables (`.env`).
   - Semua query workspace harus memfilter `workspace_id` setelah verifikasi keanggotaan user.
2. **Integritas Kode:**
   - Pemisahan yang jelas antara UI (`app/`), API handler (`server/api/`), business logic (`server/services/`), dan skema database (`server/database/`).
   - Tidak ada *dummy data* pada fitur yang sudah terhubung ke TiDB.
   - Setiap tombol dan menu navigasi harus berfungsi penuh.

---

## 9. Roadmap Implementasi Bertahap

| Tahap | Fokus Pengerjaan | Status |
| --- | --- | --- |
| **Tahap 1** | Inisialisasi Nuxt 4, Tailwind CSS, Nuxt UI, TiDB, Drizzle ORM, struktur folder, skema 8 tabel, & dokumentasi arsitektur | **Selesai** |
| **Tahap 2** | Migrasi database ke TiDB, sistem registrasi, login, logout, session, & proteksi middleware | Berikutnya |
| **Tahap 3** | Manajemen workspace, workspace switcher, undangan/pengelolaan anggota, & RBAC | Direncanakan |
| **Tahap 4** | CRUD proyek, anggota proyek, CRUD tugas, komentar tugas, & halaman My Tasks | Direncanakan |
| **Tahap 5** | Dashboard statistik/grafik & Kanban Board interaktif (drag-and-drop tersimpan ke DB) | Direncanakan |
| **Tahap 6** | Kalender deadline/jadwal proyek, halaman Reports, Settings, & Notifikasi | Direncanakan |
