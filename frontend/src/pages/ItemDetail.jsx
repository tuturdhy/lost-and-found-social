import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  MapPin, Tag, Palette, Clock, User, MessageCircle,
  CheckCircle, ArrowLeft, Loader2, Star
} from 'lucide-react'

export default function ItemDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [item, setItem]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [resolving, setResolving] = useState(false)

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const { data } = await api.get(`/items/${id}`)
        setItem(data.data)
      } catch {
        toast.error("Annonce introuvable")
        navigate('/')
      } finally {
        setLoading(false)
      }
    }
    fetchItem()
  }, [id])

  const handleResolve = async () => {
    if (!confirm("Marquer cet objet comme retrouvé/rendu ?")) return
    setResolving(true)
    try {
      await api.patch(`/items/${id}/resolve`)
      setItem(i => ({ ...i, status: 'RESOLVED' }))
      toast.success("Objet marqué comme résolu ! 🎉")
    } catch {
      toast.error("Erreur lors de la résolution")
    } finally {
      setResolving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    )
  }

  if (!item) return null

  const isOwner = String(item.userId) === String(user?.id)
  const timeAgo = item.createdAt
    ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: fr })
    : ''
    console.log(item)
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="btn-ghost mb-4 -ml-2">
        <ArrowLeft className="w-4 h-4" /> Retour
      </button>

      <div className="card overflow-hidden">
        {/* Image */}
        {item.photoUrl && (
          <div className="relative h-64 bg-gray-800">
            <img
              src={
                item.photoUrl.startsWith('http')
                  ? item.photoUrl
                  : `http://localhost:8080${item.photoUrl}`
              }
              alt={item.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />
          </div>
        )}

        <div className="p-6">
          {/* Type & Status */}
          <div className="flex items-center gap-2 mb-4">
            {item.type === 'LOST' ? (
              <span className="badge-lost text-sm px-3 py-1">🔍 Objet perdu</span>
            ) : (
              <span className="badge-found text-sm px-3 py-1">✅ Objet trouvé</span>
            )}
            {item.status === 'RESOLVED' && (
              <span className="badge-resolved text-sm px-3 py-1">Résolu</span>
            )}
          </div>

          <h1 className="text-2xl font-bold text-white mb-3">{item.title}</h1>

          {item.description && (
            <p className="text-gray-400 text-sm leading-relaxed mb-5">{item.description}</p>
          )}

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {item.category && (
              <div className="card px-3 py-2.5 flex items-center gap-2">
                <Tag className="w-4 h-4 text-primary-400" />
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide">Catégorie</p>
                  <p className="text-sm text-gray-200 font-medium capitalize">{item.category}</p>
                </div>
              </div>
            )}
            {item.color && (
              <div className="card px-3 py-2.5 flex items-center gap-2">
                <Palette className="w-4 h-4 text-accent-400" />
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide">Couleur</p>
                  <p className="text-sm text-gray-200 font-medium capitalize">{item.color}</p>
                </div>
              </div>
            )}
            {item.address && (
              <div className="card px-3 py-2.5 flex items-center gap-2 col-span-2">
                <MapPin className="w-4 h-4 text-rose-400" />
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide">Lieu</p>
                  <p className="text-sm text-gray-200 font-medium">{item.address}</p>
                </div>
              </div>
            )}
          </div>

          {/* Keywords */}
          {item.keywords && item.keywords.length > 0 && (
            <div className="mb-5">
              <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Mots-clés</p>
              <div className="flex flex-wrap gap-2">
                {(Array.isArray(item.keywords) ? item.keywords : JSON.parse(item.keywords ?? '[]')).map((kw, i) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-primary-500/10 text-primary-400 text-xs border border-primary-500/20">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Owner */}
          <div className="border-t border-gray-800 pt-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold">
              {item.userName?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-200">{item.userName}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-400" />
                 
                </p>
              </div>
              <span className="ml-auto text-xs text-gray-600 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {timeAgo}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {!isOwner && item.status === 'ACTIVE' && (
              <button
              onClick={() => {
                console.log(item)
                navigate(`/chat/${item.userId}?itemId=${item.id}`)
              }}
                className="btn-primary flex-1"
              >
                <MessageCircle className="w-4 h-4" /> Contacter
              </button>
            )}
            {isOwner && item.status === 'ACTIVE' && (
              <button
                onClick={handleResolve}
                disabled={resolving}
                className="btn-secondary flex-1 hover:border-emerald-500/40 hover:text-emerald-400"
              >
                {resolving
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <CheckCircle className="w-4 h-4" />
                }
                Marquer comme résolu
              </button>
            )}
            {item.status === 'RESOLVED' && (
              <div className="flex-1 text-center py-2.5 text-sm text-emerald-400 font-medium">
                ✅ Cet objet a été retrouvé/rendu
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
