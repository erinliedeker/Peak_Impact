import type { Org, Event } from './models'

/**
 * Input parameters for generating an organization report
 */
export interface OrgReportInput {
  orgId: string
  dateFrom: string | Date
  dateTo: string | Date
}

/**
 * Per-user summary for individual volunteer tracking
 */
export interface PerUserSummary {
  userId: string
  email?: string
  totalHours: number
  totalEvents: number
}

/**
 * Group summary for bulk attendance entries
 */
export interface GroupSummary {
  groupLabel: string
  totalParticipants: number
  totalHours: number
  totalEvents: number
}

/**
 * Event data enriched with attendance metrics for reports
 */
export interface ReportEventData {
  id: string
  name: string
  date: Date
  duration: number // scheduled event duration in hours
  participants: number // total participants from attendance records
  location: string
  capacity: number
}

/**
 * Complete organization report data structure
 */
export interface OrgReportData {
  org: Org
  dateRange: {
    from: Date
    to: Date
  }
  totalEvents: number
  totalParticipants: number // derived from attendance records
  totalHours: number // derived from attendance records
  averageHoursPerParticipant: number
  averageParticipantsPerEvent: number
  events: ReportEventData[]
  perUserSummaries: PerUserSummary[]
  groupSummaries: GroupSummary[]
}

/**
 * Organization summary within a user report
 */
export interface UserReportOrgSummary {
  orgId: string
  orgName: string
  totalHours: number
  totalEvents: number
  events: Array<{
    eventId: string
    eventName: string
    date: Date
    hours: number
  }>
}

/**
 * User volunteer report data structure
 */
export interface UserReportData {
  userId: string
  userName: string
  email?: string
  totalImpactScore: number
  totalVolunteerHours: number
  totalEventsCompleted: number
  organizationSummaries: UserReportOrgSummary[]
  reportGeneratedDate: Date
}
