import { Link } from 'react-router-dom'
import { MapPin, Clock, Tag } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function ItemCard({ item }) {
  const timeAgo = item.createdAt
    ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: fr })
    : ''

  return (
    <Link to={`/items/${item.id}`} className="block">
      <div className="card-hover overflow-hidden group cursor-pointer animate-fade-in">
        {/* Image */}
        <div className="relative h-44 bg-gray-800 overflow-hidden">
          {item.photoUrl ? (
            <img
            src={
              item.photoUrl.startsWith('http')
                ? item.photoUrl
                : `http://localhost:8080${item.photoUrl}`
            }
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-5xl opacity-20">
                {item.category === 'sac' ? '👜' :
                 item.category === 'téléphone' ? '📱' :
                 item.category === 'clés' ? '🔑' :
                 item.category === 'portefeuille' ? '👛' :
                 item.category === 'bijoux' ? '💍' : '📦'}
              </div>
            </div>
          )}
          {/* Type badge */}
          <div className="absolute top-2.5 left-2.5">
            {item.type === 'LOST' ? (
              <span className="badge-lost">🔍 Perdu</span>
            ) : (
              <span className="badge-found">✅ Trouvé</span>
            )}
          </div>
          {/* Status badge */}
          {item.status === 'RESOLVED' && (
            <div className="absolute top-2.5 right-2.5">
              <span className="badge-resolved">Résolu</span>
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-100 text-sm truncate mb-1.5 group-hover:text-primary-300 transition-colors">
            {item.title}
          </h3>

          {item.description && (
            <p className="text-xs text-gray-500 line-clamp-2 mb-3">{item.description}</p>
          )}

          <div className="flex items-center gap-3 text-xs text-gray-500">
            {item.address && (
              <span className="flex items-center gap-1 truncate">
                <MapPin className="w-3 h-3 text-primary-500 flex-shrink-0" />
                <span className="truncate">{item.address}</span>
              </span>
            )}
            {item.category && (
              <span className="flex items-center gap-1 flex-shrink-0">
                <Tag className="w-3 h-3 text-accent-500" />
                {item.category}
              </span>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-[9px] font-bold text-white">
              {item.userName?.[0]?.toUpperCase() ?? '?'}
              </div>
              <span className="text-xs text-gray-500">{item.userName}</span>
            </div>
            <span className="flex items-center gap-1 text-xs text-gray-600">
              <Clock className="w-3 h-3" />
              {timeAgo}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
