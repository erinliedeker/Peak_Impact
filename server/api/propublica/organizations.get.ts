/**
 * @api {get} /api/propublica/organizations Search Non-Profits
 * @description Proxy endpoint to search the ProPublica Non-profit Explorer API.
 * @param {string} [q] - The search query (e.g., "Colorado Springs", "Animal Shelter").
 * @param {string} [state=CO] - The 2-letter state code to filter by. Defaults to 'CO'.
 * @param {number} [page=0] - Pagination index (starts at 0).
 * @param {number} [limit=100] - Results per page (max is usually 100).
 * @returns {Object} JSON response containing organizations and pagination metadata.
 */

import { defineEventHandler, getQuery, createError } from 'h3'

export default defineEventHandler(async (event) => {
  // 1. Extract query parameters
  const query = getQuery(event)
  
  const searchTerm = query.q || 'Colorado Springs' 
  const stateCode = query.state || 'CO'
  const page = query.page || 0
  // Allow frontend to set limit, but default to 100 (or whatever max you prefer)
  const limit = query.limit || 100 

  const BASE_URL = 'https://projects.propublica.org/nonprofits/api/v2/search.json'

  try {
    const response = await $fetch(BASE_URL, {
      params: {
        q: searchTerm,
        'state[id]': stateCode,
        page: page,
        per_page: limit // ProPublica typically uses 'per_page' for pagination limits
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