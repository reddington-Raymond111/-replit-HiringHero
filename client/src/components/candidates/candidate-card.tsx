import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Mail, Phone, MapPin, Briefcase, Building, Calendar, Tag } from "lucide-react";

interface CandidateCardProps {
  candidate: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    currentJobTitle?: string;
    currentCompany?: string;
    tags?: string[];
    status?: string;
    latestApplicationDate?: string;
  };
}

export default function CandidateCard({ candidate }: CandidateCardProps) {
  // Generate initials from name
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };
  
  // Format date to readable format
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  // Get status badge color
  const getStatusBadgeColor = (status?: string) => {
    if (!status) return 'bg-neutral-100 text-neutral-800';
    
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'interviewing':
        return 'bg-blue-100 text-blue-800';
      case 'offered':
        return 'bg-purple-100 text-purple-800';
      case 'hired':
        return 'bg-primary-100 text-primary-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };
  
  return (
    <Card className="overflow-hidden">
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
          {candidate.status && (
            <Badge variant="secondary" className={getStatusBadgeColor(candidate.status)}>
              {candidate.status}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex items-center text-muted-foreground">
          <Mail className="h-4 w-4 mr-2" />
          <span>{candidate.email}</span>
        </div>
        
        {candidate.phone && (
          <div className="flex items-center text-muted-foreground">
            <Phone className="h-4 w-4 mr-2" />
            <span>{candidate.phone}</span>
          </div>
        )}
        
        {candidate.currentCompany && (
          <div className="flex items-center text-muted-foreground">
            <Building className="h-4 w-4 mr-2" />
            <span>{candidate.currentCompany}</span>
          </div>
        )}
        
        {candidate.latestApplicationDate && (
          <div className="flex items-center text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            <span>Applied {formatDate(candidate.latestApplicationDate)}</span>
          </div>
        )}
        
        {candidate.tags && candidate.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {candidate.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-1 border-t">
        <div className="flex justify-between w-full">
          <Link href={`/candidates/${candidate.id}`}>
            <Button variant="ghost" size="sm">View Profile</Button>
          </Link>
          <Button variant="outline" size="sm">Contact</Button>
        </div>
      </CardFooter>
    </Card>
  );
}
