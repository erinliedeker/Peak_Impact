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
