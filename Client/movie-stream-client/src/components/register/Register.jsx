import { useEffect, useState } from 'react'
import {
  Check,
  ChevronDown,
  Sparkles,
} from 'lucide-react'
import {
  Link,
  useNavigate,
} from 'react-router-dom'

import axiosClient from '../../api/axiosConfig'
import logo from '../../assets/MagicStreamLogo.png'

const Register = () => {
  const [firstName, setFirstName] =
    useState('')

  const [lastName, setLastName] =
    useState('')

  const [email, setEmail] =
    useState('')

  const [password, setPassword] =
    useState('')

  const [confirmPassword, setConfirmPassword] =
    useState('')

  const [favouriteGenres, setFavouriteGenres] =
    useState([])

  const [genres, setGenres] =
    useState([])

  const [error, setError] =
    useState(null)

  const [loading, setLoading] =
    useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response =
          await axiosClient.get('/genres')

        setGenres(
          Array.isArray(response.data)
            ? response.data
            : [],
        )
      } catch (err) {
        console.error(
          'Error fetching movie genres:',
          err,
        )

        setGenres([])
      }
    }

    fetchGenres()
  }, [])

  const toggleGenre = (genre) => {
    setFavouriteGenres((current) =>
      current.some(
        (item) =>
          item.genre_id ===
          genre.genre_id,
      )
        ? current.filter(
            (item) =>
              item.genre_id !==
              genre.genre_id,
          )
        : [
            ...current,
            {
              genre_id: genre.genre_id,
              genre_name:
                genre.genre_name,
            },
          ],
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      await axiosClient.post('/register', {
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        role: 'USER',
        favourite_genres:
          favouriteGenres,
      })

      navigate('/login', {
        replace: true,
      })
    } catch (err) {
      setError(
        err.response?.data?.error ||
          'Registration failed. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-[calc(100vh-72px)] items-center justify-center overflow-hidden px-5 py-10 sm:px-8">

      <div className="absolute right-1/4 top-1/4 h-72 w-72 rounded-full bg-violet-600/10 blur-[120px]" />

      <div className="glass relative w-full max-w-2xl rounded-[2rem] p-7 sm:p-9">

        <div className="mb-8 flex items-start gap-4">

          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-violet-500/10 ring-1 ring-violet-400/20">

            <img
              src={logo}
              alt="Magic Stream"
              className="h-8 w-8 object-contain"
            />

          </div>

          <div>

            <div className="mb-1 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-violet-300">
              <Sparkles size={13} />
              Get started
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-white">
              Create your account
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Tell us what you enjoy and we'll use it to personalize recommendations.
            </p>

          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          <div className="grid gap-5 sm:grid-cols-2">

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-300">
                First name
              </span>

              <input
                value={firstName}
                onChange={(e) =>
                  setFirstName(e.target.value)
                }
                placeholder="Aryan"
                required
                className="auth-input"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-300">
                Last name
              </span>

              <input
                value={lastName}
                onChange={(e) =>
                  setLastName(e.target.value)
                }
                placeholder="Rajput"
                required
                className="auth-input"
              />
            </label>

          </div>

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
              className="auth-input"
            />

          </label>

          <div className="grid gap-5 sm:grid-cols-2">

            <label className="block">

              <span className="mb-2 block text-sm font-medium text-slate-300">
                Password
              </span>

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Create a password"
                required
                className="auth-input"
              />

            </label>

            <label className="block">

              <span className="mb-2 block text-sm font-medium text-slate-300">
                Confirm password
              </span>

              <input
                type="password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value,
                  )
                }
                placeholder="Repeat password"
                required
                className="auth-input"
              />

            </label>

          </div>

          <div>

            <div className="mb-3 flex items-end justify-between gap-3">

              <div>

                <span className="block text-sm font-medium text-slate-300">
                  Favorite genres
                </span>

                <span className="mt-1 block text-xs text-slate-600">
                  Select as many as you like.
                </span>

              </div>

              <span className="text-xs text-violet-300">
                {favouriteGenres.length}{' '}
                selected
              </span>

            </div>

            <div className="grid max-h-48 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3 movie-scrollbar">

              {genres.map((genre) => {

                const selected =
                  favouriteGenres.some(
                    (item) =>
                      item.genre_id ===
                      genre.genre_id,
                  )

                return (
                  <button
                    type="button"
                    key={genre.genre_id}
                    onClick={() =>
                      toggleGenre(genre)
                    }
                    className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                      selected
                        ? 'border-violet-400/40 bg-violet-500/15 text-white'
                        : 'border-white/8 bg-white/[0.025] text-slate-400 hover:bg-white/[0.06] hover:text-slate-200'
                    }`}
                  >

                    <span className="truncate">
                      {genre.genre_name}
                    </span>

                    {selected ? (
                      <Check
                        size={15}
                        className="text-violet-300"
                      />
                    ) : (
                      <ChevronDown
                        size={14}
                        className="text-slate-600"
                      />
                    )}

                  </button>
                )
              })}

            </div>
          </div>

          <button
            disabled={loading}
            className="w-full rounded-xl bg-white py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-violet-100 disabled:opacity-60"
          >
            {loading
              ? 'Creating account...'
              : 'Create account'}
          </button>

        </form>

        <p className="mt-7 text-center text-sm text-slate-500">
          Already have an account?{' '}

          <Link
            to="/login"
            className="font-semibold text-violet-300 hover:text-violet-200"
          >
            Sign in
          </Link>
        </p>

      </div>
    </div>
  )
}

export default Register