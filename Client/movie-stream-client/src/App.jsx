import { useNavigate } from 'react-router-dom'
import { Route, Routes } from 'react-router-dom'

import './App.css'

import Home from './components/home/Home'
import Recommended from './components/recommended/Recommended'
import Review from './components/review/Review'
import Header from './components/header/Header'
import Register from './components/register/Register'
import Login from './components/login/Login'
import RequiredAuth from './components/RequiredAuth'
import StreamMovie from './components/stream/StreamMovie'

import axiosClient from './api/axiosConfig'
import useAuth from './hooks/useAuth'

function App() {
  const navigate = useNavigate()
  const { setAuth } = useAuth()

  const updateMovieReview = (imdbId) => {
    navigate(`/review/${imdbId}`)
  }

  const handleLogout = async () => {
    try {
      await axiosClient.post('/logout')
    } catch (error) {
      console.error('Error logging out:', error)
    } finally {
      setAuth(null)
      navigate('/login', { replace: true })
    }
  }

  return (
    <div className="min-h-screen bg-[#07070b] text-slate-100">
      <Header handleLogout={handleLogout} />

      <main>
        <Routes>
          <Route
            path="/"
            element={
              <Home
                updateMovieReview={updateMovieReview}
              />
            }
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route element={<RequiredAuth />}>
            <Route
              path="/recommended"
              element={<Recommended />}
            />

            <Route
              path="/review/:imdb_id"
              element={<Review />}
            />

            <Route
              path="/stream/:yt_id"
              element={<StreamMovie />}
            />
          </Route>
        </Routes>
      </main>
    </div>
  )
}

export default App