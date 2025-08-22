import React, { useEffect, useState, useRef } from 'react'
import { Calendar, Clock, MapPin, CheckCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BookingConfirmationPopupProps {
  isVisible: boolean
  bookingData: any
  onClose: () => void
}

export const BookingConfirmationPopup: React.FC<BookingConfirmationPopupProps> = ({ 
  isVisible, 
  bookingData, 
  onClose 
}) => {
  // Remove unused countdown state
  const [, setDataSent] = useState(false)
  const confirmationRef = useRef<HTMLDivElement>(null)
  const [bookingReference] = useState(() => Math.random().toString(36).substr(2, 9).toUpperCase())

  useEffect(() => {
    if (!isVisible) return

    const sendWebhookData = async () => {
      console.log('🚀 Starting simple webhook...')
      
      try {
        // Get country code and mobile number
        const countryCode = bookingData?.patient?.selectedCountryCode?.replace('+', '') || '91'
        const mobileNumber = bookingData?.patient?.mobile || ''
        const formattedPhone = `${countryCode}${mobileNumber}`
        
        // Create simple clean payload
        const payload = {
          bookingReference: bookingReference,
          timestamp: new Date().toISOString(),
          department: bookingData?.department?.name || 'Unknown Department',
          hospital: bookingData?.location?.name || 'Unknown Hospital', 
          date: bookingData?.date?.toLocaleDateString('en-US', { 
            weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' 
          }) || 'Unknown Date',
          doctor: bookingData?.doctor?.name || 'Unknown Doctor',
          time: bookingData?.timeSlot || 'Unknown Time',
          patient: {
            name: `${bookingData?.patient?.firstName || ''} ${bookingData?.patient?.lastName || ''}`.trim() || 'Unknown Patient',
            email: bookingData?.patient?.email || 'unknown@email.com',
            mobile: mobileNumber,
            formatted_phone: formattedPhone
          }
        }
        
        console.log('📤 Sending simple webhook data:', payload)
        
        // Simple fetch request
        const response = await fetch('https://webhooks.botpe.in/webhook/68a8bbc881128cc4046e9fb4', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        })
        
        console.log('📥 Response status:', response.status)
        console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()))
        
        if (response.ok) {
          const responseText = await response.text()
          console.log('✅ SUCCESS! Response:', responseText)
          setDataSent(true)
        } else {
          console.error('❌ FAILED! Status:', response.status)
          const errorText = await response.text()
          console.error('❌ Error response:', errorText)
          setDataSent(true)
        }
        
      } catch (error) {
        console.error('💥 FETCH ERROR:', error)
        setDataSent(true)
      }
    }

    sendWebhookData()
  }, [bookingData, isVisible, bookingReference])

  // Remove WhatsApp redirect functionality

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        ref={confirmationRef}
        className={cn(
          "bg-white rounded-t-3xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto transition-transform duration-500 ease-out",
          isVisible ? "translate-y-0" : "translate-y-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Booking Confirmed!</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" strokeWidth={1.25} />
          </button>
        </div>

        <div className="p-6">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" strokeWidth={1.25} />
            </div>
          </div>

          {/* Success Message */}
          <div className="text-center mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Appointment Confirmed!
            </h3>
            <p className="text-gray-600 text-sm">
              Your appointment has been successfully booked
            </p>
          </div>

          {/* Doctor Information */}
          <div className="bg-gray-50 rounded-2xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                <img 
                  src={bookingData.doctor?.image || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTuj2a_Lkjnw0IRzGPJgasIV0HWQjiMGP4M4g&s"}
                  alt={bookingData.doctor?.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 text-sm">
                  {bookingData.doctor?.name}
                </h4>
                <p className="text-xs text-gray-600 mb-1">
                  {bookingData.doctor?.qualification}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <MapPin className="w-3 h-3" strokeWidth={1.25} />
                  <span>{bookingData.location?.name}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="bg-gray-50 rounded-2xl p-4 mb-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-3 h-3 text-primary" strokeWidth={1.25} />
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
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <Clock className="w-3 h-3 text-primary" strokeWidth={1.25} />
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
          <div className="bg-gray-50 rounded-2xl p-4 mb-4">
            <h5 className="font-semibold text-gray-900 mb-3 text-sm">Patient Details</h5>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">Name</span>
                <span className="text-xs font-medium text-gray-900">
                  {bookingData.patient?.firstName} {bookingData.patient?.lastName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">Email</span>
                <span className="text-xs font-medium text-gray-900">
                  {bookingData.patient?.email}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">Phone</span>
                <span className="text-xs font-medium text-gray-900">
                  {bookingData.patient?.selectedCountryCode} {bookingData.patient?.mobile}
                </span>
              </div>
            </div>
          </div>

          {/* Booking Reference */}
          <div className="bg-primary/5 rounded-xl p-4 mb-4">
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-1">Booking Reference</p>
              <p className="text-lg font-bold text-primary">
                #{bookingReference}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-colors duration-200"
            >
              Close
            </button>
            <button
              onClick={() => {
                // Optional: Add contact action here
                window.open('https://wa.me/919422594226', '_blank')
              }}
              className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-200"
            >
              Contact Hospital
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}