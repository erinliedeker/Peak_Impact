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
   * Send a follow request (Instagram style with approval)
   */
  const sendFollowRequest = async (toUserId: string) => {
    if (!currentUserId.value) throw new Error('User not authenticated')
    if (currentUserId.value === toUserId) throw new Error('Cannot follow yourself')

    // Check if already following
    const followId = `${currentUserId.value}_${toUserId}`
    const followDoc = await getDoc(doc(db, 'follows', followId))
    if (followDoc.exists()) {
      throw new Error('Already following this user')
    }

    // Check if request already exists
    const requestsQuery = query(
      collection(db, 'friendRequests'),
      where('from', '==', currentUserId.value),
      where('to', '==', toUserId),
      where('status', '==', 'pending')
    )
    const existingRequests = await getDocs(requestsQuery)
    if (!existingRequests.empty) {
      throw new Error('Follow request already sent')
    }

    // Create follow request
    await addDoc(collection(db, 'friendRequests'), {
      from: currentUserId.value,
      to: toUserId,
      status: 'pending',
      createdAt: serverTimestamp()
    })
  }

  /**
   * Accept a follow request
   */
  const acceptFollowRequest = async (requestId: string) => {
    if (!currentUserId.value) throw new Error('User not authenticated')

    const requestRef = doc(db, 'friendRequests', requestId)
    const requestSnap = await getDoc(requestRef)
    
    if (!requestSnap.exists()) throw new Error('Request not found')
    
    const requestData = requestSnap.data() as FriendRequest
    if (requestData.to !== currentUserId.value) {
      throw new Error('Not authorized to accept this request')
    }


    // Create the follow relationship (requester follows accepter)
    const followId = `${requestData.from}_${requestData.to}`
    await setDoc(doc(db, 'follows', followId), {
      followerId: requestData.from,
      followingId: requestData.to,
      status: 'active',
      createdAt: serverTimestamp()
    })

    // Create mutual follow relationship (accepter follows requester)
    const mutualFollowId = `${requestData.to}_${requestData.from}`
    await setDoc(doc(db, 'follows', mutualFollowId), {
      followerId: requestData.to,
      followingId: requestData.from,
      status: 'active',
      createdAt: serverTimestamp()
    })

    // Update request status to accepted
    await updateDoc(requestRef, {
      status: 'accepted',
      acceptedAt: serverTimestamp()
    })
  }

  /**
   * Reject a follow request
   */
  const rejectFollowRequest = async (requestId: string) => {
    if (!currentUserId.value) throw new Error('User not authenticated')

    const requestRef = doc(db, 'friendRequests', requestId)
    const requestSnap = await getDoc(requestRef)
    
    if (!requestSnap.exists()) throw new Error('Request not found')
    
    const requestData = requestSnap.data() as FriendRequest
    if (requestData.to !== currentUserId.value) {
      throw new Error('Not authorized to reject this request')
    }

    // Delete the request
    await deleteDoc(requestRef)
  }

  /**
   * Unfollow a user (removes the follow relationship)
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
    return followSnap.exists() && followSnap.data()?.status === 'active'
  }

  /**
   * Check if a follow request is pending
   */
  const hasRequestPending = async (toUserId: string): Promise<string | null> => {
    if (!currentUserId.value) return null

    const requestsQuery = query(
      collection(db, 'friendRequests'),
      where('from', '==', currentUserId.value),
      where('to', '==', toUserId),
      where('status', '==', 'pending')
    )
    const requestsSnap = await getDocs(requestsQuery)
    
    return requestsSnap.empty ? null : requestsSnap.docs[0]?.id || null
  }

  /**
   * Cancel a follow request (sender)
   */
  const cancelFollowRequest = async (requestId: string) => {
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
   * Check follow status with a user
   * Returns: 'following' | 'requested' | 'not_following'
   */
  const checkFollowStatus = async (userId: string): Promise<'following' | 'requested' | 'not_following'> => {
    if (!currentUserId.value) return 'not_following'
    
    const following = await isFollowing(userId)
    if (following) return 'following'
    
    const requestId = await hasRequestPending(userId)
    if (requestId) return 'requested'
    
    return 'not_following'
  }

  /**
   * Get user's followers (people following them + pending requests from them)
   */
  const getFollowers = async (userId?: string): Promise<string[]> => {
    const targetUserId = userId || currentUserId.value
    if (!targetUserId) return []

    // Get active follows
    const followersQuery = query(
      collection(db, 'follows'),
      where('followingId', '==', targetUserId)
    )
    const followersSnap = await getDocs(followersQuery)
    const followerIds = followersSnap.docs.map(doc => doc.data().followerId)

    // Get pending requests TO this user (people requesting to follow)
    const pendingRequestsQuery = query(
      collection(db, 'friendRequests'),
      where('to', '==', targetUserId),
      where('status', '==', 'pending')
    )
    const pendingSnap = await getDocs(pendingRequestsQuery)
    const pendingFollowerIds = pendingSnap.docs.map(doc => doc.data().from)

    // Combine and deduplicate
    const allFollowerIds = [...new Set([...followerIds, ...pendingFollowerIds])]
    
    return allFollowerIds
  }

  /**
   * Get user's following (people they're following + people they've sent requests to)
   */
  const getFollowing = async (userId?: string): Promise<string[]> => {
    const targetUserId = userId || currentUserId.value
    if (!targetUserId) return []

    // Get active follows
    const followingQuery = query(
      collection(db, 'follows'),
      where('followerId', '==', targetUserId)
    )
    const followingSnap = await getDocs(followingQuery)
    const followingIds = followingSnap.docs.map(doc => doc.data().followingId)

    // Get pending requests FROM this user (people they've requested to follow)
    const sentRequestsQuery = query(
      collection(db, 'friendRequests'),
      where('from', '==', targetUserId),
      where('status', '==', 'pending')
    )
    const sentSnap = await getDocs(sentRequestsQuery)
    const pendingFollowingIds = sentSnap.docs.map(doc => doc.data().to)

    // Combine and deduplicate
    const allFollowingIds = [...new Set([...followingIds, ...pendingFollowingIds])]
    
    return allFollowingIds
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
    sendFollowRequest,
    acceptFollowRequest,
    rejectFollowRequest,
    cancelFollowRequest,
    unfollowUser,
    isFollowing,
    hasRequestPending,
    checkFollowStatus,
    getFollowers,
    getFollowing,
    getReceivedRequestsQuery,
    getSentRequestsQuery,
    getMutualFollowsCount
  }
}
