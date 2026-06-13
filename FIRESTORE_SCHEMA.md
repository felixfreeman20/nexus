# Nexus — Firestore Schema (Phase 2)

## Collections

### `users/{uid}`
```
{
  uid: string,
  username: string,          // lowercase, unique, searchable
  displayName: string,       // shown in UI
  email: string,
  avatar: string | null,     // Storage download URL
  bio: string,
  status: 'online' | 'offline' | 'idle' | 'dnd',
  lastSeen: timestamp,
  createdAt: timestamp,
  updatedAt: timestamp,
}
```

### `users/{uid}/friends/{friendUid}`
```
{
  uid: string,               // friend's uid
  addedAt: timestamp,
}
```

### `friendRequests/{requestId}`
```
{
  fromUid: string,
  toUid: string,
  status: 'pending' | 'accepted' | 'declined',
  createdAt: timestamp,
}
```

## Indexes Required (create in Firebase Console)
- `friendRequests`: composite index on `toUid ASC, status ASC`
- `friendRequests`: composite index on `fromUid ASC, status ASC`
- `users`: single-field index on `username ASC` (auto-created)

## Storage Buckets
- `avatars/{uid}` — user profile pictures (max 5MB)
