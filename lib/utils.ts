import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-ZW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatRelativeDate(date: Date | string): string {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(date)
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length).trimEnd() + '...'
}

export function generateUniqueSlug(base: string): string {
  const slug = slugify(base)
  const suffix = Math.random().toString(36).substring(2, 8)
  return `${slug}-${suffix}`
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function formatPhoneNumber(phone: string): string {
  // Format Zimbabwe phone numbers
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('263')) {
    return `+${cleaned}`
  }
  if (cleaned.startsWith('0')) {
    return `+263${cleaned.slice(1)}`
  }
  return phone
}

export function getWhatsAppUrl(phone: string, message?: string): string {
  const cleaned = phone.replace(/\D/g, '')
  const number = cleaned.startsWith('263') ? cleaned : `263${cleaned.replace(/^0/, '')}`
  const encodedMessage = message ? encodeURIComponent(message) : ''
  return `https://wa.me/${number}${encodedMessage ? `?text=${encodedMessage}` : ''}`
}

export function isSubscriptionActive(endDate: Date | null | undefined): boolean {
  if (!endDate) return false
  return new Date(endDate) > new Date()
}

export const CATEGORIES = [
  { name: 'Electronics', slug: 'electronics', icon: 'monitor' },
  { name: 'Clothing & Fashion', slug: 'clothing-fashion', icon: 'shirt' },
  { name: 'Home & Garden', slug: 'home-garden', icon: 'home' },
  { name: 'Vehicles', slug: 'vehicles', icon: 'car' },
  { name: 'Services', slug: 'services', icon: 'briefcase' },
  { name: 'Food & Beverages', slug: 'food-beverages', icon: 'utensils' },
  { name: 'Health & Beauty', slug: 'health-beauty', icon: 'heart' },
  { name: 'Sports & Outdoors', slug: 'sports-outdoors', icon: 'activity' },
  { name: 'Books & Education', slug: 'books-education', icon: 'book' },
  { name: 'Agriculture', slug: 'agriculture', icon: 'leaf' },
  { name: 'Property & Real Estate', slug: 'property-real-estate', icon: 'building' },
  { name: 'Baby & Kids', slug: 'baby-kids', icon: 'baby' },
] as const

export const ZIMBABWE_LOCATIONS = [
  'Harare',
  'Bulawayo',
  'Chitungwiza',
  'Mutare',
  'Gweru',
  'Kwekwe',
  'Kadoma',
  'Masvingo',
  'Chinhoyi',
  'Marondera',
  'Norton',
  'Chegutu',
  'Zvishavane',
  'Bindura',
  'Beitbridge',
  'Redcliff',
  'Victoria Falls',
  'Hwange',
  'Rusape',
  'Kariba',
  'Nationwide',
] as const

export const PAYMENT_METHODS = [
  { id: 'ecocash', label: 'EcoCash' },
  { id: 'mukuru', label: 'Mukuru' },
  { id: 'innbucks', label: 'InnBucks' },
  { id: 'usd_cash', label: 'USD Cash' },
  { id: 'zig', label: 'ZiG' },
  { id: 'bank_transfer', label: 'Bank Transfer' },
  { id: 'zipit', label: 'ZIPIT' },
] as const
