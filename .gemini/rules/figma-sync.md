# Sinkronisasi Desain Antigravity ↔ Figma (Taskora)

Proyek **Taskora** terhubung dengan file Figma Design:
- **Figma File Key:** `YBZg0vOF0CTWVRDmR93tJT`
- **Figma URL:** https://www.figma.com/design/YBZg0vOF0CTWVRDmR93tJT

## Pemetaan Layar & Node ID

| Halaman / Komponen di Kode | Frame di Figma | Node ID |
| --- | --- | --- |
| `app/components/TaskoraLogo.vue` | `00 — Logo Concepts (Taskora)` | `6:2` |
| `app/pages/index.vue` | `01 — Dashboard` (v1) / `01 : Dashboard Anti-Slop (Final)` | `2:20` / `23:2` |
| `app/pages/my-tasks.vue` | `02 — My Tasks` (v1) / `02 — My Tasks Interactive (v3)` | `2:136` / `20:180` |
| `app/pages/projects/index.vue` | `03 — Projects` | `3:2` |
| `app/pages/projects/[id].vue` | `03 — Project Detail & Galeri Bukti (v3)` | `20:248` |
| `app/pages/kanban.vue` | `04 — Kanban Board` | `3:83` |
| `app/pages/team.vue` | `04 — Team & Single Owner RBAC (v2)` | `18:232` |
| `app/components/TaskDetailModal.vue` | `05 — Modal Buat Tugas & Bukti` (v1) / `04 — Interactive States & Searchable Modal (v3)` | `3:204` / `20:301` |

## Aturan Sinkronisasi
- Setiap kali pengguna mengubah tampilan UI, komponen, warna, atau layout di `app/` dan meminta pembaruan atau sinkronisasi desain, perbarui juga node terkait di file Figma `YBZg0vOF0CTWVRDmR93tJT` menggunakan `use_figma` (dengan skill `figma-use` dan `figma-generate-design`).
- Pertahankan tema Light Mode (putih `#FFFFFF`, canvas `#F8FAFC`, utama Indigo `#4F46E5`, font `Inter`).
