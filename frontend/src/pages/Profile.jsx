import { useState, useEffect } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import ItemCard from '../components/ItemCard'
import { Package, CheckCircle, Star, Calendar, Loader2, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'


export default function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [profile, setProfile] = useState(null)
  const [myItems, setMyItems] = useState([])
  const [loading, setLoading] = useState(true)
 // ACTIVE | RESOLVED

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, itemsRes] = await Promise.all([
          api.get('/users/me'),
          api.get('/items/user/me'),
        ])
        setProfile(profileRes.data.data)
        setMyItems(itemsRes.data.data ?? [])
      } catch {
        toast.error("Impossible de charger le profil")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredItems = myItems

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    )
  }

  const joinDate = profile?.createdAt
    ? format(new Date(profile.createdAt), 'MMMM yyyy', { locale: fr })
    : ''

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24 md:pb-8">

      {/* Profile header */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar */}
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-primary-900/40">
              {profile?.name?.[0]?.toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-gray-900" />
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{profile?.name}</h1>
            <p className="text-gray-400 text-sm mt-0.5">{profile?.email}</p>
            {joinDate && (
              <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Membre depuis {joinDate}
              </p>
            )}
          </div>

          <button
            onClick={() => { logout(); navigate('/login') }}
            className="btn-ghost text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 self-start"
          >
            <LogOut className="w-4 h-4" /> Déconnexion
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          <div className="bg-gray-800/60 rounded-xl p-3 text-center">
            <div className="text-xl font-bold gradient-text">{profile?.itemsPublished ?? 0}</div>
            <div className="text-xs text-gray-500 mt-0.5 flex items-center justify-center gap-1">
              <Package className="w-3 h-3" /> Annonces
            </div>
          </div>
          <div className="bg-gray-800/60 rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-emerald-400">{profile?.itemsResolved ?? 0}</div>
            <div className="text-xs text-gray-500 mt-0.5 flex items-center justify-center gap-1">
              <CheckCircle className="w-3 h-3" /> Résolus
            </div>
          </div>
          <div className="bg-gray-800/60 rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-yellow-400">{Math.round(profile?.reputationScore ?? 0)}</div>
            <div className="text-xs text-gray-500 mt-0.5 flex items-center justify-center gap-1">
              <Star className="w-3 h-3" /> Points
            </div>
          </div>
        </div>
      </div>

      {/* My items */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Mes annonces</h2>
         
        </div>

        {filteredItems.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-16 text-center">
          <div className="text-4xl mb-3">📭</div>
        
          <p className="text-gray-400 font-medium">
            Aucune annonce pour le moment
          </p>
        
          <p className="text-gray-600 text-sm mt-1">
            Publiez votre première annonce !
          </p>
        </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map(item => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
