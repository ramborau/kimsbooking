import React, { useState, useEffect, useRef } from 'react'
import { User, Mail, Check, ChevronDown, Calendar, MessageCircle, CheckCircle, MapPin, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useBookingStore } from '@/store/bookingStore'
import { DepartmentModal } from '@/components/chat/DepartmentModal'
import { LocationModal } from '@/components/chat/LocationModal'
import { DateTimeModal } from '@/components/chat/DateTimeModal'
import { PatientModal } from '@/components/chat/PatientModal'
import countryData from '../../countrycode.json'

interface Message {
  id: string
  type: 'bot' | 'user' | 'screen'
  content: string
  timestamp: Date
  component?: React.ReactNode
}

const emailDomains = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'icloud.com',
  'protonmail.com',
  'aol.com',
  'mail.com'
]

interface Country {
  name: string
  phone: string[]
  image: string
  emoji: string
}

type CountryData = Record<string, Country>

interface TypingBubbleProps {
  isVisible: boolean
}

const TypingBubble: React.FC<TypingBubbleProps> = ({ isVisible }) => {
  if (!isVisible) return null

  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-full bg-white border border-primary flex items-center justify-center flex-shrink-0">
        <img src="/kimsbot.png" alt="KIMS Bot" className="w-8 h-8 rounded-full object-cover" />
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
  const [, setChatMode] = useState<'booking' | 'chat'>('booking')
  const [userInput, setUserInput] = useState('')
  const [showDepartmentModal, setShowDepartmentModal] = useState(false)
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [showDateModal, setShowDateModal] = useState(false)
  const [showPatientModal, setShowPatientModal] = useState(false)
  const [showChatInput, setShowChatInput] = useState(false)
  const [patientInfoStep, setPatientInfoStep] = useState<'name' | 'email' | 'mobile' | 'complete'>('name')
  const [collectedPatientInfo, setCollectedPatientInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: ''
  })
  const [validation, setValidation] = useState({
    firstName: false,
    lastName: false,
    email: false,
    mobile: false
  })
  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    email: false,
    mobile: false
  })
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [emailSuggestions, setEmailSuggestions] = useState<string[]>([])
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState<{code: string, data: Country}>(
    { code: 'IN', data: (countryData as CountryData)['IN'] }
  )
  const [isDetectingCountry, setIsDetectingCountry] = useState(true)
  const countryButtonRef = React.useRef<HTMLButtonElement>(null)
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
    const audioContext = new (window.AudioContext || (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)()
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

  // Format timestamp for display
  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  // Generate styled appointment confirmation message
  const generateAppointmentConfirmation = () => {
    const bookingRef = Math.random().toString(36).substr(2, 9).toUpperCase()
    
    return (
      <div className="space-y-4">
        {/* Success Header */}
        <div className="flex items-center gap-3 bg-green-50 p-4 rounded-xl border border-green-200">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-600" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="font-bold text-green-800">Appointment Confirmed!</h3>
            <p className="text-sm text-green-600">Your booking has been successfully processed</p>
          </div>
        </div>

        {/* Doctor Information */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
              <img 
                src={bookingData.doctor?.image || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTuj2a_Lkjnw0IRzGPJgasIV0HWQjiMGP4M4g&s"}
                alt={bookingData.doctor?.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-900">{bookingData.doctor?.name}</h4>
              <p className="text-sm text-gray-600 mb-2">{bookingData.doctor?.qualification}</p>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" strokeWidth={1.25} />
                <span>{bookingData.location?.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Appointment Details */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <h5 className="font-semibold text-gray-900 mb-3">Appointment Details</h5>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-primary" strokeWidth={1.25} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {bookingData.date?.toLocaleDateString('en-US', { 
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
                <p className="text-xs text-gray-600">Date</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-primary" strokeWidth={1.25} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{bookingData.timeSlot}</p>
                <p className="text-xs text-gray-600">Time</p>
              </div>
            </div>
          </div>
        </div>

        {/* Patient Information */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <h5 className="font-semibold text-gray-900 mb-3">Patient Details</h5>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Name</span>
              <span className="text-sm font-medium text-gray-900">
                {bookingData.patient?.firstName} {bookingData.patient?.lastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Email</span>
              <span className="text-sm font-medium text-gray-900">{bookingData.patient?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Phone</span>
              <span className="text-sm font-medium text-gray-900">
                {bookingData.patient?.selectedCountryCode} {bookingData.patient?.mobile}
              </span>
            </div>
          </div>
        </div>

        {/* Booking Reference */}
        <div className="bg-primary/5 rounded-xl p-4 text-center border border-primary/20">
          <p className="text-sm text-gray-600 mb-1">Booking Reference</p>
          <p className="text-xl font-bold text-primary">#{bookingRef}</p>
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            // Reset for new booking
            resetBooking()
            setIsInitialized(false)
            setPatientInfoStep('name')
            setCollectedPatientInfo({ firstName: '', lastName: '', email: '', mobile: '' })
            setShowChatInput(false)
            // Restart the chat flow
            setTimeout(() => {
              addBotMessage("Hello! Welcome to KIMS Hospital. I'm here to help you book your appointment quickly and easily.", undefined, 1000)
              setTimeout(() => {
                addBotMessage("First, let me get your basic information to serve you better. Please provide your name:", undefined, 1800)
                
                setTimeout(() => {
                  setPatientInfoStep('name')
                  setShowChatInput(true)
                  setTimeout(() => {
                    chatInputRef.current?.focus()
                  }, 100)
                }, 3200)
              }, 2000)
            }, 500)
          }}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
        >
          🔄 Book Another Appointment
        </button>
      </div>
    )
  }

  // Send webhook and show confirmation message
  const sendWebhookAndShowConfirmation = async () => {
    const bookingRef = Math.random().toString(36).substr(2, 9).toUpperCase()
    
    // Send webhook data
    try {
      const countryCode = bookingData.patient?.selectedCountryCode?.replace('+', '') || '91'
      const mobileNumber = bookingData.patient?.mobile || ''
      const formattedPhone = `${countryCode}${mobileNumber}`
      
      const payload = {
        bookingReference: bookingRef,
        timestamp: new Date().toISOString(),
        department: bookingData.department?.name || 'Unknown Department',
        hospital: bookingData.location?.name || 'Unknown Hospital', 
        date: bookingData.date?.toLocaleDateString('en-US', { 
          weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' 
        }) || 'Unknown Date',
        doctor: bookingData.doctor?.name || 'Unknown Doctor',
        time: bookingData.timeSlot || 'Unknown Time',
        patient: {
          name: `${bookingData.patient?.firstName || ''} ${bookingData.patient?.lastName || ''}`.trim() || 'Unknown Patient',
          email: bookingData.patient?.email || 'unknown@email.com',
          mobile: mobileNumber,
          formatted_phone: formattedPhone
        }
      }
      
      console.log('📤 Sending webhook data:', payload)
      
      await fetch('https://webhooks.botpe.in/webhook/68a8bbc881128cc4046e9fb4', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
    } catch (error) {
      console.error('Webhook error:', error)
    }
    
    // Show confirmation message
    addBotMessage("", generateAppointmentConfirmation(), 800)
  }

  // Validation functions - exactly like PatientForm
  const validateFirstName = (value: string) => {
    const isValid = value.trim().length >= 2 && /^[a-zA-Z\s]+$/.test(value)
    setValidation(prev => ({ ...prev, firstName: isValid }))
    return isValid
  }

  const validateLastName = (value: string) => {
    const isValid = value.trim().length >= 2 && /^[a-zA-Z\s]+$/.test(value)
    setValidation(prev => ({ ...prev, lastName: isValid }))
    return isValid
  }

  const validateEmail = (value: string) => {
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    setValidation(prev => ({ ...prev, email: isValid }))
    return isValid
  }

  const validatePhone = (value: string) => {
    const phoneDigits = value.replace(/\D/g, '')
    const isValid = phoneDigits.length >= 10 && phoneDigits.length <= 15
    setValidation(prev => ({ ...prev, mobile: isValid }))
    return isValid
  }

  // Patient form handlers
  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (/^[a-zA-Z\s]*$/.test(value)) {
      setCollectedPatientInfo(prev => ({ ...prev, firstName: value }))
      validateFirstName(value)
      if (!touched.firstName) {
        setTouched(prev => ({ ...prev, firstName: true }))
      }
    }
  }

  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (/^[a-zA-Z\s]*$/.test(value)) {
      setCollectedPatientInfo(prev => ({ ...prev, lastName: value }))
      validateLastName(value)
      if (!touched.lastName) {
        setTouched(prev => ({ ...prev, lastName: true }))
      }
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCollectedPatientInfo(prev => ({ ...prev, email: value }))
    
    validateEmail(value)
    if (!touched.email) {
      setTouched(prev => ({ ...prev, email: true }))
    }
    
    // Show email suggestions after @
    if (value.includes('@') && !value.includes('.')) {
      const [username, domain] = value.split('@')
      if (domain) {
        const filtered = emailDomains.filter(d => d.toLowerCase().startsWith(domain.toLowerCase()))
        setEmailSuggestions(filtered.map(d => `${username}@${d}`))
        setShowSuggestions(filtered.length > 0)
      } else {
        setEmailSuggestions(emailDomains.map(d => `${username}@${d}`))
        setShowSuggestions(true)
      }
    } else {
      setShowSuggestions(false)
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const numbersOnly = value.replace(/\D/g, '')
    
    if (numbersOnly.length <= 15) {
      setCollectedPatientInfo(prev => ({ ...prev, mobile: numbersOnly }))
      validatePhone(numbersOnly)
      if (!touched.mobile) {
        setTouched(prev => ({ ...prev, mobile: true }))
      }
    }
  }

  const selectEmailSuggestion = (suggestion: string) => {
    setCollectedPatientInfo(prev => ({ ...prev, email: suggestion }))
    setShowSuggestions(false)
    validateEmail(suggestion)
  }

  // Auto-detect user's country from IP
  useEffect(() => {
    const detectCountry = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/')
        const data = await response.json()
        
        if (data.country_code) {
          const countryCode = data.country_code.toUpperCase()
          const countryInfo = (countryData as CountryData)[countryCode]
          
          if (countryInfo && countryInfo.phone && countryInfo.phone.length > 0) {
            setSelectedCountry({ code: countryCode, data: countryInfo })
          }
        }
      } catch (error) {
        console.log('Could not detect country, using default (India)')
      } finally {
        setIsDetectingCountry(false)
      }
    }
    
    detectCountry()
  }, [])

  // Close country dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (showCountryDropdown && !target.closest('.country-selector')) {
        setShowCountryDropdown(false)
      }
    }
    
    if (showCountryDropdown) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showCountryDropdown])

  // Initialize chat with welcome message and patient info collection
  useEffect(() => {
    let timeoutId1: NodeJS.Timeout
    let timeoutId2: NodeJS.Timeout
    let timeoutId3: NodeJS.Timeout

    if (!isInitialized && messages.length === 0) {
      timeoutId1 = setTimeout(() => {
        addBotMessage("Hello! Welcome to KIMS Hospital. I'm here to help you book your appointment quickly and easily.", undefined, 1000)
        
        timeoutId2 = setTimeout(() => {
          addBotMessage("First, let me get your basic information to serve you better. Please provide your name:", undefined, 1800)
          
          setTimeout(() => {
            setPatientInfoStep('name')
            setShowChatInput(true)
            setTimeout(() => {
              chatInputRef.current?.focus()
            }, 100)
          }, 3200)
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
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleStartBooking = () => {
    setChatMode('booking')
    setShowChatInput(false) // Hide chat input when switching to booking mode
    
    // Add user message for button selection
    addUserMessage("Book An Appointment")
    
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
    // Handle patient info collection
    if (patientInfoStep !== 'complete' && showChatInput) {
      handlePatientFormSubmit()
      return
    }

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

  // Handle form submission for each step
  const handlePatientFormSubmit = () => {
    switch (patientInfoStep) {
      case 'name':
        if (validation.firstName && validation.lastName && 
            collectedPatientInfo.firstName.trim() && collectedPatientInfo.lastName.trim()) {
          addUserMessage(`${collectedPatientInfo.firstName} ${collectedPatientInfo.lastName}`)
          setShowChatInput(false)
          addBotMessage(`Nice to meet you, ${collectedPatientInfo.firstName} ${collectedPatientInfo.lastName}! ${collectedPatientInfo.firstName}, please provide your email address:`, undefined, 800)
          setTimeout(() => {
            setPatientInfoStep('email')
            setShowChatInput(true)
            setTimeout(() => {
              chatInputRef.current?.focus()
            }, 100)
          }, 1200)
        }
        break
        
      case 'email':
        if (validation.email && collectedPatientInfo.email.trim()) {
          addUserMessage(collectedPatientInfo.email)
          setShowChatInput(false)
          addBotMessage(`Great! Finally, ${collectedPatientInfo.firstName}, please provide your mobile number:`, undefined, 800)
          setTimeout(() => {
            setPatientInfoStep('mobile')
            setShowChatInput(true)
            setTimeout(() => {
              chatInputRef.current?.focus()
            }, 100)
          }, 1200)
        }
        break
        
      case 'mobile':
        if (validation.mobile && collectedPatientInfo.mobile.trim()) {
          addUserMessage(`${selectedCountry.data.phone[0]} ${collectedPatientInfo.mobile}`)
          setPatientInfoStep('complete')
          setShowChatInput(false)
          
          // Complete patient info and proceed
          const fullPatientInfo = {
            ...collectedPatientInfo,
            selectedCountryCode: selectedCountry.data.phone[0]
          }
          
          setPatient(fullPatientInfo)
          
          addBotMessage(`Perfect! I have all your information:
• Name: ${fullPatientInfo.firstName} ${fullPatientInfo.lastName}  
• Email: ${fullPatientInfo.email}
• Mobile: ${fullPatientInfo.selectedCountryCode} ${fullPatientInfo.mobile}

Now, how would you like to proceed?`, 
            <div className="space-y-3">
              <button
                onClick={handleStartBooking}
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <Calendar className="w-5 h-5" strokeWidth={1.25} />
                Book An Appointment
              </button>
              <button
                onClick={handleChatMode}
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" strokeWidth={1.25} />
                Chat with Bot
              </button>
            </div>, 1200)
        }
        break
    }
  }

  const processUserMessage = (message: string) => {
    const messageText = message.trim()
    const lowerMessage = messageText.toLowerCase()
    
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
                
                // Patient info already collected, proceed to confirmation
                setTimeout(() => {
                  addBotMessage("Perfect! Processing your appointment booking...", undefined, 1000)
                  setTimeout(() => {
                    // Send confirmation message with webhook
                    sendWebhookAndShowConfirmation()
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


  const handleDepartmentSelected = (department: {id: number, name: string}) => {
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

  const handleLocationSelected = (location: {id: number, name: string}) => {
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

  const handleDateTimeSelected = (doctor: {id: number, name: string}, timeSlot: string, date: Date | null) => {
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
      // Patient info already collected at start, proceed to confirmation
      addBotMessage("Using your previously provided information. Processing your booking...", undefined, 1100)
      setTimeout(() => {
        // Send confirmation message with webhook
        sendWebhookAndShowConfirmation()
      }, 2200)
    }, 2800)
  }

  // Legacy handler kept for modal-based booking (if needed)
  const handlePatientInfoSubmitted = (patientData: {firstName: string, lastName: string, email: string, mobile: string}) => {
    setPatient(patientData)
    setShowPatientModal(false)
    
    // Add user message showing their information submission
    addUserMessage(`My details: ${patientData.firstName} ${patientData.lastName}, ${patientData.email}, ${patientData.mobile}`)
    
    addBotMessage(`Thank you, ${patientData.firstName}! I have all the information needed.`, undefined, 1200)
    setTimeout(() => {
      addBotMessage("Let me confirm your appointment details and process your booking...", undefined, 1400)
      setTimeout(() => {
        // Send confirmation message with webhook
        sendWebhookAndShowConfirmation()
      }, 2200)
    }, 2500)
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col" style={{backgroundImage: 'url(https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png)', backgroundRepeat: 'repeat', backgroundSize: 'auto'}}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white border border-primary flex items-center justify-center">
            <img src="/kimsbot.png" alt="KIMS Bot" className="w-10 h-10 rounded-full object-cover" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              KIMS Assistant
              <img src="https://static.whatsapp.net/rsrc.php/v4/yM/r/SGDtYg_EYce.png" alt="WhatsApp" className="w-5 h-5" />
            </h1>
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
                <div className="w-10 h-10 rounded-full bg-white border border-primary flex items-center justify-center flex-shrink-0">
                  <img src="/kimsbot.png" alt="KIMS Bot" className="w-8 h-8 rounded-full object-cover" />
                </div>
                <div className="max-w-[80%] min-w-0">
                  <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border">
                    <p className="text-gray-800 leading-relaxed">{message.content}</p>
                  </div>
                  {message.component && (
                    <div className="mt-3 rounded-2xl overflow-hidden" style={{backgroundColor: 'transparent', boxShadow: 'none', border: 'none'}}>
                      {message.component}
                    </div>
                  )}
                  <div className="mt-1 ml-1">
                    <span className="text-xs text-gray-400">{formatTimestamp(message.timestamp)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 mb-4 flex-row-reverse">
                <div className="w-10 h-10 rounded-full bg-white border border-primary flex items-center justify-center flex-shrink-0">
                  <img src="/user.png" alt="User" className="w-8 h-8 rounded-full object-cover" />
                </div>
                <div className="max-w-[80%]">
                  <div className="rounded-2xl rounded-br-md px-4 py-3 shadow-sm" style={{backgroundColor: '#ffeeee'}}>
                    <p className="leading-relaxed">{message.content}</p>
                  </div>
                  <div className="mt-1 mr-1 text-right">
                    <span className="text-xs text-gray-400">{formatTimestamp(message.timestamp)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        
        <TypingBubble isVisible={isTyping} />
        <div ref={messagesEndRef} />
      </div>



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

      {/* Fixed Bottom Chat Input */}
      {showChatInput && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-10">
          <div className="max-w-4xl mx-auto">
            {/* Patient Info Collection Inputs */}
            {patientInfoStep !== 'complete' ? (
              <div>
                {patientInfoStep === 'name' && (
                  <div className="flex items-end gap-3">
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      {/* First Name */}
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                          <User className="w-4 h-4 text-gray-400" strokeWidth={1.25} />
                        </div>
                        <input
                          type="text"
                          placeholder="First Name"
                          value={collectedPatientInfo.firstName}
                          onChange={handleFirstNameChange}
                          onBlur={() => setTouched(prev => ({ ...prev, firstName: true }))}
                          className={cn(
                            "w-full h-12 pl-10 pr-10 rounded-lg border-2 transition-all duration-200 text-base outline-none",
                            validation.firstName 
                              ? "border-green-500 bg-green-50/50" 
                              : touched.firstName && collectedPatientInfo.firstName 
                                ? "border-red-300" 
                                : "border-gray-200 focus:border-primary"
                          )}
                          autoFocus
                        />
                        {validation.firstName && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" strokeWidth={2} />
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Last Name */}
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                          <User className="w-4 h-4 text-gray-400" strokeWidth={1.25} />
                        </div>
                        <input
                          type="text"
                          placeholder="Last Name"
                          value={collectedPatientInfo.lastName}
                          onChange={handleLastNameChange}
                          onBlur={() => setTouched(prev => ({ ...prev, lastName: true }))}
                          className={cn(
                            "w-full h-12 pl-10 pr-10 rounded-lg border-2 transition-all duration-200 text-base outline-none",
                            validation.lastName 
                              ? "border-green-500 bg-green-50/50" 
                              : touched.lastName && collectedPatientInfo.lastName 
                                ? "border-red-300" 
                                : "border-gray-200 focus:border-primary"
                          )}
                        />
                        {validation.lastName && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" strokeWidth={2} />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={handlePatientFormSubmit}
                      disabled={!validation.firstName || !validation.lastName}
                      className={cn(
                        "px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center min-w-[80px] h-12",
                        validation.firstName && validation.lastName
                          ? "bg-primary hover:bg-primary/90 text-white shadow-sm"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      )}
                    >
                      <svg
                        className="w-5 h-5 rotate-90"
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
                )}

                {patientInfoStep === 'email' && (
                  <div className="flex items-end gap-3">
                    <div className="flex-1 relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                        <Mail className="w-4 h-4 text-gray-400" strokeWidth={1.25} />
                      </div>
                      <input
                        type="email"
                        placeholder="Email Address"
                        value={collectedPatientInfo.email}
                        onChange={handleEmailChange}
                        onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
                        className={cn(
                          "w-full h-12 pl-10 pr-10 rounded-lg border-2 transition-all duration-200 text-base outline-none",
                          validation.email 
                            ? "border-green-500 bg-green-50/50" 
                            : touched.email && collectedPatientInfo.email 
                              ? "border-red-300" 
                              : "border-gray-200 focus:border-primary"
                        )}
                        autoFocus
                      />
                      {validation.email && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" strokeWidth={2} />
                          </div>
                        </div>
                      )}
                      
                      {/* Email suggestions dropdown */}
                      {showSuggestions && (
                        <div className="absolute bottom-full mb-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto">
                          {emailSuggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => selectEmailSuggestion(suggestion)}
                              className="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handlePatientFormSubmit}
                      disabled={!validation.email}
                      className={cn(
                        "px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center min-w-[80px] h-12",
                        validation.email
                          ? "bg-primary hover:bg-primary/90 text-white shadow-sm"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      )}
                    >
                      <svg
                        className="w-5 h-5 rotate-90"
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
                )}

                {patientInfoStep === 'mobile' && (
                  <div className="flex items-end gap-3">
                    <div className="flex-1 relative country-selector">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                        <button
                          type="button"
                          ref={countryButtonRef}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setShowCountryDropdown(!showCountryDropdown)
                          }}
                          className="flex items-center gap-2 hover:bg-gray-50 rounded px-1 py-1 transition-colors"
                        >
                          <div className="w-5 h-3.5 rounded-sm overflow-hidden">
                            <img 
                              src={selectedCountry.data.image}
                              alt={selectedCountry.data.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://upload.wikimedia.org/wikipedia/en/thumb/4/41/Flag_of_India.svg/510px-Flag_of_India.svg.png"
                              }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">
                            {isDetectingCountry ? '...' : selectedCountry.data.phone[0]}
                          </span>
                          <ChevronDown className={cn(
                            "w-3 h-3 text-gray-400 transition-transform duration-200",
                            showCountryDropdown ? "rotate-180" : ""
                          )} strokeWidth={1.25} />
                        </button>
                      </div>
                      <input
                        type="tel"
                        placeholder="Mobile Number"
                        value={collectedPatientInfo.mobile}
                        onChange={handlePhoneChange}
                        onBlur={() => setTouched(prev => ({ ...prev, mobile: true }))}
                        className={cn(
                          "w-full h-12 pl-24 pr-10 rounded-lg border-2 transition-all duration-200 text-base outline-none",
                          validation.mobile 
                            ? "border-green-500 bg-green-50/50" 
                            : touched.mobile && collectedPatientInfo.mobile 
                              ? "border-red-300" 
                              : "border-gray-200 focus:border-primary"
                        )}
                        autoFocus
                      />
                      {validation.mobile && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" strokeWidth={2} />
                          </div>
                        </div>
                      )}
                      
                      {/* Country Dropdown - Always open upward */}
                      {showCountryDropdown && (
                        <div className="absolute bottom-full mb-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                          {Object.entries(countryData as CountryData)
                            .filter(([, country]) => country.phone && country.phone.length > 0)
                            .sort((a, b) => a[1].name.localeCompare(b[1].name))
                            .slice(0, 30) // Show top 30 countries
                            .map(([code, country]) => (
                              <button
                                key={code}
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  setSelectedCountry({ code, data: country })
                                  setShowCountryDropdown(false)
                                }}
                                className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                              >
                                <div className="w-5 h-3.5 rounded-sm overflow-hidden">
                                  <img 
                                    src={country.image}
                                    alt={country.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = "https://upload.wikimedia.org/wikipedia/en/thumb/4/41/Flag_of_India.svg/510px-Flag_of_India.svg.png"
                                    }}
                                  />
                                </div>
                                <span className="text-sm flex-1">{country.name}</span>
                                <span className="text-sm text-gray-600">{country.phone[0]}</span>
                              </button>
                            ))
                          }
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handlePatientFormSubmit}
                      disabled={!validation.mobile}
                      className={cn(
                        "px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center min-w-[80px] h-12",
                        validation.mobile
                          ? "bg-primary hover:bg-primary/90 text-white shadow-sm"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      )}
                    >
                      <svg
                        className="w-5 h-5 rotate-90"
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
                )}
              </div>
            ) : (
              /* Regular Chat Input */
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
            )}
            
            {patientInfoStep === 'complete' && (
              <div className="text-center mt-2">
                <p className="text-xs text-gray-400">
                  Press Enter to send • Shift+Enter for new line
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer Spacer for Chat Input */}
      {showChatInput ? (
        <div className="h-32"></div>
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