import { z } from 'zod';

export const invoiceItemSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  rate: z.coerce.number().min(0, 'Rate cannot be negative'),
  amount: z.coerce.number().min(0).optional(),
});

export const invoiceSchema = z.object({
  id: z.string().optional(),
  clientId: z.string().optional(),
  logo: z.string().optional(),
  number: z.string().min(1, 'Invoice number is required'),
  from: z.string().optional(),
  billTo: z.string().min(1, 'Bill To is required'),
  shipTo: z.string().optional(),
  date: z.string().optional(), 
  paymentTerms: z.string().optional(),
  dueDate: z.string().optional(),
  poNumber: z.string().optional(),
  currency: z.string().optional(),
  
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
  
  notes: z.string().optional(),
  terms: z.string().optional(),
  
  taxRate: z.coerce.number().min(0).max(100).optional(),
  discount: z.coerce.number().min(0).optional(),
  shipping: z.coerce.number().min(0).optional(),
  amountPaid: z.coerce.number().min(0).optional(),
  
  subtotal: z.number().optional(),
  taxAmount: z.number().optional(),
  total: z.number().optional(),
  balanceDue: z.number().optional(),
});

export type InvoiceFormData = z.infer<typeof invoiceSchema>;

export const defaultInvoiceValues = {
  clientId: '',
  number: '1',
  currency: 'USD',
  items: [{ description: '', quantity: 1, rate: 0, amount: 0 }],
  taxRate: 0,
  discount: 0,
  shipping: 0,
  amountPaid: 0,
};
