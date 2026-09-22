import {
  CirclePlay,
  MessageSquareText,
  Star,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const Movie = ({
  movie,
  updateMovieReview,
}) => {
  const ranking =
    movie?.ranking?.ranking_name

  const genres = Array.isArray(movie?.genre)
    ? movie.genre.slice(0, 2)
    : []

  return (
    <article className="group overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.035] shadow-[0_20px_70px_rgba(0,0,0,0.18)] transition duration-300 hover:-translate-y-1 hover:border-violet-400/20 hover:bg-white/[0.055]">

      <Link
        to={`/stream/${movie.youtube_id}`}
        className="block"
      >

        <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">

          <img
            src={movie.poster_path}
            alt={movie.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.045]"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/20" />

          <div className="absolute inset-0 grid place-items-center opacity-0 transition duration-300 group-hover:opacity-100">

            <span className="grid h-14 w-14 place-items-center rounded-full border border-white/20 bg-white/90 text-slate-950 shadow-2xl shadow-black/40 backdrop-blur">

              <CirclePlay
                size={25}
                fill="currentColor"
              />

            </span>

          </div>

          {ranking && (
            <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-amber-300/20 bg-black/50 px-3 py-1.5 text-xs font-semibold text-amber-200 backdrop-blur-md">

              <Star
                size={12}
                fill="currentColor"
              />

              {ranking}

            </span>
          )}

          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">

            <div>

              <p className="text-xs font-medium uppercase tracking-widest text-white/60">
                {movie.imdb_id}
              </p>

              <h3 className="mt-1 line-clamp-1 text-xl font-semibold text-white">
                {movie.title}
              </h3>

            </div>

          </div>

        </div>

      </Link>

      <div className="flex items-center justify-between gap-3 px-4 py-4">

        <div className="flex min-w-0 flex-wrap gap-1.5">

          {genres.length > 0 ? (
            genres.map((genre) => (
              <span
                key={
                  genre.genre_id ||
                  genre.genre_name
                }
                className="rounded-full border border-white/8 bg-white/[0.04] px-2.5 py-1 text-[11px] text-slate-400"
              >
                {genre.genre_name}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-600">
              Movie
            </span>
          )}

        </div>

        {updateMovieReview && (
          <button
            onClick={() =>
              updateMovieReview(movie.imdb_id)
            }
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-violet-400/30 hover:bg-violet-400/10 hover:text-white"
          >
            <MessageSquareText size={14} />
            Review
          </button>
        )}

      </div>

    </article>
  )
}

export default Movie