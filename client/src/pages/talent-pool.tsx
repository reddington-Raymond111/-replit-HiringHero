import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Search, 
  Filter, 
  Tag, 
  User, 
  PlusCircle, 
  CheckCircle, 
  Briefcase 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter 
} from "@/components/ui/card";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuCheckboxItem 
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getInitials } from "@/lib/utils";
import CandidateForm from "@/components/candidates/candidate-form";

export default function TalentPool() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCandidateForm, setShowCandidateForm] = useState(false);
  const [skillFilter, setSkillFilter] = useState<string[]>([]);
  const [departmentFilter, setDepartmentFilter] = useState<string[]>([]);
  
  const { data: candidates, isLoading } = useQuery({
    queryKey: ['/api/candidates'],
  });

  // Mock-up data for available skills and departments
  const availableSkills = [
    "JavaScript", "React", "Node.js", "Python", "Java", "Product Management",
    "UI/UX Design", "Graphic Design", "Marketing", "Sales", "Customer Service",
    "Project Management", "Data Analysis", "Machine Learning"
  ];
  
  const availableDepartments = [
    "Engineering", "Design", "Marketing", "Sales", "Customer Service",
    "Human Resources", "Finance", "Operations", "Product"
  ];

  // Filter candidates based on search and filters
  const filteredCandidates = candidates?.filter(candidate => {
    // Search filter
    const matchesSearch = searchTerm === "" || 
      `${candidate.firstName} ${candidate.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (candidate.currentJobTitle || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (candidate.currentCompany || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Skills filter
    const matchesSkills = skillFilter.length === 0 || 
      (candidate.tags && skillFilter.some(skill => candidate.tags.includes(skill)));
    
    // Department filter (for now, we'll just check if any department tag exists)
    const matchesDepartment = departmentFilter.length === 0 || 
      (candidate.tags && departmentFilter.some(dept => candidate.tags.includes(dept)));
    
    return matchesSearch && matchesSkills && matchesDepartment;
  });

  // Group candidates by status
  const activeCandidates = filteredCandidates?.filter(c => c.status === 'active') || [];
  const hiredCandidates = filteredCandidates?.filter(c => c.status === 'hired') || [];
  const archivedCandidates = filteredCandidates?.filter(c => c.status === 'archived') || [];

  return (
    <main className="flex-1 overflow-y-auto bg-neutral-50 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-800">Talent Pool</h2>
            <p className="mt-1 text-sm text-neutral-500">Build and manage your candidate database</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button onClick={() => setShowCandidateForm(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add to Talent Pool
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
          <Input
            placeholder="Search talent pool..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              <Tag className="mr-2 h-4 w-4" />
              Skills
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48">
            {availableSkills.map((skill) => (
              <DropdownMenuCheckboxItem
                key={skill}
                checked={skillFilter.includes(skill)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSkillFilter([...skillFilter, skill]);
                  } else {
                    setSkillFilter(skillFilter.filter(s => s !== skill));
                  }
                }}
              >
                {skill}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              <Briefcase className="mr-2 h-4 w-4" />
              Department
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48">
            {availableDepartments.map((dept) => (
              <DropdownMenuCheckboxItem
                key={dept}
                checked={departmentFilter.includes(dept)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setDepartmentFilter([...departmentFilter, dept]);
                  } else {
                    setDepartmentFilter(departmentFilter.filter(d => d !== dept));
                  }
                }}
              >
                {dept}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Candidate Listings */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Candidates ({filteredCandidates?.length || 0})</TabsTrigger>
          <TabsTrigger value="active">Active ({activeCandidates.length})</TabsTrigger>
          <TabsTrigger value="hired">Hired ({hiredCandidates.length})</TabsTrigger>
          <TabsTrigger value="archived">Archived ({archivedCandidates.length})</TabsTrigger>
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
                <Card key={candidate.id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarFallback className="bg-primary-100 text-primary">
                            {getInitials(candidate.firstName, candidate.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-base">
                            {candidate.firstName} {candidate.lastName}
                          </CardTitle>
                          {candidate.currentJobTitle && (
                            <p className="text-sm text-muted-foreground">
                              {candidate.currentJobTitle}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Briefcase className="h-4 w-4 mr-2" />
                      <span>{candidate.currentCompany || "Not specified"}</span>
                    </div>
                    
                    {candidate.tags && candidate.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {candidate.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {candidate.notes && (
                      <p className="text-sm text-neutral-600 mt-2 line-clamp-2">
                        {candidate.notes}
                      </p>
                    )}
                  </CardContent>
                  <CardFooter className="pt-1 border-t">
                    <div className="flex justify-between w-full">
                      <Button variant="ghost" size="sm">
                        <User className="h-4 w-4 mr-2" />
                        View Profile
                      </Button>
                      <Button variant="outline" size="sm">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Match Jobs
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <h3 className="text-lg font-medium text-neutral-900">No candidates found</h3>
              <p className="mt-1 text-sm text-neutral-500">
                Try adjusting your search or filters to find what you're looking for.
              </p>
              <Button className="mt-4" onClick={() => setShowCandidateForm(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add to Talent Pool
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="active">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {activeCandidates.map((candidate) => (
              <Card key={candidate.id}>
                {/* Same card content as above */}
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="hired">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {hiredCandidates.map((candidate) => (
              <Card key={candidate.id}>
                {/* Same card content as above */}
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="archived">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {archivedCandidates.map((candidate) => (
              <Card key={candidate.id}>
                {/* Same card content as above */}
              </Card>
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
