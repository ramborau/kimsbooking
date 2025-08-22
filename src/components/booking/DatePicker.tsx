import React, { useState, useEffect } from 'react'
import { Calendar, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DoctorListing } from './DoctorListing'

interface DatePickerProps {
  onSelect: (date: Date) => void
  selected?: Date | null
  popupSelectedDate?: Date | null
  onDoctorSlotSelect?: (doctor: any, slot: string, period: string) => void
}

export const DatePicker: React.FC<DatePickerProps> = ({ onSelect, selected, popupSelectedDate, onDoctorSlotSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [showCalendar, setShowCalendar] = useState(false)
  const [startDate, setStartDate] = useState(new Date()) // Track the start date for quick dates
  const [loadingDoctors, setLoadingDoctors] = useState(false)

  // Update startDate when popup selection changes
  useEffect(() => {
    if (popupSelectedDate) {
      setStartDate(popupSelectedDate)
    }
  }, [popupSelectedDate])

  // Auto-select first available date if today has no slots
  useEffect(() => {
    if (!selected) {
      const today = new Date()
      if (!hasAvailableSlots(today)) {
        // Find the first date with available slots
        const quickDates = getQuickDates()
        for (const date of quickDates) {
          if (hasAvailableSlots(date)) {
            onSelect(date)
            break
          }
        }
      } else {
        // Today has slots, select it
        onSelect(today)
      }
    }
  }, [selected, onSelect])
  
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    const days = []
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    
    return days
  }
  
  const getQuickDates = () => {
    // Always use the startDate (which changes only from popup selection)
    const dates = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      dates.push(date)
    }
    return dates
  }
  
  
  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }
  
  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }
  
  const isPast = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }
  
  const isSelected = (date: Date) => {
    return selected && date.toDateString() === selected.toDateString()
  }

  // Sample doctors data (matching DoctorListing)
  const doctors = [
    {
      id: 1,
      name: "Dr. Rajesh Kumar",
      qualification: "MBBS, MD (Cardiology)",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTuj2a_Lkjnw0IRzGPJgasIV0HWQjiMGP4M4g&s",
      slots: {
        morning: 5,
        afternoon: 2,
        evening: 0
      }
    },
    {
      id: 2,
      name: "Dr. Priya Sharma",
      qualification: "MBBS, MS (Orthopedics)",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTuj2a_Lkjnw0IRzGPJgasIV0HWQjiMGP4M4g&s",
      slots: {
        morning: 7,
        afternoon: 4,
        evening: 3
      }
    },
    {
      id: 3,
      name: "Dr. Amit Patel",
      qualification: "MBBS, MD (Neurology)",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTuj2a_Lkjnw0IRzGPJgasIV0HWQjiMGP4M4g&s",
      slots: {
        morning: 0,
        afternoon: 1,
        evening: 6
      }
    },
    {
      id: 4,
      name: "Dr. Sunita Reddy",
      qualification: "MBBS, MD (Dermatology)",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTuj2a_Lkjnw0IRzGPJgasIV0HWQjiMGP4M4g&s",
      slots: {
        morning: 3,
        afternoon: 0,
        evening: 2
      }
    }
  ]

  const generateTimeSlotsForDate = (period: 'morning' | 'afternoon' | 'evening', count: number, dateToCheck: Date) => {
    const startHour = period === 'morning' ? 9 : period === 'afternoon' ? 14 : 18
    const endHour = period === 'morning' ? 12 : period === 'afternoon' ? 17 : 21
    const now = new Date()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const isToday = dateToCheck && dateToCheck.toDateString() === today.toDateString()
    
    let availableSlots = []
    
    // Generate all possible slots for the period
    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === endHour && minute > 0) break // Don't go past end hour
        
        const slotTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        
        // Check if slot is in the past for today
        if (isToday) {
          const slotDateTime = new Date()
          slotDateTime.setHours(hour, minute, 0, 0)
          
          if (slotDateTime > now) {
            availableSlots.push(slotTime)
          }
        } else {
          availableSlots.push(slotTime)
        }
      }
    }
    
    // Return the requested number of available slots
    return availableSlots.slice(0, Math.min(count, availableSlots.length))
  }

  const hasAvailableSlots = (date: Date) => {
    // Check if any doctor has available slots for this date
    for (const doctor of doctors) {
      for (const period of ['morning', 'afternoon', 'evening'] as const) {
        const availableSlots = generateTimeSlotsForDate(period, doctor.slots[period], date)
        if (availableSlots.length > 0) {
          return true
        }
      }
    }
    return false
  }
  
  const quickDates = getQuickDates()
  const days = getDaysInMonth(currentMonth)
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  
  return (
    <div className="px-4 py-6">
      {/* Quick Select */}
      <div className="mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {quickDates.map((date, index) => {
            const hasSlots = hasAvailableSlots(date)
            const isPastDate = isPast(date)
            const isDisabled = isPastDate || !hasSlots
            
            return (
              <button
                key={index}
                onClick={async () => {
                  if (!isDisabled) {
                    setLoadingDoctors(true)
                    onSelect(date)
                    // Simulate loading doctors for selected date
                    await new Promise(resolve => setTimeout(resolve, 1000))
                    setLoadingDoctors(false)
                  }
                }}
                disabled={isDisabled}
                className={cn(
                  "flex-shrink-0 px-2 py-2 rounded-xl border-2 transition-all duration-200 min-w-[60px]",
                  isSelected(date)
                    ? "border-primary bg-primary text-white"
                    : isDisabled
                      ? "border-gray-200 bg-white opacity-40 cursor-not-allowed"
                      : "border-gray-200 bg-white hover:border-gray-300"
                )}
              >
                <div className={cn(
                  "text-xs",
                  isSelected(date) ? "text-white opacity-80" : "text-muted-foreground"
                )}>
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className="text-sm font-semibold">
                  {date.getDate()}
                </div>
                <div className={cn(
                  "text-xs",
                  isSelected(date) ? "text-white opacity-80" : "text-muted-foreground"
                )}>
                  {date.toLocaleDateString('en-US', { month: 'short' })}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Doctor Listing */}
      {loadingDoctors ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary mr-3" strokeWidth={1.25} />
          <span className="text-lg text-gray-600">Loading doctors for selected date...</span>
        </div>
      ) : (
        <DoctorListing onSlotSelect={onDoctorSlotSelect} selectedDate={selected} />
      )}
      
      {/* Calendar - only show when button is clicked */}
      {showCalendar && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => {
                const newMonth = new Date(currentMonth)
                newMonth.setMonth(currentMonth.getMonth() - 1)
                setCurrentMonth(newMonth)
              }}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" strokeWidth={1.25} />
            </button>
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-4 h-4" strokeWidth={1.25} />
              {formatMonthYear(currentMonth)}
            </h3>
            <button
              onClick={() => {
                const newMonth = new Date(currentMonth)
                newMonth.setMonth(currentMonth.getMonth() + 1)
                setCurrentMonth(newMonth)
              }}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="w-4 h-4" strokeWidth={1.25} />
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, index) => (
              <div key={index} className="aspect-square">
                {date ? (
                  <button
                    onClick={() => {
                      const hasSlots = hasAvailableSlots(date)
                      const isPastDate = isPast(date)
                      if (!isPastDate && hasSlots) {
                        onSelect(date)
                        setShowCalendar(false)
                      }
                    }}
                    disabled={isPast(date) || !hasAvailableSlots(date)}
                    className={cn(
                      "w-full h-full rounded-lg text-base font-medium transition-all duration-200 relative",
                      isSelected(date)
                        ? "bg-primary text-white"
                        : isToday(date)
                          ? "bg-primary/10 text-primary border-2 border-primary"
                          : isPast(date)
                            ? "text-gray-300 cursor-not-allowed"
                            : !hasAvailableSlots(date)
                              ? "text-gray-300 cursor-not-allowed opacity-40"
                              : "hover:bg-gray-100 text-gray-700"
                    )}
                  >
                    {date.getDate()}
                    {isToday(date) && !isSelected(date) && (
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"></div>
                    )}
                  </button>
                ) : (
                  <div></div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}