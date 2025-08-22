import React, { useState, useEffect } from 'react'
import { User, Mail, Check, Calendar, Clock, MapPin, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useBookingStore } from '@/store/bookingStore'
import countryData from '../../../countrycode.json'

interface PatientFormProps {
  onSubmit: (data: any) => void
  initialData?: any
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

export const PatientForm: React.FC<PatientFormProps> = ({ onSubmit, initialData }) => {
  const { bookingData } = useBookingStore()
  
  const [formData, setFormData] = useState({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    email: initialData?.email || '',
    phone: initialData?.phone || ''
  })
  
  const [validation, setValidation] = useState({
    firstName: false,
    lastName: false,
    email: false,
    phone: false
  })
  
  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    email: false,
    phone: false
  })
  
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [emailSuggestions, setEmailSuggestions] = useState<string[]>([])
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState<{code: string, data: Country}>(
    { code: 'IN', data: (countryData as CountryData)['IN'] }
  )
  const [isDetectingCountry, setIsDetectingCountry] = useState(true)
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom')
  const countryButtonRef = React.useRef<HTMLButtonElement>(null)
  
  // Validate first name - only letters and spaces
  const validateFirstName = (value: string) => {
    const isValid = value.trim().length >= 2 && /^[a-zA-Z\s]+$/.test(value)
    setValidation(prev => ({ ...prev, firstName: isValid }))
    return isValid
  }
  
  // Validate last name - only letters and spaces
  const validateLastName = (value: string) => {
    const isValid = value.trim().length >= 2 && /^[a-zA-Z\s]+$/.test(value)
    setValidation(prev => ({ ...prev, lastName: isValid }))
    return isValid
  }
  
  // Validate email
  const validateEmail = (value: string) => {
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    setValidation(prev => ({ ...prev, email: isValid }))
    return isValid
  }
  
  // Validate phone - only numbers, minimum 10 digits
  const validatePhone = (value: string) => {
    // Only allow numbers
    const phoneDigits = value.replace(/\D/g, '')
    const isValid = phoneDigits.length >= 10 && phoneDigits.length <= 15
    setValidation(prev => ({ ...prev, phone: isValid }))
    return isValid
  }
  
  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Only allow letters and spaces - prevent numbers
    if (/^[a-zA-Z\s]*$/.test(value)) {
      setFormData(prev => ({ ...prev, firstName: value }))
      // Real-time validation
      validateFirstName(value)
      if (!touched.firstName) {
        setTouched(prev => ({ ...prev, firstName: true }))
      }
    }
  }
  
  const handleFirstNameBlur = () => {
    setTouched(prev => ({ ...prev, firstName: true }))
    validateFirstName(formData.firstName)
  }
  
  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Only allow letters and spaces - prevent numbers
    if (/^[a-zA-Z\s]*$/.test(value)) {
      setFormData(prev => ({ ...prev, lastName: value }))
      // Real-time validation
      validateLastName(value)
      if (!touched.lastName) {
        setTouched(prev => ({ ...prev, lastName: true }))
      }
    }
  }
  
  const handleLastNameBlur = () => {
    setTouched(prev => ({ ...prev, lastName: true }))
    validateLastName(formData.lastName)
  }
  
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFormData(prev => ({ ...prev, email: value }))
    
    // Real-time validation
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
  
  const handleEmailBlur = () => {
    setTouched(prev => ({ ...prev, email: true }))
    validateEmail(formData.email)
  }
  
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Only allow numbers - remove any non-digit characters
    const numbersOnly = value.replace(/\D/g, '')
    
    // Limit to 15 digits max
    if (numbersOnly.length <= 15) {
      setFormData(prev => ({ ...prev, phone: numbersOnly }))
      // Real-time validation
      validatePhone(numbersOnly)
      if (!touched.phone) {
        setTouched(prev => ({ ...prev, phone: true }))
      }
    }
  }
  
  const handlePhoneBlur = () => {
    setTouched(prev => ({ ...prev, phone: true }))
    validatePhone(formData.phone)
  }
  
  const selectEmailSuggestion = (suggestion: string) => {
    setFormData(prev => ({ ...prev, email: suggestion }))
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

  const isFormValid = validation.firstName && validation.lastName && validation.email && validation.phone
  
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

  // Update parent with form data whenever it changes (but skip initial empty render)
  useEffect(() => {
    if (formData.firstName || formData.lastName || formData.email || formData.phone) {
      const formDataWithCountry = {
        ...formData,
        selectedCountryCode: selectedCountry.data.phone[0] // Include selected country code
      }
      onSubmit(formDataWithCountry)
    }
  }, [formData.firstName, formData.lastName, formData.email, formData.phone, selectedCountry])
  
  return (
    <div className="px-4 py-4">
      {/* Enhanced Appointment Information - Fixed Height */}
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-3xl border border-primary/20 p-4 mb-6 min-h-[48vh] max-h-[48vh] overflow-y-auto">
        <h2 className="text-lg font-bold text-gray-900 mb-4 text-center sticky top-0 bg-gradient-to-br from-primary/5 to-primary/10 py-2 rounded-xl">Appointment Summary</h2>
        
        {/* Doctor Info - Compact */}
        <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-primary/20">
              <img 
                src={bookingData?.doctor?.image || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTuj2a_Lkjnw0IRzGPJgasIV0HWQjiMGP4M4g&s"}
                alt={bookingData?.doctor?.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-gray-900 mb-1">{bookingData?.doctor?.name}</h3>
              <p className="text-xs text-gray-600 mb-1">{bookingData?.doctor?.qualification}</p>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 rounded-full">
                <span className="text-xs font-medium text-primary">{bookingData?.department?.name}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Date & Time - Compact */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <div className="flex items-center justify-center mb-1">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="w-3 h-3 text-primary" strokeWidth={1.5} />
              </div>
            </div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Date</p>
            <p className="text-sm font-bold text-gray-900">
              {bookingData?.date?.toLocaleDateString('en-US', { 
                weekday: 'short',
                month: 'short', 
                day: 'numeric' 
              })}
            </p>
            <p className="text-xs text-gray-600">
              {bookingData?.date?.toLocaleDateString('en-US', { year: 'numeric' })}
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <div className="flex items-center justify-center mb-1">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="w-3 h-3 text-primary" strokeWidth={1.5} />
              </div>
            </div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Time</p>
            <p className="text-sm font-bold text-gray-900">{bookingData?.timeSlot}</p>
            <p className="text-xs text-gray-600">Consultation</p>
          </div>
        </div>
        
        {/* Hospital Details - Compact */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-primary" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Hospital</p>
              <p className="text-base font-bold text-gray-900 mb-1">{bookingData?.location?.name}</p>
              <p className="text-xs text-gray-600">{bookingData?.location?.name}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Patient Information Title */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Patient Information</h2>
        <p className="text-sm text-gray-600">Please fill in your details to complete the booking</p>
      </div>
      
      <div className="space-y-4">
        {/* Name fields - side by side */}
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                <User className="w-4 h-4 text-gray-400" strokeWidth={1.25} />
              </div>
              <input
                type="text"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleFirstNameChange}
                onBlur={handleFirstNameBlur}
                className={cn(
                  "w-full h-12 pl-10 pr-10 rounded-lg border-2 transition-all duration-200 text-base outline-none",
                  validation.firstName 
                    ? "border-green-500 bg-green-50/50" 
                    : touched.firstName && formData.firstName 
                      ? "border-red-300" 
                      : "border-gray-200 focus:border-primary"
                )}
              />
              {validation.firstName && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" strokeWidth={2} />
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="relative">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                <User className="w-4 h-4 text-gray-400" strokeWidth={1.25} />
              </div>
              <input
                type="text"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleLastNameChange}
                onBlur={handleLastNameBlur}
                className={cn(
                  "w-full h-12 pl-10 pr-10 rounded-lg border-2 transition-all duration-200 text-base outline-none",
                  validation.lastName 
                    ? "border-green-500 bg-green-50/50" 
                    : touched.lastName && formData.lastName 
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
        </div>
        
        {/* Email field with autocomplete */}
        <div className="relative">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
              <Mail className="w-4 h-4 text-gray-400" strokeWidth={1.25} />
            </div>
            <input
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleEmailChange}
              onBlur={handleEmailBlur}
              className={cn(
                "w-full h-12 pl-10 pr-10 rounded-lg border-2 transition-all duration-200 text-base outline-none",
                validation.email 
                  ? "border-green-500 bg-green-50/50" 
                  : touched.email && formData.email 
                    ? "border-red-300" 
                    : "border-gray-200 focus:border-primary"
              )}
            />
            {validation.email && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" strokeWidth={2} />
                </div>
              </div>
            )}
          </div>
          
          {/* Email suggestions dropdown */}
          {showSuggestions && (
            <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto">
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
        
        {/* Custom Phone field with country selector */}
        <div className="relative country-selector">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
              <button
                type="button"
                ref={countryButtonRef}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  
                  // Calculate if dropdown should open above or below
                  if (countryButtonRef.current) {
                    const rect = countryButtonRef.current.getBoundingClientRect()
                    const spaceBelow = window.innerHeight - rect.bottom
                    const spaceAbove = rect.top
                    
                    // If less than 300px space below and more space above, open upward
                    if (spaceBelow < 300 && spaceAbove > spaceBelow) {
                      setDropdownPosition('top')
                    } else {
                      setDropdownPosition('bottom')
                    }
                  }
                  
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
              value={formData.phone}
              onChange={handlePhoneChange}
              onBlur={handlePhoneBlur}
              className={cn(
                "w-full h-12 pl-24 pr-10 rounded-lg border-2 transition-all duration-200 text-base outline-none",
                validation.phone 
                  ? "border-green-500 bg-green-50/50" 
                  : touched.phone && formData.phone 
                    ? "border-red-300" 
                    : "border-gray-200 focus:border-primary"
              )}
            />
            {validation.phone && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" strokeWidth={2} />
                </div>
              </div>
            )}
          </div>
          
          {/* Country Dropdown - Smart Positioning */}
          {showCountryDropdown && (
            <div className={cn(
              "absolute w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto",
              dropdownPosition === 'bottom' ? "top-full mt-1" : "bottom-full mb-1"
            )}>
              {Object.entries(countryData as CountryData)
                .filter(([_, country]) => country.phone && country.phone.length > 0)
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
      </div>
      
    </div>
  )
}