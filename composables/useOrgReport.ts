import type { OrgReportInput, OrgReportData } from '../types'

/**
 * Composable for fetching organization reports
 */
export function useOrgReport() {
  /**
   * Fetch report data as JSON
   */
  const fetchReportData = async (input: OrgReportInput): Promise<OrgReportData> => {
    try {
      const data = await $fetch<OrgReportData>('/api/reports/org', {
        method: 'POST',
        body: {
          orgId: input.orgId,
          dateFrom: input.dateFrom,
          dateTo: input.dateTo,
          format: 'json'
        }
      })
      return data
    } catch (e) {
      throw new Error(`Failed to fetch report: ${e instanceof Error ? e.message : 'Unknown error'}`)
    }
  }

  /**
   * Download report as PDF
   */
  const downloadReportPdf = async (input: OrgReportInput): Promise<void> => {
    try {
      const blob = await $fetch('/api/reports/org', {
        method: 'POST',
        body: {
          orgId: input.orgId,
          dateFrom: input.dateFrom,
          dateTo: input.dateTo,
          format: 'pdf'
        },
        responseType: 'blob'
      }) as Blob

      // Create download link
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `org-report-${input.orgId}-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      throw new Error(`Failed to download PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Download report as CSV
   */
  const downloadReportCsv = async (input: OrgReportInput): Promise<void> => {
    try {
      const csvContent = await $fetch('/api/reports/org', {
        method: 'POST',
        body: {
          orgId: input.orgId,
          dateFrom: input.dateFrom,
          dateTo: input.dateTo,
          format: 'csv'
        },
        responseType: 'text'
      }) as string

      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `org-report-${input.orgId}-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      throw new Error(`Failed to download CSV: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return {
    fetchReportData,
    downloadReportPdf,
    downloadReportCsv
  }
}
