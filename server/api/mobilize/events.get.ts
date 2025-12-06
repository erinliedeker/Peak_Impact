/**
 * @api {get} /api/mobilize/events Fetch Volunteer Events
 * @description Proxy endpoint to fetch volunteer events from the Mobilize.us API.
 * This endpoint bypasses CORS restrictions often encountered when fetching directly from the client.
 * * @param {string} [zip=80903] - The zip code to filter events by. Defaults to Colorado Springs (80903).
 * @param {number} [per_page=25] - Number of results to return.
 * * @returns {Object} JSON response containing a list of events.
 * * @example Frontend Usage (Nuxt/Vue)
 * const { data } = await useFetch('/api/mobilize/events', {
 * query: { zip: '80202' }
 * })
 */

import { defineEventHandler, getQuery, createError } from 'h3'

export default defineEventHandler(async (event) => {
  // 1. Extract and sanitize query parameters
  const query = getQuery(event)
  const zip = query.zip || '80903'
  const perPage = query.per_page || 25

  const BASE_URL = 'https://api.mobilize.us/v1/events'

  try {
    // 2. Fetch data from Mobilize
    const response = await $fetch(BASE_URL, {
      params: {
        zip: zip,
        per_page: perPage,
        // 'timeslot_start': 'gte_now' // Optional: ensure future events only
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