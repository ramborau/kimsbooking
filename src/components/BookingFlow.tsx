import React from 'react'
import { useBookingStore } from '@/store/bookingStore'
import { StickyHeader } from '@/components/layout/StickyHeader'
import { StickyFooter } from '@/components/layout/StickyFooter'
import { LocationPopup } from '@/components/location/LocationPopup'
import { DateSelectionPopup } from '@/components/date/DateSelectionPopup'
import { DepartmentSelect } from '@/components/booking/DepartmentSelect'
import { LocationSelect } from '@/components/booking/LocationSelect'
import { DatePicker } from '@/components/booking/DatePicker'
import { PatientForm } from '@/components/booking/PatientForm'
import { BookingConfirmationPopup } from '@/components/booking/BookingConfirmationPopup'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'

const BookingFlow: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [showLocationPopup, setShowLocationPopup] = React.useState(false)
  const [showDatePopup, setShowDatePopup] = React.useState(false)
  const [popupSelectedDate, setPopupSelectedDate] = React.useState<Date | null>(null)
  const [selectedDoctorSlot, setSelectedDoctorSlot] = React.useState<{
    doctor: any
    slot: string
    period: string
  } | null>(null)
  const [showConfirmationPopup, setShowConfirmationPopup] = React.useState(false)
  
  const {
    currentStep,
    userLocation,
    locationPermissionAsked,
    bookingData,
    nextStep,
    prevStep,
    setUserLocation,
    setLocationPermissionAsked,
    setDepartment,
    setLocation,
    setDate,
    setDoctor,
    setTimeSlot,
    setPatient,
    resetBooking
  } = useBookingStore()

  // Always reset location state on component mount to ensure popup shows
  React.useEffect(() => {
    console.log('BookingFlow mounted, clearing location state...')
    
    // Clear all location-related localStorage items
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.includes('location') || key.includes('geolocation') || key.includes('position') || key === 'userLocation')) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => {
      console.log('Removing localStorage key:', key)
      localStorage.removeItem(key)
    })
    
    // Force reset location permission state to ensure popup shows on page 1
    console.log('Resetting location permission state...')
    setLocationPermissionAsked(false)
    setUserLocation(null as any)
  }, [])

  const getStepTitle = (step: number) => {
    const titles = [
      '',
      'Select Department',
      'Choose Location',
      'Select Date',
      'Your Information'
    ]
    return titles[step]
  }

  const getButtonText = (step: number) => {
    const texts = [
      '',
      'Continue',
      'Select Location',
      'Continue',
      'Book Appointment',
      'Done'
    ]
    return texts[step]
  }

  const isStepValid = (step: number) => {
    switch (step) {
      case 1: return !!bookingData.department
      case 2: return !!bookingData.location
      case 3: return !!bookingData.date && !!selectedDoctorSlot
      case 4: return bookingData.patient && 
                       bookingData.patient.firstName && 
                       bookingData.patient.lastName && 
                       bookingData.patient.email && 
                       bookingData.patient.phone &&
                       bookingData.patient.firstName.trim().length >= 2 &&
                       bookingData.patient.lastName.trim().length >= 2 &&
                       /^[a-zA-Z\s]+$/.test(bookingData.patient.firstName) &&
                       /^[a-zA-Z\s]+$/.test(bookingData.patient.lastName) &&
                       /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bookingData.patient.email) &&
                       bookingData.patient.phone.length >= 10
      default: return false
    }
  }

  const handleNext = () => {
    if (currentStep === 4) {
      // Show confirmation popup instead of going to step 5
      setShowConfirmationPopup(true)
    } else {
      nextStep()
    }
  }
  
  const handleConfirmationClose = () => {
    setShowConfirmationPopup(false)
    resetBooking()
  }

  const handlePatientSubmit = (patientData: any) => {
    setPatient(patientData)
    // Don't auto-advance, let the Continue button handle it
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StickyHeader
        title={getStepTitle(currentStep)}
        onBack={currentStep > 1 ? prevStep : undefined}
        showBack={currentStep > 1}
        showSearch={currentStep === 1}
        currentStep={currentStep}
        totalSteps={4}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showGetDistance={currentStep === 2 && !userLocation}
        onGetDistance={() => setShowLocationPopup(true)}
        showSelectDate={currentStep === 3}
        onSelectDate={() => setShowDatePopup(true)}
        showLanguageSwitcher={currentStep === 1}
      />
      
      <main className={cn(
        "pt-20 pb-24 min-h-screen",
        "animate-in fade-in-50 duration-300"
      )}>
        {currentStep === 1 && (
          <DepartmentSelect
            onSelect={(dept) => {
              setDepartment(dept)
            }}
            selected={bookingData.department?.id}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        )}
        
        {currentStep === 2 && (
          <LocationSelect
            onSelect={(location) => {
              setLocation(location)
            }}
            selected={bookingData.location?.id}
            userLocation={userLocation}
          />
        )}
        
        {currentStep === 3 && (
          <DatePicker
            onSelect={(date) => {
              setDate(date)
            }}
            selected={bookingData.date}
            popupSelectedDate={popupSelectedDate}
            onDoctorSlotSelect={(doctor, slot, period) => {
              setSelectedDoctorSlot({ doctor, slot, period })
              setDoctor(doctor)
              setTimeSlot(slot)
            }}
          />
        )}
        
        {currentStep === 4 && (
          <PatientForm
            onSubmit={handlePatientSubmit}
            initialData={bookingData.patient || {}}
          />
        )}
        
      </main>
      
      {currentStep < 5 && currentStep > 0 && (
        <StickyFooter>
          <Button
            onClick={handleNext}
            disabled={!isStepValid(currentStep)}
            className={cn(
              "w-full h-20 text-xl font-medium shadow-sm transition-all duration-200 flex items-center justify-between px-6 rounded-t-lg rounded-b-none",
              isStepValid(currentStep) 
                ? "bg-primary hover:bg-primary/90 active:scale-[0.98]" 
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            )}
          >
            {currentStep === 1 && bookingData.department && (() => {
              const DeptIcon = bookingData.department.icon
              return (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <DeptIcon className="w-4 h-4 text-white" strokeWidth={1.25} />
                  </div>
                  <span>{bookingData.department.name}</span>
                </div>
              )
            })()}
            {currentStep === 1 && !bookingData.department && (
              <div className="flex flex-col items-start">
                <span className="font-semibold">8 Departments</span>
                <span className="text-sm opacity-80">5 Hospitals</span>
              </div>
            )}
            {currentStep === 2 && bookingData.location && (
              <div className="flex flex-col items-start">
                <span className="font-semibold">{bookingData.location.name}</span>
                <span className="text-sm opacity-80">15 Doctors Available</span>
              </div>
            )}
            {currentStep === 2 && !bookingData.location && (
              <div className="flex flex-col items-start">
                <span className="font-semibold">3 Hospitals</span>
                <span className="text-sm opacity-80">45 Doctors Available</span>
              </div>
            )}
            {currentStep === 3 && selectedDoctorSlot && bookingData.date && (
              <div className="flex flex-col items-start">
                <span className="font-semibold">{selectedDoctorSlot.doctor.name}</span>
                <span className="text-sm opacity-80">
                  {bookingData.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} | {selectedDoctorSlot.slot}
                </span>
              </div>
            )}
            {currentStep === 3 && !selectedDoctorSlot && bookingData.date && (
              <div className="flex flex-col items-start">
                <span className="font-semibold">{bookingData.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                <span className="text-sm opacity-80">3 Doctors Available</span>
              </div>
            )}
            {currentStep === 3 && !selectedDoctorSlot && !bookingData.date && (
              <div className="flex flex-col items-start">
                <span className="font-semibold">Select Date</span>
                <span className="text-sm opacity-80">3 Doctors Available</span>
              </div>
            )}
            {currentStep === 4 && bookingData.patient && (
              <div className="flex flex-col items-start">
                <span className="font-semibold">{bookingData.patient.firstName} {bookingData.patient.lastName}</span>
                <span className="text-sm opacity-80">{bookingData.patient.email}</span>
              </div>
            )}
            {currentStep === 4 && !bookingData.patient && (
              <div className="flex flex-col items-start">
                <span className="font-semibold">Enter Your Details</span>
                <span className="text-sm opacity-80">Required for Booking</span>
              </div>
            )}
            {(currentStep !== 1) && (currentStep !== 2) && (currentStep !== 3) && (currentStep !== 4) && (
              <span>{getButtonText(currentStep)}</span>
            )}
            <div className="flex items-center gap-2">
              <span>{currentStep === 4 ? 'Book Appointment' : 'Continue'}</span>
              <ArrowRight className="w-5 h-5" strokeWidth={1.25} />
            </div>
          </Button>
        </StickyFooter>
      )}
      
      
      {/* Location Popup - show by default on page 1 if not asked yet, or when manually triggered */}
      <LocationPopup
        isVisible={(currentStep === 1 && !locationPermissionAsked) || showLocationPopup}
        onLocationGranted={(location) => {
          setUserLocation(location)
          setLocationPermissionAsked(true)
          setShowLocationPopup(false)
        }}
        onLocationDenied={() => {
          setLocationPermissionAsked(true)
          setShowLocationPopup(false)
        }}
      />

      {/* Date Selection Popup */}
      <DateSelectionPopup
        isVisible={showDatePopup}
        onDateSelected={(date) => {
          setDate(date)
          setPopupSelectedDate(date) // Track popup selections separately
          setShowDatePopup(false)
        }}
        onClose={() => setShowDatePopup(false)}
        selectedDate={bookingData.date}
      />
      
      {/* Booking Confirmation Popup */}
      <BookingConfirmationPopup
        isVisible={showConfirmationPopup}
        bookingData={bookingData}
        onClose={handleConfirmationClose}
      />
    </div>
  )
}

export default BookingFlow