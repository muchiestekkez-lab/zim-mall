import { z } from 'zod'

export const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  role: z.enum(['CUSTOMER', 'SELLER']).default('CUSTOMER'),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const storeSchema = z.object({
  name: z
    .string()
    .min(3, 'Store name must be at least 3 characters')
    .max(60, 'Store name too long'),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(500, 'Description too long'),
  whatsapp: z
    .string()
    .min(9, 'Invalid phone number')
    .max(15)
    .optional()
    .or(z.literal('')),
  phone: z.string().min(9).max(15).optional().or(z.literal('')),
  location: z.string().min(1, 'Location is required'),
  logo: z.string().optional(),
  banner: z.string().optional(),
})

export const productSchema = z.object({
  name: z
    .string()
    .min(3, 'Product name must be at least 3 characters')
    .max(100, 'Product name too long'),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(2000, 'Description too long'),
  price: z
    .number({ invalid_type_error: 'Price must be a number' })
    .positive('Price must be greater than 0')
    .max(999999, 'Price too high'),
  category: z.string().min(1, 'Category is required'),
  location: z.string().min(1, 'Location is required'),
  deliveryType: z.enum(['DELIVERY', 'PICKUP', 'BOTH']),
  condition: z.enum(['NEW', 'USED']),
  stock: z
    .number({ invalid_type_error: 'Stock must be a number' })
    .int()
    .min(0, 'Stock cannot be negative'),
  images: z.array(z.string()).min(1, 'At least one image is required').max(8),
})

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
  storeId: z.string().optional(),
  productId: z.string().optional(),
})

export const reportSchema = z.object({
  reason: z.string().min(1, 'Reason is required'),
  description: z.string().max(500).optional(),
  productId: z.string().optional(),
  storeId: z.string().optional(),
  userId: z.string().optional(),
})

export const searchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  location: z.string().optional(),
  deliveryType: z.enum(['DELIVERY', 'PICKUP', 'BOTH']).optional(),
  condition: z.enum(['NEW', 'USED']).optional(),
  sort: z.enum(['newest', 'price_asc', 'price_desc', 'popular']).optional(),
  page: z.number().int().min(1).default(1),
})

export type SignUpInput = z.infer<typeof signUpSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type StoreInput = z.infer<typeof storeSchema>
export type ProductInput = z.infer<typeof productSchema>
export type ReviewInput = z.infer<typeof reviewSchema>
export type ReportInput = z.infer<typeof reportSchema>
export type SearchInput = z.infer<typeof searchSchema>
