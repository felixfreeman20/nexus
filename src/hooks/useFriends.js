import { useState, useEffect } from 'react'
import {
  collection, query, where, onSnapshot,
  doc, getDoc, getDocs, addDoc, updateDoc,
  deleteDoc, setDoc, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../contexts/AuthContext'

async function fetchUserProfile(uid) {
  try {
    const snap = await getDoc(doc(db, 'users', uid))
    if (snap.exists()) return snap.data()
    // Fallback — user doc may not exist yet
    return { uid, username: uid, displayName: 'Unknown User', status: 'offline', avatar: null }
  } catch {
    return { uid, username: uid, displayName: 'Unknown User', status: 'offline', avatar: null }
  }
}

export function useFriends() {
  const { currentUser } = useAuth()
  const [friends, setFriends] = useState([])
  const [incomingRequests, setIncomingRequests] = useState([])
  const [outgoingRequests, setOutgoingRequests] = useState([])
  const [loading, setLoading] = useState(true)

  // Friends subcollection listener
  useEffect(() => {
    if (!currentUser) return
    const friendsRef = collection(db, 'users', currentUser.uid, 'friends')
    const unsub = onSnapshot(friendsRef, async (snap) => {
      const profiles = await Promise.all(
        snap.docs.map(async (d) => {
          const profile = await fetchUserProfile(d.id)
          return { ...profile, addedAt: d.data().addedAt }
        })
      )
      setFriends(profiles)
      setLoading(false)
    }, () => setLoading(false))
    return unsub
  }, [currentUser])

  // Incoming pending requests
  useEffect(() => {
    if (!currentUser) return
    const q = query(
      collection(db, 'friendRequests'),
      where('toUid', '==', currentUser.uid),
      where('status', '==', 'pending')
    )
    const unsub = onSnapshot(q, async (snap) => {
      const requests = await Promise.all(
        snap.docs.map(async (d) => {
          const data = d.data()
          const fromUser = await fetchUserProfile(data.fromUid)
          return { requestId: d.id, ...data, fromUser }
        })
      )
      setIncomingRequests(requests)
    }, (err) => console.error('Incoming listener:', err))
    return unsub
  }, [currentUser])

  // Outgoing pending requests
  useEffect(() => {
    if (!currentUser) return
    const q = query(
      collection(db, 'friendRequests'),
      where('fromUid', '==', currentUser.uid),
      where('status', '==', 'pending')
    )
    const unsub = onSnapshot(q, async (snap) => {
      const requests = await Promise.all(
        snap.docs.map(async (d) => {
          const data = d.data()
          const toUser = await fetchUserProfile(data.toUid)
          return { requestId: d.id, ...data, toUser }
        })
      )
      setOutgoingRequests(requests)
    }, (err) => console.error('Outgoing listener:', err))
    return unsub
  }, [currentUser])

  async function sendFriendRequest(toUid) {
    if (!currentUser || toUid === currentUser.uid) throw new Error('Invalid user')

    const friendSnap = await getDoc(doc(db, 'users', currentUser.uid, 'friends', toUid))
    if (friendSnap.exists()) throw new Error('Already friends')

    const existingSnap = await getDocs(query(
      collection(db, 'friendRequests'),
      where('fromUid', '==', currentUser.uid),
      where('toUid', '==', toUid),
      where('status', '==', 'pending')
    ))
    if (!existingSnap.empty) throw new Error('Request already sent')

    // Auto-accept if they already sent us one
    const reverseSnap = await getDocs(query(
      collection(db, 'friendRequests'),
      where('fromUid', '==', toUid),
      where('toUid', '==', currentUser.uid),
      where('status', '==', 'pending')
    ))
    if (!reverseSnap.empty) {
      await acceptFriendRequest(reverseSnap.docs[0].id, toUid)
      return
    }

    await addDoc(collection(db, 'friendRequests'), {
      fromUid: currentUser.uid,
      toUid,
      status: 'pending',
      createdAt: serverTimestamp(),
    })
  }

  async function acceptFriendRequest(requestId, fromUid) {
    await updateDoc(doc(db, 'friendRequests', requestId), { status: 'accepted' })
    await setDoc(doc(db, 'users', currentUser.uid, 'friends', fromUid), {
      uid: fromUid, addedAt: serverTimestamp(),
    })
    await setDoc(doc(db, 'users', fromUid, 'friends', currentUser.uid), {
      uid: currentUser.uid, addedAt: serverTimestamp(),
    })
  }

  async function declineFriendRequest(requestId) {
    await updateDoc(doc(db, 'friendRequests', requestId), { status: 'declined' })
  }

  async function cancelFriendRequest(requestId) {
    await deleteDoc(doc(db, 'friendRequests', requestId))
  }

  async function removeFriend(friendUid) {
    await deleteDoc(doc(db, 'users', currentUser.uid, 'friends', friendUid))
    await deleteDoc(doc(db, 'users', friendUid, 'friends', currentUser.uid))
  }

  return {
    friends, incomingRequests, outgoingRequests, loading,
    sendFriendRequest, acceptFriendRequest,
    declineFriendRequest, cancelFriendRequest, removeFriend,
  }
}
