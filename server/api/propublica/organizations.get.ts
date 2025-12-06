/**
 * @api {get} /api/propublica/organizations Search Non-Profits
 * @description Proxy endpoint to search the ProPublica Non-profit Explorer API.
 * * @param {string} [q] - The search query (e.g., "Colorado Springs", "Animal Shelter").
 * @param {string} [state=CO] - The 2-letter state code to filter by. Defaults to 'CO'.
 * @param {number} [page=0] - Pagination index (starts at 0).
 * * @returns {Object} JSON response containing organizations and pagination metadata.
 * * @example Frontend Usage (Nuxt/Vue)
 * const { data } = await useFetch('/api/propublica/organizations', {
 * query: { q: 'Homeless Shelter', page: 1 }
 * })
 */

import { defineEventHandler, getQuery, createError } from 'h3'

export default defineEventHandler(async (event) => {
  // 1. Extract query parameters
  const query = getQuery(event)
  
  // Default to searching Colorado Springs if no query provided
  const searchTerm = query.q || 'Colorado Springs' 
  const stateCode = query.state || 'CO' // ProPublica requires State ID (CO is often mapped internally or passed directly)
  const page = query.page || 0

  const BASE_URL = 'https://projects.propublica.org/nonprofits/api/v2/search.json'

  try {
    // 2. Fetch data from ProPublica
    // Note: ProPublica V2 Search API uses specific array-like syntax for state IDs in some docs,
    // but standard query params work for the general search endpoint.
    const response = await $fetch(BASE_URL, {
      params: {
        q: searchTerm,
        'state[id]': stateCode, // URL encodes to state[id]=CO
        page: page
      }
    })

    return response

  } catch (error: any) {
    console.error('ProPublica API Error:', error)
    
    throw createError({
      statusCode: error.response?.status || 500,
      statusMessage: 'Failed to fetch Non-Profit data',
      data: error.data
    })
  }
})