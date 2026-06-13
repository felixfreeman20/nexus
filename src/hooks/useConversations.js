import { useState, useEffect } from 'react'
import {
  collection, query, where, onSnapshot,
  doc, setDoc, getDoc, serverTimestamp, orderBy,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../contexts/AuthContext'
import { getDMId } from './useMessages'

export function useConversations() {
  const { currentUser } = useAuth()
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentUser) return
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', currentUser.uid),
      orderBy('lastMessageAt', 'desc')
    )
    const unsub = onSnapshot(q, (snap) => {
      setConversations(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }, () => setLoading(false))
    return unsub
  }, [currentUser])

  async function ensureConversation(otherUser) {
    if (!currentUser) return null
    const convId = getDMId(currentUser.uid, otherUser.uid)
    const convRef = doc(db, 'conversations', convId)
    const snap = await getDoc(convRef)
    if (!snap.exists()) {
      await setDoc(convRef, {
        id: convId,
        type: 'dm',
        participants: [currentUser.uid, otherUser.uid],
        participantProfiles: {
          [currentUser.uid]: {
            uid: currentUser.uid,
            displayName: currentUser.displayName || 'User',
            username: currentUser.displayName || 'user',
            avatar: currentUser.photoURL || null,
          },
          [otherUser.uid]: {
            uid: otherUser.uid,
            displayName: otherUser.displayName || 'User',
            username: otherUser.username || 'user',
            avatar: otherUser.avatar || null,
          },
        },
        lastMessage: null,
        lastMessageAt: serverTimestamp(),
        lastSenderId: null,
        typing: {},
        createdAt: serverTimestamp(),
      })
    }
    return convId
  }

  return { conversations, loading, ensureConversation }
}
