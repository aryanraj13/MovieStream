import Movie from '../movie/Movie'

const Movies = ({
  movies,
  updateMovieReview,
  message,
  title = 'Movies',
  subtitle,
}) => {
  return (
    <div>

      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">
            Discover
          </p>

          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {title}
          </h2>

          {subtitle && (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              {subtitle}
            </p>
          )}
        </div>

        {movies?.length > 0 && (
          <span className="text-sm text-slate-500">
            {movies.length} titles
          </span>
        )}

      </div>

      {Array.isArray(movies) && movies.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">

          {movies.map((movie) => (
            <Movie
              key={movie._id || movie.imdb_id}
              updateMovieReview={updateMovieReview}
              movie={movie}
            />
          ))}

        </div>
      ) : (
        <div className="glass rounded-3xl px-6 py-20 text-center">

          <h3 className="text-lg font-semibold text-white">
            Nothing here yet
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            {message || 'No movies are available right now.'}
          </p>

        </div>
      )}

    </div>
  )
}

export default Movies