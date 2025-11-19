import React from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Loader2, Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/features/auth/useAuth';
import { jobSeekerProfileDoc } from '@/lib/firestore-collections';
import { JobSeekerProfile } from '@/types';
import { getDoc, setDoc } from 'firebase/firestore';
import { CvUploadCard } from '@/features/job-seeker/components/CvUploadCard';

const ExperienceFormSchema = z.object({
  company: z.string().min(2, 'Company name is required'),
  role: z.string().min(2, 'Role is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  description: z.string().max(1000).optional().or(z.literal('')),
});

const EducationFormSchema = z.object({
  institution: z.string().min(2, 'Institution is required'),
  degree: z.string().min(2, 'Degree or qualification is required'),
  fieldOfStudy: z.string().optional().or(z.literal('')),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
});

const profileSchema = z.object({
  headline: z
    .string()
    .min(3, 'Headline must be at least 3 characters')
    .max(120, 'Headline is too long'),
  location: z.string().min(2, 'Location is required'),
  bio: z.string().max(2000, 'Bio cannot exceed 2000 characters').optional().or(z.literal('')),
  skills: z.array(z.string().min(1)).default([]),
  linkedinUrl: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  portfolioUrl: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  visibility: z.enum(['public', 'private']).default('public'),
  experience: z.array(ExperienceFormSchema).default([]),
  education: z.array(EducationFormSchema).default([]),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const createEmptyExperience = () => ({
  company: '',
  role: '',
  startDate: '',
  endDate: '',
  current: false,
  description: '',
});

const createEmptyEducation = () => ({
  institution: '',
  degree: '',
  fieldOfStudy: '',
  startDate: '',
  endDate: '',
  current: false,
});

const defaultValues: ProfileFormValues = {
  headline: '',
  location: '',
  bio: '',
  skills: [],
  linkedinUrl: '',
  portfolioUrl: '',
  visibility: 'public',
  experience: [createEmptyExperience()],
  education: [createEmptyEducation()],
};

const formatDateInput = (date?: Date | null) => {
  if (!date) return '';
  return date.toISOString().split('T')[0];
};

const mapProfileToFormValues = (profile: JobSeekerProfile): ProfileFormValues => ({
  headline: profile.headline ?? '',
  location: profile.location ?? '',
  bio: profile.bio ?? '',
  skills: profile.skills ?? [],
  linkedinUrl: profile.linkedinUrl ?? '',
  portfolioUrl: profile.portfolioUrl ?? '',
  visibility: profile.visibility ?? 'public',
  experience:
    profile.experience?.map((item) => ({
      company: item.company ?? '',
      role: item.role ?? '',
      startDate: formatDateInput(item.startDate),
      endDate: item.current ? '' : formatDateInput(item.endDate),
      current: Boolean(item.current),
      description: item.description ?? '',
    })) ?? [createEmptyExperience()],
  education:
    profile.education?.map((item) => ({
      institution: item.institution ?? '',
      degree: item.degree ?? '',
      fieldOfStudy: item.fieldOfStudy ?? '',
      startDate: formatDateInput(item.startDate),
      endDate: item.current ? '' : formatDateInput(item.endDate),
      current: Boolean(item.current),
    })) ?? [createEmptyEducation()],
});

const mapFormToFirestorePayload = (
  values: ProfileFormValues,
  userId: string,
  base: JobSeekerProfile | null
) => {
  const trimmedSkills = values.skills.map((skill) => skill.trim()).filter(Boolean);

  return {
    userId: userId || base?.userId || '',
    headline: values.headline.trim(),
    location: values.location.trim(),
    bio: values.bio?.trim() || null,
    skills: trimmedSkills,
    linkedinUrl: values.linkedinUrl?.trim() || null,
    portfolioUrl: values.portfolioUrl?.trim() || null,
    visibility: values.visibility,
    experience: values.experience.map((exp) => ({
      company: exp.company.trim(),
      role: exp.role.trim(),
      startDate: exp.startDate ? new Date(exp.startDate) : null,
      endDate: exp.current || !exp.endDate ? null : new Date(exp.endDate),
      current: exp.current,
      description: exp.description?.trim() || null,
    })),
    education: values.education.map((edu) => ({
      institution: edu.institution.trim(),
      degree: edu.degree.trim(),
      fieldOfStudy: edu.fieldOfStudy?.trim() || null,
      startDate: edu.startDate ? new Date(edu.startDate) : null,
      endDate: edu.current || !edu.endDate ? null : new Date(edu.endDate),
      current: edu.current,
    })),
    updatedAt: new Date(),
  };
};

const ErrorText: React.FC<{ message?: string }> = ({ message }) => {
  if (!message) return null;
  return <p className="text-sm text-destructive">{message}</p>;
};

export const JobSeekerProfile: React.FC = () => {
  const { user, firebaseUser } = useAuth();
  const profileId = user?.id ?? firebaseUser?.uid ?? '';
  const queryClient = useQueryClient();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues,
    mode: 'onBlur',
  });

  const {
    fields: experienceFields,
    append: appendExperience,
    remove: removeExperience,
  } = useFieldArray({ name: 'experience', control: form.control });

  const {
    fields: educationFields,
    append: appendEducation,
    remove: removeEducation,
  } = useFieldArray({ name: 'education', control: form.control });

  const [skillInput, setSkillInput] = React.useState('');

  const profileQuery = useQuery({
    queryKey: ['job-seeker-profile', profileId],
    enabled: Boolean(profileId),
    queryFn: async () => {
      const snapshot = await getDoc(jobSeekerProfileDoc(profileId));
      return snapshot.exists() ? snapshot.data() : null;
    },
  });

  React.useEffect(() => {
    if (profileQuery.data) {
      form.reset(mapProfileToFormValues(profileQuery.data));
    }
  }, [profileQuery.data, form]);

  const refreshProfile = React.useCallback(async () => {
    if (!profileId) return;
    await queryClient.invalidateQueries({ queryKey: ['job-seeker-profile', profileId] });
  }, [profileId, queryClient]);

  const saveMutation = useMutation({
    mutationKey: ['update-job-seeker-profile', profileId],
    mutationFn: async (values: ProfileFormValues) => {
      if (!profileId) {
        throw new Error('Missing profile identifier');
      }
      const payload = mapFormToFirestorePayload(values, profileId, profileQuery.data);
      await setDoc(jobSeekerProfileDoc(profileId), payload, { merge: true });
    },
    onSuccess: async () => {
      await refreshProfile();
      toast.success('Profile updated');
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Failed to save profile';
      toast.error(message);
    },
  });

  const handleAddExperience = () => {
    appendExperience(createEmptyExperience());
  };

  const handleAddEducation = () => {
    appendEducation(createEmptyEducation());
  };

  const handleAddSkill = (fieldValue: string[], onChange: (value: string[]) => void) => {
    const trimmed = skillInput.trim();
    if (!trimmed || fieldValue.includes(trimmed)) return;
    onChange([...fieldValue, trimmed]);
    setSkillInput('');
  };

  const handleRemoveSkill = (index: number, fieldValue: string[], onChange: (value: string[]) => void) => {
    const next = fieldValue.filter((_, i) => i !== index);
    onChange(next);
  };

  const onSubmit = (values: ProfileFormValues) => {
    saveMutation.mutate(values);
  };

  const isLoading = profileQuery.isLoading || !profileId;
  const isSaving = saveMutation.isPending;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">
          Keep your details up to date so employers can find you faster.
        </p>
      </div>

      {profileQuery.isError && (
        <Card>
          <CardContent className="py-6">
            <p className="text-sm text-destructive">
              Unable to load your profile right now. Please try again in a moment.
            </p>
          </CardContent>
        </Card>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              This content appears on your public Linkroom profile.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Professional headline</label>
                <Input
                  placeholder="Senior Software Engineer"
                  disabled={isLoading || isSaving}
                  {...form.register('headline')}
                />
                <ErrorText message={form.formState.errors.headline?.message} />
              </div>
              <div>
                <label className="text-sm font-medium">Location</label>
                <Input
                  placeholder="Johannesburg, South Africa"
                  disabled={isLoading || isSaving}
                  {...form.register('location')}
                />
                <ErrorText message={form.formState.errors.location?.message} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Bio</label>
                <span className="text-xs text-muted-foreground">Max 2000 characters</span>
              </div>
              <Textarea
                rows={5}
                placeholder="Summarise your experience, strengths, and career goals."
                disabled={isLoading || isSaving}
                {...form.register('bio')}
              />
              <ErrorText message={form.formState.errors.bio?.message} />
            </div>

            <Controller
              name="skills"
              control={form.control}
              render={({ field }) => (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Skills</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g. Product Strategy"
                      value={skillInput}
                      disabled={isLoading || isSaving}
                      onChange={(event) => setSkillInput(event.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isLoading || isSaving || !skillInput.trim()}
                      onClick={() => handleAddSkill(field.value ?? [], field.onChange)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(field.value ?? []).map((skill, index) => (
                      <span
                        key={`${skill}-${index}`}
                        className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-sm"
                      >
                        {skill}
                        <button
                          type="button"
                          className="text-muted-foreground hover:text-foreground"
                          onClick={() => handleRemoveSkill(index, field.value ?? [], field.onChange)}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                    {(field.value ?? []).length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        Add at least three skills to improve your matches.
                      </p>
                    )}
                  </div>
                  <ErrorText message={form.formState.errors.skills?.message as string | undefined} />
                </div>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium">LinkedIn URL</label>
                <Input
                  placeholder="https://linkedin.com/in/username"
                  disabled={isLoading || isSaving}
                  {...form.register('linkedinUrl')}
                />
                <ErrorText message={form.formState.errors.linkedinUrl?.message} />
              </div>
              <div>
                <label className="text-sm font-medium">Portfolio URL</label>
                <Input
                  placeholder="https://yourportfolio.com"
                  disabled={isLoading || isSaving}
                  {...form.register('portfolioUrl')}
                />
                <ErrorText message={form.formState.errors.portfolioUrl?.message} />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Profile visibility</label>
              <select
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                disabled={isLoading || isSaving}
                {...form.register('visibility')}
              >
                <option value="public">Public – recruiters can find you</option>
                <option value="private">Private – only you can view</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <CvUploadCard
          profileId={profileId}
          cvUrl={profileQuery.data?.cvUrl}
          cvFileName={profileQuery.data?.cvFileName}
          onUpdated={refreshProfile}
          disabled={!profileId || isLoading || isSaving}
        />

        <Card>
          <CardHeader>
            <CardTitle>Experience</CardTitle>
            <CardDescription>Showcase the roles you have held.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {experienceFields.map((field, index) => (
              <div key={field.id} className="space-y-4 rounded-md border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">Position {index + 1}</span>
                  {experienceFields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      disabled={isLoading || isSaving}
                      onClick={() => removeExperience(index)}
                    >
                      <Trash2 className="mr-1 h-4 w-4" /> Remove
                    </Button>
                  )}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Company</label>
                    <Input
                      disabled={isLoading || isSaving}
                      {...form.register(`experience.${index}.company` as const)}
                    />
                    <ErrorText
                      message={
                        form.formState.errors.experience?.[index]?.company?.message as string | undefined
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Role</label>
                    <Input
                      disabled={isLoading || isSaving}
                      {...form.register(`experience.${index}.role` as const)}
                    />
                    <ErrorText
                      message={
                        form.formState.errors.experience?.[index]?.role?.message as string | undefined
                      }
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Start date</label>
                    <Input
                      type="date"
                      disabled={isLoading || isSaving}
                      {...form.register(`experience.${index}.startDate` as const)}
                    />
                    <ErrorText
                      message={
                        form.formState.errors.experience?.[index]?.startDate?.message as string | undefined
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">End date</label>
                    <Input
                      type="date"
                      disabled={isLoading || isSaving || form.watch(`experience.${index}.current`)}
                      {...form.register(`experience.${index}.endDate` as const)}
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border" 
                    disabled={isLoading || isSaving}
                    {...form.register(`experience.${index}.current` as const)}
                  />
                  I currently work here
                </label>
                <div>
                  <label className="text-sm font-medium">Highlights</label>
                  <Textarea
                    rows={3}
                    disabled={isLoading || isSaving}
                    {...form.register(`experience.${index}.description` as const)}
                  />
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isLoading || isSaving}
              onClick={handleAddExperience}
            >
              <Plus className="mr-2 h-4 w-4" /> Add experience
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Education</CardTitle>
            <CardDescription>Share your qualifications and courses.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {educationFields.map((field, index) => (
              <div key={field.id} className="space-y-4 rounded-md border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">Entry {index + 1}</span>
                  {educationFields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      disabled={isLoading || isSaving}
                      onClick={() => removeEducation(index)}
                    >
                      <Trash2 className="mr-1 h-4 w-4" /> Remove
                    </Button>
                  )}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Institution</label>
                    <Input
                      disabled={isLoading || isSaving}
                      {...form.register(`education.${index}.institution` as const)}
                    />
                    <ErrorText
                      message={
                        form.formState.errors.education?.[index]?.institution?.message as string | undefined
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Degree</label>
                    <Input
                      disabled={isLoading || isSaving}
                      {...form.register(`education.${index}.degree` as const)}
                    />
                    <ErrorText
                      message={
                        form.formState.errors.education?.[index]?.degree?.message as string | undefined
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Field of study</label>
                  <Input
                    disabled={isLoading || isSaving}
                    {...form.register(`education.${index}.fieldOfStudy` as const)}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Start date</label>
                    <Input
                      type="date"
                      disabled={isLoading || isSaving}
                      {...form.register(`education.${index}.startDate` as const)}
                    />
                    <ErrorText
                      message={
                        form.formState.errors.education?.[index]?.startDate?.message as string | undefined
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">End date</label>
                    <Input
                      type="date"
                      disabled={isLoading || isSaving || form.watch(`education.${index}.current`)}
                      {...form.register(`education.${index}.endDate` as const)}
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border"
                    disabled={isLoading || isSaving}
                    {...form.register(`education.${index}.current` as const)}
                  />
                  I currently study here
                </label>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isLoading || isSaving}
              onClick={handleAddEducation}
            >
              <Plus className="mr-2 h-4 w-4" /> Add education
            </Button>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            disabled={isLoading || isSaving || profileQuery.isFetching}
            onClick={() => form.reset(profileQuery.data ? mapProfileToFormValues(profileQuery.data) : defaultValues)}
          >
            Reset
          </Button>
          <Button type="submit" disabled={isLoading || isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save profile
          </Button>
        </div>
      </form>
    </div>
  );
};
