import { generateUserReportPdf } from '~~/server/utils/pdf/userReportPdf'
import type { UserReportData } from '~~/types'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const userData: UserReportData = body

    // Generate PDF buffer
    const pdfBuffer = await generateUserReportPdf(userData)

    // Set response headers for PDF download
    setHeader(event, 'Content-Type', 'application/pdf')
    setHeader(event, 'Content-Disposition', `attachment; filename="volunteer-report-${new Date().getTime()}.pdf"`)

    return pdfBuffer
  } catch (error) {
    console.error('Error generating user report PDF:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to generate report'
    })
  }
})
