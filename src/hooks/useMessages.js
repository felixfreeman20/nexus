import { useState, useEffect } from 'react'
import {
  collection, query, orderBy, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc,
  serverTimestamp, limit,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../contexts/AuthContext'

// DM conversation ID is always sorted so both users get same ID
export function getDMId(uid1, uid2) {
  return [uid1, uid2].sort().join('_')
}

export function useMessages(conversationId) {
  const { currentUser } = useAuth()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!conversationId) { setLoading(false); return }
    const q = query(
      collection(db, 'conversations', conversationId, 'messages'),
      orderBy('createdAt', 'asc'),
      limit(100)
    )
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }, (err) => {
      console.error('Messages listener:', err)
      setLoading(false)
    })
    return unsub
  }, [conversationId])

  async function sendMessage(text) {
    if (!text.trim() || !conversationId || !currentUser) return
    await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
      text: text.trim(),
      senderId: currentUser.uid,
      senderName: currentUser.displayName || currentUser.email,
      createdAt: serverTimestamp(),
      editedAt: null,
      deleted: false,
    })
    // Update conversation metadata for sidebar ordering
    await updateDoc(doc(db, 'conversations', conversationId), {
      lastMessage: text.trim(),
      lastMessageAt: serverTimestamp(),
      lastSenderId: currentUser.uid,
    }).catch(() => {}) // may not exist yet — created on first message via ensureConversation
  }

  async function editMessage(messageId, newText) {
    if (!newText.trim()) return
    await updateDoc(doc(db, 'conversations', conversationId, 'messages', messageId), {
      text: newText.trim(),
      editedAt: serverTimestamp(),
    })
  }

  async function deleteMessage(messageId) {
    await updateDoc(doc(db, 'conversations', conversationId, 'messages', messageId), {
      text: '',
      deleted: true,
      editedAt: serverTimestamp(),
    })
  }

  return { messages, loading, sendMessage, editMessage, deleteMessage }
}
