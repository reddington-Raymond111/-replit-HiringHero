import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import DashboardMetrics from "@/components/dashboard/metrics";
import RecentApplications from "@/components/dashboard/recent-applications";
import UpcomingInterviews from "@/components/dashboard/upcoming-interviews";
import RecruitmentPipeline from "@/components/dashboard/recruitment-pipeline";
import JobForm from "@/components/jobs/job-form";

export default function Dashboard() {
  const [jobFormOpen, setJobFormOpen] = useState(false);
  
  return (
    <main className="flex-1 overflow-y-auto bg-neutral-50 p-4 sm:p-6">
      {/* Dashboard Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-800">Dashboard</h2>
            <p className="mt-1 text-sm text-neutral-500">Overview of your recruitment activities</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <Button onClick={() => setJobFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Job
            </Button>
          </div>
        </div>
      </div>

      {/* Dashboard Metrics */}
      <DashboardMetrics />

      {/* Dashboard Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentApplications />
        </div>
        <div className="lg:col-span-1">
          <UpcomingInterviews />
        </div>
      </div>

      {/* Recruitment Pipeline */}
      <RecruitmentPipeline />
      
      {/* Job Form Modal */}
      <JobForm 
        isOpen={jobFormOpen} 
        onClose={() => setJobFormOpen(false)} 
      />
    </main>
  );
}
