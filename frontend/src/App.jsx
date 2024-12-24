import Navbar from './Components/Navbar'
import { Routes, Route } from 'react-router-dom'
import HomePage from './Pages/HomePage'
import SignupPage from './Pages/SignupPage'
import LoginPage from './Pages/LoginPage'
import SettingsPage from './Pages/SettingsPage'
import ProfilePage from './Pages/ProfilePage'
import { useEffect } from 'react'
import { useAuthStore } from './Store/useAuthStore'
import { Loader } from "lucide-react"
import { Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
export default function App() {
  const {authUser, checkAuth, isCheckingAuth, onlineUsers} = useAuthStore()

  console.log({onlineUsers});

  useEffect(() => {
    checkAuth()

  }, [checkAuth]);



  if(isCheckingAuth && !authUser) return (
    <div className='flex items-center justify-center h-screen'>
      <Loader className = "size-10 animate-spin"/>
    </div>
  )
  return (
    <div data-theme="retro">

      <Navbar/>


      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login"/>} />
        <Route path="/signup" element={!authUser ? <SignupPage /> : <Navigate to="/"/>} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/"/>}/>
        <Route path="/settings" element={<SettingsPage/>}/>
        <Route path="/profile" element={authUser ? <ProfilePage/> : <Navigate to="/login"/>}/>
      </Routes>
      <Toaster/>
    </div>
  )
}