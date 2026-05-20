import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

useEffect(() => {
  const storedUser = localStorage.getItem('user')

  if (storedUser) {
    try {
      setUser(JSON.parse(storedUser))
    } catch {
      localStorage.removeItem('user')
    }
  }
}, [])
  const [loading, setLoading] = useState(false)

  const login = async (email, password) => {

    const response = await api.post('/auth/login', {
      email,
      password
    })
  
    console.log(response.data)
  
    const backendData = response.data.data || response.data
  
    const token = backendData.token
    const userId = backendData.userId
    const name = backendData.name
  
    localStorage.setItem('token', token)
  
    localStorage.setItem(
      'user',
      JSON.stringify({
        id: userId,
        name,
        email
      })
    )
  
    setUser({
      id: userId,
      name,
      email
    })
  
    return response.data
  }

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password })
    const { token, userId } = data.data
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify({ id: userId, name, email }))
    setUser({ id: userId, name, email })
    return data
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
