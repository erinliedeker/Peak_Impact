import PDFDocument from 'pdfkit'

export async function generateVolunteerLetterPdf(data: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'LETTER' })
    const chunks: Buffer[] = []

    doc.on('data', (chunk) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    // Fonts
    const fontRegular = 'Helvetica'
    const fontBold = 'Helvetica-Bold'

    // --------------------------
    // HEADER
    // --------------------------
    doc
      .fontSize(16)
      .font(fontBold)
      .text('Peak Impact', 50, 50)

    const todayStr = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })

    doc
      .fontSize(10)
      .font(fontRegular)
      .text(todayStr, 400, 55, { align: 'right' })

    doc.moveDown(4)

    // --------------------------
    // BODY
    // --------------------------
    doc
      .fontSize(10)
      .text('To whom it may concern,')
      .moveDown(1.5)

    const startDate = new Date(data.dateRange.start).toLocaleDateString()
    const endDate = new Date(data.dateRange.end).toLocaleDateString()

    // Verification line
    doc.text(
      `I am pleased to confirm that ${data.volunteerName} has completed ${data.totalHours} hours of community service with ${data.organization.name} between ${startDate} and ${endDate}.`,
      { align: 'left', lineGap: 3 }
    )
    doc.moveDown(1)

    // Optional organization description
    if (data.organization.description) {
      doc.text(data.organization.description, {
        align: 'left',
        lineGap: 3
      })
      doc.moveDown(1)
    }

    // Contact line
    doc.text(
      `If you have any questions, please reach out by email to ${data.organization.email}.`,
      { align: 'left', lineGap: 3 }
    )
    doc.moveDown(2)

    // Sign-off
    doc.text('Best,')
    doc.moveDown(2)

    doc
      .font(fontBold)
      .text(`${data.organization.name} Administrator`)
      .font(fontRegular)
      .text('Volunteer Coordinator')

    // --------------------------
    // HOURS TABLE
    // --------------------------
    doc.moveDown(4)

    doc
      .fontSize(14)
      .font(fontBold)
      .text('Volunteer Hours Details')
      .moveDown(0.5)

    doc
      .fontSize(10)
      .font(fontRegular)
      .text(`Dates: ${startDate} - ${endDate}`)
      .text(`Total Time: ${data.totalHours} hours`)
      .moveDown(1.5)

    // Table header
    const tableTop = doc.y
    const tableX = 50

    const colWidths = {
      activity: 300,
      date: 150,
      duration: 100
    }

    doc
      .fontSize(9)
      .font(fontBold)
      .fillColor('#666666')
      .text('ACTIVITY', tableX, tableTop)
      .text('DATE', tableX + colWidths.activity, tableTop)
      .text('DURATION', tableX + colWidths.activity + colWidths.date, tableTop)

    // Divider line
    doc
      .moveTo(tableX, tableTop + 15)
      .lineTo(550, tableTop + 15)
      .strokeColor('#e5e7eb')
      .lineWidth(1)
      .stroke()

    doc.fillColor('#000000').font(fontRegular)

    // --------------------------
    // TABLE ROWS
    // --------------------------
    let currentY = tableTop + 25

    data.events.forEach((event: any) => {
      if (currentY > doc.page.height - 50) {
        doc.addPage()
        currentY = 50
      }

      const dateStr = new Date(event.date).toLocaleDateString()

      doc.text(event.name, tableX, currentY, {
        width: colWidths.activity - 20,
        lineBreak: false,
        ellipsis: true
      })

      doc.text(dateStr, tableX + colWidths.activity, currentY)
      doc.text(
        event.durationLabel,
        tableX + colWidths.activity + colWidths.date,
        currentY
      )

      currentY += 20
    })

    // Bottom divider
    doc
      .moveTo(tableX, currentY)
      .lineTo(550, currentY)
      .strokeColor('#e5e7eb')
      .lineWidth(1)
      .stroke()

    doc.end()
  })
}
