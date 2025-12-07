import { z } from 'zod'
import { generateVolunteerLetterPdf } from '../../utils/pdf/orgReportPdf' // Assumed location
// Schema matching your requested parameters
const volunteerReportSchema = z.object({
  volunteerName: z.string().min(1, 'Volunteer Name is required'),
  organization: z.object({
    name: z.string(),
    email: z.string().email(),
    description: z.string().optional(),
  }),
  events: z.array(z.object({
    name: z.string(),
    date: z.string().or(z.date()).transform(val => new Date(val)),
    // Mapping "checkin time" and "checkout time" to camelCase for code usage
    checkInTime: z.string().or(z.date()).transform(val => new Date(val)),
    checkOutTime: z.string().or(z.date()).transform(val => new Date(val)),
  }))
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const validatedData = volunteerReportSchema.parse(body)

    // 1. Calculate Durations
    let totalMilliseconds = 0
    const processedEvents = validatedData.events.map(e => {
      const durationMs = e.checkOutTime.getTime() - e.checkInTime.getTime()
      totalMilliseconds += durationMs
      return {
        ...e,
        // Format: "X hrs Y mins"
        durationLabel: formatDuration(durationMs)
      }
    })

    // 2. Format Totals
    const totalHours = (totalMilliseconds / (1000 * 60 * 60)).toFixed(1)
    
    // 3. Determine Date Range
    const sortedDates = validatedData.events.map(e => e.date.getTime()).sort()
    const dateRange = {
      start: new Date(sortedDates[0]),
      end: new Date(sortedDates[sortedDates.length - 1])
    }

    // 4. Generate PDF
    const pdfBuffer = await generateVolunteerLetterPdf({
      ...validatedData,
      events: processedEvents,
      totalHours,
      dateRange
    })

    // 5. Return PDF
    setHeader(event, 'Content-Type', 'application/pdf')
    setHeader(event, 'Content-Disposition', `attachment; filename="Peak-Impact-Verification.pdf"`)
    
    return pdfBuffer

  } catch (error) {
    throw createError({ statusCode: 500, statusMessage: 'Generation Failed', data: error })
  }
})

// Helper: 90 mins -> "1 hr 30 mins"
function formatDuration(ms: number) {
  const hours = Math.floor(ms / (1000 * 60 * 60))
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
  if (hours > 0) return `${hours} hr ${minutes > 0 ? minutes + ' min' : ''}`
  return `${minutes} min`
}