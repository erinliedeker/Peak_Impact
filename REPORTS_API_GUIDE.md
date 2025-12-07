# Organization Reports API Guide

## Overview
The organization reports system now pulls real data from Firebase/Firestore instead of using mock data. You can generate reports in JSON, PDF, or CSV format showing volunteer participation, hours, and impact metrics.

## Firebase Data Structure Required

### Events Collection (`events`)
```typescript
{
  id: string
  organizationId: string          // Must match org ID you're reporting on
  organizationName: string
  title: string
  description: string
  date: string                    // ISO date string
  start: string | null            // Start time for duration calculation
  end: string | null              // End time for duration calculation
  volunteersNeeded: number
  volunteersSignedUp: number
  location: { lat: number, lng: number } | string
  category: string
  attendees: VolunteerAttendance[]  // Key field for report data
  createdAt: string
  isMicroProject: boolean
  suppliesNeeded: string[]
}
```

### VolunteerAttendance (in Event)
```typescript
{
  volunteerId: string              // User UID
  status: 'registered' | 'checked-in' | 'completed' | 'cancelled'
  checkInTime: string | null       // ISO datetime - used to calculate hours
  checkOutTime: string | null      // ISO datetime - used to calculate hours
  hoursVerified: boolean
  verificationLetterSent: boolean
}
```

### Organizations Collection (`organizations`)
```typescript
{
  id: string
  name: string
  ein: string | null              // EIN number for reports
  admins: string[]
  description: string
  contactEmail: string
  type: string
}
```

### Users Collection (`users`)
```typescript
{
  id: string (UID)
  name: string
  email: string                   // Fetched for per-user summaries
  // ... other user fields
}
```

## API Endpoint

**POST** `/api/reports/org`

### Request Body
```json
{
  "orgId": "organization_id_here",
  "dateFrom": "2024-01-01",
  "dateTo": "2024-12-31",
  "format": "pdf"  // or "csv" or "json"
}
```

### Request Examples

#### Generate PDF Report
```javascript
const response = await fetch('/api/reports/org', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    orgId: 'org-123',
    dateFrom: '2024-11-01',
    dateTo: '2024-12-31',
    format: 'pdf'
  })
})

const blob = await response.blob()
const url = window.URL.createObjectURL(blob)
const a = document.createElement('a')
a.href = url
a.download = 'organization-report.pdf'
a.click()
```

#### Generate CSV Report
```javascript
const response = await fetch('/api/reports/org', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    orgId: 'org-123',
    dateFrom: '2024-11-01',
    dateTo: '2024-12-31',
    format: 'csv'
  })
})

const csv = await response.text()
// Save or process CSV data
```

#### Get JSON Report Data
```javascript
const response = await fetch('/api/reports/org', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    orgId: 'org-123',
    dateFrom: '2024-11-01',
    dateTo: '2024-12-31',
    format: 'json'  // or omit, defaults to json
  })
})

const data = await response.json()
console.log(data)
```

### Response - JSON Format
```json
{
  "org": {
    "id": "org-123",
    "name": "Mountain View High School",
    "EIN": "12-3456789",
    "admins": ["user-admin-1"]
  },
  "dateRange": {
    "from": "2024-11-01T00:00:00.000Z",
    "to": "2024-12-31T23:59:59.999Z"
  },
  "totalEvents": 15,
  "totalParticipants": 128,
  "totalHours": 384.5,
  "averageHoursPerParticipant": 3.0,
  "averageParticipantsPerEvent": 8.5,
  "events": [
    {
      "id": "event-1",
      "name": "Beach Cleanup",
      "date": "2024-11-15T09:00:00.000Z",
      "duration": 3,
      "participants": 25,
      "location": "Ocean Beach",
      "capacity": 50
    }
  ],
  "perUserSummaries": [
    {
      "userId": "user-1",
      "email": "john@example.com",
      "totalHours": 12,
      "totalEvents": 4
    }
  ],
  "groupSummaries": []
}
```

## How Data Flows

1. **Request comes in** with `orgId` and date range
2. **Events fetched** from Firestore filtered by:
   - `organizationId` matches the requested `orgId`
   - Event `date` is within the date range
3. **Attendees extracted** from each event's `attendees` array
4. **Hours calculated** from `checkInTime` and `checkOutTime` for each attendee
5. **User emails fetched** from Firestore `users` collection
6. **Aggregates calculated**:
   - Total participants = sum of all attendees
   - Total hours = sum of all hours worked
   - Per-user summaries = grouped by volunteerId with email lookup
7. **Output generated** as JSON, PDF, or CSV

## Key Features

✅ **Real Firebase Data** - All data pulled from your Firestore collections
✅ **Automatic Hour Calculation** - Hours computed from check-in/check-out times
✅ **Email Lookup** - User emails fetched from profiles automatically
✅ **Multiple Formats** - JSON for data, PDF for reports, CSV for spreadsheets
✅ **Date Filtering** - Only events within specified range included
✅ **Error Handling** - Gracefully handles missing data and Firebase errors

## Common Use Cases

### Generate Monthly Report
```javascript
const now = new Date()
const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

const response = await fetch('/api/reports/org', {
  method: 'POST',
  body: JSON.stringify({
    orgId: 'org-123',
    dateFrom: firstDay.toISOString().split('T')[0],
    dateTo: lastDay.toISOString().split('T')[0],
    format: 'pdf'
  })
})
```

### Generate Annual Report
```javascript
const response = await fetch('/api/reports/org', {
  method: 'POST',
  body: JSON.stringify({
    orgId: 'org-123',
    dateFrom: '2024-01-01',
    dateTo: '2024-12-31',
    format: 'pdf'
  })
})
```

## Troubleshooting

### Report Shows Zero Data
- Check that events exist in Firestore with matching `organizationId`
- Verify event dates are within the requested date range
- Ensure `attendees` array is populated in event documents

### Missing User Emails
- Verify user documents exist in `users` collection
- Check that user `email` field is populated
- If missing, report shows fallback "User {id}" format

### Hours Showing as Zero
- Check that volunteers have both `checkInTime` and `checkOutTime` set
- Verify times are valid ISO datetime strings
- Times must be in chronological order (checkOut > checkIn)

## Integration in UI

To add report generation to your org dashboard:

```vue
<template>
  <button @click="generateReport('pdf')">Download PDF Report</button>
  <button @click="generateReport('csv')">Download CSV Report</button>
  <button @click="generateReport('json')">View JSON Data</button>
</template>

<script setup>
async function generateReport(format) {
  const response = await fetch('/api/reports/org', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orgId: currentOrg.id,
      dateFrom: dateRangeStart,
      dateTo: dateRangeEnd,
      format
    })
  })
  
  if (format === 'json') {
    const data = await response.json()
    console.log(data)
  } else {
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `report.${format}`
    a.click()
  }
}
</script>
```
