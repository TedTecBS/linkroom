import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Briefcase, Building2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const LandingPage: React.FC = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-white py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-5xl font-bold tracking-tight">
              Connecting Top Talent with Opportunity
            </h1>
            <p className="mb-8 text-xl text-gray-600">
              Discover your dream job or find the perfect candidate. Linkroom
              makes hiring simple, fast, and effective.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/jobs">
                <Button size="lg" className="w-full sm:w-auto">
                  Find Jobs <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Post a Job
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Why Choose Linkroom?
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <FeatureCard
              icon={<Briefcase className="h-12 w-12 text-primary" />}
              title="Thousands of Jobs"
              description="Browse opportunities from top companies across all industries and experience levels."
            />
            <FeatureCard
              icon={<Building2 className="h-12 w-12 text-primary" />}
              title="Top Companies"
              description="Connect with leading organisations looking for talented professionals like you."
            />
            <FeatureCard
              icon={<Users className="h-12 w-12 text-primary" />}
              title="Smart Matching"
              description="Our AI-powered system matches the right talent with the right opportunities."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-20 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">Ready to Get Started?</h2>
          <p className="mb-8 text-lg opacity-90">
            Join thousands of job seekers and employers on Linkroom today.
          </p>
          <Link to="/signup">
            <Button size="lg" variant="secondary">
              Sign Up Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
}) => {
  return (
    <div className="rounded-lg border bg-white p-6 text-center shadow-sm">
      <div className="mb-4 flex justify-center">{icon}</div>
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};
