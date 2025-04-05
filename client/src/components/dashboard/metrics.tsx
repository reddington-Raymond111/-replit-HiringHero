import { useQuery } from "@tanstack/react-query";
import { Briefcase, Users, Calendar, Clock } from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  bgColor: string;
  textColor: string;
  linkText: string;
  linkHref: string;
}

const MetricCard = ({ title, value, icon: Icon, bgColor, textColor, linkText, linkHref }: MetricCardProps) => (
  <Card className="overflow-hidden">
    <CardContent className="p-0">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className={`flex-shrink-0 ${bgColor} rounded-md p-3`}>
            <Icon className={`h-5 w-5 ${textColor}`} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-neutral-500 truncate">{title}</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-neutral-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </CardContent>
    <CardFooter className="bg-neutral-50 px-4 py-2">
      <div className="text-sm">
        <Link href={linkHref} className="font-medium text-primary hover:text-primary/80">
          {linkText}
        </Link>
      </div>
    </CardFooter>
  </Card>
);

export default function DashboardMetrics() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['/api/dashboard-stats'],
  });
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Skeleton className="h-12 w-12 rounded-md" />
                <div className="ml-5 flex-1">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-neutral-50 px-4 py-2">
              <Skeleton className="h-4 w-24" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }
  
  if (error) {
    return <div className="text-red-500">Error loading dashboard metrics</div>;
  }
  
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
      <MetricCard 
        title="Active Jobs"
        value={stats?.activeJobs || 0}
        icon={Briefcase}
        bgColor="bg-primary-50"
        textColor="text-primary"
        linkText="View all jobs"
        linkHref="/jobs"
      />
      
      <MetricCard 
        title="Total Candidates"
        value={stats?.totalCandidates || 0}
        icon={Users}
        bgColor="bg-green-50"
        textColor="text-green-600"
        linkText="View all candidates"
        linkHref="/candidates"
      />
      
      <MetricCard 
        title="Interviews This Week"
        value={stats?.interviewsThisWeek || 0}
        icon={Calendar}
        bgColor="bg-orange-50"
        textColor="text-orange-600"
        linkText="View schedule"
        linkHref="/interviews"
      />
      
      <MetricCard 
        title="Avg. Time to Hire"
        value={`${stats?.avgTimeToHire || 0} days`}
        icon={Clock}
        bgColor="bg-neutral-100"
        textColor="text-neutral-600"
        linkText="View analytics"
        linkHref="/analytics"
      />
    </div>
  );
}
