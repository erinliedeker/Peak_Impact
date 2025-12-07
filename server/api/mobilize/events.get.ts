/**
 * @api {get} /api/mobilize/events Fetch Volunteer Events
 * @description Proxy endpoint to fetch volunteer events from the Mobilize.us API.
 * Filters for future events only (timeslot_start >= now).
 * @param {string} [zip=80903] - The zip code to filter events by. Defaults to Colorado Springs (80903).
 * @param {number} [per_page=25] - Number of results to return.
 * @returns {Object} JSON response containing a list of events.
 */

import { defineEventHandler, getQuery, createError } from 'h3'

export default defineEventHandler(async (event) => {
  // 1. Extract and sanitize query parameters
  const query = getQuery(event)
  
  // Ensure zip is treated as a string (handles edge case where array is passed)
  const zip = query.zip ? String(query.zip) : '80903'
  // Ensure perPage is a valid number
  const perPage = query.per_page ? parseInt(String(query.per_page), 10) : 25

  const BASE_URL = 'https://api.mobilize.us/v1/events'

  try {
    // 2. Fetch data from Mobilize
    const response = await $fetch(BASE_URL, {
      params: {
        zip: zip,
        per_page: perPage,
        // Filter: Only include events with timeslots starting now or in the future
        timeslot_start: 'gte_now'
      }
    })

    // 3. Return the clean data
    return response

  } catch (error: any) {
    // 4. Handle Errors gracefully
    throw createError({
      statusCode: error.response?.status || 500,
      statusMessage: error.response?.statusText || 'Failed to fetch Mobilize events',
      data: error.data
    })
  }
})