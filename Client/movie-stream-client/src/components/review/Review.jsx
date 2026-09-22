import {
  useEffect,
  useRef,
  useState,
} from 'react'

import {
  ArrowLeft,
  MessageSquareText,
  Save,
  ShieldCheck,
} from 'lucide-react'

import {
  useNavigate,
  useParams,
} from 'react-router-dom'

import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import useAuth from '../../hooks/useAuth'

import Movie from '../movie/Movie'
import Spinner from '../spinner/Spinner'

const Review = () => {
  const [movie, setMovie] = useState({})
  const [loading, setLoading] =
    useState(false)

  const revText = useRef()

  const { imdb_id } = useParams()

  const { auth } = useAuth()

  const axiosPrivate =
    useAxiosPrivate()

  const navigate = useNavigate()

  useEffect(() => {
    const fetchMovie = async () => {
      setLoading(true)

      try {
        const response =
          await axiosPrivate.get(
            `/movie/${imdb_id}`,
          )

        setMovie(response.data)
      } catch (error) {
        console.error(
          'Error fetching movie:',
          error,
        )
      } finally {
        setLoading(false)
      }
    }

    fetchMovie()
  }, [imdb_id, axiosPrivate])

  const handleSubmit = async (e) => {
    e.preventDefault()

    setLoading(true)

    try {
      const response =
        await axiosPrivate.patch(
          `/updatereview/${imdb_id}`,
          {
            admin_review:
              revText.current.value,
          },
        )

      setMovie((current) => ({
        ...current,
        admin_review:
          response.data?.admin_review ??
          current.admin_review,
        ranking: {
          ranking_name:
            response.data?.ranking_name ??
            current.ranking?.ranking_name,
        },
      }))
    } catch (error) {
      console.error(
        'Error updating review:',
        error,
      )
    } finally {
      setLoading(false)
    }
  }

  if (loading && !movie?.title) {
    return <Spinner />
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:py-16">

      <button
        onClick={() => navigate(-1)}
        className="mb-8 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-white"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="mb-9 flex items-center gap-4">

        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-violet-500/10 text-violet-300">
          <MessageSquareText size={21} />
        </div>

        <div>

          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">
            Movie details
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white">
            Review & rating
          </h1>

        </div>

      </div>

      <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">

        <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-4">
          <Movie movie={movie} />
        </div>

        <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-6 sm:p-8">

          <div className="mb-7 flex items-center gap-3">

            <ShieldCheck
              size={19}
              className="text-violet-300"
            />

            <span className="text-sm font-medium text-slate-300">
              {auth?.role === 'ADMIN'
                ? 'Admin review workspace'
                : 'Editorial review'}
            </span>

          </div>

          {auth?.role === 'ADMIN' ? (

            <form onSubmit={handleSubmit}>

              <label className="mb-2 block text-sm font-medium text-slate-300">
                Admin review
              </label>

              <textarea
                ref={revText}
                required
                rows={10}
                defaultValue={
                  movie?.admin_review
                }
                placeholder="Write a thoughtful review..."
                className="w-full resize-y rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm leading-6 text-white outline-none placeholder:text-slate-600 transition focus:border-violet-400/50 focus:ring-4 focus:ring-violet-500/10"
              />

              <button
                disabled={loading}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-violet-100 disabled:opacity-60"
              >
                <Save size={16} />

                {loading
                  ? 'Saving...'
                  : 'Save review'}
              </button>

            </form>

          ) : (

            <div>

              <p className="mb-2 text-sm font-medium text-slate-400">
                Editorial review
              </p>

              <div className="rounded-2xl border border-white/8 bg-black/20 p-5 text-sm leading-7 text-slate-300">
                {movie.admin_review ||
                  'No editorial review has been published for this movie yet.'}
              </div>

            </div>

          )}

        </div>
      </div>
    </div>
  )
}

export default Review