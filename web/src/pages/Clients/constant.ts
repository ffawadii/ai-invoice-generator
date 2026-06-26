import { z } from 'zod';

export const clientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  address: z.string().optional(),
});

export type ClientFormData = z.infer<typeof clientSchema>;

export const defaultClientValues = {
  name: '',
  email: '',
  address: '',
};
