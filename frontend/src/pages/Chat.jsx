import React from 'react'
import { Authzustand } from '../Store/useAuthStore'

function Chat() {
  const {logout} =Authzustand()
  return (
    <button onClick={logout} className='z-10 text-blue-400 bg-red-300 rounded-lg border-none text-2xl  '>
      Logout
    </button>
  )
}

export default Chat
