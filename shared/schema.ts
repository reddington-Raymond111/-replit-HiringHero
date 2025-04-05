import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("user"), // admin, hr, manager, user
  avatar: text("avatar"),
});

export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true 
});

// Job model
export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  department: text("department").notNull(),
  location: text("location").notNull(),
  description: text("description").notNull(),
  requirements: text("requirements").notNull(),
  type: text("type").notNull(), // full-time, part-time, contract
  status: text("status").notNull().default("draft"), // draft, active, closed
  salary: text("salary"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  createdBy: integer("created_by").notNull(),
  channels: jsonb("channels").notNull().default({}), // stores where job is posted
});

export const insertJobSchema = createInsertSchema(jobs).omit({ 
  id: true,
  createdAt: true 
});

// Job stage model for recruitment pipeline
export const jobStages = pgTable("job_stages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  order: integer("order").notNull(),
  jobId: integer("job_id").notNull(),
  color: text("color").notNull().default("#3f51b5"),
});

export const insertJobStageSchema = createInsertSchema(jobStages).omit({ 
  id: true 
});

// Candidate model
export const candidates = pgTable("candidates", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  resumeUrl: text("resume_url"),
  linkedIn: text("linkedin_url"),
  currentJobTitle: text("current_job_title"),
  currentCompany: text("current_company"),
  notes: text("notes"),
  tags: jsonb("tags").notNull().default([]),
  source: text("source"), // where candidate applied from
  createdAt: timestamp("created_at").notNull().defaultNow(),
  status: text("status").notNull().default("active"), // active, hired, archived
});

export const insertCandidateSchema = createInsertSchema(candidates).omit({ 
  id: true,
  createdAt: true 
});

// Application model
export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  candidateId: integer("candidate_id").notNull(),
  jobId: integer("job_id").notNull(),
  stageId: integer("stage_id").notNull(),
  status: text("status").notNull().default("new"), // new, in-progress, rejected, accepted
  appliedAt: timestamp("applied_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  notes: text("notes"),
  feedback: jsonb("feedback").notNull().default([])
});

export const insertApplicationSchema = createInsertSchema(applications).omit({ 
  id: true,
  appliedAt: true,
  updatedAt: true
});

// Interview model
export const interviews = pgTable("interviews", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").notNull(),
  title: text("title").notNull(),
  type: text("type").notNull(), // phone, video, technical, onsite
  scheduledAt: timestamp("scheduled_at").notNull(),
  duration: integer("duration").notNull(), // minutes
  location: text("location"), // url for video or room for onsite
  interviewers: jsonb("interviewers").notNull().default([]),
  status: text("status").notNull().default("scheduled"), // scheduled, completed, cancelled
  feedback: jsonb("feedback").notNull().default([]),
  notes: text("notes"),
});

export const insertInterviewSchema = createInsertSchema(interviews).omit({ 
  id: true 
});

// Offer model
export const offers = pgTable("offers", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").notNull(),
  salary: text("salary").notNull(),
  startDate: timestamp("start_date").notNull(),
  expiryDate: timestamp("expiry_date").notNull(),
  benefits: jsonb("benefits").notNull().default([]),
  status: text("status").notNull().default("draft"), // draft, sent, accepted, rejected
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertOfferSchema = createInsertSchema(offers).omit({ 
  id: true,
  createdAt: true 
});

// Dashboard stats model (for caching dashboard statistics)
export const dashboardStats = pgTable("dashboard_stats", {
  id: serial("id").primaryKey(),
  activeJobs: integer("active_jobs").notNull().default(0),
  totalCandidates: integer("total_candidates").notNull().default(0),
  interviewsThisWeek: integer("interviews_this_week").notNull().default(0),
  avgTimeToHire: integer("avg_time_to_hire").notNull().default(0), // days
  candidatesByStage: jsonb("candidates_by_stage").notNull().default({}),
  applicationsTimeline: jsonb("applications_timeline").notNull().default([]), 
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertDashboardStatsSchema = createInsertSchema(dashboardStats).omit({ 
  id: true,
  updatedAt: true 
});

// Types for the schema
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;

export type JobStage = typeof jobStages.$inferSelect;
export type InsertJobStage = z.infer<typeof insertJobStageSchema>;

export type Candidate = typeof candidates.$inferSelect;
export type InsertCandidate = z.infer<typeof insertCandidateSchema>;

export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;

export type Interview = typeof interviews.$inferSelect;
export type InsertInterview = z.infer<typeof insertInterviewSchema>;

export type Offer = typeof offers.$inferSelect;
export type InsertOffer = z.infer<typeof insertOfferSchema>;

export type DashboardStats = typeof dashboardStats.$inferSelect;
export type InsertDashboardStats = z.infer<typeof insertDashboardStatsSchema>;
