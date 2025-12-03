import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Journey types for TfL integration - Zod schemas
export const journeyLegSchema = z.object({
  mode: z.enum(["tube", "walking"]),
  lineName: z.string().optional(),
  direction: z.string().optional(),
  from: z.string(),
  to: z.string(),
  duration: z.number(),
  stops: z.number().optional(),
  distance: z.number().optional(),
});

export const disruptionSchema = z.object({
  severity: z.enum(["info", "warning", "severe"]),
  message: z.string(),
});

export const journeySchema = z.object({
  duration: z.number(),
  departureTime: z.string(),
  arrivalTime: z.string(),
  legs: z.array(journeyLegSchema),
  disruptions: z.array(disruptionSchema),
  isFastest: z.boolean().optional(),
});

export const journeyRequestSchema = z.object({
  from: z.string(),
  to: z.string(),
});

// Insert schemas for validation
export const insertJourneyLegSchema = journeyLegSchema;
export const insertDisruptionSchema = disruptionSchema;
export const insertJourneySchema = journeySchema.extend({
  isFastest: z.boolean(),
});

// TypeScript types inferred from Zod schemas
export type JourneyLeg = z.infer<typeof journeyLegSchema>;
export type Disruption = z.infer<typeof disruptionSchema>;
export type Journey = z.infer<typeof journeySchema>;
export type JourneyRequest = z.infer<typeof journeyRequestSchema>;
