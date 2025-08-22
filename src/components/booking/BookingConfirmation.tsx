import React, { useEffect, useState } from 'react'
import { Calendar, Clock, MapPin, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BookingConfirmationProps {
  bookingData: any
  onDone: () => void
}

export const BookingConfirmation: React.FC<BookingConfirmationProps> = ({ bookingData, onDone }) => {
  const [countdown, setCountdown] = useState(10)
  const [dataSent, setDataSent] = useState(false)

  useEffect(() => {
    // Send data to webhook
    const sendToWebhook = async () => {
      try {
        const response = await fetch('https://webhook.site/26326710-fa8d-42fc-962d-6eb5774ba56a', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...bookingData,
            timestamp: new Date().toISOString(),
          }),
        })
        
        if (response.ok) {
          setDataSent(true)
        }
      } catch (error) {
        console.error('Failed to send webhook:', error)
        setDataSent(true) // Continue anyway
      }
    }

    sendToWebhook()
  }, [bookingData])

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          // Close the entire page
          window.close()
          // Fallback if window.close() doesn't work
          window.location.href = 'about:blank'
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="px-4 py-6">
      {/* Success Icon */}
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-600" strokeWidth={1.25} />
        </div>
      </div>

      {/* Success Message */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Appointment Confirmed!
        </h2>
        <p className="text-gray-600">
          Your appointment has been successfully booked
        </p>
      </div>

      {/* Doctor Information */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-5 mb-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
            <img 
              src={bookingData.doctor?.image || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTuj2a_Lkjnw0IRzGPJgasIV0HWQjiMGP4M4g&s"}
              alt={bookingData.doctor?.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 text-lg">
              {bookingData.doctor?.name}
            </h3>
            <p className="text-sm text-gray-600 mb-1">
              {bookingData.doctor?.qualification}
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-3 h-3" strokeWidth={1.25} />
              <span>{bookingData.location?.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Details */}
      <div className="bg-gray-50 rounded-2xl p-5 mb-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-primary" strokeWidth={1.25} />
              </div>
              <div>
                <p className="text-xs text-gray-600">Date</p>
                <p className="text-sm font-semibold text-gray-900">
                  {bookingData.date?.toLocaleDateString('en-US', { 
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-primary" strokeWidth={1.25} />
              </div>
              <div>
                <p className="text-xs text-gray-600">Time</p>
                <p className="text-sm font-semibold text-gray-900">
                  {bookingData.timeSlot}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Information */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-5 mb-4">
        <h4 className="font-semibold text-gray-900 mb-3">Patient Details</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Name</span>
            <span className="text-sm font-medium text-gray-900">
              {bookingData.patient?.firstName} {bookingData.patient?.lastName}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Email</span>
            <span className="text-sm font-medium text-gray-900">
              {bookingData.patient?.email}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Phone</span>
            <span className="text-sm font-medium text-gray-900">
              {bookingData.patient?.phone}
            </span>
          </div>
        </div>
      </div>

      {/* Booking Reference */}
      <div className="bg-primary/5 rounded-xl p-4 mb-6">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Booking Reference</p>
          <p className="text-lg font-bold text-primary">
            #{Math.random().toString(36).substr(2, 9).toUpperCase()}
          </p>
        </div>
      </div>

      {/* Auto-close countdown */}
      <div className="text-center text-sm text-gray-500">
        This page will close automatically in {countdown} seconds
      </div>
    </div>
  )
}