/**
 * Core data models for Peak Impact
 */

export interface User {
  id: string
  email: string
  orgs: string[] // IDs of orgs they belong to, or empty if none
  age: number | null
}

export interface Org {
  id: string
  name: string
  EIN?: string // optional tax ID
  admins: string[] // user IDs of admins for this org
}

export interface Event {
  id: string
  name: string
  date: Date | string // ISO string for serialization
  duration: number // in hours
  participants: number // total participant count for quick summary
  location: string
  org: string // orgId
  capacity: number
}

export const globalCategories = [
  "Animal Welfare & Rescue",
  "Arts & Culture Preservation",
  "Cancer Research & Support",
  "Children's Education & Literacy",
  "Civil Rights & Advocacy",
  "Climate Change Mitigation",
  "Community Development & Planning",
  "Disability Rights & Support",
  "Disaster Relief & Preparedness",
  "Elder Care & Senior Services",
  "Environmental Conservation & Cleanup",
  "Food Security & Hunger Relief",
  "Healthcare Access & Wellness",
  "Homelessness & Housing Support",
  "Immigrant & Refugee Aid",
  "Job Training & Workforce Development",
  "LGBTQ+ Rights & Support",
  "Mental Health Awareness",
  "Natural Disaster Relief",
  "Open Source Software Development",
  "Park & Trail Maintenance",
  "Political & Voter Registration",
  "Poverty Reduction",
  "Recreational Sports Coaching",
  "Recycling & Waste Reduction",
  "Science, Technology, Engineering, & Math (STEM) Education",
  "Veterans Support",
  "Wildlife Protection",
  "Youth Mentorship & Development"
]

/**
 * AttendanceRecord supports both individual and group/bulk attendance tracking
 * 
 * Individual tracking: userId is present, participantCount = 1
 * Group/bulk tracking: groupLabel is present, userId is null, participantCount > 1
 */
export interface AttendanceRecord {
  id: string
  eventId: string
  orgId: string
  userId?: string // present for per-user tracking
  groupLabel?: string // present for bulk/group entries (e.g., "Class of 2026 – Section B")
  participantCount: number // 1 for individuals; >1 for group entries
  hoursPerParticipant: number
  totalHours: number // usually participantCount * hoursPerParticipant
  createdAt: Date | string // ISO string for serialization
}
