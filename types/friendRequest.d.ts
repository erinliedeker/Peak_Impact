/**
 * Friend Request data structure
 */
export interface FriendRequest {
  id: string
  from: string // User ID who sent the request
  to: string // User ID who receives the request
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: Date | string
}

/**
 * Extended user info for friend lists
 */
export interface FriendInfo {
  id: string
  name: string
  initials: string
  avatarUrl?: string
  userType?: string
  impactPoints: number
  mutualFriends?: number
}
