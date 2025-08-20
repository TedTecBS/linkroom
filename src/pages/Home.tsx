import { Fragment, useEffect, useState } from 'react'
import {
  db,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  startAfter
} from '@/integrations/firebase'
import type { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore'
import JobCard from '@/components/JobCard'
import AdSlot from '@/components/AdSlot'
import type { Job } from '@/types'

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const fetchJobs = async () => {
    if (loading) return
    setLoading(true)
    let q = query(
      collection(db, 'jobs'),
      where('status', '==', 'published'),
      orderBy('postedAt', 'desc'),
      limit(20)
    )
    if (lastDoc) {
      q = query(
        collection(db, 'jobs'),
        where('status', '==', 'published'),
        orderBy('postedAt', 'desc'),
        startAfter(lastDoc),
        limit(20)
      )
    }
    const snap = await getDocs(q)
    const newJobs = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as Job[]
    setJobs(prev => [...prev, ...newJobs])
    const last = snap.docs[snap.docs.length - 1] || null
    setLastDoc(last)
    setHasMore(snap.docs.length === 20)
    setLoading(false)
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  return (
    <div className="mx-auto max-w-5xl p-4">
      <h1 className="text-2xl font-bold">Welcome to Linkroom</h1>
      <p className="mt-2 text-gray-700">
        Discover jobs. Admin posts include ads to support the platform; company posts are ad‑free with tokens.
      </p>
      <div className="mt-4">
        {jobs.map((job, idx) => (
          <Fragment key={job.id}>
            <JobCard job={job} />
            {(idx + 1) % 4 === 0 && <AdSlot />}
          </Fragment>
        ))}
        {hasMore && (
          <button
            className="block mx-auto mt-4 px-4 py-2 border rounded"
            onClick={fetchJobs}
            disabled={loading}
          >
            {loading ? 'Loading…' : 'Load more'}
          </button>
        )}
      </div>
    </div>
  )
}
