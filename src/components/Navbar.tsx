import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Menu } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '@/features/auth/useAuth';

export const Navbar: React.FC = () => {
  const { user } = useAuth();

  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Briefcase className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Linkroom</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center space-x-6 md:flex">
            <Link
              to="/jobs"
              className="text-sm font-medium text-gray-700 hover:text-primary"
            >
              Find Jobs
            </Link>
            <Link
              to="/companies"
              className="text-sm font-medium text-gray-700 hover:text-primary"
            >
              Companies
            </Link>

            {user ? (
              <Link
                to={
                  user.role === 'admin'
                    ? '/admin'
                    : user.role === 'employer'
                    ? '/employer'
                    : '/dashboard'
                }
              >
                <Button>Dashboard</Button>
              </Link>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button variant="ghost">Log In</Button>
                </Link>
                <Link to="/signup">
                  <Button>Sign Up</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden">
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
    </nav>
  );
};
