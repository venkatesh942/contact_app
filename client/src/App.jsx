import React from 'react'
import AuthForm from './AuthForm'
import Dashboard from './Dashboard'

const App = () => {
  const [session, setSession] = React.useState(() => {
    try {
      return JSON.parse(localStorage.getItem('contactBookSession') || 'null')
    } catch {
      localStorage.removeItem('contactBookSession')
      return null
    }
  })
  React.useEffect(() => {
    const clearExpiredSession = () => {
      setSession(null)
    }
    window.addEventListener('auth:expired', clearExpiredSession)
    return () => window.removeEventListener('auth:expired', clearExpiredSession)
  }, [])

  const logOut = () => {
    localStorage.removeItem('contactBookSession')
    setSession(null)
  }

  if (!session?.token || !session?.user) {
    return <AuthForm onAuthenticated={(newSession) => {
      localStorage.setItem('contactBookSession', JSON.stringify(newSession))
      setSession(newSession)
    }} />
  }

  return <Dashboard user={session.user} onLogout={logOut} />
}

export default App
