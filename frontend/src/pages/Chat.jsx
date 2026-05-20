import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Send, MessageCircle, ArrowLeft, Loader2, CheckCheck } from 'lucide-react'

export default function Chat() {
  const { userId: targetUserId } = useParams()
  const [searchParams] = useSearchParams()
const itemId = searchParams.get('itemId')
  const { user } = useAuth()
  const navigate = useNavigate()

  const [conversations, setConversations] = useState([])
  const [activeChat, setActiveChat]       = useState(null)  // { userId, name }
  const [messages, setMessages]           = useState([])
  const [input, setInput]                 = useState('')
  const [loading, setLoading]             = useState(false)
  const [sending, setSending]             = useState(false)

  const stompRef    = useRef(null)
  const messagesEnd = useRef(null)

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => { scrollToBottom() }, [messages])

  // Load conversations
  useEffect(() => {
    loadConversations()
  }, [])

  // If URL has a userId param, open that conversation
  useEffect(() => {

    if (!targetUserId) return
  
    const conv = conversations.find(
      c => String(c.otherUserId) === String(targetUserId)
    )
  
    if (conv) {
      openConversation(conv)
    } else {
      fetchUserAndOpen(targetUserId)
    }
  
  }, [targetUserId, conversations])

  // WebSocket connection (dynamic import to avoid Vite/CJS issues)
  useEffect(() => {
    let client = null
    const token = localStorage.getItem('token')

    Promise.all([
      import('@stomp/stompjs'),
      import('sockjs-client'),
    ]).then(([{ Client }, { default: SockJS }]) => {
      client = new Client({
        webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      
        connectHeaders: {
          Authorization: `Bearer ${token}`
        },
      
        onConnect: () => {
      
          client.subscribe('/user/queue/messages', (msg) => {
      
            const message = JSON.parse(msg.body)
      
            setMessages(prev => {
              if (prev.some(m => m.id === message.id)) return prev
              return [...prev, message]
            })
      
            // Refresh conversations + badges
            loadConversations()
          })
        },
      
        reconnectDelay: 5000,
      })
      client.activate()
      stompRef.current = client
    }).catch(console.error)

    return () => { client?.deactivate() }
  }, [])

  const loadConversations = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/chat')
      setConversations(data.data ?? [])
    } catch {}
    finally { setLoading(false) }
  }

  const fetchUserAndOpen = async (userId) => {

    try {
  
      const { data } = await api.get(`/users/${userId}`)
  
      setActiveChat({
        userId: parseInt(userId),
        name: data.data?.name ?? 'Utilisateur'
      })
  
      setMessages([])
  
    } catch (err) {
      console.log(err)
    }
  }

  const openConversation = async (conv) => {
    setActiveChat({ userId: conv.otherUserId, name: conv.otherUserName })
    setLoading(true)
    try {
      const { data } = await api.get(`/chat/${conv.otherUserId}`)
      setMessages(data.data ?? [])
      // Mark as read
      const chatId = [Math.min(user.id, conv.otherUserId), Math.max(user.id, conv.otherUserId)].join('_')
      await api.patch(`/chat/${chatId}/read`).catch(() => {})
      loadConversations()
    } catch {}
    finally { setLoading(false) }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim() || !activeChat) return
    setSending(true)
    try {
      const { data } = await api.post('/chat/send', {
        receiverId: activeChat.userId,
        itemId: Number(itemId),
        content: input.trim(),
      })
      setMessages(prev => [...prev, data.data])
      setInput('')
      // Refresh conversations list
      loadConversations()
    } catch {}
    finally { setSending(false) }
  }

  const formatTime = (dateStr) => {
    if (!dateStr) return ''
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: fr })
  }

  const isMine = (msg) => String(msg.senderId) === String(user?.id)

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 pb-24 md:pb-6">
      <h1 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-primary-400" />
        Messages
      </h1>

      <div className="flex gap-4 h-[calc(100vh-160px)] md:h-[600px]">

        {/* Conversations list */}
        <div className={`w-full md:w-72 flex-shrink-0 card overflow-hidden flex flex-col ${activeChat ? 'hidden md:flex' : 'flex'}`}>
          <div className="px-4 py-3 border-b border-gray-800 font-semibold text-sm text-gray-300">
            Conversations
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-gray-800/60">
            {loading && conversations.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <MessageCircle className="w-10 h-10 text-gray-700 mb-3" />
                <p className="text-gray-500 text-sm">Aucune conversation</p>
                <p className="text-gray-600 text-xs mt-1">Contactez quelqu'un depuis une annonce</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.otherUserId}
                  onClick={() => openConversation(conv)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-800/50 transition-all ${
                    activeChat?.userId === conv.otherUserId ? 'bg-primary-500/10 border-l-2 border-l-primary-500' : ''
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {conv.otherUserName?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm text-gray-200 truncate">{conv.otherUserName}</span>
                      {conv.lastMessageTime && (
                        <span className="text-[10px] text-gray-600 flex-shrink-0 ml-1">
                          {formatTime(conv.lastMessageTime)}
                        </span>
                      )}
                    </div>
                    {conv.lastMessage && (
                      <p className="text-xs text-gray-500 truncate mt-0.5">{conv.lastMessage}</p>
                    )}
                  </div>
                  {conv.unreadCount > 0 && (
                    <div className="w-5 h-5 rounded-full bg-primary-500 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                      {conv.unreadCount}
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat window */}
        <div className={`flex-1 card overflow-hidden flex flex-col ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
          {!activeChat ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center text-3xl mb-4">
                💬
              </div>
              <p className="text-gray-300 font-semibold">Sélectionne une conversation</p>
              <p className="text-gray-500 text-sm mt-1">ou contacte quelqu'un depuis une annonce</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-3">
                <button
                  onClick={() => setActiveChat(null)}
                  className="md:hidden btn-ghost p-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm">
                  {activeChat.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-100">{activeChat.name}</p>
                  <p className="text-xs text-gray-500">En ligne</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <p className="text-gray-500 text-sm">Commencez la conversation !</p>
                  </div>
                ) : (
                  messages.map((msg, i) => (
                    <div
                      key={msg.id ?? i}
                      className={`flex ${isMine(msg) ? 'justify-end' : 'justify-start'} animate-fade-in`}
                    >
                      <div
                        className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                          isMine(msg)
                            ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-br-md'
                            : 'bg-gray-800 text-gray-100 rounded-bl-md'
                        }`}
                      >
                        <p className="break-words">{msg.content}</p>
                        <div className={`flex items-center gap-1 mt-1 text-[10px] ${isMine(msg) ? 'text-white/60 justify-end' : 'text-gray-500'}`}>
                          <span>{formatTime(msg.createdAt)}</span>
                          {isMine(msg) && msg.read && <CheckCheck className="w-3 h-3" />}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEnd} />
              </div>

              {/* Input */}
              <form onSubmit={sendMessage} className="px-4 py-3 border-t border-gray-800 flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Écrire un message..."
                  className="input flex-1"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || sending}
                  className="btn-primary px-4 py-2.5"
                >
                  {sending
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Send className="w-4 h-4" />
                  }
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
