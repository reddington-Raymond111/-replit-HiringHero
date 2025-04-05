import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import JobList from "@/components/jobs/job-list";
import JobForm from "@/components/jobs/job-form";

export default function Jobs() {
  const [jobFormOpen, setJobFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [departmentFilter, setDepartmentFilter] = useState<string[]>([]);
  
  const { data: jobs, isLoading, error } = useQuery({
    queryKey: ['/api/jobs'],
  });

  // Filter jobs based on search and filters
  const filteredJobs = jobs?.filter(job => {
    // Search filter
    const matchesSearch = searchTerm === "" || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter.length === 0 || 
      statusFilter.includes(job.status);
    
    // Department filter
    const matchesDepartment = departmentFilter.length === 0 || 
      departmentFilter.includes(job.department);
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  // Group jobs by status
  const draftJobs = filteredJobs?.filter(job => job.status === "draft") || [];
  const activeJobs = filteredJobs?.filter(job => job.status === "active") || [];
  const closedJobs = filteredJobs?.filter(job => job.status === "closed") || [];

  // Get unique departments for filter
  const departments = [...new Set(jobs?.map(job => job.department))];
  
  return (
    <main className="flex-1 overflow-y-auto bg-neutral-50 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-800">Job Postings</h2>
            <p className="mt-1 text-sm text-neutral-500">Manage your job listings and track applications</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button onClick={() => setJobFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Job
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
          <Input
            placeholder="Search jobs..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              <Filter className="mr-2 h-4 w-4" />
              Status
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48">
            {["draft", "active", "closed"].map((status) => (
              <DropdownMenuCheckboxItem
                key={status}
                checked={statusFilter.includes(status)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setStatusFilter([...statusFilter, status]);
                  } else {
                    setStatusFilter(statusFilter.filter(s => s !== status));
                  }
                }}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              <Filter className="mr-2 h-4 w-4" />
              Department
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48">
            {departments?.map((department) => (
              <DropdownMenuCheckboxItem
                key={department}
                checked={departmentFilter.includes(department)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setDepartmentFilter([...departmentFilter, department]);
                  } else {
                    setDepartmentFilter(departmentFilter.filter(d => d !== department));
                  }
                }}
              >
                {department.charAt(0).toUpperCase() + department.slice(1)}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Job Listings */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Jobs ({filteredJobs?.length || 0})</TabsTrigger>
          <TabsTrigger value="active">Active ({activeJobs.length})</TabsTrigger>
          <TabsTrigger value="draft">Draft ({draftJobs.length})</TabsTrigger>
          <TabsTrigger value="closed">Closed ({closedJobs.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <JobList jobs={filteredJobs || []} isLoading={isLoading} />
        </TabsContent>
        
        <TabsContent value="active" className="space-y-4">
          <JobList jobs={activeJobs} isLoading={isLoading} />
        </TabsContent>
        
        <TabsContent value="draft" className="space-y-4">
          <JobList jobs={draftJobs} isLoading={isLoading} />
        </TabsContent>
        
        <TabsContent value="closed" className="space-y-4">
          <JobList jobs={closedJobs} isLoading={isLoading} />
        </TabsContent>
      </Tabs>
      
      {/* Job Form Modal */}
      <JobForm 
        isOpen={jobFormOpen} 
        onClose={() => setJobFormOpen(false)} 
      />
    </main>
  );
}
