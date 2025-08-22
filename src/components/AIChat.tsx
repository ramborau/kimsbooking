import React, { useState, useEffect, useRef } from 'react'
import { Bot, User } from 'lucide-react'
import { useBookingStore } from '@/store/bookingStore'
import { DepartmentSelect } from '@/components/booking/DepartmentSelect'
import { LocationSelect } from '@/components/booking/LocationSelect'
import { DatePicker } from '@/components/booking/DatePicker'
import { PatientForm } from '@/components/booking/PatientForm'
import { BookingConfirmationPopup } from '@/components/booking/BookingConfirmationPopup'

interface Message {
  id: string
  type: 'bot' | 'user' | 'screen'
  content: string
  timestamp: Date
  component?: React.ReactNode
}

interface TypingBubbleProps {
  isVisible: boolean
}

const TypingBubble: React.FC<TypingBubbleProps> = ({ isVisible }) => {
  if (!isVisible) return null

  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
        <Bot className="w-5 h-5 text-white" strokeWidth={1.25} />
      </div>
      <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border animate-pulse">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  )
}

export const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const {
    bookingData,
    setDepartment,
    setLocation, 
    setDate,
    setDoctor,
    setTimeSlot,
    setPatient,
    resetBooking
  } = useBookingStore()

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Play notification sound
  const playNotificationSound = () => {
    // Create a simple notification sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.2)
  }

  // Add a bot message with typing animation
  const addBotMessage = (content: string, component?: React.ReactNode, delay: number = 1500) => {
    setIsTyping(true)
    
    setTimeout(() => {
      const newMessage: Message = {
        id: Date.now().toString(),
        type: component ? 'screen' : 'bot',
        content,
        timestamp: new Date(),
        component
      }
      
      setMessages(prev => [...prev, newMessage])
      setIsTyping(false)
      playNotificationSound()
    }, delay)
  }

  // Initialize chat with welcome message
  useEffect(() => {
    setTimeout(() => {
      addBotMessage("Hello! 👋 Welcome to KIMS Hospital. I'm here to help you book your appointment quickly and easily.", undefined, 1000)
      
      setTimeout(() => {
        addBotMessage("Let's get started with your appointment booking!", 
          <button
            onClick={handleStartBooking}
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
          >
            📅 Book An Appointment
          </button>,
          2000
        )
      }, 2000)
    }, 500)
  }, [])

  const handleStartBooking = () => {
    addBotMessage("Great! First, please select the medical department you need:", 
      <DepartmentSelect 
        onSelect={(dept) => {
          setDepartment(dept)
          setTimeout(() => handleDepartmentSelected(dept), 500)
        }}
        selected={bookingData.department?.id}
        searchQuery=""
        onSearchChange={() => {}}
      />
    )
  }

  const handleDepartmentSelected = (department: any) => {
    addBotMessage(`Excellent choice! ${department.name} is one of our specialized departments with experienced doctors. Now, let's find the most convenient location for you:`,
      <LocationSelect
        onSelect={(location) => {
          setLocation(location)
          setTimeout(() => handleLocationSelected(location), 500)
        }}
        selected={bookingData.location?.id}
        userLocation={null}
      />
    )
  }

  const handleLocationSelected = (location: any) => {
    addBotMessage(`Perfect! ${location.name} is a great choice. Now, please select your preferred date and time for the appointment:`,
      <DatePicker
        onSelect={(date) => {
          setDate(date)
        }}
        selected={bookingData.date}
        popupSelectedDate={null}
        onDoctorSlotSelect={(doctor, slot, _period) => {
          setDoctor(doctor)
          setTimeSlot(slot)
          setTimeout(() => handleDateTimeSelected(doctor, slot, bookingData.date), 500)
        }}
      />
    )
  }

  const handleDateTimeSelected = (doctor: any, timeSlot: string, date: Date | null) => {
    const dateStr = date?.toLocaleDateString('en-US', { 
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' 
    })
    
    addBotMessage(`Wonderful! You've selected an appointment with ${doctor.name} on ${dateStr} at ${timeSlot}. Now I need some basic information to complete your booking:`,
      <PatientForm
        onSubmit={(patientData) => {
          setPatient(patientData)
          setTimeout(() => handlePatientInfoSubmitted(patientData), 500)
        }}
        initialData={bookingData.patient || {}}
      />
    )
  }

  const handlePatientInfoSubmitted = (patientData: any) => {
    addBotMessage(`Thank you, ${patientData.firstName}! I have all the information needed. Let me confirm your appointment details and process your booking...`)
    
    setTimeout(() => {
      setShowConfirmation(true)
    }, 2000)
  }

  const handleConfirmationClose = () => {
    setShowConfirmation(false)
    addBotMessage("🎉 Your appointment has been successfully booked! You'll be redirected to WhatsApp for any further assistance. Thank you for choosing KIMS Hospital!")
    
    setTimeout(() => {
      addBotMessage("Is there anything else I can help you with today?", 
        <button
          onClick={() => {
            resetBooking()
            setMessages([])
            // Restart the chat flow
            setTimeout(() => {
              addBotMessage("Hello! 👋 Welcome to KIMS Hospital. I'm here to help you book your appointment quickly and easily.")
              setTimeout(() => {
                addBotMessage("Let's get started with your appointment booking!", 
                  <button
                    onClick={handleStartBooking}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    📅 Book Another Appointment
                  </button>
                )
              }, 1500)
            }, 1000)
          }}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
        >
          🔄 Book Another Appointment
        </button>
      )
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" strokeWidth={1.25} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">KIMS Assistant</h1>
            <p className="text-sm text-gray-500">AI-Powered Appointment Booking</p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="animate-in slide-in-from-bottom-2 duration-300">
            {message.type === 'bot' || message.type === 'screen' ? (
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" strokeWidth={1.25} />
                </div>
                <div className="max-w-[80%] min-w-0">
                  <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border">
                    <p className="text-gray-800 leading-relaxed">{message.content}</p>
                  </div>
                  {message.component && (
                    <div className="mt-3 bg-white rounded-2xl shadow-sm border overflow-hidden">
                      {message.component}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 mb-4 flex-row-reverse">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-gray-600" strokeWidth={1.25} />
                </div>
                <div className="max-w-[80%]">
                  <div className="bg-primary text-white rounded-2xl rounded-br-md px-4 py-3 shadow-sm">
                    <p className="leading-relaxed">{message.content}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        
        <TypingBubble isVisible={isTyping} />
        <div ref={messagesEndRef} />
      </div>

      {/* Booking Confirmation Popup */}
      <BookingConfirmationPopup
        isVisible={showConfirmation}
        bookingData={bookingData}
        onClose={handleConfirmationClose}
      />

      {/* Footer */}
      <div className="bg-white border-t px-4 py-3">
        <div className="text-center">
          <p className="text-xs text-gray-500">
            KIMS Hospital AI Assistant - Book your appointments with ease
          </p>
        </div>
      </div>
    </div>
  )
}