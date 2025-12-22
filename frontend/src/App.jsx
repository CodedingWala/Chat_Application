import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { GoogleLogin } from '@react-oauth/google'
import axios  from "axios"


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>

      {/* yeha google cloud console per localhost domain the link change kerna hai tabi button dikhe ga */}
              <GoogleLogin
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
              />
    </>
  )
}

export default App
