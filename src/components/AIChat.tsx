import React, { useState, useEffect, useRef } from 'react'
import { Bot, User } from 'lucide-react'
import { useBookingStore } from '@/store/bookingStore'
import { BookingConfirmationPopup } from '@/components/booking/BookingConfirmationPopup'
import { DepartmentModal } from '@/components/chat/DepartmentModal'
import { LocationModal } from '@/components/chat/LocationModal'
import { DateTimeModal } from '@/components/chat/DateTimeModal'
import { PatientModal } from '@/components/chat/PatientModal'

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
  const [_chatMode, setChatMode] = useState<'booking' | 'chat'>('booking')
  const [userInput, setUserInput] = useState('')
  const [showDepartmentModal, setShowDepartmentModal] = useState(false)
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [showDateModal, setShowDateModal] = useState(false)
  const [showPatientModal, setShowPatientModal] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isInitialized, setIsInitialized] = useState(false)

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
    let timeoutId1: NodeJS.Timeout
    let timeoutId2: NodeJS.Timeout
    let timeoutId3: NodeJS.Timeout

    if (!isInitialized && messages.length === 0) {
      timeoutId1 = setTimeout(() => {
        addBotMessage("Hello! 👋 Welcome to KIMS Hospital. I'm here to help you book your appointment quickly and easily.", undefined, 1000)
        
        timeoutId2 = setTimeout(() => {
          addBotMessage("How would you like to proceed?", 
            <div className="space-y-3">
              <button
                onClick={handleStartBooking}
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
              >
                📅 Book An Appointment
              </button>
              <button
                onClick={handleChatMode}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
              >
                💬 Chat with Bot
              </button>
            </div>,
            2000
          )
        }, 2000)
      }, 500)
      
      timeoutId3 = setTimeout(() => {
        setIsInitialized(true)
      }, 5000)
    }

    return () => {
      if (timeoutId1) clearTimeout(timeoutId1)
      if (timeoutId2) clearTimeout(timeoutId2)
      if (timeoutId3) clearTimeout(timeoutId3)
    }
  }, [])

  const handleStartBooking = () => {
    setChatMode('booking')
    addBotMessage("Great! First, please select the medical department you need:")
    setShowDepartmentModal(true)
  }

  const handleChatMode = () => {
    setChatMode('chat')
    addBotMessage("I'm here to help! Please tell me what you need assistance with. For example, you can say 'I need to see a dentist at the earliest' or 'I want to book a cardiology appointment'.")
    // Add input field component
    addBotMessage("", 
      <div className="p-4">
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type your message here..."
          className="w-full p-3 border border-gray-300 rounded-lg resize-none"
          rows={3}
        />
        <button
          onClick={handleUserMessage}
          className="w-full mt-3 bg-primary hover:bg-primary/90 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
        >
          Send Message
        </button>
      </div>
    )
  }

  const handleUserMessage = () => {
    if (!userInput.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: userInput,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])

    // Process the message and respond
    processUserMessage(userInput)
    setUserInput('')
  }

  const processUserMessage = (message: string) => {
    const lowerMessage = message.toLowerCase()
    
    // Check for dentist request
    if (lowerMessage.includes('dentist') || lowerMessage.includes('dental')) {
      addBotMessage("I found the earliest available dentist appointment for you!")
      
      // Auto-select dentistry department
      const dentistryDept = { id: 1, name: 'Dentistry', description: 'Dental care and oral health' }
      setDepartment(dentistryDept)
      
      // Show earliest available appointment
      setTimeout(() => {
        addBotMessage(`Great! I've found Dr. Sarah Johnson, our experienced dentist, available tomorrow at 10:00 AM. Would you like to book this appointment?`,
          <div className="p-4 space-y-3">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p><strong>Doctor:</strong> Dr. Sarah Johnson</p>
              <p><strong>Specialty:</strong> Dentistry</p>
              <p><strong>Date:</strong> Tomorrow</p>
              <p><strong>Time:</strong> 10:00 AM</p>
              <p><strong>Location:</strong> KIMS Main Campus</p>
            </div>
            <button
              onClick={() => {
                // Set the appointment details
                setDoctor({ id: 1, name: 'Dr. Sarah Johnson', qualification: 'DDS, Oral Surgery' })
                setTimeSlot('10:00 AM')
                setDate(new Date(Date.now() + 24 * 60 * 60 * 1000)) // Tomorrow
                setLocation({ id: 1, name: 'KIMS Main Campus' })
                
                // Show patient form
                setTimeout(() => {
                  addBotMessage("Perfect! Now I just need your contact information to complete the booking:")
                  setShowPatientModal(true)
                }, 500)
              }}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
            >
              ✅ Book This Appointment
            </button>
            <button
              onClick={() => {
                addBotMessage("No problem! Let me show you all available options:")
                setShowDepartmentModal(true)
              }}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
            >
              🔍 See Other Options
            </button>
          </div>
        )
      }, 1000)
    } else {
      // Generic response for other queries
      addBotMessage("I understand you're looking for medical assistance. Let me help you book an appointment with the right specialist:")
      setTimeout(() => {
        setShowDepartmentModal(true)
      }, 1000)
    }
  }


  const handleDepartmentSelected = (department: any) => {
    setDepartment(department)
    setShowDepartmentModal(false)
    addBotMessage(`Excellent choice! ${department.name} is one of our specialized departments with experienced doctors. Now, let's find the most convenient location for you:`)
    setTimeout(() => {
      setShowLocationModal(true)
    }, 1000)
  }

  const handleLocationSelected = (location: any) => {
    setLocation(location)
    setShowLocationModal(false)
    addBotMessage(`Perfect! ${location.name} is a great choice. Now, please select your preferred date and time for the appointment:`)
    setTimeout(() => {
      setShowDateModal(true)
    }, 1000)
  }

  const handleDateTimeSelected = (doctor: any, timeSlot: string, date: Date | null) => {
    setDoctor(doctor)
    setTimeSlot(timeSlot)
    if (date) setDate(date)
    setShowDateModal(false)
    
    const dateStr = date?.toLocaleDateString('en-US', { 
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' 
    })
    
    addBotMessage(`Wonderful! You've selected an appointment with ${doctor.name} on ${dateStr} at ${timeSlot}. Now I need some basic information to complete your booking:`)
    setTimeout(() => {
      setShowPatientModal(true)
    }, 1000)
  }

  const handlePatientInfoSubmitted = (patientData: any) => {
    setPatient(patientData)
    setShowPatientModal(false)
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
            setIsInitialized(false)
            // Restart the chat flow
            setTimeout(() => {
              addBotMessage("Hello! 👋 Welcome to KIMS Hospital. I'm here to help you book your appointment quickly and easily.")
              setTimeout(() => {
                addBotMessage("How would you like to proceed?", 
                  <div className="space-y-3">
                    <button
                      onClick={handleStartBooking}
                      className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      📅 Book Another Appointment
                    </button>
                    <button
                      onClick={handleChatMode}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      💬 Chat with Bot
                    </button>
                  </div>
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

      {/* Department Selection Modal */}
      <DepartmentModal
        isOpen={showDepartmentModal}
        onSelect={handleDepartmentSelected}
        selected={bookingData.department?.id}
      />

      {/* Location Selection Modal */}
      <LocationModal
        isOpen={showLocationModal}
        onSelect={handleLocationSelected}
        selected={bookingData.location?.id}
      />

      {/* Date & Time Selection Modal */}
      <DateTimeModal
        isOpen={showDateModal}
        onSelect={handleDateTimeSelected}
        selectedDate={bookingData.date}
      />

      {/* Patient Information Modal */}
      <PatientModal
        isOpen={showPatientModal}
        onSubmit={handlePatientInfoSubmitted}
        initialData={bookingData.patient || {}}
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