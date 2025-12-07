import PDFDocument from 'pdfkit'
import type { OrgReportData } from '../../../types'

/**
 * Generate a PDF report for an organization
 * Returns a Buffer that can be sent as a response
 */
export async function generateOrgReportPdf(data: OrgReportData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'LETTER' })
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
      doc
        .rect(0, 0, doc.page.width, 120)
        .fill(colors.primary)

      doc
        .fontSize(28)
        .font('Helvetica-Bold')
        .fillColor('#ffffff')
        .text('Organization Impact Report', 50, 30, { align: 'center' })
        .moveDown(0.5)

      // Organization info on banner
      doc
        .fontSize(20)
        .fillColor('#ffffff')
        .text(data.org.name, { align: 'center' })

      if (data.org.EIN) {
        doc
          .fontSize(10)
          .fillColor('#e2e8f0')
          .text(`EIN: ${data.org.EIN}`, { align: 'center' })
      }

      doc
        .fontSize(11)
        .fillColor('#e2e8f0')
        .text(
          `Report Period: ${data.dateRange.from.toLocaleDateString()} - ${data.dateRange.to.toLocaleDateString()}`,
          { align: 'center' }
        )

      // Reset position after banner
      doc.y = 140
      doc.fillColor(colors.text)

      // Summary metrics section with cards
      doc
        .fontSize(18)
        .font('Helvetica-Bold')
        .fillColor(colors.primary)
        .text('Summary Metrics', { underline: true })
        .fillColor(colors.text)
        .moveDown(1)

      // Metric cards in grid layout
      const cardWidth = 150
      const cardHeight = 60
      const cardSpacing = 20
      const startX = 50
      let currentX = startX
      let currentY = doc.y

      const metrics = [
        { label: 'Total Events', value: data.totalEvents.toString(), color: colors.primary },
        { label: 'Total Participants', value: data.totalParticipants.toString(), color: colors.accent },
        { label: 'Total Hours', value: data.totalHours.toFixed(1), color: colors.secondary },
        { label: 'Avg Hours/Participant', value: data.averageHoursPerParticipant.toFixed(2), color: colors.primary },
        { label: 'Avg Participants/Event', value: data.averageParticipantsPerEvent.toFixed(1), color: colors.accent }
      ]

      metrics.forEach((metric, index) => {
        if (index === 3) {
          // Move to next row after 3 cards
          currentX = startX
          currentY += cardHeight + cardSpacing
        }

        // Draw card background
        doc
          .rect(currentX, currentY, cardWidth, cardHeight)
          .fillAndStroke(colors.light, colors.secondary)

        // Draw metric value
        doc
          .fontSize(24)
          .font('Helvetica-Bold')
          .fillColor(metric.color)
          .text(metric.value, currentX + 10, currentY + 10, { width: cardWidth - 20, align: 'left' })

        // Draw metric label
        doc
          .fontSize(9)
          .font('Helvetica')
          .fillColor(colors.secondary)
          .text(metric.label, currentX + 10, currentY + 40, { width: cardWidth - 20, align: 'left' })

        currentX += cardWidth + cardSpacing
      })

      doc.y = currentY + cardHeight + 30
      doc.fillColor(colors.text)

      // Events table with enhanced styling
      doc
        .fontSize(18)
        .font('Helvetica-Bold')
        .fillColor(colors.primary)
        .text('Events', { underline: true })
        .fillColor(colors.text)
        .moveDown(0.8)

      // Table header with background
      const tableTop = doc.y
      const colWidths = { name: 160, date: 85, duration: 60, participants: 85, location: 125 }
      const tableStartX = 50
      const tableWidth = Object.values(colWidths).reduce((sum, w) => sum + w, 0)

      // Header background
      doc
        .rect(tableStartX, tableTop, tableWidth, 25)
        .fill(colors.primary)

      // Calculate column positions
      let xPos = tableStartX + 5
      const colPositions = {
        name: xPos,
        date: xPos + colWidths.name,
        duration: xPos + colWidths.name + colWidths.date,
        participants: xPos + colWidths.name + colWidths.date + colWidths.duration,
        location: xPos + colWidths.name + colWidths.date + colWidths.duration + colWidths.participants
      }

      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('#ffffff')
        .text('Event Name', colPositions.name, tableTop + 8, { width: colWidths.name - 10, align: 'left' })
        .text('Date', colPositions.date, tableTop + 8, { width: colWidths.date - 5, align: 'left' })
        .text('Hours', colPositions.duration, tableTop + 8, { width: colWidths.duration - 5, align: 'center' })
        .text('Participants', colPositions.participants, tableTop + 8, { width: colWidths.participants - 5, align: 'center' })
        .text('Location', colPositions.location, tableTop + 8, { width: colWidths.location - 5, align: 'left' })

      doc.y = tableTop + 28
      doc.fillColor(colors.text)

      // Table rows with alternating colors
      doc.font('Helvetica').fontSize(9)
      data.events.forEach((event: typeof data.events[0], index: number) => {
        const rowY = doc.y
        const rowHeight = 26

        // Alternating row background
        if (index % 2 === 0) {
          doc.rect(tableStartX, rowY, tableWidth, rowHeight).fill(colors.light)
          doc.fillColor(colors.text)
        }

        // Draw each cell independently with proper positioning
        doc.text(event.name, colPositions.name, rowY + 7, { width: colWidths.name - 10, align: 'left', lineBreak: false, ellipsis: true })
        doc.text(event.date.toLocaleDateString(), colPositions.date, rowY + 7, { width: colWidths.date - 5, align: 'left' })
        doc.text(event.duration.toString(), colPositions.duration, rowY + 7, { width: colWidths.duration - 5, align: 'center' })
        doc.text(event.participants.toString(), colPositions.participants, rowY + 7, { width: colWidths.participants - 5, align: 'center' })
        doc.text(event.location, colPositions.location, rowY + 7, { width: colWidths.location - 5, align: 'left', lineBreak: false, ellipsis: true })
        
        doc.y = rowY + rowHeight
      })

      doc.moveDown(2)

      // Per-user summaries with enhanced styling
      if (data.perUserSummaries.length > 0) {
        doc.addPage()
        
        // Reset colors and add header banner
        doc
          .rect(0, 0, doc.page.width, 80)
          .fill(colors.primary)
        
        doc
          .fontSize(22)
          .font('Helvetica-Bold')
          .fillColor('#ffffff')
          .text('Individual Volunteer Summary', 50, 30, { align: 'center' })
        
        doc.y = 100
        doc.fillColor(colors.text)

        const userTableTop = doc.y
        const userColWidths = { name: 180, email: 200, events: 80, hours: 80 }
        const userTableStartX = 50
        const userTableWidth = Object.values(userColWidths).reduce((sum, w) => sum + w, 0)

        // Header background
        doc
          .rect(userTableStartX, userTableTop, userTableWidth, 25)
          .fill(colors.accent)

        // Calculate column positions for user table
        const userColPositions = {
          name: userTableStartX + 5,
          email: userTableStartX + userColWidths.name,
          events: userTableStartX + userColWidths.name + userColWidths.email,
          hours: userTableStartX + userColWidths.name + userColWidths.email + userColWidths.events
        }

        doc
          .fontSize(10)
          .font('Helvetica-Bold')
          .fillColor('#ffffff')
          .text('Name', userColPositions.name, userTableTop + 8, { width: userColWidths.name - 10, align: 'left' })
          .text('Email', userColPositions.email, userTableTop + 8, { width: userColWidths.email - 10, align: 'left' })
          .text('Events Attended', userColPositions.events, userTableTop + 8, { width: userColWidths.events - 5, align: 'center' })
          .text('Total Hours', userColPositions.hours, userTableTop + 8, { width: userColWidths.hours - 5, align: 'center' })

        doc.y = userTableTop + 28
        doc.fillColor(colors.text)
        doc.font('Helvetica').fontSize(9)

        data.perUserSummaries.forEach((user: typeof data.perUserSummaries[0], index: number) => {
          const rowY = doc.y
          const rowHeight = 26

          // Alternating row background
          if (index % 2 === 0) {
            doc.rect(userTableStartX, rowY, userTableWidth, rowHeight).fill(colors.light)
            doc.fillColor(colors.text)
          }

          // Draw each cell independently with proper positioning
          doc.text(user.name || user.email || user.userId, userColPositions.name, rowY + 7, { width: userColWidths.name - 10, align: 'left', lineBreak: false, ellipsis: true })
          doc.text(user.email || user.userId, userColPositions.email, rowY + 7, { width: userColWidths.email - 10, align: 'left', lineBreak: false, ellipsis: true })
          doc.text(user.totalEvents.toString(), userColPositions.events, rowY + 7, { width: userColWidths.events - 5, align: 'center' })
          doc.text(user.totalHours.toFixed(1), userColPositions.hours, rowY + 7, { width: userColWidths.hours - 5, align: 'center' })
          
          doc.y = rowY + rowHeight
        })

        doc.moveDown(2)
      }

      // Group summaries with enhanced styling
      if (data.groupSummaries.length > 0) {
        if (data.perUserSummaries.length === 0) {
          doc.addPage()
          
          // Add header banner
          doc
            .rect(0, 0, doc.page.width, 80)
            .fill(colors.primary)
          
          doc
            .fontSize(22)
            .font('Helvetica-Bold')
            .fillColor('#ffffff')
            .text('Group/Bulk Attendance Summary', 50, 30, { align: 'center' })
          
          doc.y = 100
        } else {
          doc
            .fontSize(18)
            .font('Helvetica-Bold')
            .fillColor(colors.primary)
            .text('Group/Bulk Attendance', { underline: true })
            .moveDown(0.8)
        }

        doc.fillColor(colors.text)
        const groupTableTop = doc.y
        const groupColWidths = { name: 220, events: 90, participants: 100, hours: 90 }
        const groupTableStartX = 50
        const groupTableWidth = Object.values(groupColWidths).reduce((sum, w) => sum + w, 0)

        // Header background
        doc
          .rect(groupTableStartX, groupTableTop, groupTableWidth, 25)
          .fill(colors.secondary)

        // Calculate column positions for group table
        const groupColPositions = {
          name: groupTableStartX + 5,
          events: groupTableStartX + groupColWidths.name,
          participants: groupTableStartX + groupColWidths.name + groupColWidths.events,
          hours: groupTableStartX + groupColWidths.name + groupColWidths.events + groupColWidths.participants
        }

        doc
          .fontSize(10)
          .font('Helvetica-Bold')
          .fillColor('#ffffff')
          .text('Group Name', groupColPositions.name, groupTableTop + 8, { width: groupColWidths.name - 10, align: 'left' })
          .text('Events', groupColPositions.events, groupTableTop + 8, { width: groupColWidths.events - 5, align: 'center' })
          .text('Participants', groupColPositions.participants, groupTableTop + 8, { width: groupColWidths.participants - 5, align: 'center' })
          .text('Total Hours', groupColPositions.hours, groupTableTop + 8, { width: groupColWidths.hours - 5, align: 'center' })

        doc.y = groupTableTop + 28
        doc.fillColor(colors.text)
        doc.font('Helvetica').fontSize(9)

        data.groupSummaries.forEach((group: typeof data.groupSummaries[0], index: number) => {
          const rowY = doc.y
          const rowHeight = 26

          // Alternating row background
          if (index % 2 === 0) {
            doc.rect(groupTableStartX, rowY, groupTableWidth, rowHeight).fill(colors.light)
            doc.fillColor(colors.text)
          }

          // Draw each cell independently with proper positioning
          doc.text(group.groupLabel, groupColPositions.name, rowY + 7, { width: groupColWidths.name - 10, align: 'left', lineBreak: false, ellipsis: true })
          doc.text(group.totalEvents.toString(), groupColPositions.events, rowY + 7, { width: groupColWidths.events - 5, align: 'center' })
          doc.text(group.totalParticipants.toString(), groupColPositions.participants, rowY + 7, { width: groupColWidths.participants - 5, align: 'center' })
          doc.text(group.totalHours.toFixed(1), groupColPositions.hours, rowY + 7, { width: groupColWidths.hours - 5, align: 'center' })
          
          doc.y = rowY + rowHeight
        })
      }

      // Footer with enhanced styling
      const footerY = doc.page.height - 60
      
      doc
        .rect(0, footerY, doc.page.width, 60)
        .fill(colors.light)
      
      doc
        .fontSize(8)
        .fillColor(colors.secondary)
        .text(
          `Generated on ${new Date().toLocaleString()}`,
          50,
          footerY + 15,
          { align: 'center' }
        )
        .text(
          'Peak Impact - Organization Reporting System',
          50,
          footerY + 30,
          { align: 'center' }
        )

      doc.end()
    } catch (error) {
      reject(error)
    }
  })
}
