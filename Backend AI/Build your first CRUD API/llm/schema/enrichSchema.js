import { z } from "zod";

// This defines the exact shape the AI's answer must match.
// If the AI returns anything different, it gets rejected.
export const enrichOutputSchema = z.object({
   category: z.enum(["work", "personal", "shopping", "health", "other"]),
   priority: z.enum(["low", "medium", "high"]),
   suggestion: z.string(),
   confidence: z.number().min(0).max(1),
});

// This defines what a valid INPUT looks like (what the user sends us).
export const enrichInputSchema = z.object({
   title: z.string().min(1, "title is required").max(200, "title too long (max 200 chars)"),
});