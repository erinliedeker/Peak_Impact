import type {
  Event,
  AttendanceRecord,
  Org,
  OrgReportInput,
  OrgReportData,
  PerUserSummary,
  GroupSummary,
  ReportEventData,
  ConnectEvent,
  VolunteerAttendance
} from '../../../types'
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'
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
 * Fetch events for an organization within a date range from Firebase
 */
export async function fetchOrgEventsForRange(
  orgId: string,
  from: Date,
  to: Date
): Promise<ConnectEvent[]> {
  try {
    const db = getFirestore()
    const eventsRef = collection(db, 'events')
    
    // Query events by organization ID
    const q = query(
      eventsRef,
      where('organizationId', '==', orgId)
    )
    
    const snapshot = await getDocs(q)
    const events: ConnectEvent[] = []
    
    snapshot.docs.forEach(doc => {
      const data = doc.data()
      const eventDate = new Date(data.date)
      
      // Filter by date range
      if (eventDate >= from && eventDate <= to) {
        events.push({
          id: doc.id,
          title: data.title || 'Untitled Event',
          description: data.description || '',
          organizationId: data.organizationId,
          organizationName: data.organizationName || '',
          location: data.location || {},
          date: data.date,
          start: data.start || null,
          end: data.end || null,
          category: data.category || 'Social',
          volunteersNeeded: data.volunteersNeeded || 0,
          volunteersSignedUp: data.volunteersSignedUp || 0,
          isMicroProject: data.isMicroProject || false,
          suppliesNeeded: data.suppliesNeeded || [],
          attendees: data.attendees || [],
          createdAt: data.createdAt || new Date().toISOString(),
          isExternal: data.isExternal || false,
          externalUrl: data.externalUrl || undefined,
          imageUrl: data.imageUrl || undefined
        } as ConnectEvent)
      }
    })
    
    return events
  } catch (error) {
    console.error(`[fetchOrgEventsForRange] Error fetching events for org ${orgId}:`, error)
    return []
  }
}

/**
 * Convert Firebase attendee data to AttendanceRecord format
 */
function convertAttendeeToAttendanceRecord(
  eventId: string,
  orgId: string,
  attendee: VolunteerAttendance,
  eventDate: string
): AttendanceRecord {
  // Calculate hours based on check-in and check-out times
  let hoursWorked = 0
  if (attendee.checkInTime && attendee.checkOutTime) {
    const checkIn = new Date(attendee.checkInTime).getTime()
    const checkOut = new Date(attendee.checkOutTime).getTime()
    hoursWorked = (checkOut - checkIn) / (1000 * 60 * 60) // Convert ms to hours
  }
  
  return {
    id: `${eventId}-${attendee.volunteerId}`,
    eventId,
    orgId,
    userId: attendee.volunteerId,
    participantCount: 1,
    hoursPerParticipant: hoursWorked,
    totalHours: hoursWorked,
    createdAt: new Date(eventDate)
  } as AttendanceRecord
}

/**
 * Fetch attendance records for an organization within a date range from Firebase
 */
export async function fetchAttendanceForOrgAndRange(
  orgId: string,
  from: Date,
  to: Date
): Promise<AttendanceRecord[]> {
  try {
    const db = getFirestore()
    const events = await fetchOrgEventsForRange(orgId, from, to)
    
    const attendanceRecords: AttendanceRecord[] = []
    
    // Extract attendee data from each event
    events.forEach(event => {
      if (event.attendees && Array.isArray(event.attendees)) {
        event.attendees.forEach((attendee: VolunteerAttendance) => {
          const record = convertAttendeeToAttendanceRecord(
            event.id,
            orgId,
            attendee,
            event.date
          )
          attendanceRecords.push(record)
        })
      }
    })
    
    return attendanceRecords
  } catch (error) {
    console.error(`[fetchAttendanceForOrgAndRange] Error fetching attendance for org ${orgId}:`, error)
    return []
  }
}

/**
 * Fetch organization by ID from Firebase
 */
export async function fetchOrgById(orgId: string): Promise<Org | null> {
  try {
    const db = getFirestore()
    const orgRef = doc(db, 'organizations', orgId)
    const docSnap = await getDoc(orgRef)
    
    if (docSnap.exists()) {
      const data = docSnap.data()
      return {
        id: docSnap.id,
        name: data.name || 'Unknown Organization',
        EIN: data.ein || null,
        admins: data.admins || []
      } as Org
    }
    
    return null
  } catch (error) {
    console.error(`[fetchOrgById] Error fetching org ${orgId}:`, error)
    return null
  }
}

/**
 * Fetch user profiles from Firebase
 */
async function fetchUserProfiles(userIds: string[]): Promise<Map<string, { email?: string; name?: string }>> {
  try {
    const db = getFirestore()
    const userMap = new Map<string, { email?: string; name?: string }>()
    
    if (userIds.length === 0) return userMap
    
    // Fetch user documents in chunks (Firestore limit is 10 items per query)
    const CHUNK_SIZE = 10
    for (let i = 0; i < userIds.length; i += CHUNK_SIZE) {
      const chunk = userIds.slice(i, i + CHUNK_SIZE)
      
      for (const userId of chunk) {
        try {
          const userRef = doc(db, 'users', userId)
          const userSnap = await getDoc(userRef)
          
          if (userSnap.exists()) {
            const data = userSnap.data()
            userMap.set(userId, { email: data.email || `User ${userId}`, name: data.name || undefined })
          } else {
            userMap.set(userId, { email: `User ${userId}` })
          }
        } catch (error) {
          console.warn(`[fetchUserProfiles] Could not fetch user ${userId}:`, error)
          userMap.set(userId, { email: `User ${userId}` })
        }
      }
    }
    
    return userMap
  } catch (error) {
    console.error('[fetchUserProfiles] Error fetching user profiles:', error)
    return new Map()
  }
}

/**
 * Build per-user summaries from attendance records
 */
async function buildPerUserSummaries(attendance: AttendanceRecord[]): Promise<PerUserSummary[]> {
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

  // Fetch user emails from Firebase
  const userIds = Array.from(userMap.keys())
  const profileMap = await fetchUserProfiles(userIds)

  // Convert to array of summaries
  return Array.from(userMap.entries()).map(([userId, stats]) => {
    const profile = profileMap.get(userId)
    return {
      userId,
      name: profile?.name,
      email: profile?.email || `User ${userId}`,
      totalHours: stats.totalHours,
      totalEvents: stats.eventIds.size
    }
  })
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
  events: ConnectEvent[],
  attendance: AttendanceRecord[]
): ReportEventData[] {
  return events.map((event) => {
    const eventAttendance = attendance.filter(att => att.eventId === event.id)
    const totalParticipants = eventAttendance.reduce((sum, att) => sum + att.participantCount, 0)

    return {
      id: event.id,
      name: event.title,
      date: new Date(event.date),
      duration: event.start && event.end ? calculateDuration(event.start, event.end) : 0,
      participants: totalParticipants,
      location: typeof event.location === 'string' ? event.location : JSON.stringify(event.location),
      capacity: event.volunteersNeeded || 0
    }
  })
}

/**
 * Helper to calculate duration from start and end times
 */
function calculateDuration(start: string | null, end: string | null): number {
  if (!start || !end) return 0
  try {
    const startTime = new Date(start).getTime()
    const endTime = new Date(end).getTime()
    return (endTime - startTime) / (1000 * 60 * 60) // Convert ms to hours
  } catch {
    return 0
  }
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

  // Build summaries - await async function
  const perUserSummaries = await buildPerUserSummaries(attendance)
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
