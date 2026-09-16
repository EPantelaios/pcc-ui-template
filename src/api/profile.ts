import type { UserProfile } from '@/types/profile'

const BACKEND_API = import.meta.env.VITE_BACKEND_URI

// example of a function to fetch user profile data from the backend API
export const fetchUserProfile = async (token: string): Promise<UserProfile> => {
  const response = await fetch(`${BACKEND_API}/users/profile`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as Error
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`,
    )
  }

  return (await response.json()) as UserProfile
}
