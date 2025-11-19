import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <Briefcase className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Linkroom</span>
            </Link>
            <p className="text-sm text-gray-600">
              Connecting Top Talent with Opportunity
            </p>
          </div>

          {/* For Job Seekers */}
          <div>
            <h3 className="mb-4 font-semibold">For Job Seekers</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link to="/jobs" className="hover:text-primary">
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link to="/companies" className="hover:text-primary">
                  Companies
                </Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-primary">
                  Create Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h3 className="mb-4 font-semibold">For Employers</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link to="/employer" className="hover:text-primary">
                  Post a Job
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-primary">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-primary">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-4 font-semibold">Company</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link to="/about" className="hover:text-primary">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-primary">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} Linkroom. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
