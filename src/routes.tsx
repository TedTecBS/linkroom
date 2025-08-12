import { createBrowserRouter } from 'react-router-dom'
import Home from './pages/Home'
import JobsList from './pages/JobsList'
import JobDetail from './pages/JobDetail'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import CompanyDashboard from './pages/CompanyDashboard'
import App from './App'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'login', element: <Login /> },
      { path: 'jobs', element: <JobsList /> },
      { path: 'jobs/:id', element: <JobDetail /> },
      { path: 'admin', element: <AdminDashboard /> },
      { path: 'company', element: <CompanyDashboard /> }
    ]
  }
])
