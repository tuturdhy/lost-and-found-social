import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import api from '../api/axios'
import ItemCard from '../components/ItemCard'
import { Search, Filter, Plus, Package, MapPin, Loader2, SlidersHorizontal } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
const CATEGORIES = ['Tous', 'sac', 'téléphone', 'clés', 'portefeuille', 'bijoux', 'vêtements', 'autre']

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuth()
  const [items, setItems]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [typeFilter, setTypeFilter] = useState('ALL')      // ALL | LOST | FOUND
  const [category, setCategory]   = useState('Tous')
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') ?? '')
  const [stats, setStats]         = useState({ total: 0, lost: 0, found: 0 })

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      let data
      if (searchQuery.trim()) {
        const res = await api.get(`/items/search?q=${encodeURIComponent(searchQuery.trim())}`)
        data = res.data.data ?? []
      } else {
        const params = new URLSearchParams()
        if (typeFilter !== 'ALL') params.set('type', typeFilter)
        const res = await api.get(`/items?${params}`)
        data = res.data.data ?? []
      }

      // Filter by category client-side
      const filtered = category !== 'Tous'
        ? data.filter(i => i.category?.toLowerCase() === category.toLowerCase())
        : data

        const visibleItems = filtered.filter(i => {
          if (!user) return true
        
          return String(i.userId) !== String(user.id)
        })
        
        setItems(visibleItems)
        setStats({
          total: visibleItems.length,
          lost: visibleItems.filter(i => i.type === 'LOST').length,
          found: visibleItems.filter(i => i.type === 'FOUND').length,
        })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [typeFilter, category, searchQuery, user])

  useEffect(() => { fetchItems() }, [fetchItems])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchItems()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 pb-24 md:pb-8 pt-6">

      {/* Hero / Stats */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Tableau de bord
              <span className="gradient-text ml-2">Lost & Found</span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">Retrouvez vos objets perdus ou signalez vos trouvailles</p>
          </div>
          <Link to="/publish" className="btn-primary self-start">
            <Plus className="w-4 h-4" /> Publier un objet
          </Link>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold gradient-text">{stats.total}</div>
            <div className="text-xs text-gray-500 mt-0.5">Total annonces</div>
          </div>
          <div className="card p-4 text-center border-rose-500/20">
            <div className="text-2xl font-bold text-rose-400">{stats.lost}</div>
            <div className="text-xs text-gray-500 mt-0.5">Objets perdus</div>
          </div>
          <div className="card p-4 text-center border-emerald-500/20">
            <div className="text-2xl font-bold text-emerald-400">{stats.found}</div>
            <div className="text-xs text-gray-500 mt-0.5">Objets trouvés</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6 space-y-4">
        {/* Search */}
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Rechercher par titre, description, catégorie..."
            className="input pl-10 pr-24"
          />
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary py-1.5 px-3 text-xs">
            Chercher
          </button>
        </form>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Type filter */}
          <div className="flex gap-2">
            {[
              { value: 'ALL',   label: 'Tous',   color: 'from-primary-500 to-accent-500' },
              { value: 'LOST',  label: '🔍 Perdus',  color: 'from-rose-500 to-pink-500' },
              { value: 'FOUND', label: '✅ Trouvés', color: 'from-emerald-500 to-teal-500' },
            ].map(({ value, label, color }) => (
              <button
                key={value}
                onClick={() => { setTypeFilter(value); setSearchQuery('') }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  typeFilter === value
                    ? `bg-gradient-to-r ${color} text-white shadow-lg`
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Category filter */}
          <div className="flex-1 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex-shrink-0 ${
                    category === cat
                      ? 'bg-primary-500/20 text-primary-300 border border-primary-500/40'
                      : 'bg-gray-800/60 text-gray-500 hover:text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
          <p className="text-gray-500 text-sm">Chargement des annonces...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gray-800 flex items-center justify-center text-4xl">
            📭
          </div>
          <div>
            <p className="text-gray-300 font-semibold">Aucun objet trouvé</p>
            <p className="text-gray-500 text-sm mt-1">
              {searchQuery ? `Aucun résultat pour "${searchQuery}"` : 'Soyez le premier à publier une annonce'}
            </p>
          </div>
          <Link to="/publish" className="btn-primary mt-2">
            <Plus className="w-4 h-4" /> Publier une annonce
          </Link>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-400">
              <span className="font-semibold text-gray-200">{items.length}</span> annonce{items.length > 1 ? 's' : ''}
              {searchQuery && <> pour <span className="text-primary-400">"{searchQuery}"</span></>}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map(item => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
