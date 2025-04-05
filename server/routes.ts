import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertJobSchema, 
  insertJobStageSchema, 
  insertCandidateSchema, 
  insertApplicationSchema, 
  insertInterviewSchema, 
  insertOfferSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const apiRouter = express.Router();
  
  // ===== User Routes =====
  apiRouter.post("/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });
  
  apiRouter.get("/users/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const user = await storage.getUser(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(user);
  });
  
  // ===== Job Routes =====
  apiRouter.get("/jobs", async (req, res) => {
    const jobs = await storage.getJobs();
    res.json(jobs);
  });
  
  apiRouter.get("/jobs/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid job ID" });
    }
    
    const job = await storage.getJob(id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    
    res.json(job);
  });
  
  apiRouter.post("/jobs", async (req, res) => {
    try {
      const jobData = insertJobSchema.parse(req.body);
      const job = await storage.createJob(jobData);
      res.status(201).json(job);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid job data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create job" });
    }
  });
  
  apiRouter.put("/jobs/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid job ID" });
    }
    
    try {
      const jobData = insertJobSchema.partial().parse(req.body);
      const updatedJob = await storage.updateJob(id, jobData);
      
      if (!updatedJob) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      res.json(updatedJob);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid job data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update job" });
    }
  });
  
  apiRouter.delete("/jobs/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid job ID" });
    }
    
    const deleted = await storage.deleteJob(id);
    if (!deleted) {
      return res.status(404).json({ message: "Job not found" });
    }
    
    res.status(204).end();
  });
  
  // ===== Job Stage Routes =====
  apiRouter.get("/jobs/:jobId/stages", async (req, res) => {
    const jobId = parseInt(req.params.jobId);
    if (isNaN(jobId)) {
      return res.status(400).json({ message: "Invalid job ID" });
    }
    
    const stages = await storage.getJobStages(jobId);
    res.json(stages);
  });
  
  apiRouter.post("/job-stages", async (req, res) => {
    try {
      const stageData = insertJobStageSchema.parse(req.body);
      const stage = await storage.createJobStage(stageData);
      res.status(201).json(stage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid stage data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create job stage" });
    }
  });
  
  apiRouter.put("/job-stages/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid stage ID" });
    }
    
    try {
      const stageData = insertJobStageSchema.partial().parse(req.body);
      const updatedStage = await storage.updateJobStage(id, stageData);
      
      if (!updatedStage) {
        return res.status(404).json({ message: "Job stage not found" });
      }
      
      res.json(updatedStage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid stage data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update job stage" });
    }
  });
  
  apiRouter.delete("/job-stages/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid stage ID" });
    }
    
    const deleted = await storage.deleteJobStage(id);
    if (!deleted) {
      return res.status(404).json({ message: "Job stage not found" });
    }
    
    res.status(204).end();
  });
  
  // ===== Candidate Routes =====
  apiRouter.get("/candidates", async (req, res) => {
    const candidates = await storage.getCandidates();
    res.json(candidates);
  });
  
  apiRouter.get("/candidates/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid candidate ID" });
    }
    
    const candidate = await storage.getCandidate(id);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    
    res.json(candidate);
  });
  
  apiRouter.post("/candidates", async (req, res) => {
    try {
      const candidateData = insertCandidateSchema.parse(req.body);
      const candidate = await storage.createCandidate(candidateData);
      res.status(201).json(candidate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid candidate data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create candidate" });
    }
  });
  
  apiRouter.put("/candidates/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid candidate ID" });
    }
    
    try {
      const candidateData = insertCandidateSchema.partial().parse(req.body);
      const updatedCandidate = await storage.updateCandidate(id, candidateData);
      
      if (!updatedCandidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }
      
      res.json(updatedCandidate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid candidate data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update candidate" });
    }
  });
  
  apiRouter.delete("/candidates/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid candidate ID" });
    }
    
    const deleted = await storage.deleteCandidate(id);
    if (!deleted) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    
    res.status(204).end();
  });
  
  // ===== Application Routes =====
  apiRouter.get("/applications", async (req, res) => {
    const applications = await storage.getApplications();
    res.json(applications);
  });
  
  apiRouter.get("/applications/job/:jobId", async (req, res) => {
    const jobId = parseInt(req.params.jobId);
    if (isNaN(jobId)) {
      return res.status(400).json({ message: "Invalid job ID" });
    }
    
    const applications = await storage.getApplicationsByJob(jobId);
    res.json(applications);
  });
  
  apiRouter.get("/applications/candidate/:candidateId", async (req, res) => {
    const candidateId = parseInt(req.params.candidateId);
    if (isNaN(candidateId)) {
      return res.status(400).json({ message: "Invalid candidate ID" });
    }
    
    const applications = await storage.getApplicationsByCandidate(candidateId);
    res.json(applications);
  });
  
  apiRouter.get("/applications/stage/:stageId", async (req, res) => {
    const stageId = parseInt(req.params.stageId);
    if (isNaN(stageId)) {
      return res.status(400).json({ message: "Invalid stage ID" });
    }
    
    const applications = await storage.getApplicationsByStage(stageId);
    res.json(applications);
  });
  
  apiRouter.get("/applications/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid application ID" });
    }
    
    const application = await storage.getApplication(id);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }
    
    res.json(application);
  });
  
  apiRouter.post("/applications", async (req, res) => {
    try {
      const applicationData = insertApplicationSchema.parse(req.body);
      
      // Validate that candidate and job exist
      const candidate = await storage.getCandidate(applicationData.candidateId);
      const job = await storage.getJob(applicationData.jobId);
      const stage = await storage.getJobStage(applicationData.stageId);
      
      if (!candidate) {
        return res.status(400).json({ message: "Candidate not found" });
      }
      
      if (!job) {
        return res.status(400).json({ message: "Job not found" });
      }
      
      if (!stage) {
        return res.status(400).json({ message: "Stage not found" });
      }
      
      const application = await storage.createApplication(applicationData);
      res.status(201).json(application);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid application data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create application" });
    }
  });
  
  apiRouter.put("/applications/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid application ID" });
    }
    
    try {
      const applicationData = insertApplicationSchema.partial().parse(req.body);
      const updatedApplication = await storage.updateApplication(id, applicationData);
      
      if (!updatedApplication) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      res.json(updatedApplication);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid application data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update application" });
    }
  });
  
  apiRouter.put("/applications/:id/stage/:stageId", async (req, res) => {
    const id = parseInt(req.params.id);
    const stageId = parseInt(req.params.stageId);
    
    if (isNaN(id) || isNaN(stageId)) {
      return res.status(400).json({ message: "Invalid application ID or stage ID" });
    }
    
    const updatedApplication = await storage.updateApplicationStage(id, stageId);
    
    if (!updatedApplication) {
      return res.status(404).json({ message: "Application not found" });
    }
    
    res.json(updatedApplication);
  });
  
  apiRouter.delete("/applications/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid application ID" });
    }
    
    const deleted = await storage.deleteApplication(id);
    if (!deleted) {
      return res.status(404).json({ message: "Application not found" });
    }
    
    res.status(204).end();
  });
  
  // ===== Interview Routes =====
  apiRouter.get("/interviews", async (req, res) => {
    const interviews = await storage.getInterviews();
    res.json(interviews);
  });
  
  apiRouter.get("/interviews/upcoming", async (req, res) => {
    const interviews = await storage.getUpcomingInterviews();
    res.json(interviews);
  });
  
  apiRouter.get("/interviews/application/:applicationId", async (req, res) => {
    const applicationId = parseInt(req.params.applicationId);
    if (isNaN(applicationId)) {
      return res.status(400).json({ message: "Invalid application ID" });
    }
    
    const interviews = await storage.getInterviewsByApplication(applicationId);
    res.json(interviews);
  });
  
  apiRouter.get("/interviews/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid interview ID" });
    }
    
    const interview = await storage.getInterview(id);
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }
    
    res.json(interview);
  });
  
  apiRouter.post("/interviews", async (req, res) => {
    try {
      const interviewData = insertInterviewSchema.parse(req.body);
      
      // Validate that application exists
      const application = await storage.getApplication(interviewData.applicationId);
      if (!application) {
        return res.status(400).json({ message: "Application not found" });
      }
      
      const interview = await storage.createInterview(interviewData);
      res.status(201).json(interview);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid interview data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create interview" });
    }
  });
  
  apiRouter.put("/interviews/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid interview ID" });
    }
    
    try {
      const interviewData = insertInterviewSchema.partial().parse(req.body);
      const updatedInterview = await storage.updateInterview(id, interviewData);
      
      if (!updatedInterview) {
        return res.status(404).json({ message: "Interview not found" });
      }
      
      res.json(updatedInterview);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid interview data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update interview" });
    }
  });
  
  apiRouter.delete("/interviews/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid interview ID" });
    }
    
    const deleted = await storage.deleteInterview(id);
    if (!deleted) {
      return res.status(404).json({ message: "Interview not found" });
    }
    
    res.status(204).end();
  });
  
  // ===== Offer Routes =====
  apiRouter.get("/offers", async (req, res) => {
    const offers = await storage.getOffers();
    res.json(offers);
  });
  
  apiRouter.get("/offers/application/:applicationId", async (req, res) => {
    const applicationId = parseInt(req.params.applicationId);
    if (isNaN(applicationId)) {
      return res.status(400).json({ message: "Invalid application ID" });
    }
    
    const offers = await storage.getOffersByApplication(applicationId);
    res.json(offers);
  });
  
  apiRouter.get("/offers/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid offer ID" });
    }
    
    const offer = await storage.getOffer(id);
    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }
    
    res.json(offer);
  });
  
  apiRouter.post("/offers", async (req, res) => {
    try {
      const offerData = insertOfferSchema.parse(req.body);
      
      // Validate that application exists
      const application = await storage.getApplication(offerData.applicationId);
      if (!application) {
        return res.status(400).json({ message: "Application not found" });
      }
      
      const offer = await storage.createOffer(offerData);
      res.status(201).json(offer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid offer data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create offer" });
    }
  });
  
  apiRouter.put("/offers/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid offer ID" });
    }
    
    try {
      const offerData = insertOfferSchema.partial().parse(req.body);
      const updatedOffer = await storage.updateOffer(id, offerData);
      
      if (!updatedOffer) {
        return res.status(404).json({ message: "Offer not found" });
      }
      
      res.json(updatedOffer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid offer data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update offer" });
    }
  });
  
  apiRouter.delete("/offers/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid offer ID" });
    }
    
    const deleted = await storage.deleteOffer(id);
    if (!deleted) {
      return res.status(404).json({ message: "Offer not found" });
    }
    
    res.status(204).end();
  });
  
  // ===== Dashboard Stats Routes =====
  apiRouter.get("/dashboard-stats", async (req, res) => {
    const stats = await storage.getDashboardStats();
    res.json(stats);
  });

  // Register API routes
  app.use("/api", apiRouter);
  
  const httpServer = createServer(app);
  return httpServer;
}
