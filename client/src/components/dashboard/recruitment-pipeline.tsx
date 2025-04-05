import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { MoreHorizontal, CheckCircle, XCircle, Eye, CalendarIcon, FileCheck, Mail, Phone, Users } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface Candidate {
  id: number;
  firstName: string;
  lastName: string;
}

interface Job {
  id: number;
  title: string;
}

interface JobStage {
  id: number;
  name: string;
  color: string;
  order: number;
  jobId: number;
}

interface Application {
  id: number;
  candidateId: number;
  jobId: number;
  stageId: number;
  status: string;
  appliedAt: string;
  candidate?: Candidate;
  job?: Job;
}

// Item types for DnD
const ItemTypes = {
  CANDIDATE_CARD: 'candidateCard'
};

// Candidate card component
interface CandidateCardProps {
  application: Application;
  onCardMove: (applicationId: number, newStageId: number) => void;
}

const CandidateCard = ({ application, onCardMove }: CandidateCardProps) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.CANDIDATE_CARD,
    item: { id: application.id, currentStageId: application.stageId },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatAppliedDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Applied today';
    if (diffDays === 1) return 'Applied yesterday';
    return `Applied ${diffDays} days ago`;
  };

  const getStatusIcon = () => {
    switch (application.status) {
      case 'phone_screening':
        return <Phone className="mr-1 h-3 w-3" />;
      case 'resume_review':
        return <FileCheck className="mr-1 h-3 w-3" />;
      case 'interview_scheduled':
        return <CalendarIcon className="mr-1 h-3 w-3" />;
      case 'technical_test':
        return <Mail className="mr-1 h-3 w-3" />;
      case 'final_interview':
        return <Users className="mr-1 h-3 w-3" />;
      default:
        return <CalendarIcon className="mr-1 h-3 w-3" />;
    }
  };

  return (
    <div
      ref={drag}
      className={`bg-white border border-neutral-200 rounded-md p-3 shadow-sm hover:shadow transition cursor-move ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center">
          <Avatar className="w-8 h-8 bg-neutral-200">
            <AvatarFallback className="text-xs font-medium text-neutral-600">
              {application.candidate ? getInitials(application.candidate.firstName, application.candidate.lastName) : 'CN'}
            </AvatarFallback>
          </Avatar>
          <div className="ml-2">
            <p className="text-sm font-medium text-neutral-800">
              {application.candidate ? `${application.candidate.firstName} ${application.candidate.lastName}` : 'Candidate'}
            </p>
            <p className="text-xs text-neutral-500">{application.job?.title || 'Position'}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-neutral-600">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View Profile</DropdownMenuItem>
            <DropdownMenuItem>Schedule Interview</DropdownMenuItem>
            <DropdownMenuItem>Send Email</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Reject</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="text-xs text-neutral-500 flex items-center">
        {getStatusIcon()}
        <span>{formatAppliedDate(application.appliedAt)}</span>
      </div>
      <div className="mt-2 flex justify-between">
        <Button variant="outline" size="sm" className="px-2 py-1 h-auto text-xs">
          <Eye className="mr-1 h-3 w-3" />
          View
        </Button>
        <div className="flex space-x-1">
          <Button variant="ghost" size="icon" className="h-6 w-6 text-neutral-400 hover:text-green-600">
            <CheckCircle className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-neutral-400 hover:text-red-600">
            <XCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// Stage column component
interface StageColumnProps {
  stage: JobStage;
  applications: Application[];
  onCardMove: (applicationId: number, newStageId: number) => void;
}

const StageColumn = ({ stage, applications, onCardMove }: StageColumnProps) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.CANDIDATE_CARD,
    drop: (item: { id: number }) => {
      onCardMove(item.id, stage.id);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const getColumnHeaderStyles = (color?: string) => {
    // Default color if none is provided
    const defaultColor = '#6B7280'; // Gray color
    const safeColor = color || defaultColor;
    
    try {
      // Convert hex to RGB and create a light background
      const hex = safeColor.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      
      return {
        backgroundColor: `rgba(${r}, ${g}, ${b}, 0.1)`,
        color: safeColor
      };
    } catch (error) {
      // Fallback in case of any errors in color parsing
      return {
        backgroundColor: 'rgba(107, 114, 128, 0.1)', // Light gray
        color: defaultColor
      };
    }
  };

  return (
    <div ref={drop} className="w-72 flex flex-col">
      <div 
        className="rounded-md p-3 mb-3 flex items-center justify-between"
        style={getColumnHeaderStyles(stage.color)}
      >
        <h3 className="text-sm font-medium">{stage.name}</h3>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full" 
              style={{ 
                backgroundColor: stage.color ? `${stage.color}20` : 'rgba(107, 114, 128, 0.2)', 
                color: stage.color || '#6B7280' 
              }}>
          {applications.length}
        </span>
      </div>
      
      <div className="space-y-3 min-h-[50px]" style={{ backgroundColor: isOver ? '#f9fafb' : 'transparent' }}>
        {applications.map((application) => (
          <CandidateCard
            key={application.id}
            application={application}
            onCardMove={onCardMove}
          />
        ))}
        
        {applications.length > 3 && (
          <div className="text-center py-2">
            <Button variant="link" size="sm" className="text-xs text-primary">
              Show more ({applications.length - 3})
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default function RecruitmentPipeline() {
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const { toast } = useToast();
  
  const { data: jobs, isLoading: isLoadingJobs } = useQuery({
    queryKey: ['/api/jobs'],
  });
  
  // Set first job as selected when jobs load
  useEffect(() => {
    if (jobs && jobs.length > 0 && !selectedJobId) {
      setSelectedJobId(jobs[0].id);
    }
  }, [jobs, selectedJobId]);
  
  const { data: stages, isLoading: isLoadingStages } = useQuery({
    queryKey: ['/api/jobs', selectedJobId, 'stages'],
    enabled: !!selectedJobId,
  });
  
  const { data: applications, isLoading: isLoadingApplications } = useQuery({
    queryKey: ['/api/applications', 'job', selectedJobId],
    enabled: !!selectedJobId,
  });
  
  // Mutation for updating application stage
  const updateApplicationStageMutation = useMutation({
    mutationFn: async ({ applicationId, stageId }: { applicationId: number, stageId: number }) => {
      return apiRequest('PUT', `/api/applications/${applicationId}/stage/${stageId}`, null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/applications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/applications', 'job', selectedJobId] });
      toast({
        title: "Candidate moved",
        description: "The candidate has been moved to a new stage",
      });
    },
    onError: (error) => {
      toast({
        title: "Error moving candidate",
        description: String(error),
        variant: "destructive",
      });
    }
  });
  
  const handleCardMove = (applicationId: number, newStageId: number) => {
    updateApplicationStageMutation.mutate({ applicationId, stageId: newStageId });
  };
  
  // Organize applications by stage
  const getApplicationsByStage = (stageId: number) => {
    return applications?.filter(app => app.stageId === stageId) || [];
  };
  
  const isLoading = isLoadingJobs || isLoadingStages || isLoadingApplications;
  
  if (isLoading) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Recruitment Pipeline</CardTitle>
              <CardDescription>Current candidates by recruitment stage</CardDescription>
            </div>
            <Skeleton className="h-10 w-40" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-72 flex flex-col">
                <Skeleton className="h-12 w-full mb-3" />
                <div className="space-y-3">
                  {[...Array(2)].map((_, j) => (
                    <Skeleton key={j} className="h-28 w-full" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Recruitment Pipeline</CardTitle>
            <CardDescription>Current candidates by recruitment stage</CardDescription>
          </div>
          <div className="flex space-x-3">
            <Select value={selectedJobId?.toString()} onValueChange={(value) => setSelectedJobId(Number(value))}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select a position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Positions</SelectItem>
                {jobs?.map((job) => (
                  <SelectItem key={job.id} value={job.id.toString()}>
                    {job.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <DndProvider backend={HTML5Backend}>
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {stages?.map((stage) => (
              <StageColumn
                key={stage.id}
                stage={stage}
                applications={getApplicationsByStage(stage.id)}
                onCardMove={handleCardMove}
              />
            ))}
          </div>
        </DndProvider>
      </CardContent>
    </Card>
  );
}
