import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  Users, 
  ChevronLeft, 
  ChevronRight,
  VideoIcon,
  PhoneCall
} from "lucide-react";
import { format, startOfWeek, endOfWeek, addDays, addWeeks, subWeeks, isToday, isSameDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import InterviewForm from "@/components/interviews/interview-form";

interface Interview {
  id: number;
  title: string;
  type: string;
  scheduledAt: string;
  duration: number;
  location: string;
  application: {
    candidate: {
      firstName: string;
      lastName: string;
    };
    job: {
      title: string;
    };
  };
  interviewers: string[];
  status: string;
}

export default function Interviews() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showInterviewForm, setShowInterviewForm] = useState(false);
  
  const { data: interviews, isLoading } = useQuery<Interview[]>({
    queryKey: ['/api/interviews'],
  });

  // Filter interviews based on search
  const filteredInterviews = interviews?.filter(interview => {
    return searchTerm === "" || 
      interview.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${interview.application.candidate.firstName} ${interview.application.candidate.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interview.application.job.title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Group interviews by day for calendar view
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start on Monday
  const endDate = endOfWeek(currentDate, { weekStartsOn: 1 });
  
  const daysOfWeek = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));
  
  const interviewsByDay = daysOfWeek.map(day => {
    return {
      date: day,
      interviews: filteredInterviews?.filter(interview => 
        isSameDay(new Date(interview.scheduledAt), day)
      ) || []
    };
  });

  // Get today's interviews
  const todayInterviews = filteredInterviews?.filter(interview => 
    isSameDay(new Date(interview.scheduledAt), new Date())
  ) || [];

  // Get upcoming interviews (excluding today)
  const upcomingInterviews = filteredInterviews?.filter(interview => {
    const interviewDate = new Date(interview.scheduledAt);
    return interviewDate > new Date() && !isSameDay(interviewDate, new Date());
  }).sort((a, b) => 
    new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
  ) || [];
  
  // Get past interviews
  const pastInterviews = filteredInterviews?.filter(interview => 
    new Date(interview.scheduledAt) < new Date() && !isSameDay(new Date(interview.scheduledAt), new Date())
  ).sort((a, b) => 
    new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
  ) || [];

  // Helper function for interview card
  const renderInterviewCard = (interview: Interview) => {
    return (
      <Card key={interview.id} className="mb-4">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-medium text-neutral-900">{interview.title}</h3>
              <p className="text-sm text-neutral-500">
                with {interview.application.candidate.firstName} {interview.application.candidate.lastName}
              </p>
            </div>
            <Badge variant="secondary" className={interview.type === 'technical' ? 'bg-primary-100 text-primary-800' : 
                                                   interview.type === 'phone' ? 'bg-blue-100 text-blue-800' : 
                                                   interview.type === 'video' ? 'bg-green-100 text-green-800' : 
                                                   'bg-neutral-100 text-neutral-800'}>
              {interview.type}
            </Badge>
          </div>
          
          <div className="flex items-center text-sm text-neutral-500 mt-2">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{format(new Date(interview.scheduledAt), 'MMM d, yyyy h:mm a')}</span>
            <span className="mx-2">•</span>
            <Clock className="h-4 w-4 mr-1" />
            <span>{interview.duration} min</span>
          </div>
          
          {interview.location && (
            <div className="flex items-center text-sm text-neutral-500 mt-1">
              {interview.type === 'phone' ? (
                <PhoneCall className="h-4 w-4 mr-1" />
              ) : interview.type === 'video' ? (
                <VideoIcon className="h-4 w-4 mr-1" />
              ) : (
                <div className="h-4 w-4 mr-1" />
              )}
              <span>{interview.location}</span>
            </div>
          )}
          
          {interview.interviewers && interview.interviewers.length > 0 && (
            <div className="flex items-center text-sm text-neutral-500 mt-1">
              <Users className="h-4 w-4 mr-1" />
              <span>{interview.interviewers.join(', ')}</span>
            </div>
          )}
          
          <div className="mt-4 flex space-x-2">
            <Button variant="outline" size="sm">View Details</Button>
            <Button variant="outline" size="sm">Reschedule</Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <main className="flex-1 overflow-y-auto bg-neutral-50 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-800">Interviews</h2>
            <p className="mt-1 text-sm text-neutral-500">Schedule and manage candidate interviews</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button onClick={() => setShowInterviewForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Schedule Interview
            </Button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
        <Input
          placeholder="Search interviews..."
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Interview Listings */}
      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl">
                    {format(startDate, 'MMMM d')} - {format(endDate, 'MMMM d, yyyy')}
                  </CardTitle>
                  <CardDescription>
                    Week {format(currentDate, 'w')}
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="icon" onClick={() => setCurrentDate(subWeeks(currentDate, 1))}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
                    Today
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => setCurrentDate(addWeeks(currentDate, 1))}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-4">
                {/* Days of week headers */}
                {daysOfWeek.map((date) => (
                  <div key={date.toString()} className="text-center">
                    <p className="text-sm font-medium text-neutral-500">
                      {format(date, 'EEE')}
                    </p>
                    <p className={cn(
                      "text-sm font-semibold mt-1 h-8 w-8 rounded-full flex items-center justify-center mx-auto",
                      isToday(date) ? "bg-primary text-white" : "text-neutral-900"
                    )}>
                      {format(date, 'd')}
                    </p>
                  </div>
                ))}
                
                {/* Calendar cells with interviews */}
                {interviewsByDay.map((dayData) => (
                  <div key={dayData.date.toString()} className="min-h-[150px] max-h-[300px] overflow-y-auto">
                    {isLoading ? (
                      <Skeleton className="h-24 w-full" />
                    ) : dayData.interviews.length > 0 ? (
                      dayData.interviews.map((interview) => (
                        <div key={interview.id} className="bg-white p-2 mb-2 rounded border border-neutral-200 text-sm">
                          <div className="font-medium truncate">{interview.title}</div>
                          <div className="text-xs text-neutral-500 truncate">
                            {format(new Date(interview.scheduledAt), 'h:mm a')} • {interview.duration} min
                          </div>
                          <div className="flex items-center mt-1">
                            <Avatar className="h-5 w-5 mr-1">
                              <AvatarFallback className="text-[10px]">
                                {interview.application.candidate.firstName[0]}{interview.application.candidate.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs truncate">
                              {interview.application.candidate.firstName} {interview.application.candidate.lastName}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-xs text-neutral-400">No interviews</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="list">
          <Tabs defaultValue="upcoming" className="space-y-4">
            <TabsList>
              <TabsTrigger value="today">Today ({todayInterviews.length})</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming ({upcomingInterviews.length})</TabsTrigger>
              <TabsTrigger value="past">Past ({pastInterviews.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="today" className="space-y-4">
              {isLoading ? (
                [...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 w-full mb-4" />)
              ) : todayInterviews.length > 0 ? (
                todayInterviews.map(renderInterviewCard)
              ) : (
                <div className="text-center py-10">
                  <h3 className="text-lg font-medium text-neutral-900">No interviews scheduled for today</h3>
                  <p className="mt-1 text-sm text-neutral-500">
                    Schedule a new interview or check upcoming days.
                  </p>
                  <Button className="mt-4" onClick={() => setShowInterviewForm(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Schedule Interview
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="upcoming" className="space-y-4">
              {isLoading ? (
                [...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 w-full mb-4" />)
              ) : upcomingInterviews.length > 0 ? (
                upcomingInterviews.map(renderInterviewCard)
              ) : (
                <div className="text-center py-10">
                  <h3 className="text-lg font-medium text-neutral-900">No upcoming interviews</h3>
                  <p className="mt-1 text-sm text-neutral-500">
                    Schedule a new interview to get started.
                  </p>
                  <Button className="mt-4" onClick={() => setShowInterviewForm(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Schedule Interview
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="past" className="space-y-4">
              {isLoading ? (
                [...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 w-full mb-4" />)
              ) : pastInterviews.length > 0 ? (
                pastInterviews.map(renderInterviewCard)
              ) : (
                <div className="text-center py-10">
                  <h3 className="text-lg font-medium text-neutral-900">No past interviews</h3>
                  <p className="mt-1 text-sm text-neutral-500">
                    When interviews are completed, they'll appear here.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
      
      {/* Interview Form Modal */}
      <InterviewForm 
        isOpen={showInterviewForm} 
        onClose={() => setShowInterviewForm(false)} 
      />
    </main>
  );
}
