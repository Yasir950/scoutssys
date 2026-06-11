import { z } from 'zod';

const shifts = ['MORNING', 'AFTERNOON', 'EVENING', 'NIGHT', 'FULL_DAY'] as const;

export const CreateDutyDepartmentSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
});

export const AssignDutySchema = z.object({
  registrationNumber: z.string().min(1, 'Registration number is required'),
  departmentId: z.string().cuid(),
  gateName: z.string().min(1).max(100),
  shift: z.enum(shifts),
  reportingTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM format'),
  inchargeName: z.string().min(2).max(100),
  notes: z.string().max(500).optional(),
});

export type AssignDutyInput = z.infer<typeof AssignDutySchema>;
export type CreateDutyDepartmentInput = z.infer<typeof CreateDutyDepartmentSchema>;