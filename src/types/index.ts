import { z } from 'zod';

// ==========================================
// USER ROLES
// ==========================================

export const UserRole = z.enum(['job_seeker', 'employer', 'admin']);
export type UserRole = z.infer<typeof UserRole>;

export const UserStatus = z.enum(['active', 'disabled']);
export type UserStatus = z.infer<typeof UserStatus>;

// ==========================================
// USER
// ==========================================

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: UserRole,
  photoURL: z.string().url().optional(),
  phone: z.string().optional(),
  status: UserStatus,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;

// ==========================================
// JOB SEEKER PROFILE
// ==========================================

export const ExperienceItemSchema = z.object({
  company: z.string(),
  role: z.string(),
  startDate: z.date(),
  endDate: z.date().optional(),
  description: z.string().optional(),
  current: z.boolean().default(false),
});

export type ExperienceItem = z.infer<typeof ExperienceItemSchema>;

export const EducationItemSchema = z.object({
  institution: z.string(),
  degree: z.string(),
  fieldOfStudy: z.string().optional(),
  startDate: z.date(),
  endDate: z.date().optional(),
  current: z.boolean().default(false),
});

export type EducationItem = z.infer<typeof EducationItemSchema>;

export const ProfileVisibility = z.enum(['public', 'private']);
export type ProfileVisibility = z.infer<typeof ProfileVisibility>;

export const JobSeekerProfileSchema = z.object({
  id: z.string(),
  userId: z.string(),
  headline: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().optional(),
  skills: z.array(z.string()),
  experience: z.array(ExperienceItemSchema),
  education: z.array(EducationItemSchema),
  cvUrl: z.string().url().optional(),
  cvFileName: z.string().optional(),
  visibility: ProfileVisibility,
  linkedinUrl: z.string().url().optional(),
  portfolioUrl: z.string().url().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type JobSeekerProfile = z.infer<typeof JobSeekerProfileSchema>;

// ==========================================
// ORGANISATION
// ==========================================

export const SocialLinkSchema = z.object({
  type: z.enum(['linkedin', 'twitter', 'facebook', 'instagram', 'other']),
  url: z.string().url(),
});

export type SocialLink = z.infer<typeof SocialLinkSchema>;

export const OrganisationStatus = z.enum(['active', 'suspended']);
export type OrganisationStatus = z.infer<typeof OrganisationStatus>;

export const OrganisationSchema = z.object({
  id: z.string(),
  ownerUserId: z.string(),
  name: z.string(),
  logoUrl: z.string().url().optional(),
  description: z.string().optional(),
  website: z.string().url().optional(),
  socialLinks: z.array(SocialLinkSchema),
  industry: z.string().optional(),
  size: z.string().optional(),
  address: z.string().optional(),
  status: OrganisationStatus,
  featured: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Organisation = z.infer<typeof OrganisationSchema>;

// ==========================================
// JOB
// ==========================================

export const RemoteType = z.enum(['remote', 'hybrid', 'onsite']);
export type RemoteType = z.infer<typeof RemoteType>;

export const JobType = z.enum([
  'full_time',
  'part_time',
  'contract',
  'internship',
  'temporary',
  'freelance',
]);
export type JobType = z.infer<typeof JobType>;

export const ApplicationMethod = z.enum(['external', 'internal']);
export type ApplicationMethod = z.infer<typeof ApplicationMethod>;

export const JobStatus = z.enum(['draft', 'published', 'closed']);
export type JobStatus = z.infer<typeof JobStatus>;

export const JobSchema = z.object({
  id: z.string(),
  orgId: z.string(),
  createdByUserId: z.string(),
  title: z.string(),
  slug: z.string(),
  location: z.string(),
  remoteType: RemoteType,
  jobType: JobType,
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  currency: z.string().default('ZAR'),
  description: z.string(),
  requirements: z.string(),
  benefits: z.string().optional(),
  applicationMethod: ApplicationMethod,
  externalUrl: z.string().url().optional(),
  status: JobStatus,
  publishedAt: z.date().optional(),
  expiresAt: z.date().optional(),
  viewCount: z.number().default(0),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Job = z.infer<typeof JobSchema>;

// Job with populated organisation data
export type JobWithOrg = Job & {
  organisation: Organisation;
};

// ==========================================
// APPLICATION
// ==========================================

export const ApplicationStatus = z.enum([
  'submitted',
  'viewed',
  'shortlisted',
  'rejected',
  'hired',
  'withdrawn',
]);
export type ApplicationStatus = z.infer<typeof ApplicationStatus>;

export const ApplicationSchema = z.object({
  id: z.string(),
  jobId: z.string(),
  orgId: z.string(),
  applicantUserId: z.string(),
  status: ApplicationStatus,
  coverLetter: z.string().optional(),
  cvUrlOverride: z.string().url().optional(),
  aiScore: z.number().min(0).max(100).optional(),
  aiReasoning: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Application = z.infer<typeof ApplicationSchema>;

// Application with populated job and applicant data
export type ApplicationWithDetails = Application & {
  job: Job;
  applicant: User;
  applicantProfile?: JobSeekerProfile;
};

// ==========================================
// PLANS & SUBSCRIPTIONS
// ==========================================

export const PlanType = z.enum(['single', 'bundle', 'subscription']);
export type PlanType = z.infer<typeof PlanType>;

export const PlanSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: PlanType,
  price: z.number(),
  currency: z.string().default('ZAR'),
  jobCredits: z.number().optional(), // For single or bundle
  durationMonths: z.number().optional(), // For subscription
  description: z.string(),
  isActive: z.boolean(),
  features: z.array(z.string()).optional(),
});

export type Plan = z.infer<typeof PlanSchema>;

export const SubscriptionStatus = z.enum([
  'active',
  'expired',
  'cancelled',
  'pending',
]);
export type SubscriptionStatus = z.infer<typeof SubscriptionStatus>;

export const SubscriptionSchema = z.object({
  id: z.string(),
  orgId: z.string(),
  userId: z.string(),
  planId: z.string(),
  type: PlanType,
  status: SubscriptionStatus,
  remainingJobCredits: z.number().optional(),
  startedAt: z.date(),
  expiresAt: z.date().optional(),
  paystackRef: z.string().optional(),
  lastPaymentStatus: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Subscription = z.infer<typeof SubscriptionSchema>;

// ==========================================
// JOB ALERTS
// ==========================================

export const AlertFrequency = z.enum(['daily', 'weekly']);
export type AlertFrequency = z.infer<typeof AlertFrequency>;

export const AlertCriteriaSchema = z.object({
  keywords: z.array(z.string()).optional(),
  location: z.string().optional(),
  radiusKm: z.number().optional(),
  jobType: JobType.optional(),
  remoteType: RemoteType.optional(),
  salaryMin: z.number().optional(),
});

export type AlertCriteria = z.infer<typeof AlertCriteriaSchema>;

export const AlertSchema = z.object({
  id: z.string(),
  userId: z.string(),
  criteria: AlertCriteriaSchema,
  frequency: AlertFrequency,
  lastSentAt: z.date().optional(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Alert = z.infer<typeof AlertSchema>;

// ==========================================
// ADMIN LOGS
// ==========================================

export const AdminLogSchema = z.object({
  id: z.string(),
  adminUserId: z.string(),
  actionType: z.string(),
  targetCollection: z.string(),
  targetId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.date(),
});

export type AdminLog = z.infer<typeof AdminLogSchema>;

// ==========================================
// SAVED JOBS
// ==========================================

export const SavedJobSchema = z.object({
  id: z.string(),
  userId: z.string(),
  jobId: z.string(),
  createdAt: z.date(),
});

export type SavedJob = z.infer<typeof SavedJobSchema>;
