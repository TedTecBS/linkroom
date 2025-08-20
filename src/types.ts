export type Role = 'admin' | 'company' | 'user'

export type Job = {
  id: string
  title: string
  description: string
  companyName: string
  isAdminPost: boolean
  createdBy: string
  createdAt?: { seconds: number; nanoseconds: number } | null
  status?: string
  postedAt?: { seconds: number; nanoseconds: number } | null
}
