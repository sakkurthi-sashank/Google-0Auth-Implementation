import { useEffect, useState } from 'react'

export const App = () => {
  const [user, setUser] = useState({
    name: '',
    email: '',
    picture: '',
  })

  const handleGoogleLogin = () => {
    const googleLoginUrl = getGoogleLoginUrl()
    window.location.href = googleLoginUrl
  }

  const getGoogleLoginUrl = () => {
    const params = new URLSearchParams({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID as string,
      redirect_uri: import.meta.env.VITE_GOOGLE_REDIRECT_URI as string,
      response_type: 'code',
      scope: 'openid profile email',
      state: new URLSearchParams({
        redirect_uri: import.meta.env.VITE_GOOGLE_REDIRECT_URI as string,
      }).toString(),
    })

    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`
  }

  useEffect(() => {
    const url = new URL(window.location.href)
    const urlAccessToken = url.searchParams.get('access_token')

    if (urlAccessToken) {
      localStorage.setItem('accessToken', urlAccessToken)
    }

    const accessToken = urlAccessToken || localStorage.getItem('accessToken')
    window.history.replaceState({}, '', window.location.origin)

    const fetchUserProfile = async () => {
      if (accessToken) {
        try {
          const profile = await fetchUserProfileData(accessToken)
          setUser({
            name: profile.name,
            email: profile.email,
            picture: profile.picture,
          })
        } catch (error) {
          console.error('Error fetching user profile:', error)
        }
      }
    }

    fetchUserProfile()
  }, [])

  const fetchUserProfileData = async (accessToken: string) => {
    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    if (!profileResponse.ok) {
      throw new Error('Failed to fetch user profile')
    }
    return await profileResponse.json()
  }

  return (
    <div>
      <button onClick={handleGoogleLogin}>Google Login</button>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  )
}
