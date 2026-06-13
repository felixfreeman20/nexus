// Shared Avatar component — used everywhere
export default function Avatar({ name = '?', avatar = null, size = 32, status = null }) {
  const colors = [
    '#5865f2','#ed4245','#3ba55d','#faa61a',
    '#eb459e','#00aff4','#593695','#1abc9c',
  ]
  const color = colors[(name.charCodeAt(0) || 0) % colors.length]
  const initials = name.slice(0, 2).toUpperCase()

  const statusColors = {
    online: '#3ba55d',
    offline: '#747f8d',
    idle: '#faa61a',
    dnd: '#ed4245',
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block', flexShrink: 0 }}>
      {avatar ? (
        <img
          src={avatar}
          alt={name}
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      ) : (
        <div style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: size * 0.38,
          color: '#fff',
          userSelect: 'none',
          letterSpacing: '-0.5px',
        }}>
          {initials}
        </div>
      )}
      {status && (
        <span style={{
          position: 'absolute',
          bottom: -1,
          right: -1,
          width: Math.max(8, size * 0.32),
          height: Math.max(8, size * 0.32),
          borderRadius: '50%',
          background: statusColors[status] || statusColors.offline,
          border: `${Math.max(1.5, size * 0.06)}px solid var(--color-bg-secondary)`,
        }} />
      )}
    </div>
  )
}
