import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '@/integrations/firebase'
import { useEffect, useState } from 'react'
import type { Job } from '@/types'
import JobCard from '@/components/JobCard'
import { Link } from 'react-router-dom'

export default function JobsList() {
  const [jobs, setJobs] = useState<Job[]>([])
  useEffect(() => {
    const q = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setJobs(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })))
    })
    return () => unsub()
  }, [])
  return (
    <div className="mx-auto max-w-5xl p-4">
      <h2 className="text-xl font-semibold mb-4">Latest Jobs</h2>
      {jobs.map(j => <Link key={j.id} to={`/jobs/${j.id}`}><JobCard job={j} /></Link>)}
    </div>
  )
}
