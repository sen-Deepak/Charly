import { useState, useEffect } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../supabaseClient'

function DashboardLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(true)
  const [profile, setProfile] = useState({ full_name: '', position: '', role: '' })
  const [profileLoading, setProfileLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const fetchProfile = async () => {
      setProfileLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        const userId = user?.id
        if (!userId) {
          setProfileLoading(false)
          return
        }
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, position, role')
          .eq('id', userId)
          .single()
        if (error) throw error
        if (mounted) setProfile({ full_name: data.full_name || '', position: data.position || '', role: data.role || '' })
      } catch (err) {
        console.error('Error fetching profile:', err)
      } finally {
        if (mounted) setProfileLoading(false)
      }
    }

    fetchProfile()
    return () => { mounted = false }
  }, [])

  const handleLogout = async () => {
    setLoading(true)
    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession()

      if (session) {
        // Log logout
        const { error: logError } = await supabase.rpc('log_logout', {
          p_session_id: session.access_token
        })

        if (logError) {
          console.error('Error logging logout:', logError)
        }
      }

      // Sign out
      await supabase.auth.signOut()
      navigate('/login')
    } catch (err) {
      console.error('Error during logout:', err)
      navigate('/login')
    } finally {
      setLoading(false)
    }
  }

  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`flex flex-col transition-all duration-300 ease-in-out fixed h-screen ${
          expanded ? 'w-64' : 'w-20'
        } bg-gradient-to-br from-secondary-300 via-secondary-200 to-secondary-100 text-white`}
      >
        {/* Fixed top section */}
        <div className="flex-shrink-0">
          <div
            className={`p-4 border-b border-white/10 flex items-center justify-center cursor-pointer select-none hover:bg-white/5 transition-colors`}
            onClick={() => setExpanded((s) => !s)}
            title={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {/* Charly title (match Login style) - centered and white */}
            <div className="flex items-center justify-center">
              <span className="inline-block text-white font-brittany font-black align-baseline" style={{ lineHeight: 1 }}>
                {expanded ? (
                  <span className="text-2xl">Charly</span>
                ) : (
                  <span className="text-2xl">C</span>
                )}
              </span>
            </div>
          </div>

          {/* Profile brief */}
          <div className={`p-4 transition-opacity duration-300 ${expanded ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
            <div className="text-sm text-white/90 flex flex-col items-center text-center">
              <div className="text-lg text-white font-medium">
                {profileLoading ? 'Loading...' : `Hi, ${profile.full_name ? profile.full_name.split(' ')[0] : 'User'}`}
              </div>
              <div className="text-sm text-white/80">{profile.position || '—'}</div>
            </div>
          </div>
        </div>

        {/* Scrollable navigation */}
        <nav className="flex-1 p-2 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
          {[
            { to: '/profile', label: 'Profile', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              ) },
           
            { to: '/hr-donna', label: 'HR Donna', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              ) },
            { to: '/gajodhar', label: 'Gajodhar', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v4m0 0a4 4 0 110 8v1M6 20h12" />
                </svg>
              ) }
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 ${
                isActive(item.to)
                  ? 'bg-white/20 text-white font-semibold'
                  : 'text-white/80 hover:bg-white/5'
              }`}
            >
              <div className="flex-shrink-0">
                {item.icon}
              </div>
              <div className={`truncate ${expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>
                {item.label}
              </div>
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-200">
          <button
            onClick={handleLogout}
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {loading ? 'Logging out...' : (expanded ? 'Logout' : '')}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className={`flex-1 overflow-y-auto transition-all duration-300 ${expanded ? 'ml-64' : 'ml-20'}`}>
        <div className="max-w mx-auto  ">
          <Outlet />
        </div>
      </main>
      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 2px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.3);
          }
        `}
      </style>
    </div>
  )
}

export default DashboardLayout

