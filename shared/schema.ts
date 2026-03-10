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

export const quizSubmissionSchema = z.object({
  firstName: z.string().min(1),
  email: z.string().email(),
  ownsBusiness: z.boolean(),
  revenueRange: z.string().nullable(),
  answers: z.array(z.number()).length(15),
});

export type QuizSubmission = z.infer<typeof quizSubmissionSchema>;

export const resendRetrySchema = z.object({
  firstName: z.string().min(1),
  email: z.string().email(),
  primaryArchetype: z.string(),
  axisScores: z.object({
    DI: z.number(),
    OD: z.number(),
    CR: z.number(),
    RT: z.number(),
    SV: z.number(),
  }),
  ctaRoute: z.string(),
});

export type ResendRetry = z.infer<typeof resendRetrySchema>;
