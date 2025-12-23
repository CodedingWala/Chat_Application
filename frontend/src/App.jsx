import React, { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import Chat from './pages/Chat'
import Login from './pages/LoginPage'
import Singup from './pages/SignUpPage'
import { Authzustand } from './Store/useAuthStore'
import PageLoad from './component/PageLoad'
import { Toaster } from "react-hot-toast"

function App() {
  const { authUser, isCheckingAuth, checkAuth, } = Authzustand()
  // useEffect(() => {
  //   checkAuth()
  // }, [checkAuth])
  // if (isCheckingAuth) {
  //   return <PageLoad />
  // }
  return (
    <div className="min-h-screen bg-slate-900 relative flex items-center justify-center p-4 overflow-hidden">
      {/* DECORATORS - GRID BG & GLOW SHAPES */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]" />
      <div className="absolute top-0 -left-4 size-96 bg-pink-500 opacity-20 blur-[100px]" />
      <div className="absolute bottom-0 -right-4 size-96 bg-cyan-500 opacity-20 blur-[100px]" />

      <Routes>
        <Route path="/" element={authUser ? <Chat /> : <Navigate to="/login" />} />
        <Route path="/login" element={!authUser ? <Login /> : <Navigate to="/" />} />
        <Route path="/signup" element={!authUser ? <Singup /> : <Navigate to="/" />} />
      </Routes>

      <Toaster
        position="top-center"
        reverseOrder={false}
      />

    </div>
  )
}

export default App



{/* <GoogleLogin
        onSuccess={async (credentialResponse) => {
          const token = credentialResponse.credential;
          console.log("Google Token:", token);

          try {
            const res = await axios.post(
              "http://localhost:3000/api/auth/google",
              { token }
            );
            console.log("Backend Response:", res.data);
          } catch (error) {
            console.error("Error connecting to backend:", error);
          }
        }}
        onError={() => console.log("Login Failed")}
      /> */}
