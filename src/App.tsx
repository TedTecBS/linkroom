import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext'
import JobsList from './routes/JobsList'
import JobDetail from './routes/JobDetail'
import AdminPostJob from './routes/admin/PostJob'
import EmployerPostJob from './routes/employer/PostJob'

const queryClient = new QueryClient()

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<JobsList />} />
          <Route path="/jobs" element={<JobsList />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/admin/post-job" element={<AdminPostJob />} />
          <Route path="/employer/post-job" element={<EmployerPostJob />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </QueryClientProvider>
)

export default App
