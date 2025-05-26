import { createContext, useEffect, useState } from "react"

export const AuthContext = createContext({
  user: null,
  setUser: null,
  initialLoading: true
})

export const AuthContextProvider = ({ children }) => {
  const [initialLoading, setInitialLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const fetchUserStatus = async () => {
      try {
        const res = await fetch("/api/status", {
          credentials: "include",
        })

        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
        } else {
          setUser(null)
        }
      } catch (err) {
        console.error("Failed to fetch user status:", err)
        setUser(null)
      } finally {
        setInitialLoading(false)
      }
    }

    fetchUserStatus()
  }, [])

  return (
    <AuthContext.Provider value={{ user, setUser, initialLoading }}>
      {children}
    </AuthContext.Provider>
  )
}
