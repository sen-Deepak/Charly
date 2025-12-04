import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

function Profile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Not authenticated')
        return
      }

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('full_name, email, role, position')
        .eq('id', user.id)
        .single()

      if (fetchError) throw fetchError

      setProfile({
        ...data,
        email: user.email,
        id: user.id
      })
    } catch (err) {
      console.error('Error loading profile:', err)
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-sm tracking-wide text-gray-400">Loading profile…</div>
      </div>
    )
  }

  if (error && !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 px-4">
        <div className="max-w-sm w-full rounded-xl border border-red-100 bg-white/80 shadow-sm px-6 py-5 text-center">
          <p className="font-medium text-red-600 mb-1">Something went wrong</p>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-light text-gray-900">Profile</h1>
          <div className="mt-3 h-0.5 w-16 rounded-full bg-gradient-to-r from-primary to-secondary" />
        </div>

        {/* Profile Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm px-6 py-7 sm:px-10 sm:py-9 space-y-8">
          {/* Name Section */}
          <div className="space-y-1">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-[0.18em]">
              Full Name
            </h2>
            <p className="text-2xl font-light text-gray-900">
              {profile?.full_name || '—'}
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-dashed border-gray-200" />

          {/* Email Section */}
          <div className="space-y-1">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-[0.18em]">
              Email
            </h2>
            <p className="text-base font-light text-gray-700 break-all">
              {profile?.email || '—'}
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-dashed border-gray-200" />

          {/* Position Section */}
          <div className="space-y-1">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-[0.18em]">
              Position
            </h2>
            <p className="text-base font-light text-gray-700 capitalize">
              {profile?.position || '—'}
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-dashed border-gray-200" />

          {/* Role Section */}
          <div className="space-y-1">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-[0.18em]">
              Role
            </h2>
            <div className="inline-flex items-center rounded-full border border-gray-100 bg-slate-50 px-3 py-1">
              <span
                className={`text-xs font-medium capitalize px-2 py-0.5 rounded-full ${
                  profile?.role === 'admin'
                    ? 'bg-accent-50 text-accent-700'
                    : 'bg-primary-50 text-primary-700'
                }`}
              >
                {profile?.role || '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <p className="mt-8 text-xs text-gray-400 text-center">
          Contact your administrator to update profile information.
        </p>
      </div>
    </div>
  )
}

export default Profile
