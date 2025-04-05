import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Filter, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuCheckboxItem 
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import CandidateCard from "@/components/candidates/candidate-card";
import CandidateForm from "@/components/candidates/candidate-form";

export default function Candidates() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [showCandidateForm, setShowCandidateForm] = useState(false);
  
  const { data: candidates, isLoading } = useQuery({
    queryKey: ['/api/candidates'],
  });

  // Filter candidates based on search and filters
  const filteredCandidates = candidates?.filter(candidate => {
    // Search filter
    const matchesSearch = searchTerm === "" || 
      `${candidate.firstName} ${candidate.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (candidate.currentJobTitle || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (candidate.currentCompany || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter.length === 0 || 
      statusFilter.includes(candidate.status || "");
    
    // Tag filter
    const matchesTags = tagFilter.length === 0 || 
      (candidate.tags && tagFilter.some(tag => candidate.tags.includes(tag)));
    
    return matchesSearch && matchesStatus && matchesTags;
  });

  // Get unique tags for filter
  const allTags = candidates?.reduce((acc: string[], candidate) => {
    if (candidate.tags) {
      candidate.tags.forEach(tag => {
        if (!acc.includes(tag)) {
          acc.push(tag);
        }
      });
    }
    return acc;
  }, []) || [];

  // Get unique statuses for filter
  const allStatuses = [...new Set(candidates?.map(c => c.status).filter(Boolean))] as string[];

  return (
    <main className="flex-1 overflow-y-auto bg-neutral-50 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-800">Candidates</h2>
            <p className="mt-1 text-sm text-neutral-500">Manage candidates and applications</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-3">
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Import Resumes
            </Button>
            <Button onClick={() => setShowCandidateForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Candidate
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
          <Input
            placeholder="Search candidates..."
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
            {allStatuses.map((status) => (
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
              Tags
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48">
            {allTags.map((tag) => (
              <DropdownMenuCheckboxItem
                key={tag}
                checked={tagFilter.includes(tag)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setTagFilter([...tagFilter, tag]);
                  } else {
                    setTagFilter(tagFilter.filter(t => t !== tag));
                  }
                }}
              >
                {tag}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Candidate Listings */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Candidates</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="interviewing">Interviewing</TabsTrigger>
          <TabsTrigger value="hired">Hired</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-64 w-full" />
              ))}
            </div>
          ) : filteredCandidates && filteredCandidates.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredCandidates.map((candidate) => (
                <CandidateCard key={candidate.id} candidate={candidate} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <h3 className="text-lg font-medium text-neutral-900">No candidates found</h3>
              <p className="mt-1 text-sm text-neutral-500">
                Try adjusting your search or filters to find what you're looking for.
              </p>
              <Button className="mt-4" onClick={() => setShowCandidateForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Candidate
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="active">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredCandidates?.filter(c => c.status === 'active').map((candidate) => (
              <CandidateCard key={candidate.id} candidate={candidate} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="interviewing">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredCandidates?.filter(c => c.status === 'interviewing').map((candidate) => (
              <CandidateCard key={candidate.id} candidate={candidate} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="hired">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredCandidates?.filter(c => c.status === 'hired').map((candidate) => (
              <CandidateCard key={candidate.id} candidate={candidate} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Candidate Form Modal */}
      <CandidateForm 
        isOpen={showCandidateForm} 
        onClose={() => setShowCandidateForm(false)} 
      />
    </main>
  );
}
