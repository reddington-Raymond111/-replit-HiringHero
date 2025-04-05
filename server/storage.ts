import { 
  users, type User, type InsertUser,
  jobs, type Job, type InsertJob,
  jobStages, type JobStage, type InsertJobStage,
  candidates, type Candidate, type InsertCandidate,
  applications, type Application, type InsertApplication,
  interviews, type Interview, type InsertInterview,
  offers, type Offer, type InsertOffer,
  dashboardStats, type DashboardStats, type InsertDashboardStats
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Job methods
  getJobs(): Promise<Job[]>;
  getJob(id: number): Promise<Job | undefined>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: number, job: Partial<InsertJob>): Promise<Job | undefined>;
  deleteJob(id: number): Promise<boolean>;
  
  // Job Stage methods
  getJobStages(jobId: number): Promise<JobStage[]>;
  createJobStage(stage: InsertJobStage): Promise<JobStage>;
  updateJobStage(id: number, stage: Partial<InsertJobStage>): Promise<JobStage | undefined>;
  deleteJobStage(id: number): Promise<boolean>;
  
  // Candidate methods
  getCandidates(): Promise<Candidate[]>;
  getCandidate(id: number): Promise<Candidate | undefined>;
  createCandidate(candidate: InsertCandidate): Promise<Candidate>;
  updateCandidate(id: number, candidate: Partial<InsertCandidate>): Promise<Candidate | undefined>;
  deleteCandidate(id: number): Promise<boolean>;
  
  // Application methods
  getApplications(): Promise<Application[]>;
  getApplicationsByJob(jobId: number): Promise<Application[]>;
  getApplicationsByCandidate(candidateId: number): Promise<Application[]>;
  getApplicationsByStage(stageId: number): Promise<Application[]>;
  getApplication(id: number): Promise<Application | undefined>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplication(id: number, application: Partial<InsertApplication>): Promise<Application | undefined>;
  updateApplicationStage(id: number, stageId: number): Promise<Application | undefined>;
  deleteApplication(id: number): Promise<boolean>;
  
  // Interview methods
  getInterviews(): Promise<Interview[]>;
  getInterviewsByApplication(applicationId: number): Promise<Interview[]>;
  getUpcomingInterviews(): Promise<Interview[]>;
  getInterview(id: number): Promise<Interview | undefined>;
  createInterview(interview: InsertInterview): Promise<Interview>;
  updateInterview(id: number, interview: Partial<InsertInterview>): Promise<Interview | undefined>;
  deleteInterview(id: number): Promise<boolean>;
  
  // Offer methods
  getOffers(): Promise<Offer[]>;
  getOffersByApplication(applicationId: number): Promise<Offer[]>;
  getOffer(id: number): Promise<Offer | undefined>;
  createOffer(offer: InsertOffer): Promise<Offer>;
  updateOffer(id: number, offer: Partial<InsertOffer>): Promise<Offer | undefined>;
  deleteOffer(id: number): Promise<boolean>;
  
  // Dashboard stats methods
  getDashboardStats(): Promise<DashboardStats>;
  updateDashboardStats(stats: InsertDashboardStats): Promise<DashboardStats>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private jobs: Map<number, Job>;
  private jobStages: Map<number, JobStage>;
  private candidates: Map<number, Candidate>;
  private applications: Map<number, Application>;
  private interviews: Map<number, Interview>;
  private offers: Map<number, Offer>;
  private dashboardStats: DashboardStats;
  
  private userId: number;
  private jobId: number;
  private stageId: number;
  private candidateId: number;
  private applicationId: number;
  private interviewId: number;
  private offerId: number;

  constructor() {
    this.users = new Map();
    this.jobs = new Map();
    this.jobStages = new Map();
    this.candidates = new Map();
    this.applications = new Map();
    this.interviews = new Map();
    this.offers = new Map();
    
    this.userId = 1;
    this.jobId = 1;
    this.stageId = 1;
    this.candidateId = 1;
    this.applicationId = 1;
    this.interviewId = 1;
    this.offerId = 1;
    
    // Initialize dashboard stats
    this.dashboardStats = {
      id: 1,
      activeJobs: 0,
      totalCandidates: 0,
      interviewsThisWeek: 0,
      avgTimeToHire: 0,
      candidatesByStage: {},
      applicationsTimeline: [],
      updatedAt: new Date()
    };
    
    // Initialize with sample admin user
    this.createUser({
      username: "admin",
      password: "admin123",
      fullName: "Admin User",
      email: "admin@talenthub.com",
      role: "admin",
      avatar: ""
    });

    // Initialize with sample jobs
    this.createJob({
      title: "Frontend Developer",
      department: "Engineering",
      location: "San Francisco, CA",
      type: "full-time",
      salary: "$80,000 - $120,000",
      description: "We're looking for a talented Frontend Developer to join our team.",
      requirements: "3+ years of experience with React, TypeScript, and modern frontend frameworks.",
      status: "active",
      createdBy: 1, // Admin user ID
      channels: {}
    });
    
    this.createJob({
      title: "UX Designer",
      department: "Design",
      location: "Remote",
      type: "full-time",
      salary: "$90,000 - $130,000",
      description: "Join our design team to create beautiful and intuitive user experiences.",
      requirements: "Portfolio demonstrating strong UX design skills. Experience with Figma and Adobe Creative Suite.",
      status: "active",
      createdBy: 1, // Admin user ID
      channels: {}
    });
    
    // Initialize with sample candidates
    this.createCandidate({
      firstName: "John",
      lastName: "Smith",
      email: "john.smith@example.com",
      phone: "123-456-7890",
      currentJobTitle: "Senior Web Developer",
      currentCompany: "Tech Innovations Inc.",
      tags: ["JavaScript", "React", "TypeScript"],
      source: "LinkedIn",
      status: "active",
      resumeUrl: "path/to/resume.pdf",
      notes: "Excellent technical background, 8 years of experience in web development."
    });
    
    this.createCandidate({
      firstName: "Emma",
      lastName: "Garcia",
      email: "emma.garcia@example.com",
      phone: "987-654-3210",
      currentJobTitle: "UX/UI Designer",
      currentCompany: "Design Solutions",
      tags: ["UI Design", "Figma", "Adobe XD"],
      source: "Referral",
      status: "active",
      resumeUrl: "path/to/resume.pdf",
      notes: "Strong portfolio with creative design solutions. Looking for remote opportunities."
    });
    
    // Add applications linking candidates to jobs and sample interviews
    // This is done after the candidates and jobs are created so we can reference their IDs
    setTimeout(() => {
      // Get the first job (Frontend Developer) and the first candidate (John)
      const job1 = Array.from(this.jobs.values())[0];
      const candidate1 = Array.from(this.candidates.values())[0];
      
      if (job1 && candidate1) {
        // Get the first stage (New Applications) for the job
        const stages = Array.from(this.jobStages.values())
          .filter(stage => stage.jobId === job1.id)
          .sort((a, b) => a.order - b.order);
        
        if (stages.length > 0) {
          // Create application
          const application1 = this.createApplication({
            jobId: job1.id,
            candidateId: candidate1.id,
            stageId: stages[0].id,
            status: "new",
            notes: "Strong frontend candidate with React experience"
          });
          
          // After application is created, schedule an interview
          application1.then(app => {
            // Create a technical interview 3 days from now
            const interviewDate = new Date();
            interviewDate.setDate(interviewDate.getDate() + 3);
            interviewDate.setHours(10, 0, 0, 0); // 10 AM
            
            this.createInterview({
              applicationId: app.id,
              title: "Technical Interview - Frontend",
              type: "technical",
              scheduledAt: interviewDate,
              duration: 60, // 60 minutes
              location: "Zoom: https://zoom.us/j/123456789",
              status: "scheduled",
              interviewers: ["Sarah Anderson", "John Doe"],
              notes: "Focus on React, TypeScript, and frontend architecture",
              feedback: []
            });
          });
        }
      }
      
      // Get the second job (UX Designer) and the second candidate (Emma)
      const job2 = Array.from(this.jobs.values())[1];
      const candidate2 = Array.from(this.candidates.values())[1];
      
      if (job2 && candidate2) {
        // Get the first stage (New Applications) for the job
        const stages = Array.from(this.jobStages.values())
          .filter(stage => stage.jobId === job2.id)
          .sort((a, b) => a.order - b.order);
        
        if (stages.length > 0) {
          // Create application
          const application2 = this.createApplication({
            jobId: job2.id,
            candidateId: candidate2.id,
            stageId: stages[0].id,
            status: "new",
            notes: "Experienced UX designer with strong portfolio"
          });
          
          // After application is created, schedule an interview
          application2.then(app => {
            // Create a portfolio review 2 days from now
            const interviewDate = new Date();
            interviewDate.setDate(interviewDate.getDate() + 2);
            interviewDate.setHours(14, 30, 0, 0); // 2:30 PM
            
            this.createInterview({
              applicationId: app.id,
              title: "Portfolio Review - UX Designer",
              type: "design",
              scheduledAt: interviewDate,
              duration: 90, // 90 minutes
              location: "Conference Room 3",
              status: "scheduled",
              interviewers: ["Sarah Anderson", "Alex Brown"],
              notes: "Review portfolio and discuss past design projects",
              feedback: []
            });
          });
        }
      }
    }, 100); // Small delay to ensure jobs and candidates are created first
    
    // Initialize with HR user
    this.createUser({
      username: "sarah",
      password: "sarah123",
      fullName: "Sarah Anderson",
      email: "sarah@talenthub.com",
      role: "hr",
      avatar: ""
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Job methods
  async getJobs(): Promise<Job[]> {
    return Array.from(this.jobs.values());
  }

  async getJob(id: number): Promise<Job | undefined> {
    return this.jobs.get(id);
  }

  async createJob(insertJob: InsertJob): Promise<Job> {
    const id = this.jobId++;
    const job: Job = { 
      ...insertJob, 
      id, 
      createdAt: new Date() 
    };
    this.jobs.set(id, job);
    
    // Create default stages for this job
    const defaultStages = [
      { name: "New Applications", order: 1, jobId: id, color: "#6B7280" },
      { name: "Screening", order: 2, jobId: id, color: "#F59E0B" },
      { name: "Assessment", order: 3, jobId: id, color: "#3B82F6" },
      { name: "Interview", order: 4, jobId: id, color: "#10B981" },
      { name: "Offer", order: 5, jobId: id, color: "#8B5CF6" }
    ];
    
    for (const stage of defaultStages) {
      await this.createJobStage(stage);
    }
    
    // Update dashboard stats
    await this.updateDashboardStats({
      ...this.dashboardStats,
      activeJobs: Array.from(this.jobs.values()).filter(j => j.status === "active").length
    });
    
    return job;
  }

  async updateJob(id: number, job: Partial<InsertJob>): Promise<Job | undefined> {
    const existingJob = this.jobs.get(id);
    if (!existingJob) return undefined;
    
    const updatedJob = { ...existingJob, ...job };
    this.jobs.set(id, updatedJob);
    
    // Update dashboard stats if status changes
    if (job.status && job.status !== existingJob.status) {
      await this.updateDashboardStats({
        ...this.dashboardStats,
        activeJobs: Array.from(this.jobs.values()).filter(j => j.status === "active").length
      });
    }
    
    return updatedJob;
  }

  async deleteJob(id: number): Promise<boolean> {
    const deleted = this.jobs.delete(id);
    
    // If deleted successfully, also delete related stages
    if (deleted) {
      const stages = await this.getJobStages(id);
      for (const stage of stages) {
        await this.deleteJobStage(stage.id);
      }
      
      // Update dashboard stats
      await this.updateDashboardStats({
        ...this.dashboardStats,
        activeJobs: Array.from(this.jobs.values()).filter(j => j.status === "active").length
      });
    }
    
    return deleted;
  }

  // Job Stage methods
  async getJobStages(jobId: number): Promise<JobStage[]> {
    return Array.from(this.jobStages.values())
      .filter(stage => stage.jobId === jobId)
      .sort((a, b) => a.order - b.order);
  }

  async createJobStage(insertStage: InsertJobStage): Promise<JobStage> {
    const id = this.stageId++;
    const stage: JobStage = { ...insertStage, id };
    this.jobStages.set(id, stage);
    return stage;
  }

  async updateJobStage(id: number, stage: Partial<InsertJobStage>): Promise<JobStage | undefined> {
    const existingStage = this.jobStages.get(id);
    if (!existingStage) return undefined;
    
    const updatedStage = { ...existingStage, ...stage };
    this.jobStages.set(id, updatedStage);
    return updatedStage;
  }

  async deleteJobStage(id: number): Promise<boolean> {
    return this.jobStages.delete(id);
  }

  // Candidate methods
  async getCandidates(): Promise<Candidate[]> {
    return Array.from(this.candidates.values());
  }

  async getCandidate(id: number): Promise<Candidate | undefined> {
    return this.candidates.get(id);
  }

  async createCandidate(insertCandidate: InsertCandidate): Promise<Candidate> {
    const id = this.candidateId++;
    const candidate: Candidate = { 
      ...insertCandidate, 
      id, 
      createdAt: new Date()
    };
    this.candidates.set(id, candidate);
    
    // Update dashboard stats
    await this.updateDashboardStats({
      ...this.dashboardStats,
      totalCandidates: this.candidates.size
    });
    
    return candidate;
  }

  async updateCandidate(id: number, candidate: Partial<InsertCandidate>): Promise<Candidate | undefined> {
    const existingCandidate = this.candidates.get(id);
    if (!existingCandidate) return undefined;
    
    const updatedCandidate = { ...existingCandidate, ...candidate };
    this.candidates.set(id, updatedCandidate);
    return updatedCandidate;
  }

  async deleteCandidate(id: number): Promise<boolean> {
    const deleted = this.candidates.delete(id);
    
    // Update dashboard stats
    if (deleted) {
      await this.updateDashboardStats({
        ...this.dashboardStats,
        totalCandidates: this.candidates.size
      });
    }
    
    return deleted;
  }

  // Application methods
  async getApplications(): Promise<Application[]> {
    return Array.from(this.applications.values());
  }

  async getApplicationsByJob(jobId: number): Promise<Application[]> {
    return Array.from(this.applications.values())
      .filter(app => app.jobId === jobId);
  }

  async getApplicationsByCandidate(candidateId: number): Promise<Application[]> {
    return Array.from(this.applications.values())
      .filter(app => app.candidateId === candidateId);
  }

  async getApplicationsByStage(stageId: number): Promise<Application[]> {
    return Array.from(this.applications.values())
      .filter(app => app.stageId === stageId);
  }

  async getApplication(id: number): Promise<Application | undefined> {
    return this.applications.get(id);
  }

  async createApplication(insertApplication: InsertApplication): Promise<Application> {
    const id = this.applicationId++;
    const now = new Date();
    const application: Application = { 
      ...insertApplication, 
      id, 
      appliedAt: now,
      updatedAt: now 
    };
    this.applications.set(id, application);
    
    // Update candidatesByStage in dashboard stats
    const stage = this.jobStages.get(application.stageId);
    if (stage) {
      const candidatesByStage: Record<string, number> = { 
        ...this.dashboardStats.candidatesByStage 
      };
      const stageName = stage.name;
      candidatesByStage[stageName] = (candidatesByStage[stageName] || 0) + 1;
      
      await this.updateDashboardStats({
        ...this.dashboardStats,
        candidatesByStage
      });
    }
    
    return application;
  }

  async updateApplication(id: number, application: Partial<InsertApplication>): Promise<Application | undefined> {
    const existingApplication = this.applications.get(id);
    if (!existingApplication) return undefined;
    
    const updatedApplication = { 
      ...existingApplication, 
      ...application,
      updatedAt: new Date()
    };
    this.applications.set(id, updatedApplication);
    
    // If stage changed, update candidatesByStage in dashboard stats
    if (application.stageId && application.stageId !== existingApplication.stageId) {
      const oldStage = this.jobStages.get(existingApplication.stageId);
      const newStage = this.jobStages.get(application.stageId);
      
      if (oldStage && newStage) {
        const candidatesByStage: Record<string, number> = { 
          ...this.dashboardStats.candidatesByStage 
        };
        
        const oldStageName = oldStage.name;
        const newStageName = newStage.name;
        
        candidatesByStage[oldStageName] = Math.max(0, (candidatesByStage[oldStageName] || 0) - 1);
        candidatesByStage[newStageName] = (candidatesByStage[newStageName] || 0) + 1;
        
        await this.updateDashboardStats({
          ...this.dashboardStats,
          candidatesByStage
        });
      }
    }
    
    return updatedApplication;
  }

  async updateApplicationStage(id: number, stageId: number): Promise<Application | undefined> {
    return this.updateApplication(id, { stageId });
  }

  async deleteApplication(id: number): Promise<boolean> {
    const application = this.applications.get(id);
    
    if (application) {
      // Update candidatesByStage in dashboard stats
      const stage = this.jobStages.get(application.stageId);
      if (stage) {
        const candidatesByStage: Record<string, number> = { 
          ...this.dashboardStats.candidatesByStage 
        };
        const stageName = stage.name;
        candidatesByStage[stageName] = Math.max(0, (candidatesByStage[stageName] || 0) - 1);
        
        await this.updateDashboardStats({
          ...this.dashboardStats,
          candidatesByStage
        });
      }
    }
    
    return this.applications.delete(id);
  }

  // Interview methods
  async getInterviews(): Promise<Interview[]> {
    return Array.from(this.interviews.values());
  }

  async getInterviewsByApplication(applicationId: number): Promise<Interview[]> {
    return Array.from(this.interviews.values())
      .filter(interview => interview.applicationId === applicationId);
  }

  async getUpcomingInterviews(): Promise<Interview[]> {
    const now = new Date();
    const oneWeekLater = new Date();
    oneWeekLater.setDate(now.getDate() + 7);
    
    return Array.from(this.interviews.values())
      .filter(interview => 
        interview.status === "scheduled" && 
        interview.scheduledAt >= now && 
        interview.scheduledAt <= oneWeekLater
      )
      .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());
  }

  async getInterview(id: number): Promise<Interview | undefined> {
    return this.interviews.get(id);
  }

  async createInterview(insertInterview: InsertInterview): Promise<Interview> {
    const id = this.interviewId++;
    const interview: Interview = { ...insertInterview, id };
    this.interviews.set(id, interview);
    
    // Update interviewsThisWeek in dashboard stats
    const upcomingInterviews = await this.getUpcomingInterviews();
    await this.updateDashboardStats({
      ...this.dashboardStats,
      interviewsThisWeek: upcomingInterviews.length
    });
    
    return interview;
  }

  async updateInterview(id: number, interview: Partial<InsertInterview>): Promise<Interview | undefined> {
    const existingInterview = this.interviews.get(id);
    if (!existingInterview) return undefined;
    
    const updatedInterview = { ...existingInterview, ...interview };
    this.interviews.set(id, updatedInterview);
    
    // If status or scheduledAt changed, update interviewsThisWeek in dashboard stats
    if (interview.status || interview.scheduledAt) {
      const upcomingInterviews = await this.getUpcomingInterviews();
      await this.updateDashboardStats({
        ...this.dashboardStats,
        interviewsThisWeek: upcomingInterviews.length
      });
    }
    
    return updatedInterview;
  }

  async deleteInterview(id: number): Promise<boolean> {
    const deleted = this.interviews.delete(id);
    
    // Update interviewsThisWeek in dashboard stats
    if (deleted) {
      const upcomingInterviews = await this.getUpcomingInterviews();
      await this.updateDashboardStats({
        ...this.dashboardStats,
        interviewsThisWeek: upcomingInterviews.length
      });
    }
    
    return deleted;
  }

  // Offer methods
  async getOffers(): Promise<Offer[]> {
    return Array.from(this.offers.values());
  }

  async getOffersByApplication(applicationId: number): Promise<Offer[]> {
    return Array.from(this.offers.values())
      .filter(offer => offer.applicationId === applicationId);
  }

  async getOffer(id: number): Promise<Offer | undefined> {
    return this.offers.get(id);
  }

  async createOffer(insertOffer: InsertOffer): Promise<Offer> {
    const id = this.offerId++;
    const offer: Offer = { 
      ...insertOffer, 
      id, 
      createdAt: new Date() 
    };
    this.offers.set(id, offer);
    
    return offer;
  }

  async updateOffer(id: number, offer: Partial<InsertOffer>): Promise<Offer | undefined> {
    const existingOffer = this.offers.get(id);
    if (!existingOffer) return undefined;
    
    const updatedOffer = { ...existingOffer, ...offer };
    this.offers.set(id, updatedOffer);
    
    // If offer is accepted, update avgTimeToHire in dashboard stats
    if (offer.status === "accepted" && existingOffer.status !== "accepted") {
      const application = this.applications.get(existingOffer.applicationId);
      if (application) {
        const timeToHire = Math.floor((new Date().getTime() - application.appliedAt.getTime()) / (1000 * 60 * 60 * 24)); // in days
        
        // Calculate new average time to hire
        const acceptedOffers = Array.from(this.offers.values()).filter(o => o.status === "accepted");
        const newAvgTimeToHire = Math.round((this.dashboardStats.avgTimeToHire * (acceptedOffers.length - 1) + timeToHire) / acceptedOffers.length);
        
        await this.updateDashboardStats({
          ...this.dashboardStats,
          avgTimeToHire: newAvgTimeToHire
        });
      }
    }
    
    return updatedOffer;
  }

  async deleteOffer(id: number): Promise<boolean> {
    return this.offers.delete(id);
  }

  // Dashboard stats methods
  async getDashboardStats(): Promise<DashboardStats> {
    return this.dashboardStats;
  }

  async updateDashboardStats(stats: InsertDashboardStats): Promise<DashboardStats> {
    this.dashboardStats = { 
      ...this.dashboardStats, 
      ...stats,
      updatedAt: new Date()
    };
    return this.dashboardStats;
  }
}

export const storage = new MemStorage();
