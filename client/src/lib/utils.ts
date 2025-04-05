import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date to readable format
export function formatDate(date: Date | string) {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Get initials from name
export function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

// Get status badge color
export function getStatusBadgeColor(status: string | undefined) {
  if (!status) return 'bg-neutral-100 text-neutral-800';
  
  switch (status.toLowerCase()) {
    case 'new':
      return 'bg-purple-100 text-purple-800';
    case 'screening':
      return 'bg-yellow-100 text-yellow-800';
    case 'assessment':
      return 'bg-blue-100 text-blue-800';
    case 'interview':
      return 'bg-green-100 text-green-800';
    case 'offer':
      return 'bg-pink-100 text-pink-800';
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'interviewing':
      return 'bg-blue-100 text-blue-800';
    case 'offered':
      return 'bg-purple-100 text-purple-800';
    case 'hired':
      return 'bg-primary-100 text-primary-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-neutral-100 text-neutral-800';
  }
}
