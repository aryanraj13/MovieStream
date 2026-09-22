import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'

import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import Movies from '../movies/Movies'
import Spinner from '../spinner/Spinner'

const Recommended = () => {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const axiosPrivate = useAxiosPrivate()

  useEffect(() => {
    const fetchRecommendedMovies = async () => {
      setLoading(true)
      setMessage('')

      try {
        const response =
          await axiosPrivate.get(
            '/recommendedmovies',
          )

        setMovies(
          Array.isArray(response.data)
            ? response.data
            : [],
        )
      } catch (error) {
        console.error(
          'Error fetching recommended movies:',
          error,
        )

        setMessage(
          'We could not load your recommendations right now.',
        )
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendedMovies()
  }, [axiosPrivate])

  if (loading) {
    return <Spinner />
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-20">

      <div className="mb-10 overflow-hidden rounded-3xl border border-violet-400/15 bg-gradient-to-br from-violet-600/15 via-indigo-500/5 to-transparent p-7 sm:p-10">

        <div className="flex items-start gap-4">

          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-violet-500/15 text-violet-200">
            <Sparkles size={22} />
          </div>

          <div>

            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">
              For you
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Your recommendations
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              Movies selected around your favorite genres,
              so you spend less time searching and more time watching.
            </p>

          </div>

        </div>
      </div>

      <Movies
        movies={movies}
        message={message}
        title="Picked for you"
        subtitle="Based on the preferences in your Magic Stream profile."
      />

    </div>
  )
}

export default Recommended