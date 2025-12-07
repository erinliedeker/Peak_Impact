import type { Event, AttendanceRecord, Org } from '../../../types'

/**
 * Mock data for testing - replace with real DB/API calls later
 */

export const mockOrgs: Record<string, Org> = {
  'org-1': {
    id: 'org-1',
    name: 'Mountain View High School',
    EIN: '12-3456789',
    admins: ['user-admin-1']
  },
  'org-2': {
    id: 'org-2',
    name: 'Community Action Network',
    EIN: '98-7654321',
    admins: ['user-admin-2']
  }
}

export const mockEvents: Event[] = [
  {
    id: 'event-1',
    name: 'Beach Cleanup',
    date: new Date('2025-11-15T09:00:00Z'),
    duration: 3,
    participants: 45,
    location: 'Ocean Beach',
    org: 'org-1',
    capacity: 50
  },
  {
    id: 'event-2',
    name: 'Food Bank Volunteer Day',
    date: new Date('2025-11-20T10:00:00Z'),
    duration: 4,
    participants: 120,
    location: 'Downtown Food Bank',
    org: 'org-1',
    capacity: 150
  },
  {
    id: 'event-3',
    name: 'Trail Maintenance',
    date: new Date('2025-12-01T08:00:00Z'),
    duration: 5,
    participants: 30,
    location: 'Peak Trail',
    org: 'org-1',
    capacity: 40
  }
]

export const mockAttendance: AttendanceRecord[] = [
  // Individual user records
  {
    id: 'att-1',
    eventId: 'event-1',
    orgId: 'org-1',
    userId: 'user-1',
    participantCount: 1,
    hoursPerParticipant: 3,
    totalHours: 3,
    createdAt: new Date('2025-11-15T09:00:00Z')
  },
  {
    id: 'att-2',
    eventId: 'event-1',
    orgId: 'org-1',
    userId: 'user-2',
    participantCount: 1,
    hoursPerParticipant: 3,
    totalHours: 3,
    createdAt: new Date('2025-11-15T09:00:00Z')
  },
  {
    id: 'att-3',
    eventId: 'event-2',
    orgId: 'org-1',
    userId: 'user-1',
    participantCount: 1,
    hoursPerParticipant: 4,
    totalHours: 4,
    createdAt: new Date('2025-11-20T10:00:00Z')
  },
  // Group/bulk records
  {
    id: 'att-4',
    eventId: 'event-1',
    orgId: 'org-1',
    groupLabel: 'Class of 2026 - Section A',
    participantCount: 25,
    hoursPerParticipant: 3,
    totalHours: 75,
    createdAt: new Date('2025-11-15T09:00:00Z')
  },
  {
    id: 'att-5',
    eventId: 'event-1',
    orgId: 'org-1',
    groupLabel: 'Class of 2026 - Section B',
    participantCount: 18,
    hoursPerParticipant: 3,
    totalHours: 54,
    createdAt: new Date('2025-11-15T09:00:00Z')
  },
  {
    id: 'att-6',
    eventId: 'event-2',
    orgId: 'org-1',
    groupLabel: 'Senior Class Volunteers',
    participantCount: 50,
    hoursPerParticipant: 4,
    totalHours: 200,
    createdAt: new Date('2025-11-20T10:00:00Z')
  },
  {
    id: 'att-7',
    eventId: 'event-2',
    orgId: 'org-1',
    groupLabel: 'Junior Class Volunteers',
    participantCount: 69,
    hoursPerParticipant: 4,
    totalHours: 276,
    createdAt: new Date('2025-11-20T10:00:00Z')
  },
  {
    id: 'att-8',
    eventId: 'event-3',
    orgId: 'org-1',
    groupLabel: 'Environmental Club',
    participantCount: 30,
    hoursPerParticipant: 5,
    totalHours: 150,
    createdAt: new Date('2025-12-01T08:00:00Z')
  }
]

export const mockUsers: Record<string, { id: string; email: string }> = {
  'user-1': { id: 'user-1', email: 'john.doe@example.com' },
  'user-2': { id: 'user-2', email: 'jane.smith@example.com' }
}
