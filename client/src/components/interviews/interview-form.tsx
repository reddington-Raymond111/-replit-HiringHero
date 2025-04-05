import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { insertInterviewSchema } from "@shared/schema";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, X, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Extended schema with validation
const extendedInterviewSchema = insertInterviewSchema.extend({
  // Convert string dates to Date objects for form handling
  scheduledAt: z.coerce.date(),
});

interface InterviewFormProps {
  isOpen: boolean;
  onClose: () => void;
  editInterview?: z.infer<typeof extendedInterviewSchema> | null;
}

export default function InterviewForm({ isOpen, onClose, editInterview = null }: InterviewFormProps) {
  const [newInterviewer, setNewInterviewer] = useState("");
  const { toast } = useToast();
  
  const { data: applications, isLoading: isLoadingApplications } = useQuery({
    queryKey: ['/api/applications'],
    enabled: isOpen // Only fetch when dialog is open
  });
  
  const defaultValues = {
    applicationId: 0,
    title: "",
    type: "video",
    scheduledAt: new Date(),
    duration: 30,
    location: "",
    interviewers: [] as string[],
    status: "scheduled",
    notes: "",
    feedback: []
  };
  
  const form = useForm<z.infer<typeof extendedInterviewSchema>>({
    resolver: zodResolver(extendedInterviewSchema),
    defaultValues: editInterview || defaultValues,
  });
  
  const createInterviewMutation = useMutation({
    mutationFn: async (data: z.infer<typeof extendedInterviewSchema>) => {
      // Convert date object back to ISO string for API
      const apiData = {
        ...data,
        scheduledAt: data.scheduledAt.toISOString(),
      };
      return apiRequest('POST', '/api/interviews', apiData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/interviews'] });
      queryClient.invalidateQueries({ queryKey: ['/api/interviews/upcoming'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard-stats'] });
      toast({
        title: "Interview scheduled",
        description: "The interview has been scheduled successfully",
      });
      onClose();
      form.reset(defaultValues);
    },
    onError: (error) => {
      toast({
        title: "Error scheduling interview",
        description: String(error),
        variant: "destructive",
      });
    }
  });
  
  const updateInterviewMutation = useMutation({
    mutationFn: async (data: z.infer<typeof extendedInterviewSchema>) => {
      // Convert date object back to ISO string for API
      const apiData = {
        ...data,
        scheduledAt: data.scheduledAt.toISOString(),
      };
      return apiRequest('PUT', `/api/interviews/${editInterview?.id}`, apiData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/interviews'] });
      queryClient.invalidateQueries({ queryKey: ['/api/interviews/upcoming'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard-stats'] });
      toast({
        title: "Interview updated",
        description: "The interview has been updated successfully",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error updating interview",
        description: String(error),
        variant: "destructive",
      });
    }
  });
  
  const onSubmit = (data: z.infer<typeof extendedInterviewSchema>) => {
    if (editInterview) {
      updateInterviewMutation.mutate(data);
    } else {
      createInterviewMutation.mutate(data);
    }
  };
  
  const interviewTypes = [
    { value: "phone", label: "Phone Screen" },
    { value: "video", label: "Video Call" },
    { value: "technical", label: "Technical Interview" },
    { value: "onsite", label: "Onsite Interview" },
    { value: "hr", label: "HR Round" },
  ];
  
  const durations = [
    { value: 15, label: "15 min" },
    { value: 30, label: "30 min" },
    { value: 45, label: "45 min" },
    { value: 60, label: "1 hour" },
    { value: 90, label: "1 hour 30 min" },
    { value: 120, label: "2 hours" },
  ];
  
  const addInterviewer = () => {
    if (newInterviewer.trim() && !form.getValues().interviewers.includes(newInterviewer.trim())) {
      const currentInterviewers = form.getValues().interviewers || [];
      form.setValue('interviewers', [...currentInterviewers, newInterviewer.trim()]);
      setNewInterviewer("");
    }
  };
  
  const removeInterviewer = (interviewerToRemove: string) => {
    const currentInterviewers = form.getValues().interviewers || [];
    form.setValue(
      'interviewers',
      currentInterviewers.filter(interviewer => interviewer !== interviewerToRemove)
    );
  };
  
  // Get application details for display in select
  const getApplicationLabel = (applicationId: number) => {
    const application = applications?.find(app => app.id === applicationId);
    if (!application) return "Select application";
    
    return `${application.candidate?.firstName} ${application.candidate?.lastName} - ${application.job?.title}`;
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{editInterview ? "Edit Interview" : "Schedule Interview"}</DialogTitle>
          <DialogDescription>
            {editInterview 
              ? "Update the interview details below and click save when you're done."
              : "Fill in the interview details below to schedule a new interview."
            }
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="applicationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Candidate & Position</FormLabel>
                  <Select 
                    value={field.value ? field.value.toString() : ""} 
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    disabled={isLoadingApplications}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select candidate and position" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {applications?.map((application) => (
                        <SelectItem key={application.id} value={application.id.toString()}>
                          {application.candidate?.firstName} {application.candidate?.lastName} - {application.job?.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interview Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Technical Interview Round" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interview Type</FormLabel>
                    <Select 
                      value={field.value} 
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {interviewTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <Select 
                      value={field.value.toString()} 
                      onValueChange={(value) => field.onChange(parseInt(value))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {durations.map((duration) => (
                          <SelectItem key={duration.value} value={duration.value.toString()}>
                            {duration.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="scheduledAt"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="scheduledAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <div className="flex items-center">
                      <FormControl>
                        <Input
                          type="time"
                          value={format(field.value, "HH:mm")}
                          onChange={(e) => {
                            const [hours, minutes] = e.target.value.split(':');
                            const newDate = new Date(field.value);
                            newDate.setHours(parseInt(hours), parseInt(minutes));
                            field.onChange(newDate);
                          }}
                        />
                      </FormControl>
                      <Clock className="ml-2 h-4 w-4 text-neutral-500" />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={form.watch('type') === 'video' ? "Zoom/Google Meet link" : 
                                   form.watch('type') === 'phone' ? "Phone number" :
                                   "Interview location"} 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    {form.watch('type') === 'video' ? "Enter meeting link (Zoom, Google Meet, etc.)" : 
                     form.watch('type') === 'phone' ? "Phone number or conference details" :
                     form.watch('type') === 'onsite' ? "Physical address or room details" :
                     "Location details for the interview"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="interviewers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interviewers</FormLabel>
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Add interviewer name"
                      value={newInterviewer}
                      onChange={(e) => setNewInterviewer(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addInterviewer();
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={addInterviewer} 
                      size="icon"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {field.value?.map((interviewer) => (
                      <Badge key={interviewer} variant="secondary" className="text-xs">
                        {interviewer}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-1 p-0"
                          onClick={() => removeInterviewer(interviewer)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                  <FormDescription>
                    Add all team members who will be conducting the interview
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Additional notes or preparation instructions" 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={form.formState.isSubmitting}
              >
                {editInterview ? "Update Interview" : "Schedule Interview"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
