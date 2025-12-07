import {
  collection,
  addDoc,
  updateDoc,
  doc,
  arrayUnion,
  arrayRemove,
  increment,
  query,
  orderBy,
  where,
  serverTimestamp
} from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useAuthStore } from '../stores/auth'
import { useCurrentUser } from 'vuefire'
import type { Post, Comment } from '../types'

export const useFeed = () => {
  const db = useFirestore()
  const storage = useFirebaseStorage()
  const authStore = useAuthStore()
  const currentUser = useCurrentUser()

  // Resolve a stable user id (prefer Firebase auth uid)
  const getUid = () => {
    return (
      currentUser.value?.uid ||
      (authStore.profile as any)?.uid ||
      (authStore.profile as any)?.id?.toString() ||
      null
    )
  }

  /**
   * Create a new post
   */
  const createPost = async (
    text: string, 
    photoFile: File | null = null, 
    organizationId: string | null = null,
    organizationName: string | null = null
  ) => {
    const uid = getUid()
    if (!uid) throw new Error('User not authenticated')

    let photoUrl: string | null = null

    // Upload photo if provided
    if (photoFile) {
      const timestamp = Date.now()
      const fileName = `${timestamp}_${Math.random().toString(36).substring(7)}.jpg`
      const photoRef = storageRef(storage, `posts/${uid}/${fileName}`)
      
      await uploadBytes(photoRef, photoFile)
      photoUrl = await getDownloadURL(photoRef)
    }

    // Create post document
    const postsRef = collection(db, 'posts')
    const postData = {
      authorId: uid,
      authorName: authStore.profile?.name || currentUser.value?.displayName || 'User',
      text,
      photoUrl,
      organizationId,
      organizationName,
      timestamp: serverTimestamp(),
      likes: [],
      commentsCount: 0
    }

    const docRef = await addDoc(postsRef, postData)
    return docRef.id
  }

  /**
   * Toggle like on a post
   */
  const toggleLike = async (postId: string, currentLikes: string[]) => {
    const uid = getUid()
    if (!uid) throw new Error('User not authenticated')

    const postRef = doc(db, 'posts', postId)
    const isLiked = currentLikes.includes(uid)

    await updateDoc(postRef, {
      likes: isLiked ? arrayRemove(uid) : arrayUnion(uid)
    })
  }

  /**
   * Add a comment to a post
   */
  const addComment = async (postId: string, text: string) => {
    const uid = getUid()
    if (!uid) throw new Error('User not authenticated')

    // Add comment to subcollection
    const commentsRef = collection(db, 'posts', postId, 'comments')
    await addDoc(commentsRef, {
      postId,
      authorId: uid,
      authorName: authStore.profile?.name || currentUser.value?.displayName || 'User',
      text,
      timestamp: serverTimestamp()
    })

    // Increment comment count on post
    const postRef = doc(db, 'posts', postId)
    await updateDoc(postRef, {
      commentsCount: increment(1)
    })
  }

  /**
   * Get query for all posts (ordered by newest first)
   */
  const getAllPostsQuery = () => {
    const postsRef = collection(db, 'posts')
    return query(postsRef, orderBy('timestamp', 'desc'))
  }

  /**
   * Get query for posts filtered by organization
   */
  const getOrgPostsQuery = (organizationId: string) => {
    const postsRef = collection(db, 'posts')
    return query(
      postsRef, 
      where('organizationId', '==', organizationId),
      orderBy('timestamp', 'desc')
    )
  }

  /**
   * Get query for comments on a specific post
   */
  const getCommentsQuery = (postId: string) => {
    const commentsRef = collection(db, 'posts', postId, 'comments')
    return query(commentsRef, orderBy('timestamp', 'asc'))
  }

  return {
    createPost,
    toggleLike,
    addComment,
    getAllPostsQuery,
    getOrgPostsQuery,
    getCommentsQuery
  }
}
