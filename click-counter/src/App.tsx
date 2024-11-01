// src/App.tsx
import { useState, useEffect } from 'react'

function App() {
  const [clicks, setClicks] = useState(0)
  const [message, setMessage] = useState('')
  const [isBlocked, setIsBlocked] = useState(false)
  const [userId, setUserId] = useState('')

  // Add useEffect to get userId on component mount
  useEffect(() => {
    const initializeUser = async () => {
      try {
        // Check localStorage first
        let storedUserId = localStorage.getItem('userId')

        if (!storedUserId) {
          const response = await fetch('http://localhost:3090/register-user')
          const data = await response.json()
          storedUserId = data.userId
          localStorage.setItem('userId', storedUserId!)
        }

        setUserId(storedUserId!)
      } catch (error) {
        console.error('Error initializing user:', error)
        setMessage('Error initializing user')
      }
    }

    initializeUser()
  }, [])

  const handleClick = async () => {
    if (!userId) return // Guard clause if userId isn't set yet

    try {
      const response = await fetch(`http://localhost:3090/click-queue/${userId}`, {
        method: 'POST',
      })

      const data = await response.json()

      if (response.ok) {
        setClicks(data.clicks)
        setMessage(`Click ${data.clicks} counted!`)
      } else {
        setIsBlocked(true)
        setMessage('Too many clicks! Wait a few seconds...')
        setTimeout(() => setIsBlocked(false), 7000)
      }
    } catch (error) {
      setMessage('Error counting click')
      console.error(error)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          <h2 className="card-title mb-4">Click Counter</h2>
          <button
            onClick={handleClick}
            disabled={isBlocked}
            className={`btn btn-primary btn-lg ${isBlocked ? 'btn-disabled' : ''}`}
          >
            Click Me!
          </button>
          <p className="text-xl mt-4">Total Clicks: {clicks}</p>
          {message && <p className="text-sm opacity-75 mt-2">{message}</p>}
        </div>
      </div>
    </div>
  )
}

export default App;