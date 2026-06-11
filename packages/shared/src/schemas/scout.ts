import { z } from 'zod';

const bloodGroups = ['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG'] as const;

export const CreateScoutSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  fatherName: z.string().min(2, 'Father name must be at least 2 characters').max(100),
  cnicOrBForm: z.string().min(13, 'CNIC/B-Form must be 13 digits').max(15),
  contactNumber: z.string().min(11, 'Contact number must be at least 11 digits').max(15),
  emergencyContact: z.string().min(11, 'Emergency contact must be at least 11 digits').max(15),
  city: z.string().min(2, 'City is required').max(100),
  area: z.string().min(2, 'Area is required').max(100),
  unitName: z.string().min(2, 'Unit name is required').max(100),
  age: z.coerce.number().int().min(8, 'Minimum age is 8').max(25, 'Maximum age is 25'),
  bloodGroup: z.enum(['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG']),
  hasPreviousExperience: z.boolean().default(false),
  photoBase64: z.string().optional(),
});

export const UpdateScoutSchema = CreateScoutSchema.partial();

export const ScoutSearchSchema = z.object({
  q: z.string().optional(),
  city: z.string().optional(),
  unitName: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateScoutInput = z.infer<typeof CreateScoutSchema>;
export type UpdateScoutInput = z.infer<typeof UpdateScoutSchema>;
export type ScoutSearchInput = z.infer<typeof ScoutSearchSchema>;