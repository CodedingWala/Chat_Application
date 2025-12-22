import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App.jsx'
import { BrowserRouter } from 'react-router'

createRoot(document.getElementById('root')).render(
    <GoogleOAuthProvider clientId='569649349932-s4vuj5m03iutap4975v2vidljk5koqk5.apps.googleusercontent.com'>
       <BrowserRouter>
        <App />
       </BrowserRouter>
    </GoogleOAuthProvider>
)
