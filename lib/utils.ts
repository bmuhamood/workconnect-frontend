  import { type ClassValue, clsx } from "clsx"
  import { twMerge } from "tailwind-merge"

  export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
  }

  // Format currency for Uganda
  export function formatUGX(amount: number): string {
    return `UGX ${amount.toLocaleString('en-UG')}`
  }

  // Format date
  export function formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-UG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Truncate text
  export function truncateText(text: string, length: number = 100): string {
    if (text.length <= length) return text
    return text.substring(0, length) + '...'
  }

  // Generate avatar initials
  export function getInitials(name: string): string {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }