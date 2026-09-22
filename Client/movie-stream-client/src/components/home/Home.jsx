import { useEffect, useState } from 'react'
import {
  ArrowRight,
  Play,
  Sparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import axiosClient from '../../api/axiosConfig'
import Movies from '../movies/Movies'
import Spinner from '../spinner/Spinner'

const Home = ({ updateMovieReview }) => {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true)
      setMessage('')

      try {
        const response = await axiosClient.get('/movies')

        setMovies(
          Array.isArray(response.data)
            ? response.data
            : [],
        )

        if (!response.data?.length) {
          setMessage(
            'There are currently no movies available.',
          )
        }
      } catch (error) {
        console.error(
          'Error fetching movies:',
          error,
        )

        setMessage(
          'Unable to load movies right now.',
        )
      } finally {
        setLoading(false)
      }
    }

    fetchMovies()
  }, [])

  return (
    <div>

      {/* HERO */}

      <section className="relative isolate overflow-hidden border-b border-white/[0.06]">

        <div className="hero-grid absolute inset-0 -z-20 opacity-60" />

        <div className="absolute left-1/2 top-0 -z-10 h-[520px] w-[720px] -translate-x-1/2 rounded-full bg-violet-600/20 blur-[140px]" />

        <div className="absolute -right-32 top-24 -z-10 h-72 w-72 rounded-full bg-blue-500/10 blur-[100px]" />

        <div className="mx-auto grid min-h-[560px] max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[1.15fr_.85fr] lg:py-24">

          {/* Hero copy */}

          <div className="max-w-3xl">

            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-violet-200">
              <Sparkles size={14} />
              Your personal cinema
            </div>

            <h1 className="text-5xl font-semibold leading-[1.02] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
              Find your next

              <span className="block bg-gradient-to-r from-violet-300 via-fuchsia-300 to-indigo-300 bg-clip-text text-transparent">
                favorite movie.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
              Discover hand-picked movies, stream what catches your eye,
              and get recommendations shaped around the genres you love.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">

              <Link
                to="/recommended"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 shadow-xl shadow-black/20 transition hover:-translate-y-0.5 hover:bg-violet-100"
              >
                Explore recommendations
                <ArrowRight size={16} />
              </Link>

              <a
                href="#catalog"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/[0.08]"
              >
                <Play size={16} fill="currentColor" />
                Browse catalog
              </a>

            </div>

            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-2 text-xs text-slate-500">
              <span>Curated collection</span>
              <span>Personal recommendations</span>
              <span>Watch instantly</span>
            </div>

          </div>

          {/* Featured movie */}

          <div className="relative hidden lg:block">

            <div className="absolute inset-8 rounded-[2rem] bg-violet-600/20 blur-3xl" />

            <div className="glass relative mx-auto max-w-md rotate-2 rounded-[2rem] p-4">

              {movies[0]?.poster_path ? (
                <img
                  src={movies[0].poster_path}
                  alt={movies[0].title}
                  className="h-[430px] w-full rounded-[1.5rem] object-cover"
                />
              ) : (
                <div className="h-[430px] rounded-[1.5rem] bg-gradient-to-br from-violet-600 via-indigo-700 to-slate-950" />
              )}

              <div className="absolute bottom-8 left-8 right-8 rounded-2xl border border-white/10 bg-black/55 p-4 backdrop-blur-xl">

                <p className="text-xs font-medium uppercase tracking-widest text-violet-200">
                  Featured
                </p>

                <p className="mt-1 text-xl font-semibold text-white">
                  {movies[0]?.title ||
                    'A better way to discover movies'}
                </p>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* CATALOG */}

      <section
        id="catalog"
        className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-20"
      >
        {loading ? (
          <Spinner />
        ) : (
          <Movies
            movies={movies}
            updateMovieReview={updateMovieReview}
            message={message}
            title="Browse the collection"
            subtitle="Explore movies available in your Magic Stream catalog."
          />
        )}
      </section>

    </div>
  )
}

export default Home