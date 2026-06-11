import { z } from 'zod';

const itemStatuses = ['AVAILABLE', 'ISSUED', 'DAMAGED', 'LOST', 'UNDER_MAINTENANCE'] as const;
const itemConditions = ['NEW', 'GOOD', 'USED', 'DAMAGED'] as const;

export const CreateInventoryCategorySchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
});

export const CreateCabinShelfSchema = z.object({
  cabinNumber: z.string().min(1).max(20),
  shelfLabel: z.string().min(1).max(20),
  description: z.string().max(200).optional(),
});

export const CreateInventoryItemSchema = z.object({
  tagNumber: z.string().min(2).max(20).regex(/^[A-Z0-9-]+$/, 'Tag number must be alphanumeric uppercase'),
  name: z.string().min(2).max(200),
  categoryId: z.string().cuid(),
  condition: z.enum(itemConditions).default('NEW'),
  originalPrice: z.number().nonnegative(),
  cabinShelfId: z.string().cuid().optional(),
  notes: z.string().max(500).optional(),
});

export const UpdateInventoryItemSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  condition: z.enum(itemConditions).optional(),
  status: z.enum(itemStatuses).optional(),
  cabinShelfId: z.string().cuid().nullable().optional(),
  notes: z.string().max(500).optional(),
});

export const InventoryFilterSchema = z.object({
  categoryId: z.string().cuid().optional(),
  status: z.enum(itemStatuses).optional(),
  condition: z.enum(itemConditions).optional(),
  cabinShelfId: z.string().cuid().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateInventoryItemInput = z.infer<typeof CreateInventoryItemSchema>;
export type UpdateInventoryItemInput = z.infer<typeof UpdateInventoryItemSchema>;
export type InventoryFilterInput = z.infer<typeof InventoryFilterSchema>;
