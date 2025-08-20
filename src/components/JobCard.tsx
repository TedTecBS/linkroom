import AdSenseBlock from './AdSense'
import type { Job } from '@/types'
export default function JobCard({ job }: { job: Job }) {
  return (
    <article className="rounded-lg border p-4 mb-4">
        <h3 className="text-lg font-semibold">{job.title}</h3>
        <p className="text-sm text-gray-600">{job.company}</p>
        <p className="mt-2 whitespace-pre-wrap">{job.description}</p>
        {/* Show ads when allowed */}
        {job.showAds && <AdSenseBlock />}
      </article>
    )
  }
