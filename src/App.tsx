import { useEffect, useState } from 'react'
import BookingFlow from '@/components/BookingFlow'
import { WhatsAppRequired } from '@/components/WhatsAppRequired'
import { shouldShowBookingApp } from '@/utils/userAgentDetection'
import './App.css'

function App() {
  const [showBookingApp, setShowBookingApp] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user should see the booking app
    const shouldShow = shouldShowBookingApp()
    setShowBookingApp(shouldShow)
    setIsLoading(false)
    
    // Log user agent for debugging
    console.log('User Agent:', navigator.userAgent)
    console.log('Should show booking app:', shouldShow)
  }, [])

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

export default App