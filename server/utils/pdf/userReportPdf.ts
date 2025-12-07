import PDFDocument from 'pdfkit'
import type { UserReportData } from '../../../types'

/**
 * Generate a PDF report for a user's volunteer hours and impact
 * Returns a Buffer that can be sent as a response
 */
export async function generateUserReportPdf(data: UserReportData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 20, size: 'LETTER' })
      const chunks: Buffer[] = []

      // Collect PDF data
      doc.on('data', chunk => chunks.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      // Colors for enhanced styling
      const colors = {
        primary: '#2563eb', // blue
        secondary: '#64748b', // slate
        accent: '#10b981', // green
        text: '#1e293b', // dark slate
        light: '#f1f5f9' // very light slate
      }

      // Header with colored banner
      const headerHeight = 120

      doc
        .rect(0, 0, doc.page.width, headerHeight)
        .fill(colors.primary)

      // Title
      doc
        .fontSize(24)
        .font('Helvetica-Bold')
        .fillColor('#e2e8f0')
        .text('Volunteer Impact Report', 50, 24, { align: 'center' })

      // User info on banner (anchored positions for consistent layout)
      doc
        .fontSize(18)
        .fillColor('#e2e8f0')
        .text(data.userName, 50, 58, { align: 'center' })

      if (data.email) {
        doc
          .fontSize(10)
          .fillColor('#cbd5e1')
          .text(`Email: ${data.email}`, 50, 82, { align: 'center' })
      }

      const reportGeneratedDate = new Date(data.reportGeneratedDate)

      doc
        .fontSize(10)
        .fillColor('#e2e8f0')
        .text(
          `Report Generated: ${reportGeneratedDate.toLocaleDateString()}`,
          50,
          102,
          { align: 'center' }
        )

      // Reset position after banner with tighter spacing (manual layout, no auto page adds)
      const pageHeight = doc.page.height
      const footerReserve = 40
      let cursorY = headerHeight + 8
      doc.fillColor(colors.text)

      // Summary metrics (single row, absolute positions to prevent spill)
      doc
        .fontSize(15)
        .font('Helvetica-Bold')
        .fillColor(colors.primary)
        .text('Summary', 40, cursorY, { underline: true })
      cursorY += 20

      const cardWidth = 160
      const cardHeight = 42
      const cardSpacing = 6
      const startX = 40
      let currentX = startX

      const metrics = [
        { label: 'Impact', value: data.totalImpactScore.toString(), color: colors.primary },
        { label: 'Hours', value: data.totalVolunteerHours.toFixed(1), color: colors.accent },
        { label: 'Events', value: data.totalEventsCompleted.toString(), color: colors.secondary }
      ]

      metrics.forEach((metric) => {
        doc
          .rect(currentX, cursorY, cardWidth, cardHeight)
          .fillAndStroke(colors.light, colors.secondary)

        doc
          .fontSize(20)
          .font('Helvetica-Bold')
          .fillColor(metric.color)
          .text(metric.value, currentX + 10, cursorY + 8, { width: cardWidth - 20, align: 'left' })

        doc
          .fontSize(8)
          .font('Helvetica')
          .fillColor(colors.secondary)
          .text(metric.label, currentX + 10, cursorY + 28, { width: cardWidth - 20, align: 'left' })

        currentX += cardWidth + cardSpacing
      })

      cursorY += cardHeight + 10

      // No additional sections to keep the page minimal

      // Minimal footer removed to save space and force single page
      doc.end()
    } catch (error) {
      reject(error)
    }
  })
}
