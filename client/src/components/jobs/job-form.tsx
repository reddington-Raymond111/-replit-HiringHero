import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertJobSchema } from "@shared/schema";
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
  FormMessage 
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
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";

// Extended schema with validation
const extendedJobSchema = insertJobSchema.extend({
  // Add any additional validation
});

const defaultValues = {
  title: "",
  department: "",
  location: "",
  description: "",
  requirements: "",
  type: "full-time",
  status: "draft",
  salary: "",
  createdBy: 1, // Default to current user
  channels: {}
};

interface JobFormProps {
  isOpen: boolean;
  onClose: () => void;
  editJob?: z.infer<typeof extendedJobSchema> | null;
}

export default function JobForm({ isOpen, onClose, editJob = null }: JobFormProps) {
  const [activeTab, setActiveTab] = useState("details");
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof extendedJobSchema>>({
    resolver: zodResolver(extendedJobSchema),
    defaultValues: editJob || defaultValues,
  });
  
  const createJobMutation = useMutation({
    mutationFn: async (data: z.infer<typeof extendedJobSchema>) => {
      return apiRequest('POST', '/api/jobs', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard-stats'] });
      toast({
        title: "Job created",
        description: "The job posting has been created successfully",
      });
      onClose();
      form.reset(defaultValues);
    },
    onError: (error) => {
      toast({
        title: "Error creating job",
        description: String(error),
        variant: "destructive",
      });
    }
  });
  
  const updateJobMutation = useMutation({
    mutationFn: async (data: z.infer<typeof extendedJobSchema>) => {
      return apiRequest('PUT', `/api/jobs/${editJob?.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard-stats'] });
      toast({
        title: "Job updated",
        description: "The job posting has been updated successfully",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error updating job",
        description: String(error),
        variant: "destructive",
      });
    }
  });
  
  const onSubmit = (data: z.infer<typeof extendedJobSchema>) => {
    if (editJob) {
      updateJobMutation.mutate(data);
    } else {
      createJobMutation.mutate(data);
    }
  };
  
  const jobTypes = [
    { value: "full-time", label: "Full-time" },
    { value: "part-time", label: "Part-time" },
    { value: "contract", label: "Contract" },
    { value: "internship", label: "Internship" },
    { value: "temporary", label: "Temporary" },
  ];
  
  const departments = [
    { value: "engineering", label: "Engineering" },
    { value: "design", label: "Design" },
    { value: "marketing", label: "Marketing" },
    { value: "sales", label: "Sales" },
    { value: "customer_service", label: "Customer Service" },
    { value: "hr", label: "Human Resources" },
    { value: "finance", label: "Finance" },
    { value: "operations", label: "Operations" },
    { value: "product", label: "Product" },
  ];
  
  const channels = [
    { id: "company_website", name: "Company Website" },
    { id: "linkedin", name: "LinkedIn" },
    { id: "indeed", name: "Indeed" },
    { id: "glassdoor", name: "Glassdoor" },
    { id: "monster", name: "Monster" },
    { id: "ziprecruiter", name: "ZipRecruiter" },
    { id: "angellist", name: "AngelList" },
    { id: "twitter", name: "Twitter" },
  ];
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{editJob ? "Edit Job" : "Create New Job"}</DialogTitle>
          <DialogDescription>
            {editJob 
              ? "Update the job details below and click save when you're done."
              : "Fill in the job details below and publish when you're ready."
            }
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Job Details</TabsTrigger>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="channels">Publishing</TabsTrigger>
          </TabsList>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <TabsContent value="details" className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Full Stack Developer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department</FormLabel>
                        <Select 
                          value={field.value} 
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {departments.map((dept) => (
                              <SelectItem key={dept.value} value={dept.value}>
                                {dept.label}
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
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Type</FormLabel>
                        <Select 
                          value={field.value} 
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select job type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {jobTypes.map((type) => (
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
                </div>
                
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. San Francisco, CA (Remote)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="salary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salary Range (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. $80,000 - $120,000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <TabsContent value="description" className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the role, responsibilities, and company culture" 
                          className="min-h-[150px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="requirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Requirements</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="List the required skills, experience, and qualifications" 
                          className="min-h-[150px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <TabsContent value="channels" className="py-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Job Status</h4>
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <Select 
                            value={field.value} 
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="active">Active (Published)</SelectItem>
                              <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Publishing Channels</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Select where you want to publish this job posting
                    </p>
                    
                    {channels.map((channel) => (
                      <div key={channel.id} className="flex items-center space-x-2 mb-2">
                        <Checkbox 
                          id={channel.id} 
                          checked={form.watch('channels')?.[channel.id]} 
                          onCheckedChange={(checked) => {
                            form.setValue('channels', {
                              ...form.getValues('channels'),
                              [channel.id]: checked
                            });
                          }} 
                        />
                        <label
                          htmlFor={channel.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {channel.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <DialogFooter className="mt-6">
                <Button variant="outline" type="button" onClick={onClose}>
                  Cancel
                </Button>
                {activeTab === "channels" ? (
                  <Button 
                    type="submit" 
                    disabled={form.formState.isSubmitting}
                  >
                    {editJob ? "Save Changes" : "Create Job"}
                  </Button>
                ) : (
                  <Button 
                    type="button" 
                    onClick={() => {
                      if (activeTab === "details") setActiveTab("description");
                      if (activeTab === "description") setActiveTab("channels");
                    }}
                  >
                    Next
                  </Button>
                )}
              </DialogFooter>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
