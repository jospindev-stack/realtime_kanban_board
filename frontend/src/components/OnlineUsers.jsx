import { Wifi } from 'lucide-react'

export default function OnlineUsers({ users }) {
  const visible = users.slice(0, 6)
  const extra = users.length - 6

  return (
    <div className="flex items-center gap-2">
      <Wifi size={13} className="text-emerald-400" />
      <span className="text-gray-500 text-xs">{users.length} online</span>
      <div className="flex -space-x-2">
        {visible.map((u, i) => (
          <div
            key={i}
            title={u.username}
            className="w-7 h-7 rounded-full border-2 border-gray-950 flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: u.color }}
          >
            {u.username.charAt(0).toUpperCase()}
          </div>
        ))}
        {extra > 0 && (
          <div className="w-7 h-7 rounded-full border-2 border-gray-950 bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-300">
            +{extra}
          </div>
        )}
      </div>
    </div>
  )
}
