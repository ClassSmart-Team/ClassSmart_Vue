export interface Register {
  name: string
  lastname: string
  email: string
  password: string
  cellphone: string
}

export interface Login {
  email: string
  password: string
}
export interface SessionData {
  token: string
  user: User
}
export interface User {
  id: number
  name: string
  lastname: string
  email: string
  cellphone: string
  active: boolean
  role: Role
}
export interface Role {
  id: number
  description: string
  created_at: string
  updated_at: string
}

export interface GroupData {
  period_id: number
  name: string
  description: string
  active: true
}

export interface formgroup {
  name: string
  description: string
  period_id: number
  active: true
}
export interface UnitRequest {
  group_id:number,
  name:string,
  order:number,
  start_date:string,
  end_date:string
}

export type formtask = {
  title: string
  description: string
  start_date: string
  end_date: string
  status: string
  group_id: number | null
  unit_id: number | null
}
// Cada interfaz representa una "forma" de objeto diferente

export interface Owner {
  id: number
  name: string
  lastname: string
  email: string
  cellphone: string
  active: boolean
  created_at: string | null
  updated_at: string | null
}

export interface Period {
  id: number
  name: string
  year: number
  start_date: string
  end_date: string
  created_at: string | null
  updated_at: string | null
}

export interface Group {
  id: number
  name: string
  description: string
  active: boolean
  owner: Owner
  period: Period
  students_count: number
  assignments_count: number
  created_at: string | null
  updated_at: string | null
  units?: Unit[]
}

export interface Unit{
  id: number
  name: string
  group_id: number
  group?:Group
  assignments_count?:number
  start_date: string
  end_date: string
  created_at: string | null
  updated_at: string | null

}

export interface FormTask{
  title: string
  description: string
  start_date: string
  end_date: string
  status: string
  group_id: number | null
  unit_id: number | null
}

export interface ChatUser {
  id: number
  name: string
  lastname: string
  email: string
}

export interface ChatMessage {
  id: number
  chat_id: number
  content: string
  user?: ChatUser
  created_at: string
  updated_at: string
}

export interface Chat {
  id: number
  name: string | null
  is_private?: boolean
  users?: ChatUser[]
  messages?: ChatMessage[]
  users_count?: number
  messages_count?: number
  created_at: string
  updated_at: string
}


/*PARENT*/
export interface Child {
  id: number
  name: string
  lastname?: string
  email: string
  active?: string
  groups?: Group[]
}

export interface ScheduleItem {
  day: string
  start_time: string
  end_time: string
  subject_name: string
  teacher_name: string
}

export interface ParentActivity {
  id: number | null
  childId: number
  child: string
  title: string | null
  description: string | null
  subject: string
  end_date: string | null
  unit_id: number
  unit_name: string
  status: string // 'Pendiente', 'Atrasado', 'Entregado', 'Calificado', 'Tardia'
  submission?: {
    status: string
    grade: number | null
  } | null
}

export interface GroupedChild {
  childName: string
  childId: number
  subjects: Record< //como un array pero mejor <llave, array>, mas facil y directo en busqueda
    string,
    {
      name: string
      units: Record<
        string,
        {
          name: string
          id: number | null
          tasks: ParentActivity[]
        }
      >
      totalTasks: number
    }
  >
}

export interface Announcement {
  id: number
  title: string
  message: string
  created_at: string
  attachment_path?: string | null
  attachment_name?: string | null
  group?: Group | null
}

export interface GroupedForum {
  group: Group
  latestAnnouncement: Announcement | null | undefined
  count: number
}

export interface GradeRecord {
  id: number
  grade: number
  student: { id: number; name: string; lastname: string }
  group: { id: number; name: string; teacher?: string }
  unit: { id: number; name: string; order: number }
}

export interface Notifications {
  id: number
  title: string
  message?: string
  read_at: string | null
  created_at: string
  type?: string
  // Datos adicionales que el padre recibe
  student_name?: string
  group?: { id: number; name: string }
  creator?: { id: number; name: string; lastname: string }
}
