/**
 * Post data structure for social feed
 */
export interface Post {
  id: string
  authorId: string
  authorName: string
  text: string
  photoUrl?: string | null
  organizationId?: string | null
  organizationName?: string | null
  timestamp: Date
  likes: string[] // Array of user IDs who liked
  commentsCount: number
}

/**
 * Comment data structure
 */
export interface Comment {
  id: string
  postId: string
  authorId: string
  authorName: string
  text: string
  timestamp: Date
}
