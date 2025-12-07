import type {
  Event,
  AttendanceRecord,
  Org,
  OrgReportInput,
  OrgReportData,
  PerUserSummary,
  GroupSummary,
  ReportEventData
} from '../../../types'
import { mockEvents, mockAttendance, mockOrgs, mockUsers } from './mockData'

/**
 * Validate date range for report generation
 * @throws Error if date range is invalid
 */
function validateDateRange(from: Date, to: Date): void {
  // Check if dates are valid
  if (isNaN(from.getTime())) {
    throw new Error('Invalid start date')
  }
  if (isNaN(to.getTime())) {
    throw new Error('Invalid end date')
  }

  // Check if start date is before end date
  if (from > to) {
    throw new Error('Start date must be before end date')
  }

  // Check if date range is too large (e.g., more than 2 years)
  const maxDays = 730 // 2 years
  const daysDiff = Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24))
  if (daysDiff > maxDays) {
    throw new Error(`Date range too large. Maximum ${maxDays} days allowed.`)
  }

  // Check if dates are not too far in the future
  const now = new Date()
  const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())
  if (to > oneYearFromNow) {
    throw new Error('End date cannot be more than one year in the future')
  }
}

/**
 * Fetch events for an organization within a date range
 * TODO: Replace with real Firebase/DB query
 */
export async function fetchOrgEventsForRange(
  orgId: string,
  from: Date,
  to: Date
): Promise<Event[]> {
  // Mock implementation
  return mockEvents.filter((event) => {
    const eventDate = new Date(event.date)
    return (
      event.org === orgId
      && eventDate >= from
      && eventDate <= to
    )
  })
}

/**
 * Fetch attendance records for an organization within a date range
 * TODO: Replace with real Firebase/DB query
 */
export async function fetchAttendanceForOrgAndRange(
  orgId: string,
  from: Date,
  to: Date
): Promise<AttendanceRecord[]> {
  // Mock implementation
  const orgEvents = await fetchOrgEventsForRange(orgId, from, to)
  const eventIds = new Set(orgEvents.map(e => e.id))

  return mockAttendance.filter(att => att.orgId === orgId && eventIds.has(att.eventId))
}

/**
 * Fetch organization by ID
 * TODO: Replace with real Firebase/DB query
 */
export async function fetchOrgById(orgId: string): Promise<Org | null> {
  return mockOrgs[orgId] || null
}

/**
 * Build per-user summaries from attendance records
 */
function buildPerUserSummaries(attendance: AttendanceRecord[]): PerUserSummary[] {
  const userMap = new Map<string, { totalHours: number; eventIds: Set<string> }>()

  // Aggregate only records with userId
  attendance
    .filter(att => att.userId)
    .forEach((att) => {
      const userId = att.userId!
      if (!userMap.has(userId)) {
        userMap.set(userId, { totalHours: 0, eventIds: new Set() })
      }
      const userStats = userMap.get(userId)!
      userStats.totalHours += att.totalHours
      userStats.eventIds.add(att.eventId)
    })

  // Convert to array of summaries
  return Array.from(userMap.entries()).map(([userId, stats]) => ({
    userId,
    email: mockUsers[userId]?.email, // TODO: fetch from real user DB
    totalHours: stats.totalHours,
    totalEvents: stats.eventIds.size
  }))
}

/**
 * Build group summaries from attendance records
 */
function buildGroupSummaries(attendance: AttendanceRecord[]): GroupSummary[] {
  const groupMap = new Map<string, { totalParticipants: number; totalHours: number; eventIds: Set<string> }>()

  // Aggregate only records with groupLabel
  attendance
    .filter(att => att.groupLabel)
    .forEach((att) => {
      const groupLabel = att.groupLabel!
      if (!groupMap.has(groupLabel)) {
        groupMap.set(groupLabel, { totalParticipants: 0, totalHours: 0, eventIds: new Set() })
      }
      const groupStats = groupMap.get(groupLabel)!
      groupStats.totalParticipants += att.participantCount
      groupStats.totalHours += att.totalHours
      groupStats.eventIds.add(att.eventId)
    })

  // Convert to array of summaries
  return Array.from(groupMap.entries()).map(([groupLabel, stats]) => ({
    groupLabel,
    totalParticipants: stats.totalParticipants,
    totalHours: stats.totalHours,
    totalEvents: stats.eventIds.size
  }))
}

/**
 * Build event data with attendance metrics
 */
function buildReportEventData(
  events: Event[],
  attendance: AttendanceRecord[]
): ReportEventData[] {
  return events.map((event) => {
    const eventAttendance = attendance.filter(att => att.eventId === event.id)
    const totalParticipants = eventAttendance.reduce((sum, att) => sum + att.participantCount, 0)

    return {
      id: event.id,
      name: event.name,
      date: new Date(event.date),
      duration: event.duration,
      participants: totalParticipants,
      location: event.location,
      capacity: event.capacity
    }
  })
}

/**
 * Main function to build complete organization report data
 */
export async function buildOrgReportData(input: OrgReportInput): Promise<OrgReportData> {
  const from = new Date(input.dateFrom)
  const to = new Date(input.dateTo)

  // Validate date range
  validateDateRange(from, to)

  // Fetch data
  const org = await fetchOrgById(input.orgId)
  if (!org) {
    throw new Error(`Organization not found: ${input.orgId}`)
  }

  const events = await fetchOrgEventsForRange(input.orgId, from, to)
  const attendance = await fetchAttendanceForOrgAndRange(input.orgId, from, to)

  // Calculate aggregates
  const totalEvents = events.length
  const totalParticipants = attendance.reduce((sum, att) => sum + att.participantCount, 0)
  const totalHours = attendance.reduce((sum, att) => sum + att.totalHours, 0)

  const averageHoursPerParticipant = totalParticipants > 0
    ? totalHours / totalParticipants
    : 0

  const averageParticipantsPerEvent = totalEvents > 0
    ? totalParticipants / totalEvents
    : 0

  // Build summaries
  const perUserSummaries = buildPerUserSummaries(attendance)
  const groupSummaries = buildGroupSummaries(attendance)
  const reportEvents = buildReportEventData(events, attendance)

  return {
    org,
    dateRange: { from, to },
    totalEvents,
    totalParticipants,
    totalHours,
    averageHoursPerParticipant,
    averageParticipantsPerEvent,
    events: reportEvents,
    perUserSummaries,
    groupSummaries
  }
}
