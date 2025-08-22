import React, { useState } from 'react'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DateSelectionPopupProps {
  isVisible: boolean
  onDateSelected: (date: Date) => void
  onClose: () => void
  selectedDate?: Date | null
}

export const DateSelectionPopup: React.FC<DateSelectionPopupProps> = ({
  isVisible,
  onDateSelected,
  onClose,
  selectedDate
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  
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
    return selectedDate && date.toDateString() === selectedDate.toDateString()
  }

  const handleDateSelect = (date: Date) => {
    if (!isPast(date)) {
      onDateSelected(date)
      onClose()
    }
  }

  const days = getDaysInMonth(currentMonth)
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  if (!isVisible) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-50 transition-opacity duration-300" />
      
      {/* Popup */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 z-50 bg-white transition-transform duration-300 ease-out",
        "rounded-t-[30px] shadow-2xl",
        isVisible ? "translate-y-0" : "translate-y-full"
      )}>
        <div className="px-6 py-8 relative">
          {/* Handle bar */}
          <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6"></div>
          
          {/* Icon */}
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-primary" strokeWidth={1.25} />
          </div>
          
          {/* Content */}
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Select Appointment Date
            </h3>
            <p className="text-gray-600 text-base leading-relaxed">
              Choose any future date for your appointment
            </p>
          </div>
          
          {/* Calendar */}
          <div className="bg-gray-50 rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => {
                  const newMonth = new Date(currentMonth)
                  newMonth.setMonth(currentMonth.getMonth() - 1)
                  setCurrentMonth(newMonth)
                }}
                className="p-2 rounded-lg hover:bg-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" strokeWidth={1.25} />
              </button>
              <h3 className="font-semibold text-gray-900 text-lg">
                {formatMonthYear(currentMonth)}
              </h3>
              <button
                onClick={() => {
                  const newMonth = new Date(currentMonth)
                  newMonth.setMonth(currentMonth.getMonth() + 1)
                  setCurrentMonth(newMonth)
                }}
                className="p-2 rounded-lg hover:bg-white transition-colors"
              >
                <ChevronRight className="w-5 h-5" strokeWidth={1.25} />
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
                      onClick={() => handleDateSelect(date)}
                      disabled={isPast(date)}
                      className={cn(
                        "w-full h-full rounded-lg text-base font-medium transition-all duration-200 relative",
                        isSelected(date)
                          ? "bg-primary text-white"
                          : isToday(date)
                            ? "bg-primary/10 text-primary border-2 border-primary"
                            : isPast(date)
                              ? "text-gray-300 cursor-not-allowed"
                              : "hover:bg-white text-gray-700"
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
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full h-12 text-base font-medium border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </>
  )
}