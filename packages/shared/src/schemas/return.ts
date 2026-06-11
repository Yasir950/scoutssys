import { z } from 'zod';

const returnConditions = ['GOOD', 'DAMAGED', 'LOST'] as const;
const paymentMethods = ['CASH', 'UBL', 'JAZZCASH', 'EASYPAISA'] as const;

export const ReturnItemSchema = z.object({
  issuedItemId: z.string().cuid(),
  condition: z.enum(returnConditions),
  notes: z.string().max(500).optional(),
});

export const BatchReturnSchema = z.object({
  scoutId: z.string().cuid(),
  items: z.array(ReturnItemSchema).min(1),
});

export const ExchangeItemSchema = z.object({
  oldIssuedItemId: z.string().cuid(),
  newTagNumber: z.string().min(2).max(20),
  reason: z.enum(['BATTERY_LOW', 'TORN', 'DAMAGED', 'SIZE_ISSUE', 'OTHER']),
  notes: z.string().max(500).optional(),
});

export const PayFineSchema = z.object({
  paymentMethod: z.enum(paymentMethods),
  notes: z.string().max(500).optional(),
});

export type ReturnItemInput = z.infer<typeof ReturnItemSchema>;
export type BatchReturnInput = z.infer<typeof BatchReturnSchema>;
export type ExchangeItemInput = z.infer<typeof ExchangeItemSchema>;
export type PayFineInput = z.infer<typeof PayFineSchema>;
