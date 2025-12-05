import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [step, setStep] = useState(1) // 1: enter email, 2: verify OTP
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [helpOpen, setHelpOpen] = useState(false)

  const normalizedEmail = email.trim().toLowerCase()

  // Close modal on Esc
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setHelpOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const handleRequestOTP = async (e) => {
    if (e) e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data: isAllowed, error: checkError } = await supabase
        .rpc('is_email_allowed', { e: normalizedEmail })
      if (checkError) throw checkError

      if (!isAllowed) {
        setError('You don’t have permission to access this resource.')
        return
      }

      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: { shouldCreateUser: true }
      })
      if (otpError) throw otpError

      setStep(2)
    } catch (err) {
      console.error('Error requesting OTP:', err)
      setError(err.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: normalizedEmail,
        token: otpCode,
        type: 'email'
      })
      if (verifyError) throw verifyError

      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError
      if (!session) throw new Error('No session created')

      // best-effort helpers
      const { error: profileError } = await supabase.rpc('ensure_profile')
      if (profileError) console.error('ensure_profile:', profileError)

      const { error: logError } = await supabase.rpc('log_login', {
        p_session_id: session.access_token,
        p_user_agent: navigator.userAgent
      })
      if (logError) console.error('log_login:', logError)

      navigate('/profile')
    } catch (err) {
      console.error('Error verifying OTP:', err)
      const msg = (err.message || '').toLowerCase()
      if (msg.includes('expired') || msg.includes('invalid')) {
        setError('Invalid or expired code. Please try again.')
      } else {
        setError(err.message || 'Failed to verify code')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-white">
      <div className="relative flex min-h-screen">
        {/* LEFT: use SECONDARY (dark shades in your scale) */}
        <div className="hidden lg:flex lg:w-5/12 flex-col justify-between p-12
                        bg-gradient-to-br from-secondary-300 via-secondary-200 to-secondary-100 text-white">
          {/* Logo (top-left) */}
          <div className="self-start">
            <img
              src="https://i.ibb.co/1gFytnT/full-white-logo.png"
              alt="Creative Fuel Logo"
              className="w-32 sm:w-40 md:w-44 h-auto object-contain"
            />
          </div>

          {/* Welcome */}
          <div className="space-y-6">
          <h1 className="text-5xl leading-tight drop-shadow-sm">
  <span>Welcome to </span>
  <span className="font-brittany">Charly</span>
</h1>

            <p className="text-white/90 text-lg leading-relaxed max-w-md">
              Your creative partner at work.
Discover AI-powered tools, automation, and training resources
that help you think bigger and achieve more.
            </p>
          </div>

          <div className="text-white/70 text-sm">
            © 2025 Charly. All rights reserved.
          </div>
        </div>

        {/* RIGHT: form card */}
        <div className="w-full lg:w-7/12 flex items-center justify-center p-6 sm:p-8">
          <div className="w-full max-w-md">
            <h2 className="text-5xl leading-tight drop-shadow-sm mb-6">
              <span>Sign in to </span>
              <span className="font-brittany text-4.6xl text-primary font-black align-baseline">Charly</span>
            </h2>

            <div className="bg-white/95 backdrop-blur rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
              <form onSubmit={step === 1 ? handleRequestOTP : handleVerifyOTP} className="space-y-6">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@creativefuel.io"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400
                               focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition"
                    autoComplete="email"
                    inputMode="email"
                  />
                </div>

                {/* OTP step */}
                {step === 2 && (
                  <div>
                    <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                      Enter 6-digit code
                    </label>
                    <input
                      id="otp"
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required
                      maxLength={6}
                      placeholder="000000"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 text-center text-2xl tracking-widest
                                 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      We sent a code to <span className="font-medium">{normalizedEmail}</span>.{" "}
                      <button
                        type="button"
                        onClick={handleRequestOTP}
                        disabled={loading || !normalizedEmail}
                        className="underline hover:no-underline text-accent-500 disabled:text-gray-400"
                      >
                        Resend
                      </button>
                    </p>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="text-red-700 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                    {error}
                  </div>
                )}

                {/* Actions */}
                {step === 2 ? (
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => { setStep(1); setOtpCode(''); setError('') }}
                      disabled={loading}
                      className="flex-1 py-3 px-4 rounded-lg border border-gray-300 bg-white text-gray-800
                                 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed transition font-medium"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading || otpCode.length !== 6}
                      className="flex-1 py-3 px-4 rounded-lg bg-secondary-500 text-white shadow-lg border border-secondary-400
                                 hover:bg-secondary-400 focus:outline-none focus:ring-2 focus:ring-accent
                                 disabled:opacity-60 disabled:cursor-not-allowed transition font-medium"
                    >
                      {loading ? 'Verifying…' : 'Verify'}
                    </button>
                  </div>
                ) : (
                  <button
                    type="submit"
                    disabled={loading || !normalizedEmail}
                    className="w-full py-3 px-4 rounded-lg bg-secondary-300 text-white shadow-lg border border-secondary-400
                               hover:bg-secondary-100 focus:outline-none focus:ring-2 focus:ring-accent
                               disabled:opacity-60 disabled:cursor-not-allowed transition font-medium"
                  >
                    {loading ? 'Sending…' : 'Send OTP Code'}
                  </button>
                )}
              </form>

              {/* Replaced terms line with Help button */}
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setHelpOpen(true)}
                  className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50
                             focus:outline-none focus:ring-2 focus:ring-accent text-sm font-medium"
                >
                  Help
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden lg:block absolute left-[41.6667%] top-0 bottom-0 w-px bg-gray-200" />
      </div>

      {/* HELP MODAL */}
      {helpOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setHelpOpen(false)}
          aria-modal="true"
          role="dialog"
        >
          {/* stop click from closing when clicking inside the card */}
          <div
            className="w-full max-w-md mx-4 rounded-2xl bg-white shadow-xl border border-gray-200 p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              aria-label="Close help"
              onClick={() => setHelpOpen(false)}
              className="absolute top-3 right-3 inline-flex h-8 w-8 items-center justify-center rounded-full
                         border border-gray-200 text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-accent"
            >
              
            </button>

           <p className="text-gray-600">
  Connect to Admin <br />
  📧 deepak@creativeful.io
</p>

          </div>
        </div>
      )}
    </div>
  )
}

export default Login