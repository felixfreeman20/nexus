import { useState, useEffect } from 'react'
import {
  collection, query, where, onSnapshot,
  doc, getDoc, getDocs, addDoc, updateDoc,
  deleteDoc, setDoc, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../contexts/AuthContext'

export function useFriends() {
  const { currentUser } = useAuth()
  const [friends, setFriends] = useState([])
  const [incomingRequests, setIncomingRequests] = useState([])
  const [outgoingRequests, setOutgoingRequests] = useState([])
  const [loading, setLoading] = useState(true)

  // Listen to friends subcollection
  useEffect(() => {
    if (!currentUser) return
    const friendsRef = collection(db, 'users', currentUser.uid, 'friends')
    const unsub = onSnapshot(friendsRef, async (snap) => {
      const friendDocs = snap.docs.map(d => ({ uid: d.id, ...d.data() }))
      const profiles = await Promise.all(
        friendDocs.map(async (f) => {
          const userSnap = await getDoc(doc(db, 'users', f.uid))
          return userSnap.exists() ? { ...userSnap.data(), addedAt: f.addedAt } : null
        })
      )
      setFriends(profiles.filter(Boolean))
      setLoading(false)
    })
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
      try {
        const requests = await Promise.all(
          snap.docs.map(async (d) => {
            const data = d.data()
            try {
              const userSnap = await getDoc(doc(db, 'users', data.fromUid))
              return {
                requestId: d.id, ...data,
                fromUser: userSnap.exists() ? userSnap.data() : { username: data.fromUid, displayName: 'Unknown User' },
              }
            } catch {
              return { requestId: d.id, ...data, fromUser: { username: data.fromUid, displayName: 'Unknown User' } }
            }
          })
        )
        setIncomingRequests(requests)
      } catch (err) {
        console.error('Incoming requests error:', err)
      }
    }, (err) => {
      console.error('Incoming listener error:', err)
    })
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
      try {
        const requests = await Promise.all(
          snap.docs.map(async (d) => {
            const data = d.data()
            try {
              const userSnap = await getDoc(doc(db, 'users', data.toUid))
              return {
                requestId: d.id, ...data,
                toUser: userSnap.exists() ? userSnap.data() : { username: data.toUid, displayName: 'Unknown User' },
              }
            } catch {
              return { requestId: d.id, ...data, toUser: { username: data.toUid, displayName: 'Unknown User' } }
            }
          })
        )
        setOutgoingRequests(requests)
      } catch (err) {
        console.error('Outgoing requests error:', err)
      }
    }, (err) => {
      console.error('Outgoing listener error:', err)
    })
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

    // If they already sent us one, auto-accept
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
