import { useEffect } from 'react'
import { doc, updateDoc, serverTimestamp, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../contexts/AuthContext'

// Sets user online on mount, offline on unmount
// Also updates on window focus/blur
export function usePresence() {
  const { currentUser } = useAuth()

  useEffect(() => {
    if (!currentUser) return

    const userRef = doc(db, 'users', currentUser.uid)

    async function setOnline() {
      try {
        await updateDoc(userRef, {
          status: 'online',
          lastSeen: serverTimestamp(),
        })
      } catch {}
    }

    async function setOffline() {
      try {
        await updateDoc(userRef, {
          status: 'offline',
          lastSeen: serverTimestamp(),
        })
      } catch {}
    }

    setOnline()

    window.addEventListener('focus', setOnline)
    window.addEventListener('blur', setOffline)

    return () => {
      setOffline()
      window.removeEventListener('focus', setOnline)
      window.removeEventListener('blur', setOffline)
    }
  }, [currentUser])
}

// Subscribe to a single user's presence
export function useUserPresence(uid, callback) {
  useEffect(() => {
    if (!uid) return
    const unsub = onSnapshot(doc(db, 'users', uid), (snap) => {
      if (snap.exists()) callback(snap.data().status || 'offline')
    })
    return unsub
  }, [uid])
}
