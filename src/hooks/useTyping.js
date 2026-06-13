import { useEffect, useRef } from 'react'
import { doc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../contexts/AuthContext'
import { useState } from 'react'

const TYPING_TIMEOUT = 2500

export function useTyping(conversationId) {
  const { currentUser } = useAuth()
  const [typingUsers, setTypingUsers] = useState([])
  const timeoutRef = useRef(null)

  // Listen to typing indicators
  useEffect(() => {
    if (!conversationId) return
    const unsub = onSnapshot(
      doc(db, 'conversations', conversationId),
      (snap) => {
        if (!snap.exists()) return
        const data = snap.data()
        const typing = data.typing || {}
        const now = Date.now()
        // Filter out stale entries (> 4 seconds old) and self
        const active = Object.entries(typing)
          .filter(([uid, info]) =>
            uid !== currentUser?.uid &&
            info.timestamp &&
            (now - info.timestamp) < 4000
          )
          .map(([, info]) => info.name)
        setTypingUsers(active)
      },
      () => {}
    )
    return unsub
  }, [conversationId, currentUser])

  async function setTyping() {
    if (!conversationId || !currentUser) return
    try {
      await updateDoc(doc(db, 'conversations', conversationId), {
        [`typing.${currentUser.uid}`]: {
          name: currentUser.displayName || 'Someone',
          timestamp: Date.now(),
        }
      })
    } catch {}

    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(clearTyping, TYPING_TIMEOUT)
  }

  async function clearTyping() {
    if (!conversationId || !currentUser) return
    try {
      await updateDoc(doc(db, 'conversations', conversationId), {
        [`typing.${currentUser.uid}`]: null,
      })
    } catch {}
  }

  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current)
      clearTyping()
    }
  }, [conversationId])

  function getTypingText() {
    if (typingUsers.length === 0) return null
    if (typingUsers.length === 1) return `${typingUsers[0]} is typing...`
    if (typingUsers.length === 2) return `${typingUsers[0]} and ${typingUsers[1]} are typing...`
    return 'Several people are typing...'
  }

  return { setTyping, clearTyping, typingText: getTypingText() }
}
