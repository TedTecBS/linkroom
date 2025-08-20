import type { Timestamp } from 'firebase/firestore'

export type FirebaseTimestamp = Timestamp

export type Role = 'admin' | 'company' | 'user'

export type EmploymentType =
  | 'full-time'
  | 'part-time'
  | 'contract'
  | 'temporary'
  | 'internship'
  | 'volunteer'
  | 'other'

export type JobStatus = 'draft' | 'published' | 'closed'

export type Job = {
  id: string
  title: string
  company: string
  location: string
  category: string
  tags: string[]
  employmentType: EmploymentType
  salaryMin?: number
  salaryMax?: number
  currency: string
  summary: string
  description: string
  sourceUrl: string
  applyUrl: string
  postedAt: FirebaseTimestamp
  expiresAt?: FirebaseTimestamp
  source: string
  showAds: boolean
  status: JobStatus
  updatedAt: FirebaseTimestamp
}
