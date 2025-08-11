import { describe, expect, it } from 'vitest'
import { adminJobData, employerJobData } from '../functions/src/helpers'

describe('job creation helpers', () => {
  it('admin jobs include ads', () => {
    const job = adminJobData({ title: 't', description: 'd' }, 'u1')
    expect(job.includeAds).toBe(true)
    expect(job.postedByRole).toBe('admin')
  })
  it('employer jobs exclude ads', () => {
    const job = employerJobData({ title: 't', description: 'd' }, 'u1', 'c1')
    expect(job.includeAds).toBe(false)
    expect(job.postedByRole).toBe('employer')
  })
})
