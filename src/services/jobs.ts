import { httpsCallable } from 'firebase/functions'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  type Timestamp,
} from 'firebase/firestore'
import { db, functions } from '../integrations/firebase'

export interface Job {
  id: string
  title: string
  description: string
  companyId?: string
  postedByUserId: string
  postedByRole: 'admin' | 'employer'
  includeAds: boolean
  published: boolean
  createdAt: Timestamp
}

export const postAdminJob = async (data: {
  title: string
  description: string
}) => {
  const callable = httpsCallable(functions, 'postAdminJob')
  await callable(data)
}

export const postEmployerJob = async (data: {
  title: string
  description: string
}) => {
  const callable = httpsCallable(functions, 'postEmployerJob')
  await callable(data)
}

export const getJob = async (id: string) => {
  const snap = await getDoc(doc(db, 'jobs', id))
  if (!snap.exists()) return undefined
  return { id: snap.id, ...(snap.data() as Omit<Job, 'id'>) }
}

export const listJobs = async () => {
  const q = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'))
  const snaps = await getDocs(q)
  return snaps.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Job, 'id'>) }))
}
