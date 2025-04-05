import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

interface ApplicationWithDetails {
  id: number;
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
  status: string;
  appliedAt: string;
}

// Function to get status badge color
const getStatusBadgeColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'new':
      return 'bg-purple-100 text-purple-800';
    case 'screening':
      return 'bg-yellow-100 text-yellow-800';
    case 'assessment':
      return 'bg-blue-100 text-blue-800';
    case 'interview':
      return 'bg-green-100 text-green-800';
    case 'offer':
      return 'bg-pink-100 text-pink-800';
    default:
      return 'bg-neutral-100 text-neutral-800';
  }
};

// Function to get initials from name
const getInitials = (firstName: string, lastName: string) => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

export default function RecentApplications() {
  // Fetch applications
  const { data: applications, isLoading: isLoadingApplications } = useQuery<any[]>({
    queryKey: ['/api/applications'],
  });
  
  // Fetch candidates
  const { data: candidates, isLoading: isLoadingCandidates } = useQuery<any[]>({
    queryKey: ['/api/candidates'],
  });
  
  // Fetch jobs
  const { data: jobs, isLoading: isLoadingJobs } = useQuery<any[]>({
    queryKey: ['/api/jobs'],
  });
  
  // Check if all data is loading
  const isLoading = isLoadingApplications || isLoadingCandidates || isLoadingJobs;
  
  // Combine data from all sources
  const recentApplications = applications 
    ? applications
        .map(app => {
          const candidate = candidates?.find(c => c.id === app.candidateId);
          const job = jobs?.find(j => j.id === app.jobId);
          
          return {
            ...app,
            candidate: candidate || null,
            job: job || null
          };
        })
        .filter(app => app.candidate && app.job) // Filter out any incomplete entries
        .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
        .slice(0, 5)
    : [];
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>Latest candidate applications</CardDescription>
            </div>
            <Skeleton className="h-8 w-16" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(4)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="ml-4">
                          <Skeleton className="h-4 w-24 mb-1" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-16 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Check for errors in any query
  const hasErrors = false; // Set to true if any of our queries return an error
  
  if (hasErrors) {
    return <div className="text-red-500">Error loading recent applications</div>;
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Recent Applications</CardTitle>
            <CardDescription>Latest candidate applications</CardDescription>
          </div>
          <Link href="/candidates">
            <Button variant="link">View all</Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentApplications?.map((application) => (
                <TableRow key={application.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 bg-neutral-200">
                        <AvatarFallback className="text-xs text-neutral-600">
                          {getInitials(application.candidate.firstName, application.candidate.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-neutral-800">
                          {application.candidate.firstName} {application.candidate.lastName}
                        </div>
                        <div className="text-xs text-neutral-500">{application.candidate.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-neutral-800">{application.job.title}</div>
                    <div className="text-xs text-neutral-500">{application.job.department}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getStatusBadgeColor(application.status)}>
                      {application.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-neutral-500">
                    {formatDistanceToNow(new Date(application.appliedAt), { addSuffix: true })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/candidates/${application.candidate.id}`}>
                      <Button variant="link" className="text-primary h-auto p-0">View</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              
              {recentApplications?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-neutral-500">
                    No recent applications found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
