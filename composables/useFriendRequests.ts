import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  doc,
  query,
  where,
  getDocs,
  getDoc,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore'
import { useAuthStore } from '~~/stores/auth'
import type { FriendRequest, FriendInfo } from '~~/types'

export const useFriendRequests = () => {
  const db = useFirestore()
  const authStore = useAuthStore()

  const currentUserId = computed(() => authStore.profile?.id)

  /**
   * Follow a user (Instagram style - no approval needed)
   */
  const followUser = async (toUserId: string) => {
    if (!currentUserId.value) throw new Error('User not authenticated')
    if (currentUserId.value === toUserId) throw new Error('Cannot follow yourself')

    // Check if already following
    const followId = `${currentUserId.value}_${toUserId}`
    const followDoc = await getDoc(doc(db, 'follows', followId))
    if (followDoc.exists()) {
      throw new Error('Already following this user')
    }

    // Create follow
    await setDoc(doc(db, 'follows', followId), {
      followerId: currentUserId.value,
      followingId: toUserId,
      status: 'active',
      createdAt: serverTimestamp()
    }, { merge: true })
  }

  /**
   * Unfollow a user
   */
  const unfollowUser = async (toUserId: string) => {
    if (!currentUserId.value) throw new Error('User not authenticated')

    const followId = `${currentUserId.value}_${toUserId}`
    await deleteDoc(doc(db, 'follows', followId))
  }

  /**
   * Check if following a user
   */
  const isFollowing = async (userId: string): Promise<boolean> => {
    if (!currentUserId.value) return false

    const followId = `${currentUserId.value}_${userId}`
    const followSnap = await getDoc(doc(db, 'follows', followId))
    return followSnap.exists()
  }

  /**
   * Cancel a friend request (sender)
   */
  const cancelRequest = async (requestId: string) => {
    if (!currentUserId.value) throw new Error('User not authenticated')

    const requestRef = doc(db, 'friendRequests', requestId)
    const requestSnap = await getDoc(requestRef)
    
    if (!requestSnap.exists()) throw new Error('Request not found')
    
    const requestData = requestSnap.data() as FriendRequest
    if (requestData.from !== currentUserId.value) {
      throw new Error('Not authorized to cancel this request')
    }

    await deleteDoc(requestRef)
  }

  /**
   * Get received friend requests (pending)
   */
  const getReceivedRequestsQuery = () => {
    if (!currentUserId.value) return null
    return query(
      collection(db, 'friendRequests'),
      where('to', '==', currentUserId.value),
      where('status', '==', 'pending')
    )
  }

  /**
   * Get sent friend requests (pending)
   */
  const getSentRequestsQuery = () => {
    if (!currentUserId.value) return null
    return query(
      collection(db, 'friendRequests'),
      where('from', '==', currentUserId.value),
      where('status', '==', 'pending')
    )
  }

  /**
   * Check friend status with a user
   * Returns: 'following' | 'not_following'
   */
  const checkFollowStatus = async (userId: string) => {
    if (!currentUserId.value) return 'not_following'
    return (await isFollowing(userId)) ? 'following' : 'not_following'
  }

  /**
   * Get user's followers (people following them)
   */
  const getFollowers = async (userId?: string): Promise<string[]> => {
    const targetUserId = userId || currentUserId.value
    if (!targetUserId) return []

    const followersQuery = query(
      collection(db, 'follows'),
      where('followingId', '==', targetUserId)
    )
    const followersSnap = await getDocs(followersQuery)
    
    return followersSnap.docs.map(doc => doc.data().followerId)
  }

  /**
   * Get user's following (people they're following)
   */
  const getFollowing = async (userId?: string): Promise<string[]> => {
    const targetUserId = userId || currentUserId.value
    if (!targetUserId) return []

    const followingQuery = query(
      collection(db, 'follows'),
      where('followerId', '==', targetUserId)
    )
    const followingSnap = await getDocs(followingQuery)
    
    return followingSnap.docs.map(doc => doc.data().followingId)
  }

  /**
   * Count mutual follows between current user and another user
   */
  const getMutualFollowsCount = async (userId: string): Promise<number> => {
    if (!currentUserId.value) return 0

    const [myFollowing, theirFollowing] = await Promise.all([
      getFollowing(currentUserId.value),
      getFollowing(userId)
    ])

    const myFollowingSet = new Set(myFollowing)
    const mutualCount = theirFollowing.filter((id: string) => myFollowingSet.has(id)).length

    return mutualCount
  }

  return {
    followUser,
    unfollowUser,
    isFollowing,
    checkFollowStatus,
    getFollowers,
    getFollowing,
    getReceivedRequestsQuery,
    getSentRequestsQuery,
    getMutualFollowsCount
  }
}
