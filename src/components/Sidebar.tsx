import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Bookmark,
  Bell,
  Building2,
  Users,
  Settings,
  CreditCard,
  BarChart3,
  Shield,
} from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: ('job_seeker' | 'employer' | 'admin')[];
}

const navItems: NavItem[] = [
  // Job Seeker
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['job_seeker'],
  },
  {
    label: 'My Profile',
    href: '/dashboard/profile',
    icon: Users,
    roles: ['job_seeker'],
  },
  {
    label: 'Applications',
    href: '/dashboard/applications',
    icon: FileText,
    roles: ['job_seeker'],
  },
  {
    label: 'Saved Jobs',
    href: '/dashboard/saved-jobs',
    icon: Bookmark,
    roles: ['job_seeker'],
  },
  {
    label: 'Job Alerts',
    href: '/dashboard/job-alerts',
    icon: Bell,
    roles: ['job_seeker'],
  },

  // Employer
  {
    label: 'Dashboard',
    href: '/employer',
    icon: LayoutDashboard,
    roles: ['employer'],
  },
  {
    label: 'My Jobs',
    href: '/employer/jobs',
    icon: Briefcase,
    roles: ['employer'],
  },
  {
    label: 'Applications',
    href: '/employer/applications',
    icon: FileText,
    roles: ['employer'],
  },
  {
    label: 'Company Profile',
    href: '/employer/company',
    icon: Building2,
    roles: ['employer'],
  },
  {
    label: 'Billing',
    href: '/employer/billing',
    icon: CreditCard,
    roles: ['employer'],
  },

  // Admin
  {
    label: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    roles: ['admin'],
  },
  {
    label: 'Users',
    href: '/admin/users',
    icon: Users,
    roles: ['admin'],
  },
  {
    label: 'Jobs',
    href: '/admin/jobs',
    icon: Briefcase,
    roles: ['admin'],
  },
  {
    label: 'Organisations',
    href: '/admin/organisations',
    icon: Building2,
    roles: ['admin'],
  },
  {
    label: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    roles: ['admin'],
  },
  {
    label: 'Logs',
    href: '/admin/logs',
    icon: Shield,
    roles: ['admin'],
  },
];

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const filteredNavItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(user.role)
  );

  return (
    <aside className="hidden w-64 border-r bg-white md:block">
      <div className="flex h-16 items-center border-b px-6">
        <Link to="/" className="flex items-center space-x-2">
          <Briefcase className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">Linkroom</span>
        </Link>
      </div>

      <nav className="space-y-1 p-4">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 w-64 border-t p-4">
        <Link
          to="/settings"
          className="flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          <Settings className="h-5 w-5" />
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
};
