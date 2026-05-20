import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import {
  Search, Plus, Bell, MessageCircle, LogOut,
  User, Home, X, CheckCheck, MapPin
} from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [notifications, setNotifications]     = useState([])
  const [unreadCount, setUnreadCount]         = useState(0)
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [showNotifs, setShowNotifs]           = useState(false)
  const [showUserMenu, setShowUserMenu]       = useState(false)
  const [searchQuery, setSearchQuery]         = useState('')

  const notifRef    = useRef(null)
  const userMenuRef = useRef(null)

  useEffect(() => {
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false)
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchUnreadCount = async () => {

    try {
  
      // Notifications
      const notifRes = await api.get('/notifications/unread-count')
      setUnreadCount(notifRes.data.data ?? 0)
  
      // Messages
      const chatRes = await api.get('/chat')
  
      const unread = (chatRes.data.data ?? []).reduce(
        (total, chat) => total + (chat.unreadCount ?? 0),
        0
      )
  
      setUnreadMessages(unread)
  
    } catch (err) {
      console.log(err)
    }
  }
  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications')
      setNotifications(data.data ?? [])
    } catch {}
  }

  const toggleNotifs = () => {
    if (!showNotifs) fetchNotifications()
    setShowNotifs(!showNotifs)
    setShowUserMenu(false)
  }

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all')
      setUnreadCount(0)
      setNotifications(notifications.map(n => ({ ...n, read: true })))
    } catch {}
  }


  

  const markOneRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`)
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))
      setUnreadCount(c => Math.max(0, c - 1))
    } catch {}
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`)
  }

  const navLinks = [
    { to: '/',        icon: Home,          label: 'Accueil' },
    { to: '/chat',    icon: MessageCircle, label: 'Messages' },
    { to: '/profile', icon: User,          label: 'Profil' },
  ]

  const notifTypeIcon = (type) => {
    if (type === 'MATCH')    return '🎯'
    if (type === 'MESSAGE')  return '💬'
    if (type === 'RESOLVED') return '✅'
    return '🔔'
  }

  return (
    <nav className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/60">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0 mr-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm">
            LF
          </div>
          <span className="font-bold text-base hidden sm:block gradient-text">Lost&amp;Found</span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Rechercher un objet..."
              className="w-full bg-gray-800/60 border border-gray-700 rounded-xl pl-9 pr-4 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/60 transition-all"
            />
          </div>
        </form>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                location.pathname === to
                  ? 'bg-primary-500/20 text-primary-300'
                  : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'
              }`}
            >
            <div className="relative">
  <Icon className="w-4 h-4" />

  {label === 'Messages' && unreadMessages > 0 && (
    <span className="absolute -top-2 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
      {unreadMessages}
    </span>
  )}
</div>
              <span>{label}</span>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* Publish button */}
          <Link to="/publish" className="btn-primary py-2 px-3 sm:px-4 text-xs sm:text-sm">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Publier</span>
          </Link>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={toggleNotifs}
              className="relative p-2 rounded-xl text-gray-400 hover:text-gray-100 hover:bg-gray-800 transition-all"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifs && (
              <div className="absolute right-0 mt-2 w-80 card shadow-2xl shadow-black/50 animate-fade-in overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
                  <span className="font-semibold text-sm text-gray-100">Notifications</span>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
                        <CheckCheck className="w-3 h-3" /> Tout lire
                      </button>
                    )}
                    <button onClick={() => setShowNotifs(false)} className="text-gray-500 hover:text-gray-300">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-gray-800/60">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-gray-500 text-sm">
                      <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      Aucune notification
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div
                        key={notif.id}
                        onClick={async () => {

                          await markOneRead(notif.id)
                        
                          if (notif.itemId) {
                            navigate(`/items/${notif.itemId}`)
                          }
                        
                          setShowNotifs(false)
                        }}
                        className={`px-4 py-3 cursor-pointer hover:bg-gray-800/50 transition-all ${
                          !notif.read ? 'bg-primary-500/5 border-l-2 border-l-primary-500' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="text-lg leading-none mt-0.5">{notifTypeIcon(notif.type)}</span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-200 truncate">{notif.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.body}</p>
                          </div>
                          {!notif.read && (
                            <div className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-1.5" />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifs(false) }}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-800 transition-all"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold">
                {user?.name?.[0]?.toUpperCase() ?? 'U'}
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 card shadow-2xl shadow-black/50 py-1 animate-fade-in">
                <div className="px-4 py-2.5 border-b border-gray-800">
                  <p className="text-sm font-semibold text-gray-100">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
                <Link to="/profile" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-all" onClick={() => setShowUserMenu(false)}>
                  <User className="w-4 h-4" /> Mon profil
                </Link>
                <Link
  to="/chat"
  className="flex items-center justify-between px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-all"
  onClick={() => setShowUserMenu(false)}
>

  <div className="flex items-center gap-2">
    <MessageCircle className="w-4 h-4" />
    Messages
  </div>

  {unreadMessages > 0 && (
    <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
      {unreadMessages > 9 ? '9+' : unreadMessages}
    </span>
  )}

</Link>
                <div className="border-t border-gray-800 mt-1 pt-1">
                  <button
                    onClick={() => { logout(); navigate('/login') }}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-rose-400 hover:bg-gray-800 hover:text-rose-300 transition-all"
                  >
                    <LogOut className="w-4 h-4" /> Déconnexion
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-gray-950/95 backdrop-blur-xl border-t border-gray-800 flex items-center justify-around px-2 py-2 z-50">
        {navLinks.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl text-xs font-medium transition-all ${
              location.pathname === to
                ? 'text-primary-400'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <div className="relative">
  <Icon className="w-5 h-5" />

  {label === 'Messages' && unreadMessages > 0 && (
    <span className="absolute -top-2 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
      {unreadMessages}
    </span>
  )}
</div>
            <span>{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
