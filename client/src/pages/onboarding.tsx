import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Search, 
  Filter, 
  PlusCircle, 
  FileText, 
  UserCheck, 
  CalendarCheck,
  CheckCircle,
  Clock,
  ChevronRight,
  Mail,
  Clipboard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter 
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuCheckboxItem 
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

interface Offer {
  id: number;
  applicationId: number;
  salary: string;
  startDate: string;
  expiryDate: string;
  status: string;
  application: {
    candidate: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
    };
    job: {
      id: number;
      title: string;
      department: string;
    };
  };
}

export default function Onboarding() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [departmentFilter, setDepartmentFilter] = useState<string[]>([]);
  
  const { data: offers, isLoading } = useQuery<Offer[]>({
    queryKey: ['/api/offers'],
  });

  // Filter offers based on search and filters
  const filteredOffers = offers?.filter(offer => {
    // Search filter
    const matchesSearch = searchTerm === "" || 
      `${offer.application.candidate.firstName} ${offer.application.candidate.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.application.job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.application.job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.application.candidate.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter.length === 0 || 
      statusFilter.includes(offer.status);
    
    // Department filter
    const matchesDepartment = departmentFilter.length === 0 || 
      departmentFilter.includes(offer.application.job.department);
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  // Group offers by status
  const draftOffers = filteredOffers?.filter(offer => offer.status === "draft") || [];
  const sentOffers = filteredOffers?.filter(offer => offer.status === "sent") || [];
  const acceptedOffers = filteredOffers?.filter(offer => offer.status === "accepted") || [];
  const rejectedOffers = filteredOffers?.filter(offer => offer.status === "rejected") || [];

  // Onboarding steps (mock data for UI)
  const onboardingSteps = [
    { id: 1, name: "Paperwork", icon: FileText },
    { id: 2, name: "Background Check", icon: UserCheck },
    { id: 3, name: "Start Date", icon: CalendarCheck },
  ];

  // Get unique departments for filter
  const departments = [...new Set(offers?.map(o => o.application.job.department))];

  // Generate initials for name
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-neutral-100 text-neutral-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  return (
    <main className="flex-1 overflow-y-auto bg-neutral-50 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-800">Onboarding</h2>
            <p className="mt-1 text-sm text-neutral-500">Manage offers and candidate onboarding</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Offer
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
          <Input
            placeholder="Search offers..."
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
            {["draft", "sent", "accepted", "rejected"].map((status) => (
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
            {departments.map((department) => (
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
                {department}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Offer Listings */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Offers ({filteredOffers?.length || 0})</TabsTrigger>
          <TabsTrigger value="draft">Draft ({draftOffers.length})</TabsTrigger>
          <TabsTrigger value="sent">Sent ({sentOffers.length})</TabsTrigger>
          <TabsTrigger value="accepted">Accepted ({acceptedOffers.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-64 w-full" />
              ))}
            </div>
          ) : filteredOffers && filteredOffers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOffers.map((offer) => (
                <Card key={offer.id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarFallback className="bg-primary-100 text-primary">
                            {getInitials(
                              offer.application.candidate.firstName,
                              offer.application.candidate.lastName
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-base">
                            {offer.application.candidate.firstName} {offer.application.candidate.lastName}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {offer.application.job.title}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" className={getStatusBadgeColor(offer.status)}>
                        {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Salary:</span>
                      <span className="font-medium">{offer.salary}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Start Date:</span>
                      <span className="font-medium">{formatDate(offer.startDate)}</span>
                    </div>
                    {offer.status === "sent" && (
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Expires:</span>
                        <span className="font-medium">{formatDate(offer.expiryDate)}</span>
                      </div>
                    )}
                    
                    {offer.status === "accepted" && (
                      <div className="mt-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Onboarding Progress</span>
                          <span className="text-xs text-neutral-500">1/3 Completed</span>
                        </div>
                        <Progress value={33} className="h-2" />
                        <div className="mt-3 space-y-2">
                          {onboardingSteps.map((step, index) => (
                            <div key={step.id} className="flex items-center text-sm">
                              {index === 0 ? (
                                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                              ) : (
                                <Clock className="h-4 w-4 text-neutral-400 mr-2" />
                              )}
                              <span className={index === 0 ? "text-green-600" : "text-neutral-500"}>
                                {step.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-1 border-t">
                    <div className="flex justify-between w-full">
                      {offer.status === "draft" && (
                        <>
                          <Button variant="ghost" size="sm">
                            <FileText className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button size="sm">
                            <Mail className="h-4 w-4 mr-2" />
                            Send Offer
                          </Button>
                        </>
                      )}
                      
                      {offer.status === "sent" && (
                        <>
                          <Button variant="ghost" size="sm">
                            <Mail className="h-4 w-4 mr-2" />
                            Resend
                          </Button>
                          <Button variant="outline" size="sm">
                            <Clock className="h-4 w-4 mr-2" />
                            Extend Deadline
                          </Button>
                        </>
                      )}
                      
                      {offer.status === "accepted" && (
                        <>
                          <Button variant="ghost" size="sm">
                            <Clipboard className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            Continue
                            <ChevronRight className="h-4 w-4 ml-2" />
                          </Button>
                        </>
                      )}
                      
                      {offer.status === "rejected" && (
                        <>
                          <Button variant="ghost" size="sm">
                            <Clipboard className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <PlusCircle className="h-4 w-4 mr-2" />
                            New Offer
                          </Button>
                        </>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <h3 className="text-lg font-medium text-neutral-900">No offers found</h3>
              <p className="mt-1 text-sm text-neutral-500">
                Create an offer to start the onboarding process.
              </p>
              <Button className="mt-4">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Offer
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="draft">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {draftOffers.map((offer) => (
              <Card key={offer.id}>
                {/* Same card content as above */}
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="sent">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sentOffers.map((offer) => (
              <Card key={offer.id}>
                {/* Same card content as above */}
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="accepted">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {acceptedOffers.map((offer) => (
              <Card key={offer.id}>
                {/* Same card content as above */}
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
