import { useState, useCallback } from 'react'
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../contexts/AuthContext'

export function useUserSearch() {
  const { currentUser } = useAuth()
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')

  const searchUsers = useCallback(async (searchTerm) => {
    if (!searchTerm.trim() || searchTerm.trim().length < 2) {
      setResults([])
      return
    }

    try {
      setSearching(true)
      setSearchError('')

      const term = searchTerm.trim().toLowerCase()

      // Search by username prefix
      const usersRef = collection(db, 'users')
      const q = query(
        usersRef,
        where('username', '>=', term),
        where('username', '<=', term + '\uf8ff'),
        limit(10)
      )

      const snap = await getDocs(q)
      const users = snap.docs
        .map(d => d.data())
        .filter(u => u.uid !== currentUser.uid) // exclude self

      setResults(users)
    } catch (err) {
      setSearchError('Search failed. Try again.')
    } finally {
      setSearching(false)
    }
  }, [currentUser])

  function clearSearch() {
    setResults([])
    setSearchError('')
  }

  return { results, searching, searchError, searchUsers, clearSearch }
}
