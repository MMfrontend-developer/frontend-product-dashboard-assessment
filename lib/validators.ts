import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  price: z.number().positive('Price must be greater than 0'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;
