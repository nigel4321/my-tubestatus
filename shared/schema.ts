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

// Journey types for TfL integration
export interface JourneyLeg {
  mode: "tube" | "walking";
  lineName?: string;
  direction?: string;
  from: string;
  to: string;
  duration: number;
  stops?: number;
  distance?: number;
}

export interface Disruption {
  severity: "info" | "warning" | "severe";
  message: string;
}

export interface Journey {
  duration: number;
  departureTime: string;
  arrivalTime: string;
  legs: JourneyLeg[];
  disruptions: Disruption[];
  isFastest?: boolean;
}

export interface JourneyRequest {
  from: string;
  to: string;
}
