import { useState } from 'react'
import {
  LogIn,
  LogOut,
  Menu,
  UserRound,
  X,
} from 'lucide-react'
import {
  Link,
  NavLink,
  useNavigate,
} from 'react-router-dom'

import useAuth from '../../hooks/useAuth'
import logo from '../../assets/MagicStreamLogo.png'

const Header = ({ handleLogout }) => {
  const navigate = useNavigate()
  const { auth } = useAuth()
  const [open, setOpen] = useState(false)

  const closeMenu = () => {
    setOpen(false)
  }

  const navClass = ({ isActive }) =>
    `rounded-full px-4 py-2 text-sm font-medium transition ${
      isActive
        ? 'bg-white/10 text-white shadow-inner shadow-white/5'
        : 'text-slate-400 hover:bg-white/5 hover:text-white'
    }`

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#08080d]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">

        {/* Logo */}

        <Link
          to="/"
          onClick={closeMenu}
          className="flex items-center gap-3"
        >
          <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-xl border border-violet-400/20 bg-violet-500/10 shadow-lg shadow-violet-900/20">
            <img
              src={logo}
              alt="Magic Stream"
              className="h-8 w-8 object-contain"
            />
          </span>

          <span className="text-lg font-semibold tracking-tight text-white">
            Magic Stream
          </span>
        </Link>

        {/* Desktop navigation */}

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink
            to="/"
            className={navClass}
          >
            Home
          </NavLink>

          <NavLink
            to="/recommended"
            className={navClass}
          >
            Recommended
          </NavLink>
        </nav>

        {/* Desktop account */}

        <div className="hidden items-center gap-3 md:flex">

          {auth ? (
            <>
              <div className="flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.04] px-3 py-2">

                <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-xs font-bold text-white">
                  {auth.first_name?.charAt(0)?.toUpperCase() || (
                    <UserRound size={14} />
                  )}
                </span>

                <span className="max-w-32 truncate text-sm text-slate-300">
                  {auth.first_name}
                </span>

              </div>

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-red-400/30 hover:bg-red-400/10 hover:text-white"
              >
                <LogOut size={15} />
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition hover:text-white"
              >
                <LogIn size={16} />
                Sign in
              </button>

              <button
                onClick={() => navigate('/register')}
                className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-violet-100 hover:shadow-lg hover:shadow-violet-500/20"
              >
                Get started
              </button>
            </>
          )}

        </div>

        {/* Mobile menu */}

        <button
          className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-200 md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle navigation"
        >
          {open ? (
            <X size={20} />
          ) : (
            <Menu size={20} />
          )}
        </button>

      </div>

      {/* Mobile navigation */}

      {open && (
        <div className="border-t border-white/[0.07] bg-[#09090f] px-5 pb-5 pt-3 md:hidden">

          <nav className="flex flex-col gap-1">
            <NavLink
              to="/"
              onClick={closeMenu}
              className={navClass}
            >
              Home
            </NavLink>

            <NavLink
              to="/recommended"
              onClick={closeMenu}
              className={navClass}
            >
              Recommended
            </NavLink>
          </nav>

          <div className="mt-4 border-t border-white/8 pt-4">

            {auth ? (
              <button
                onClick={() => {
                  closeMenu()
                  handleLogout()
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm text-slate-200"
              >
                <LogOut size={16} />
                Logout
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">

                <button
                  onClick={() => {
                    closeMenu()
                    navigate('/login')
                  }}
                  className="rounded-xl border border-white/10 py-3 text-sm font-medium"
                >
                  Sign in
                </button>

                <button
                  onClick={() => {
                    closeMenu()
                    navigate('/register')
                  }}
                  className="rounded-xl bg-white py-3 text-sm font-semibold text-slate-950"
                >
                  Get started
                </button>

              </div>
            )}

          </div>
        </div>
      )}
    </header>
  )
}

export default Header