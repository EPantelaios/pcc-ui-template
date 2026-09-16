import type { JSX } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'

interface AuthProtectedProps {
  children: JSX.Element
}

const AuthProtected = ({ children }: AuthProtectedProps) => {
  const { initialized, authenticated } = useAuth()
  const location = useLocation()

  if (!initialized) {
    return null
  }

  if (!authenticated) {
    return <Navigate to="/" state={{ from: location }} replace />
  }

  return children
}

export default AuthProtected
