import { randomUUID } from 'node:crypto'
import type {
  NotificationType,
  ProjectStatus,
  TaskPriority,
  TaskStatus,
  WorkspaceRole
} from '../../shared/types/domain'

export interface DemoUser {
  id: string
  name: string
  email: string
  avatarUrl: string | null
}

export interface DemoWorkspace {
  id: string
  name: string
  slug: string
  description: string | null
  ownerId: string
  role: WorkspaceRole
}

export interface DemoMember {
  memberId: string
  workspaceId: string
  userId: string
  name: string
  email: string
  avatarUrl: string | null
  role: WorkspaceRole
  joinedAt: string
}

export interface DemoProject {
  id: string
  workspaceId: string
  name: string
  description: string | null
  status: ProjectStatus
  startDate: string | null
  dueDate: string | null
  createdBy: string
  createdAt: string
  updatedAt: string
  memberIds: string[]
}

export interface DemoTask {
  id: string
  workspaceId: string
  projectId: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  position: number
  assigneeId: string | null
  createdBy: string
  dueDate: string | null
  completedAt: string | null
  proofUrl?: string | null
  proofImage?: string | null
  createdAt: string
  updatedAt: string
}

export interface DemoComment {
  id: string
  taskId: string
  userId: string
  authorName: string
  authorAvatar: string | null
  content: string
  createdAt: string
}

export interface DemoNotification {
  id: string
  workspaceId: string
  userId: string
  type: NotificationType
  title: string
  message: string | null
  entityType: string | null
  entityId: string | null
  isRead: boolean
  createdAt: string
}

function daysFromNow(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

function dateOnlyFromNow(days: number): string {
  return daysFromNow(days).slice(0, 10)
}

interface DemoState {
  user: DemoUser
  workspaces: DemoWorkspace[]
  members: DemoMember[]
  projects: DemoProject[]
  tasks: DemoTask[]
  comments: DemoComment[]
  notifications: DemoNotification[]
}

const initialState = (): DemoState => ({
  user: {
    id: 'demo-user-1',
    name: 'Raka Pratama',
    email: 'raka@taskora.id',
    avatarUrl: null
  },
  workspaces: [
    {
      id: 'demo-ws-1',
      name: 'Agensi Kreatif Nusantara',
      slug: 'agensi-kreatif-nusantara',
      description: 'Workspace utama tim desain, pengembangan web, dan kampanye klien.',
      ownerId: 'demo-user-1',
      role: 'owner'
    },
    {
      id: 'demo-ws-2',
      name: 'Studio Produk Digital',
      slug: 'studio-produk-digital',
      description: 'Pengembangan produk internal SaaS dan riset UX.',
      ownerId: 'demo-user-2',
      role: 'member'
    }
  ],
  members: [
    {
      memberId: 'demo-mem-1',
      workspaceId: 'demo-ws-1',
      userId: 'demo-user-1',
      name: 'Raka Pratama',
      email: 'raka@taskora.id',
      avatarUrl: null,
      role: 'owner',
      joinedAt: daysFromNow(-45)
    },
    {
      memberId: 'demo-mem-2',
      workspaceId: 'demo-ws-1',
      userId: 'demo-user-2',
      name: 'Sinta Dewi',
      email: 'sinta@taskora.id',
      avatarUrl: null,
      role: 'member',
      joinedAt: daysFromNow(-40)
    },
    {
      memberId: 'demo-mem-3',
      workspaceId: 'demo-ws-1',
      userId: 'demo-user-3',
      name: 'Dimas Wijaya',
      email: 'dimas@taskora.id',
      avatarUrl: null,
      role: 'member',
      joinedAt: daysFromNow(-30)
    },
    {
      memberId: 'demo-mem-4',
      workspaceId: 'demo-ws-1',
      userId: 'demo-user-4',
      name: 'Nadia Putri',
      email: 'nadia@taskora.id',
      avatarUrl: null,
      role: 'member',
      joinedAt: daysFromNow(-20)
    },
    {
      memberId: 'demo-mem-5',
      workspaceId: 'demo-ws-2',
      userId: 'demo-user-1',
      name: 'Raka Pratama',
      email: 'raka@taskora.id',
      avatarUrl: null,
      role: 'member',
      joinedAt: daysFromNow(-15)
    },
    {
      memberId: 'demo-mem-6',
      workspaceId: 'demo-ws-2',
      userId: 'demo-user-2',
      name: 'Sinta Dewi',
      email: 'sinta@taskora.id',
      avatarUrl: null,
      role: 'owner',
      joinedAt: daysFromNow(-25)
    }
  ],
  projects: [
    {
      id: 'demo-proj-1',
      workspaceId: 'demo-ws-1',
      name: 'Redesign Website Klien',
      description: 'Perombakan tampilan landing page, sistem desain, dan optimasi performa SEO.',
      status: 'active',
      startDate: dateOnlyFromNow(-14),
      dueDate: dateOnlyFromNow(10),
      createdBy: 'demo-user-1',
      createdAt: daysFromNow(-14),
      updatedAt: daysFromNow(-1),
      memberIds: ['demo-user-1', 'demo-user-2', 'demo-user-3']
    },
    {
      id: 'demo-proj-2',
      workspaceId: 'demo-ws-1',
      name: 'Aplikasi Mobile Kasir',
      description: 'Pengembangan modul transaksi, cetak struk thermal, dan sinkronisasi stok.',
      status: 'active',
      startDate: dateOnlyFromNow(-20),
      dueDate: dateOnlyFromNow(18),
      createdBy: 'demo-user-2',
      createdAt: daysFromNow(-20),
      updatedAt: daysFromNow(-2),
      memberIds: ['demo-user-1', 'demo-user-3', 'demo-user-4']
    },
    {
      id: 'demo-proj-3',
      workspaceId: 'demo-ws-1',
      name: 'Kampanye Media Sosial Q4',
      description: 'Produksi konten visual, copywriting, dan jadwal publikasi lintas kanal.',
      status: 'planned',
      startDate: dateOnlyFromNow(2),
      dueDate: dateOnlyFromNow(25),
      createdBy: 'demo-user-1',
      createdAt: daysFromNow(-7),
      updatedAt: daysFromNow(-3),
      memberIds: ['demo-user-2', 'demo-user-4']
    },
    {
      id: 'demo-proj-4',
      workspaceId: 'demo-ws-1',
      name: 'Audit Keamanan & Migrasi Cloud',
      description: 'Peninjauan kontrol akses, enkripsi sesi, dan migrasi database terkelola.',
      status: 'completed',
      startDate: dateOnlyFromNow(-35),
      dueDate: dateOnlyFromNow(-3),
      createdBy: 'demo-user-1',
      createdAt: daysFromNow(-35),
      updatedAt: daysFromNow(-3),
      memberIds: ['demo-user-1', 'demo-user-2']
    },
    {
      id: 'demo-proj-5',
      workspaceId: 'demo-ws-2',
      name: 'Taskora Design System v2',
      description: 'Standarisasi komponen UI, token warna indigo-slate, dan dokumentasi aksesibilitas.',
      status: 'active',
      startDate: dateOnlyFromNow(-10),
      dueDate: dateOnlyFromNow(14),
      createdBy: 'demo-user-2',
      createdAt: daysFromNow(-10),
      updatedAt: daysFromNow(-1),
      memberIds: ['demo-user-1', 'demo-user-2']
    }
  ],
  tasks: [
    {
      id: 'demo-task-1',
      workspaceId: 'demo-ws-1',
      projectId: 'demo-proj-1',
      title: 'Finalisasi wireframe halaman beranda',
      description: 'Menyusun struktur hero section, kartu fitur, dan testimoni klien.',
      status: 'done',
      priority: 'high',
      position: 0,
      assigneeId: 'demo-user-1',
      createdBy: 'demo-user-1',
      dueDate: daysFromNow(-2),
      completedAt: daysFromNow(-2),
      proofUrl: 'https://www.figma.com/file/demo-wireframe-taskora',
      proofImage: null,
      createdAt: daysFromNow(-12),
      updatedAt: daysFromNow(-2)
    },
    {
      id: 'demo-task-2',
      workspaceId: 'demo-ws-1',
      projectId: 'demo-proj-1',
      title: 'Implementasi komponen navbar & sidebar responsif',
      description: 'Pastikan drawer mobile berjalan mulus dan kontras warna sesuai standar.',
      status: 'review',
      priority: 'high',
      position: 0,
      assigneeId: 'demo-user-1',
      createdBy: 'demo-user-2',
      dueDate: daysFromNow(2),
      completedAt: null,
      createdAt: daysFromNow(-8),
      updatedAt: daysFromNow(-1)
    },
    {
      id: 'demo-task-3',
      workspaceId: 'demo-ws-1',
      projectId: 'demo-proj-1',
      title: 'Optimasi Core Web Vitals & kompresi aset',
      description: 'Audit Lighthouse dan lazy-load gambar hero.',
      status: 'in_progress',
      priority: 'medium',
      position: 0,
      assigneeId: 'demo-user-3',
      createdBy: 'demo-user-1',
      dueDate: daysFromNow(5),
      completedAt: null,
      createdAt: daysFromNow(-6),
      updatedAt: daysFromNow(-1)
    },
    {
      id: 'demo-task-4',
      workspaceId: 'demo-ws-1',
      projectId: 'demo-proj-1',
      title: 'Siapkan copywriting halaman pricing',
      description: 'Buat 3 paket harga untuk freelancer, agensi, dan tim berkembang.',
      status: 'todo',
      priority: 'low',
      position: 0,
      assigneeId: 'demo-user-4',
      createdBy: 'demo-user-2',
      dueDate: daysFromNow(8),
      completedAt: null,
      createdAt: daysFromNow(-4),
      updatedAt: daysFromNow(-4)
    },
    {
      id: 'demo-task-5',
      workspaceId: 'demo-ws-1',
      projectId: 'demo-proj-2',
      title: 'Integrasi API cetak struk Bluetooth',
      description: 'Pengujian printer thermal 58mm pada perangkat Android.',
      status: 'in_progress',
      priority: 'high',
      position: 1,
      assigneeId: 'demo-user-1',
      createdBy: 'demo-user-1',
      dueDate: daysFromNow(-1),
      completedAt: null,
      createdAt: daysFromNow(-10),
      updatedAt: daysFromNow(-1)
    },
    {
      id: 'demo-task-6',
      workspaceId: 'demo-ws-1',
      projectId: 'demo-proj-2',
      title: 'Halaman laporan penjualan harian',
      description: 'Menampilkan total omzet, metode pembayaran, dan ekspor CSV.',
      status: 'todo',
      priority: 'medium',
      position: 1,
      assigneeId: 'demo-user-3',
      createdBy: 'demo-user-2',
      dueDate: daysFromNow(6),
      completedAt: null,
      createdAt: daysFromNow(-5),
      updatedAt: daysFromNow(-5)
    },
    {
      id: 'demo-task-7',
      workspaceId: 'demo-ws-1',
      projectId: 'demo-proj-2',
      title: 'Validasi stok minimum & notifikasi kasir',
      description: 'Tampilkan peringatan otomatis ketika stok produk kurang dari 5 unit.',
      status: 'review',
      priority: 'medium',
      position: 1,
      assigneeId: 'demo-user-4',
      createdBy: 'demo-user-1',
      dueDate: daysFromNow(3),
      completedAt: null,
      createdAt: daysFromNow(-7),
      updatedAt: daysFromNow(-2)
    },
    {
      id: 'demo-task-8',
      workspaceId: 'demo-ws-1',
      projectId: 'demo-proj-3',
      title: 'Riset tren konten visual Q4',
      description: 'Kumpulkan 10 referensi kampanye produk B2B SaaS.',
      status: 'todo',
      priority: 'low',
      position: 2,
      assigneeId: 'demo-user-1',
      createdBy: 'demo-user-2',
      dueDate: daysFromNow(12),
      completedAt: null,
      createdAt: daysFromNow(-3),
      updatedAt: daysFromNow(-3)
    },
    {
      id: 'demo-task-9',
      workspaceId: 'demo-ws-1',
      projectId: 'demo-proj-4',
      title: 'Verifikasi SSL & rotasi kunci sesi',
      description: 'Pastikan seluruh cookie menggunakan httpOnly dan sameSite lax.',
      status: 'done',
      priority: 'high',
      position: 1,
      assigneeId: 'demo-user-2',
      createdBy: 'demo-user-1',
      dueDate: daysFromNow(-5),
      completedAt: daysFromNow(-4),
      createdAt: daysFromNow(-15),
      updatedAt: daysFromNow(-4)
    },
    {
      id: 'demo-task-10',
      workspaceId: 'demo-ws-2',
      projectId: 'demo-proj-5',
      title: 'Audit kontras warna badge & tombol',
      description: 'Pastikan rasio kontras memenuhi standar WCAG AA.',
      status: 'in_progress',
      priority: 'high',
      position: 0,
      assigneeId: 'demo-user-1',
      createdBy: 'demo-user-2',
      dueDate: daysFromNow(4),
      completedAt: null,
      createdAt: daysFromNow(-5),
      updatedAt: daysFromNow(-1)
    }
  ],
  comments: [
    {
      id: 'demo-comment-1',
      taskId: 'demo-task-2',
      userId: 'demo-user-2',
      authorName: 'Sinta Dewi',
      authorAvatar: null,
      content: 'Tampilan desktop sudah rapi, tinggal cek jarak padding di layar mobile 375px.',
      createdAt: daysFromNow(-1)
    },
    {
      id: 'demo-comment-2',
      taskId: 'demo-task-2',
      userId: 'demo-user-1',
      authorName: 'Raka Pratama',
      authorAvatar: null,
      content: 'Siap, sudah disesuaikan dan siap di-review ulang.',
      createdAt: daysFromNow(0)
    }
  ],
  notifications: [
    {
      id: 'demo-notif-1',
      workspaceId: 'demo-ws-1',
      userId: 'demo-user-1',
      type: 'task_commented',
      title: 'Komentar baru di "Implementasi komponen navbar & sidebar responsif"',
      message: 'Sinta Dewi: Tampilan desktop sudah rapi, tinggal cek jarak padding di layar mobile.',
      entityType: 'task',
      entityId: 'demo-task-2',
      isRead: false,
      createdAt: daysFromNow(-1)
    },
    {
      id: 'demo-notif-2',
      workspaceId: 'demo-ws-1',
      userId: 'demo-user-1',
      type: 'task_due_soon',
      title: 'Deadline terlewat: Integrasi API cetak struk Bluetooth',
      message: 'Tugas ini melewati tenggat waktu kemarin. Segera perbarui statusnya.',
      entityType: 'task',
      entityId: 'demo-task-5',
      isRead: false,
      createdAt: daysFromNow(0)
    }
  ]
})

let state: DemoState | null = null

export function getDemoState(): DemoState {
  if (!state) {
    state = initialState()
  }
  return state
}

export function getDemoWorkspaceOrThrow(workspaceId: string) {
  const s = getDemoState()
  const ws = s.workspaces.find((w) => w.id === workspaceId)
  if (!ws) {
    throw createError({ statusCode: 404, statusMessage: 'Workspace tidak ditemukan.' })
  }
  return ws
}

export function getDemoProjectsWithStats(workspaceId: string) {
  const s = getDemoState()
  const wsProjects = s.projects.filter((p) => p.workspaceId === workspaceId)
  const wsTasks = s.tasks.filter((t) => t.workspaceId === workspaceId)
  const wsMembers = s.members.filter((m) => m.workspaceId === workspaceId)

  return wsProjects.map((p) => {
    const pTasks = wsTasks.filter((t) => t.projectId === p.id)
    const completedTasks = pTasks.filter((t) => t.status === 'done').length
    const progress = pTasks.length > 0 ? Math.round((completedTasks / pTasks.length) * 100) : 0
    const members = p.memberIds
      .map((uid) => wsMembers.find((m) => m.userId === uid))
      .filter((m): m is DemoMember => Boolean(m))
      .map((m) => ({
        userId: m.userId,
        name: m.name,
        email: m.email,
        avatarUrl: m.avatarUrl
      }))

    return {
      ...p,
      totalTasks: pTasks.length,
      completedTasks,
      progress,
      members
    }
  })
}

export function getDemoProjectDetail(workspaceId: string, projectId: string) {
  const s = getDemoState()
  const project = s.projects.find((p) => p.id === projectId && p.workspaceId === workspaceId)
  if (!project) {
    throw createError({ statusCode: 404, statusMessage: 'Proyek tidak ditemukan.' })
  }
  const wsMembers = s.members.filter((m) => m.workspaceId === workspaceId)
  const projectTasks = s.tasks
    .filter((t) => t.projectId === projectId && t.workspaceId === workspaceId)
    .sort((a, b) => a.position - b.position)
    .map((t) => ({
      ...t,
      assigneeName: wsMembers.find((m) => m.userId === t.assigneeId)?.name || null
    }))
  const completedTasks = projectTasks.filter((t) => t.status === 'done').length
  const progress =
    projectTasks.length > 0 ? Math.round((completedTasks / projectTasks.length) * 100) : 0

  const members = project.memberIds
    .map((uid) => wsMembers.find((m) => m.userId === uid))
    .filter((m): m is DemoMember => Boolean(m))
    .map((m) => ({
      id: m.memberId,
      userId: m.userId,
      name: m.name,
      email: m.email,
      avatarUrl: m.avatarUrl,
      addedAt: m.joinedAt
    }))

  return {
    ...project,
    totalTasks: projectTasks.length,
    completedTasks,
    progress,
    members,
    tasks: projectTasks
  }
}

export function getDemoTasks(
  workspaceId: string,
  filters?: { projectId?: string; assigneeId?: string; status?: TaskStatus; priority?: TaskPriority }
) {
  const s = getDemoState()
  return s.tasks
    .filter((t) => {
      if (t.workspaceId !== workspaceId) return false
      if (filters?.projectId && t.projectId !== filters.projectId) return false
      if (filters?.assigneeId && t.assigneeId !== filters.assigneeId) return false
      if (filters?.status && t.status !== filters.status) return false
      if (filters?.priority && t.priority !== filters.priority) return false
      return true
    })
    .sort((a, b) => a.position - b.position)
    .map((t) => {
      const proj = s.projects.find((p) => p.id === t.projectId)
      const assignee = t.assigneeId
        ? s.members.find((m) => m.workspaceId === workspaceId && m.userId === t.assigneeId)
        : null
      return {
        ...t,
        projectName: proj?.name || 'Proyek',
        assigneeName: assignee?.name || null,
        assigneeAvatar: assignee?.avatarUrl || null
      }
    })
}

export function getDemoDashboard(workspaceId: string) {
  const s = getDemoState()
  const now = Date.now()
  const wsProjects = s.projects.filter((p) => p.workspaceId === workspaceId)
  const wsTasks = getDemoTasks(workspaceId)

  const totalProjects = wsProjects.length
  const activeProjects = wsProjects.filter((p) => p.status === 'active').length
  const totalTasks = wsTasks.length
  const completedTasks = wsTasks.filter((t) => t.status === 'done').length

  return {
    summary: {
      totalProjects,
      activeProjects,
      totalTasks,
      completedTasks,
      overdueCount: wsTasks.filter(
        (t) => t.dueDate && t.status !== 'done' && new Date(t.dueDate).getTime() < now
      ).length,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    },
    statusBreakdown: {
      todo: wsTasks.filter((t) => t.status === 'todo').length,
      in_progress: wsTasks.filter((t) => t.status === 'in_progress').length,
      review: wsTasks.filter((t) => t.status === 'review').length,
      done: completedTasks
    },
    upcomingDeadlines: wsTasks
      .filter((t) => t.dueDate && t.status !== 'done')
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
      .slice(0, 6),
    recentActivities: [...wsTasks]
      .filter((t) => new Date(t.updatedAt).getTime() >= Date.now() - 24 * 60 * 60 * 1000)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 8)
  }
}

export function getDemoReports(workspaceId: string) {
  const s = getDemoState()
  const now = Date.now()
  const wsProjects = s.projects.filter((p) => p.workspaceId === workspaceId)
  const wsTasks = s.tasks.filter((t) => t.workspaceId === workspaceId)
  const completedTasks = wsTasks.filter((t) => t.status === 'done').length

  return {
    metrics: {
      totalProjects: wsProjects.length,
      totalTasks: wsTasks.length,
      completedTasks,
      incompleteTasks: wsTasks.length - completedTasks,
      overdueTasksCount: wsTasks.filter(
        (t) => t.dueDate && t.status !== 'done' && new Date(t.dueDate).getTime() < now
      ).length
    },
    projectProgress: wsProjects.map((p) => {
      const pTasks = wsTasks.filter((t) => t.projectId === p.id)
      const pDone = pTasks.filter((t) => t.status === 'done').length
      const pOverdue = pTasks.filter(
        (t) => t.dueDate && t.status !== 'done' && new Date(t.dueDate).getTime() < now
      ).length
      return {
        id: p.id,
        name: p.name,
        status: p.status,
        totalTasks: pTasks.length,
        completedTasks: pDone,
        incompleteTasks: pTasks.length - pDone,
        overdueTasks: pOverdue,
        progressPercentage: pTasks.length > 0 ? Math.round((pDone / pTasks.length) * 100) : 0,
        dueDate: p.dueDate
      }
    })
  }
}

export function createDemoId(prefix: string): string {
  return `${prefix}-${randomUUID().slice(0, 8)}`
}
