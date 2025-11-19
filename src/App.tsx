import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './features/auth/AuthContext';
import { useAuth } from './features/auth/useAuth';
import { ProtectedRoute } from './features/auth/ProtectedRoute';

// Layouts
import { MainLayout } from './components/layouts/MainLayout';
import { DashboardLayout } from './components/layouts/DashboardLayout';

// Public pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { SignUpPage } from './pages/auth/SignUpPage';
import { JobsPage } from './pages/jobs/JobsPage';
import { JobDetailPage } from './pages/jobs/JobDetailPage';

// Job Seeker pages
import { JobSeekerDashboard } from './pages/job-seeker/Dashboard';
import { JobSeekerProfile } from './pages/job-seeker/Profile';
import { ApplicationsPage } from './pages/job-seeker/ApplicationsPage';
import { SavedJobsPage } from './pages/job-seeker/SavedJobsPage';
import { JobAlertsPage } from './pages/job-seeker/JobAlertsPage';

// Employer pages
import { EmployerDashboard } from './pages/employer/Dashboard';
import { EmployerJobsPage } from './pages/employer/JobsPage';
import { PostJobPage } from './pages/employer/PostJobPage';
import { EditJobPage } from './pages/employer/EditJobPage';
import { EmployerApplicationsPage } from './pages/employer/ApplicationsPage';
import { CompanyProfilePage } from './pages/employer/CompanyProfilePage';
import { BillingPage } from './pages/employer/BillingPage';

// Admin pages
import { AdminDashboard } from './pages/admin/Dashboard';
import { AdminUsersPage } from './pages/admin/UsersPage';
import { AdminJobsPage } from './pages/admin/JobsPage';
import { AdminOrganisationsPage } from './pages/admin/OrganisationsPage';
import { AdminLogsPage } from './pages/admin/LogsPage';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Router component
const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/:slug" element={<JobDetailPage />} />
      </Route>

      {/* Auth routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />

      {/* Job Seeker routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['job_seeker']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<JobSeekerDashboard />} />
        <Route path="profile" element={<JobSeekerProfile />} />
        <Route path="applications" element={<ApplicationsPage />} />
        <Route path="saved-jobs" element={<SavedJobsPage />} />
        <Route path="job-alerts" element={<JobAlertsPage />} />
      </Route>

      {/* Employer routes */}
      <Route
        path="/employer"
        element={
          <ProtectedRoute allowedRoles={['employer']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<EmployerDashboard />} />
        <Route path="jobs" element={<EmployerJobsPage />} />
        <Route path="jobs/new" element={<PostJobPage />} />
        <Route path="jobs/:jobId/edit" element={<EditJobPage />} />
        <Route path="applications" element={<EmployerApplicationsPage />} />
        <Route path="company" element={<CompanyProfilePage />} />
        <Route path="billing" element={<BillingPage />} />
      </Route>

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="jobs" element={<AdminJobsPage />} />
        <Route path="organisations" element={<AdminOrganisationsPage />} />
        <Route path="logs" element={<AdminLogsPage />} />
      </Route>

      {/* Catch all - redirect based on role */}
      <Route
        path="*"
        element={
          user ? (
            <Navigate
              to={
                user.role === 'admin'
                  ? '/admin'
                  : user.role === 'employer'
                  ? '/employer'
                  : '/dashboard'
              }
              replace
            />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
    </Routes>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
          <Toaster position="top-right" />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
