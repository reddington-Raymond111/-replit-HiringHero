import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Interview {
  id: number;
  title: string;
  type: string;
  scheduledAt: string;
  duration: number;
  application: {
    candidate: {
      firstName: string;
      lastName: string;
    }
  }
}

const getInterviewTypeStyles = (type: string) => {
  switch (type.toLowerCase()) {
    case 'technical':
      return 'border-primary-500 bg-primary-100 text-primary-800';
    case 'design':
      return 'border-green-500 bg-green-100 text-green-800';
    case 'hr':
      return 'border-orange-500 bg-orange-100 text-orange-800';
    case 'phone':
      return 'border-blue-500 bg-blue-100 text-blue-800';
    case 'onsite':
      return 'border-purple-500 bg-purple-100 text-purple-800';
    default:
      return 'border-neutral-500 bg-neutral-100 text-neutral-800';
  }
};

export default function UpcomingInterviews() {
  // Fetch upcoming interviews
  const { data: interviews, isLoading: isLoadingInterviews } = useQuery<any[]>({
    queryKey: ['/api/interviews/upcoming'],
  });
  
  // Fetch applications
  const { data: applications, isLoading: isLoadingApplications } = useQuery<any[]>({
    queryKey: ['/api/applications'],
  });
  
  // Fetch candidates 
  const { data: candidates, isLoading: isLoadingCandidates } = useQuery<any[]>({
    queryKey: ['/api/candidates'],
  });
  
  // Check if all data is loading
  const isLoading = isLoadingInterviews || isLoadingApplications || isLoadingCandidates;
  
  // Join the data to create complete interview objects
  const enhancedInterviews = interviews && applications && candidates
    ? interviews.map(interview => {
        // Find the application associated with this interview
        const application = applications.find(app => app.id === interview.applicationId);
        
        // Find the candidate associated with this application
        const candidate = application 
          ? candidates.find(cand => cand.id === application.candidateId)
          : null;
        
        // Return enriched interview data
        return {
          ...interview,
          application: {
            ...application,
            candidate: candidate || null
          }
        };
      }).filter(interview => interview.application && interview.application.candidate)
    : [];
  
  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Upcoming Interviews</CardTitle>
          <CardDescription>Scheduled for the next 7 days</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 overflow-y-auto max-h-96">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border-l-4 border-neutral-300 pl-3 py-2">
              <div className="flex justify-between items-start">
                <div>
                  <Skeleton className="h-4 w-40 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <div className="mt-2 flex items-center text-xs text-neutral-600">
                <Skeleton className="h-3 w-24 mr-3" />
                <Skeleton className="h-3 w-16" />
              </div>
              <div className="mt-2 flex space-x-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }
  
  // We're not tracking errors explicitly anymore since we have multiple queries
  // This error handling section is removed for now
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Upcoming Interviews</CardTitle>
        <CardDescription>Scheduled for the next 7 days</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 overflow-y-auto max-h-96">
        {enhancedInterviews.map((interview) => (
          <div key={interview.id} className={cn("border-l-4 pl-3 py-2", getInterviewTypeStyles(interview.type))}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-neutral-800">{interview.title}</p>
                <p className="text-xs text-neutral-500">
                  with {interview.application.candidate.firstName} {interview.application.candidate.lastName}
                </p>
              </div>
              <Badge variant="secondary" className={getInterviewTypeStyles(interview.type)}>
                {interview.type}
              </Badge>
            </div>
            <div className="mt-2 flex items-center text-xs text-neutral-600">
              <CalendarIcon className="mr-1 h-3 w-3" />
              <span>{format(new Date(interview.scheduledAt), 'MMM d, h:mm a')}</span>
              <span className="mx-2">•</span>
              <Clock className="mr-1 h-3 w-3" />
              <span>{interview.duration} min</span>
            </div>
            <div className="mt-2 flex space-x-2">
              <Link href={`/interviews/${interview.id}`}>
                <Button variant="outline" size="sm">Details</Button>
              </Link>
              <Button variant="outline" size="sm">Reschedule</Button>
            </div>
          </div>
        ))}
        
        {enhancedInterviews.length === 0 && (
          <div className="text-center py-6 text-neutral-500">
            No upcoming interviews scheduled
          </div>
        )}
      </CardContent>
      
      {enhancedInterviews.length > 0 && (
        <CardFooter className="border-t border-neutral-200 pt-3">
          <Link href="/interviews" className="w-full">
            <Button variant="link" className="w-full text-primary">
              View all interviews
            </Button>
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}
