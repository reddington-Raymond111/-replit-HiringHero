import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertCandidateSchema } from "@shared/schema";
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
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";

// Extended schema with validation
const extendedCandidateSchema = insertCandidateSchema.extend({
  // Add any additional validation
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().optional(),
});

const defaultValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  currentJobTitle: "",
  currentCompany: "",
  resumeUrl: "",
  linkedIn: "",
  notes: "",
  tags: [] as string[],
  source: "direct",
  status: "active"
};

interface CandidateFormProps {
  isOpen: boolean;
  onClose: () => void;
  editCandidate?: z.infer<typeof extendedCandidateSchema> | null;
}

export default function CandidateForm({ isOpen, onClose, editCandidate = null }: CandidateFormProps) {
  const [newTag, setNewTag] = useState("");
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof extendedCandidateSchema>>({
    resolver: zodResolver(extendedCandidateSchema),
    defaultValues: editCandidate || defaultValues,
  });
  
  const createCandidateMutation = useMutation({
    mutationFn: async (data: z.infer<typeof extendedCandidateSchema>) => {
      return apiRequest('POST', '/api/candidates', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/candidates'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard-stats'] });
      toast({
        title: "Candidate created",
        description: "The candidate has been added successfully",
      });
      onClose();
      form.reset(defaultValues);
    },
    onError: (error) => {
      toast({
        title: "Error creating candidate",
        description: String(error),
        variant: "destructive",
      });
    }
  });
  
  const updateCandidateMutation = useMutation({
    mutationFn: async (data: z.infer<typeof extendedCandidateSchema>) => {
      return apiRequest('PUT', `/api/candidates/${editCandidate?.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/candidates'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard-stats'] });
      toast({
        title: "Candidate updated",
        description: "The candidate has been updated successfully",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error updating candidate",
        description: String(error),
        variant: "destructive",
      });
    }
  });
  
  const onSubmit = (data: z.infer<typeof extendedCandidateSchema>) => {
    if (editCandidate) {
      updateCandidateMutation.mutate(data);
    } else {
      createCandidateMutation.mutate(data);
    }
  };
  
  const sourcesOptions = [
    { value: "direct", label: "Direct Application" },
    { value: "linkedin", label: "LinkedIn" },
    { value: "indeed", label: "Indeed" },
    { value: "referral", label: "Referral" },
    { value: "agency", label: "Agency" },
    { value: "other", label: "Other" },
  ];
  
  const addTag = () => {
    if (newTag.trim() && !form.getValues().tags.includes(newTag.trim())) {
      const currentTags = form.getValues().tags || [];
      form.setValue('tags', [...currentTags, newTag.trim()]);
      setNewTag("");
    }
  };
  
  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues().tags || [];
    form.setValue(
      'tags',
      currentTags.filter(tag => tag !== tagToRemove)
    );
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{editCandidate ? "Edit Candidate" : "Add New Candidate"}</DialogTitle>
          <DialogDescription>
            {editCandidate 
              ? "Update the candidate details below and click save when you're done."
              : "Fill in the candidate information below to add them to your talent pool."
            }
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="john.doe@example.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="currentJobTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Job Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Software Engineer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="currentCompany"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Company</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Corp" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="linkedIn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://linkedin.com/in/johndoe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source</FormLabel>
                    <Select 
                      value={field.value} 
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sourcesOptions.map((source) => (
                          <SelectItem key={source.value} value={source.value}>
                            {source.label}
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
              name="resumeUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resume URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/resume.pdf" {...field} />
                  </FormControl>
                  <FormDescription>
                    Link to the candidate's resume (PDF, DOC, etc.)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skills & Tags</FormLabel>
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Add a skill or tag"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={addTag} 
                      size="icon"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {field.value?.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-1 p-0"
                          onClick={() => removeTag(tag)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                  <FormDescription>
                    Add skills, experience, or any relevant tags
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
                      placeholder="Additional information or comments about the candidate" 
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
                {editCandidate ? "Save Changes" : "Add Candidate"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
