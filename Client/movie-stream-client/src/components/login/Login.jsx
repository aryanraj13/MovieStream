import { useState } from 'react'
import {
  Eye,
  EyeOff,
  LogIn,
  Sparkles,
} from 'lucide-react'
import {
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom'

import axiosClient from '../../api/axiosConfig'
import useAuth from '../../hooks/useAuth'
import logo from '../../assets/MagicStreamLogo.png'

const Login = () => {
  const { setAuth } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] =
    useState(false)

  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const location = useLocation()
  const navigate = useNavigate()

  const from =
    location.state?.from?.pathname || '/'

  const handleSubmit = async (e) => {
    e.preventDefault()

    setLoading(true)
    setError(null)

    try {
      const response =
        await axiosClient.post('/login', {
          email,
          password,
        })

      if (response.data.error) {
        setError(response.data.error)
        return
      }

      setAuth(response.data)

      navigate(from, {
        replace: true,
      })
    } catch (err) {
      setError(
        err.response?.data?.error ||
          'Invalid email or password.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-[calc(100vh-72px)] items-center justify-center overflow-hidden px-5 py-12 sm:px-8">

      <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/10 blur-[130px]" />

      <div className="glass relative w-full max-w-md rounded-[2rem] p-7 sm:p-9">

        <div className="mb-8 text-center">

          <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-violet-500/10 ring-1 ring-violet-400/20">

            <img
              src={logo}
              alt="Magic Stream"
              className="h-10 w-10 object-contain"
            />

          </div>

          <div className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-violet-300">
            <Sparkles size={13} />
            Welcome back
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Sign in to Magic Stream
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Pick up where you left off and discover something great.
          </p>

        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          <label className="block">

            <span className="mb-2 block text-sm font-medium text-slate-300">
              Email
            </span>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="you@example.com"
              required
              autoFocus
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 transition focus:border-violet-400/50 focus:bg-white/[0.06] focus:ring-4 focus:ring-violet-500/10"
            />

          </label>

          <label className="block">

            <span className="mb-2 block text-sm font-medium text-slate-300">
              Password
            </span>

            <div className="relative">

              <input
                type={
                  showPassword
                    ? 'text'
                    : 'password'
                }
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Enter your password"
                required
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 pr-12 text-sm text-white outline-none placeholder:text-slate-600 transition focus:border-violet-400/50 focus:bg-white/[0.06] focus:ring-4 focus:ring-violet-500/10"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (value) => !value,
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-white"
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <EyeOff size={17} />
                ) : (
                  <Eye size={17} />
                )}
              </button>

            </div>

          </label>

          <button
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogIn size={17} />

            {loading
              ? 'Signing in...'
              : 'Sign in'}
          </button>

        </form>

        <p className="mt-7 text-center text-sm text-slate-500">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-semibold text-violet-300 hover:text-violet-200"
          >
            Create one
          </Link>
        </p>

      </div>
    </div>
  )
}

export default Login