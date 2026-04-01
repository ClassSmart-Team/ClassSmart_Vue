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
}

export interface Unit{
  id: number
  name: string
  group_id: number
  group?:Group
  assignments_count?:number
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