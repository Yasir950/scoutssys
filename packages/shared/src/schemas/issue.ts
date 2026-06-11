import { z } from 'zod';

export const GuarantorSchema = z.object({
  fullName: z.string().min(2).max(100),
  contactNumber: z.string().min(11).max(15),
  cnicNumber: z.string().min(13).max(15),
  depositedItemDescription: z.string().min(5).max(500),
});

export const IssueItemsSchema = z.object({
  scoutId: z.string().cuid(),
  tagNumbers: z.array(z.string().min(2).max(20)).min(1, 'At least one item must be issued'),
  guarantor: GuarantorSchema.optional(),
  notes: z.string().max(500).optional(),
});

export type IssueItemsInput = z.infer<typeof IssueItemsSchema>;
export type GuarantorInput = z.infer<typeof GuarantorSchema>;
