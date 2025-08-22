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
  const [showChatInput, setShowChatInput] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatInputRef = useRef<HTMLTextAreaElement>(null)
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

  // Add a user message immediately (no typing animation)
  const addUserMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, newMessage])
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
    setShowChatInput(false) // Hide chat input when switching to booking mode
    
    // Add user message for button selection
    addUserMessage("📅 Book An Appointment")
    
    addBotMessage("Great! First, please select the medical department you need:", undefined, 1200)
    setTimeout(() => {
      setShowDepartmentModal(true)
    }, 2500)
  }

  const handleChatMode = () => {
    setChatMode('chat')
    
    // Add user message for button selection
    addUserMessage("💬 Chat with Bot")
    
    addBotMessage("I'm here to help! Please tell me what you need assistance with. For example, you can say 'I need to see a dentist at the earliest' or 'I want to book a cardiology appointment'.", undefined, 1800)
    
    // Show chat input at bottom after delay
    setTimeout(() => {
      setShowChatInput(true)
      // Auto-focus the input
      setTimeout(() => {
        chatInputRef.current?.focus()
      }, 100)
    }, 2800)
  }

  const handleUserMessage = () => {
    if (!userInput.trim()) return

    const messageText = userInput.trim()
    
    // Add user message
    addUserMessage(messageText)

    // Process the message and respond
    processUserMessage(messageText)
    setUserInput('')
    
    // Keep focus on input
    setTimeout(() => {
      chatInputRef.current?.focus()
    }, 100)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleUserMessage()
    }
  }

  const processUserMessage = (message: string) => {
    const lowerMessage = message.toLowerCase()
    
    // Check for dentist request
    if (lowerMessage.includes('dentist') || lowerMessage.includes('dental')) {
      addBotMessage("Let me check our dentist availability for you...", undefined, 1000)
      
      // Auto-select dentistry department
      const dentistryDept = { id: 1, name: 'Dentistry', description: 'Dental care and oral health' }
      setDepartment(dentistryDept)
      
      // Show earliest available appointment with natural delay
      setTimeout(() => {
        addBotMessage("Perfect! I found Dr. Sarah Johnson, our experienced dentist, available tomorrow at 10:00 AM. Would you like to book this appointment?",
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
                // Add user message for button selection
                addUserMessage("✅ Yes, book this appointment with Dr. Sarah Johnson")
                
                // Set the appointment details
                setDoctor({ id: 1, name: 'Dr. Sarah Johnson', qualification: 'DDS, Oral Surgery' })
                setTimeSlot('10:00 AM')
                setDate(new Date(Date.now() + 24 * 60 * 60 * 1000)) // Tomorrow
                setLocation({ id: 1, name: 'KIMS Main Campus' })
                
                // Show patient form with natural delay
                setTimeout(() => {
                  addBotMessage("Perfect! Now I just need your contact information to complete the booking:", undefined, 1000)
                  setTimeout(() => {
                    setShowPatientModal(true)
                  }, 1800)
                }, 800)
              }}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
            >
              ✅ Book This Appointment
            </button>
            <button
              onClick={() => {
                // Add user message for button selection
                addUserMessage("🔍 Let me see other options")
                
                addBotMessage("No problem! Let me show you all available options:", undefined, 800)
                setTimeout(() => {
                  setShowDepartmentModal(true)
                }, 1500)
              }}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
            >
              🔍 See Other Options
            </button>
          </div>, 1400
        )
      }, 2400)
    } else {
      // Generic response for other queries
      addBotMessage("I understand you're looking for medical assistance.", undefined, 1100)
      setTimeout(() => {
        addBotMessage("Let me help you book an appointment with the right specialist:", undefined, 1000)
        setTimeout(() => {
          setShowDepartmentModal(true)
        }, 1800)
      }, 2200)
    }
  }


  const handleDepartmentSelected = (department: any) => {
    setDepartment(department)
    setShowDepartmentModal(false)
    
    // Add user message showing their selection
    addUserMessage(`I selected ${department.name}`)
    
    addBotMessage(`Excellent choice! ${department.name} is one of our specialized departments with experienced doctors.`, undefined, 1400)
    setTimeout(() => {
      addBotMessage("Now, let's find the most convenient location for you:", undefined, 1000)
      setTimeout(() => {
        setShowLocationModal(true)
      }, 1800)
    }, 2600)
  }

  const handleLocationSelected = (location: any) => {
    setLocation(location)
    setShowLocationModal(false)
    
    // Add user message showing their selection
    addUserMessage(`I chose ${location.name}`)
    
    addBotMessage(`Perfect! ${location.name} is a great choice.`, undefined, 1100)
    setTimeout(() => {
      addBotMessage("Now, please select your preferred date and time for the appointment:", undefined, 1200)
      setTimeout(() => {
        setShowDateModal(true)
      }, 2000)
    }, 2400)
  }

  const handleDateTimeSelected = (doctor: any, timeSlot: string, date: Date | null) => {
    setDoctor(doctor)
    setTimeSlot(timeSlot)
    if (date) setDate(date)
    setShowDateModal(false)
    
    const dateStr = date?.toLocaleDateString('en-US', { 
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' 
    })
    
    // Add user message showing their selection
    addUserMessage(`I booked with ${doctor.name} on ${dateStr} at ${timeSlot}`)
    
    addBotMessage(`Wonderful! You've selected an appointment with ${doctor.name} on ${dateStr} at ${timeSlot}.`, undefined, 1500)
    setTimeout(() => {
      addBotMessage("Now I need some basic information to complete your booking:", undefined, 1100)
      setTimeout(() => {
        setShowPatientModal(true)
      }, 2000)
    }, 2800)
  }

  const handlePatientInfoSubmitted = (patientData: any) => {
    setPatient(patientData)
    setShowPatientModal(false)
    
    // Add user message showing their information submission
    addUserMessage(`My details: ${patientData.firstName} ${patientData.lastName}, ${patientData.email}, ${patientData.mobile}`)
    
    addBotMessage(`Thank you, ${patientData.firstName}! I have all the information needed.`, undefined, 1200)
    setTimeout(() => {
      addBotMessage("Let me confirm your appointment details and process your booking...", undefined, 1400)
      setTimeout(() => {
        setShowConfirmation(true)
      }, 2200)
    }, 2500)
  }

  const handleConfirmationClose = () => {
    setShowConfirmation(false)
    addBotMessage("🎉 Your appointment has been successfully booked!", undefined, 1300)
    setTimeout(() => {
      addBotMessage("You'll be redirected to WhatsApp for any further assistance. Thank you for choosing KIMS Hospital!", undefined, 1600)
        setTimeout(() => {
          addBotMessage("Is there anything else I can help you with today?", 
          <button
            onClick={() => {
              // Add user message for restart button
              addUserMessage("🔄 Book Another Appointment")
              
              // Clear only booking data, keep messages with user selection
              resetBooking()
              setIsInitialized(false)
              // Restart the chat flow
              setTimeout(() => {
                addBotMessage("Hello! 👋 Welcome to KIMS Hospital. I'm here to help you book your appointment quickly and easily.", undefined, 1000)
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
                    </div>, 1800
                  )
                }, 2200)
              }, 1000)
            }}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
          >
            🔄 Book Another Appointment
          </button>, 1200
          )
        }, 3200)
      }, 2800)
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

      {/* Chat Input or Footer */}
      {showChatInput ? (
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <textarea
                ref={chatInputRef}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here..."
                className="w-full p-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                rows={1}
                style={{ 
                  minHeight: '44px',
                  maxHeight: '120px',
                  scrollbarWidth: 'thin'
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement
                  target.style.height = 'auto'
                  target.style.height = Math.min(target.scrollHeight, 120) + 'px'
                }}
              />
            </div>
            <button
              onClick={handleUserMessage}
              disabled={!userInput.trim()}
              className={`px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center min-w-[60px] ${
                userInput.trim()
                  ? 'bg-primary hover:bg-primary/90 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
          <div className="text-center mt-2">
            <p className="text-xs text-gray-400">
              Press Enter to send • Shift+Enter for new line
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white border-t px-4 py-3">
          <div className="text-center">
            <p className="text-xs text-gray-500">
              KIMS Hospital AI Assistant - Book your appointments with ease
            </p>
          </div>
        </div>
      )}
    </div>
  )
}