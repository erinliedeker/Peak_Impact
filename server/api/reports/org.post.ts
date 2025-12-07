import { z } from 'zod'
import { buildOrgReportData } from '../../../server/utils/reports'
import { generateOrgReportPdf } from '../../../server/utils/pdf/orgReportPdf'

// Request body validation schema
const reportRequestSchema = z.object({
  orgId: z.string().min(1, 'Organization ID is required'),
  dateFrom: z.string().or(z.date()).transform(val => {
    if (typeof val === 'string') {
      // Handle both date strings (YYYY-MM-DD) and ISO datetime strings
      return new Date(val)
    }
    return val
  }),
  dateTo: z.string().or(z.date()).transform(val => {
    if (typeof val === 'string') {
      // Handle both date strings (YYYY-MM-DD) and ISO datetime strings
      return new Date(val)
    }
    return val
  }),
  format: z.enum(['json', 'pdf', 'csv']).optional().default('json')
})

/**
 * Generate CSV from report data
 */
function generateCSV(reportData: any): string {
  const lines: string[] = []
  
  // Header section
  lines.push('Organization Report')
  lines.push(`Organization,${reportData.org.name}`)
  if (reportData.org.EIN) {
    lines.push(`EIN,${reportData.org.EIN}`)
  }
  lines.push(`Report Period,${reportData.dateRange.from.toLocaleDateString()} - ${reportData.dateRange.to.toLocaleDateString()}`)
  lines.push('')
  
  // Summary metrics
  lines.push('Summary Metrics')
  lines.push(`Total Events,${reportData.totalEvents}`)
  lines.push(`Total Participants,${reportData.totalParticipants}`)
  lines.push(`Total Hours,${reportData.totalHours.toFixed(1)}`)
  lines.push(`Average Hours per Participant,${reportData.averageHoursPerParticipant.toFixed(2)}`)
  lines.push(`Average Participants per Event,${reportData.averageParticipantsPerEvent.toFixed(1)}`)
  lines.push('')
  
  // Events table
  lines.push('Events')
  lines.push('Event Name,Date,Hours,Participants,Location')
  reportData.events.forEach((event: any) => {
    const date = event.date instanceof Date ? event.date : new Date(event.date)
    lines.push(`"${event.name}",${date.toLocaleDateString()},${event.duration},${event.participants},"${event.location}"`)
  })
  lines.push('')
  
  // Individual volunteers
  if (reportData.perUserSummaries.length > 0) {
    lines.push('Individual Volunteers')
    lines.push('Name,Email,Events,Total Hours')
    reportData.perUserSummaries.forEach((user: any) => {
      const name = user.name || ''
      lines.push(`"${name}","${user.email || user.userId}",${user.totalEvents},${user.totalHours.toFixed(1)}`)
    })
    lines.push('')
  }
  
  // Group attendance
  if (reportData.groupSummaries.length > 0) {
    lines.push('Group Attendance')
    lines.push('Group Name,Events,Participants,Total Hours')
    reportData.groupSummaries.forEach((group: any) => {
      lines.push(`"${group.groupLabel}",${group.totalEvents},${group.totalParticipants},${group.totalHours.toFixed(1)}`)
    })
  }
  
  return lines.join('\n')
}

export default defineEventHandler(async (event) => {
  try {
    // Parse and validate request body
    const body = await readBody(event)
    const validatedInput = reportRequestSchema.parse(body)

    // Build report data
    const reportData = await buildOrgReportData({
      orgId: validatedInput.orgId,
      dateFrom: validatedInput.dateFrom,
      dateTo: validatedInput.dateTo
    })

    // Return format based on request
    if (validatedInput.format === 'csv') {
      // Generate CSV
      const csvContent = generateCSV(reportData)

      // Set response headers for CSV download
      setHeader(event, 'Content-Type', 'text/csv')
      setHeader(
        event,
        'Content-Disposition',
        `attachment; filename="org-report-${reportData.org.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv"`
      )

      return csvContent
    }
    
    if (validatedInput.format === 'pdf') {
      // Generate PDF
      const pdfBuffer = await generateOrgReportPdf(reportData)

      // Set response headers for PDF download
      setHeader(event, 'Content-Type', 'application/pdf')
      setHeader(
        event,
        'Content-Disposition',
        `attachment; filename="org-report-${reportData.org.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf"`
      )

      return pdfBuffer
    }

    // Default: return JSON
    return reportData
  } catch (error) {
    console.error('Error generating org report:', error)

    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid request data',
        data: error.issues
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to generate organization report',
      data: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})
