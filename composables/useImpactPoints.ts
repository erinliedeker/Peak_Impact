import { doc, updateDoc, increment, getFirestore } from 'firebase/firestore'
import { useAuthStore } from '../stores/auth'

/**
 * Composable for managing user impact points
 * Simple system: 1 signup/join action = 1 point
 */
export const useImpactPoints = () => {
  const authStore = useAuthStore()

  /**
   * Award impact point(s) for any signup action
   * @param points - Number of points to award (default 1)
   * @param action - Description of what earned the point(s)
   */
  const awardImpactPoints = async (points: number = 1, action?: string) => {
    const userId = authStore.profile?.id
    if (!userId) {
      console.warn('Cannot award points: user not authenticated')
      return false
    }

    try {
      const db = getFirestore()
      const userRef = doc(db, 'users', userId)
      
      // Increment points in Firestore
      await updateDoc(userRef, {
        impactPoints: increment(points)
      })

      // Update local auth store to reflect change immediately
      if (authStore.profile) {
        authStore.profile.impactPoints = (authStore.profile.impactPoints || 0) + points
      }

      if (action) {
        console.log(`✨ Awarded ${points} impact point(s) for: ${action}`)
      }

      return true
    } catch (error) {
      console.error('Failed to award impact points:', error)
      return false
    }
  }

  /**
   * Get current user's impact points
   */
  const getCurrentPoints = (): number => {
    return authStore.profile?.impactPoints || 0
  }

  return {
    awardImpactPoints,
    getCurrentPoints
  }
}
