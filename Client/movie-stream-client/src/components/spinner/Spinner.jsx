const Spinner = () => (
  <div className="grid min-h-[50vh] place-items-center">

    <div className="relative h-12 w-12">

      <div className="absolute inset-0 rounded-full border-2 border-white/10" />

      <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-violet-400" />

    </div>

  </div>
)

export default Spinner