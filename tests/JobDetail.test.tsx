import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import JobDetail from '../src/routes/JobDetail'
import * as jobs from '../src/services/jobs'

vi.mock('../src/services/jobs', () => ({
  getJob: vi.fn(),
}))

const setup = async (job: any) => {
  ;(jobs.getJob as any).mockResolvedValue(job)
  const queryClient = new QueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/jobs/${job.id}`]}>
        <Routes>
          <Route path="/jobs/:id" element={<JobDetail />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('JobDetail', () => {
  it('renders ads when includeAds true', async () => {
    const { container, findByText } = await setup({
      id: '1',
      title: 't',
      description: 'd',
      includeAds: true,
    })
    await findByText('d')
    expect(container.querySelectorAll('.adsbygoogle').length).toBe(2)
  })
  it('does not render ads when includeAds false', async () => {
    const { container, findByText } = await setup({
      id: '1',
      title: 't',
      description: 'd',
      includeAds: false,
    })
    await findByText('d')
    expect(container.querySelectorAll('.adsbygoogle').length).toBe(0)
  })
})
