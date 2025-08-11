export interface JobInput {
  title: string
  description: string
}

export const adminJobData = (data: JobInput, uid: string) => ({
  title: data.title,
  description: data.description,
  postedByUserId: uid,
  postedByRole: 'admin' as const,
  includeAds: true,
  published: true,
})

export const employerJobData = (
  data: JobInput,
  uid: string,
  companyId: string,
) => ({
  title: data.title,
  description: data.description,
  companyId,
  postedByUserId: uid,
  postedByRole: 'employer' as const,
  includeAds: false,
  published: true,
})
