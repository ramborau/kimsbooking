import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import BookingFlow from '@/components/BookingFlow'
import { WhatsAppRequired } from '@/components/WhatsAppRequired'
import { AIChat } from '@/components/AIChat'
import { shouldShowBookingApp } from '@/utils/userAgentDetection'
import './App.css'

function MainApp() {
  const [showBookingApp, setShowBookingApp] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    // Check if user should see the booking app
    const shouldShow = shouldShowBookingApp()
    setShowBookingApp(shouldShow)
    setIsLoading(false)
    
    // Log user agent for debugging
    console.log('User Agent:', navigator.userAgent)
    console.log('Should show booking app:', shouldShow)
  }, [])

  // AI Chat route bypasses WhatsApp check
  if (location.pathname === '/aichat') {
    return <AIChat />
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="App">
      {showBookingApp ? <BookingFlow /> : <WhatsAppRequired />}
    </div>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/aichat" element={<AIChat />} />
        <Route path="/*" element={<MainApp />} />
      </Routes>
    </Router>
  )
}

export default App