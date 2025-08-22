import React, { useState } from 'react'
import { Sun, CloudSun, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Doctor {
  id: number
  name: string
  qualification: string
  image: string
  slots: {
    morning: number
    afternoon: number
    evening: number
  }
  languages?: string[]
}

interface DoctorListingProps {
  onDoctorSelect?: (doctor: Doctor) => void
  selectedDoctor?: Doctor | null
  onSlotSelect?: (doctor: Doctor, slot: string, period: string) => void
  selectedDate?: Date | null
}


export const DoctorListing: React.FC<DoctorListingProps> = ({ onDoctorSelect, onSlotSelect, selectedDate }) => {
  const [doctorTabs, setDoctorTabs] = useState<Record<number, 'morning' | 'afternoon' | 'evening'>>({})
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)

  // Helper function to get active tab for a doctor
  const getActiveTab = (doctorId: number) => doctorTabs[doctorId] || getFirstAvailableTab(doctors.find(d => d.id === doctorId)!, selectedDate || undefined)

  // Helper function to set active tab for a doctor
  const setActiveTabForDoctor = (doctorId: number, tab: 'morning' | 'afternoon' | 'evening') => {
    setDoctorTabs(prev => ({ ...prev, [doctorId]: tab }))
  }

  // Sample doctors data with language variations
  const doctors: Doctor[] = [
    {
      id: 1,
      name: "Dr. Rajesh Kumar",
      qualification: "MBBS, MD (Cardiology)",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTuj2a_Lkjnw0IRzGPJgasIV0HWQjiMGP4M4g&s",
      slots: {
        morning: 5,
        afternoon: 2,
        evening: 0
      },
      languages: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Flag_of_the_United_States.svg/500px-Flag_of_the_United_States.svg.png",
        "https://upload.wikimedia.org/wikipedia/en/thumb/4/41/Flag_of_India.svg/510px-Flag_of_India.svg.png",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Arabic-Language-Flag.svg/1599px-Arabic-Language-Flag.svg.png?20110729044451"
      ]
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
      },
      languages: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Flag_of_the_United_States.svg/500px-Flag_of_the_United_States.svg.png",
        "https://upload.wikimedia.org/wikipedia/en/thumb/4/41/Flag_of_India.svg/510px-Flag_of_India.svg.png"
      ]
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
      },
      languages: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Flag_of_the_United_States.svg/500px-Flag_of_the_United_States.svg.png",
        "https://upload.wikimedia.org/wikipedia/en/thumb/4/41/Flag_of_India.svg/510px-Flag_of_India.svg.png",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Bandera_de_Espa%C3%B1a.svg/2880px-Bandera_de_Espa%C3%B1a.svg.png"
      ]
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
      },
      languages: [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Flag_of_the_United_States.svg/500px-Flag_of_the_United_States.svg.png",
        "https://upload.wikimedia.org/wikipedia/en/thumb/4/41/Flag_of_India.svg/510px-Flag_of_India.svg.png",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Arabic-Language-Flag.svg/1599px-Arabic-Language-Flag.svg.png?20110729044451"
      ]
    }
  ]

  const getAvailabilityColor = (slots: number) => {
    if (slots === 0) return 'bg-red-500'
    if (slots <= 2) return 'bg-orange-500'
    return 'bg-green-500'
  }


  const tabs = [
    { id: 'morning', label: 'Morning', icon: Sun },
    { id: 'afternoon', label: 'Afternoon', icon: CloudSun },
    { id: 'evening', label: 'Evening', icon: Moon }
  ]

  const generateTimeSlots = (period: 'morning' | 'afternoon' | 'evening', count: number, selectedDate?: Date) => {
    const slots: string[] = []
    const startHour = period === 'morning' ? 9 : period === 'afternoon' ? 14 : 18
    const endHour = period === 'morning' ? 12 : period === 'afternoon' ? 17 : 21
    const now = new Date()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const isToday = selectedDate && selectedDate.toDateString() === today.toDateString()
    
    let availableSlots = []
    
    // Generate all possible slots for the period
    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === endHour && minute > 0) break // Don't go past end hour
        
        // Format time in AM/PM
        const displayHour = hour === 12 ? 12 : hour > 12 ? hour - 12 : hour
        const period = hour >= 12 ? 'PM' : 'AM'
        const slotTime = `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`
        
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

  // Calculate available slots for each period based on current time
  const getAvailableSlotsForPeriod = (doctor: Doctor, period: 'morning' | 'afternoon' | 'evening', selectedDate?: Date) => {
    const originalCount = doctor.slots[period]
    const availableSlots = generateTimeSlots(period, originalCount, selectedDate)
    return availableSlots.length
  }

  // Get the first available tab for a doctor
  const getFirstAvailableTab = (doctor: Doctor, selectedDate?: Date): 'morning' | 'afternoon' | 'evening' => {
    const periods: ('morning' | 'afternoon' | 'evening')[] = ['morning', 'afternoon', 'evening']
    for (const period of periods) {
      if (getAvailableSlotsForPeriod(doctor, period, selectedDate) > 0) {
        return period
      }
    }
    return 'morning' // fallback
  }

  return (
    <div style={{ padding: 0 }}>
      <div className="space-y-4">
        {doctors.map((doctor) => {
          const isSelected = selectedDoctorId === doctor.id
          return (
          <div
            key={doctor.id}
            className={cn(
              "w-full rounded-2xl border-2 transition-all duration-200 text-left group relative bg-white",
              isSelected
                ? "border-primary shadow-lg"
                : "border-gray-200 hover:border-gray-300 hover:shadow-md active:scale-[0.99]"
            )}
            style={{ padding: 0 }}
          >
            {/* Doctor Info - Side by side layout */}
            <div style={{ marginBottom: 0 }}>
              <div className="flex items-center gap-3" style={{ padding: "10px", margin: 0 }}>
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                  <img 
                    src={doctor.image} 
                    alt={doctor.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900 text-lg leading-tight">
                      {doctor.name}
                    </h3>
                    {doctor.languages && doctor.languages.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600">Speaks</span>
                        <div className="flex gap-1">
                          {doctor.languages.map((flag, index) => (
                            <div key={index} className="w-5 h-3.5 rounded-sm overflow-hidden">
                              <img 
                                src={flag} 
                                alt={`Language ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {doctor.qualification}
                  </p>
                </div>
              </div>
            </div>

            {/* Time Period Tabs */}
            <div className="w-full flex" style={{ padding: "0px 10px", borderRadius: 0 }}>
              {tabs.map((tab, tabIndex) => {
                const TabIcon = tab.icon
                const availableSlots = getAvailableSlotsForPeriod(doctor, tab.id as 'morning' | 'afternoon' | 'evening', selectedDate || undefined)
                const isActiveForThisDoctor = getActiveTab(doctor.id) === tab.id
                const isDisabled = availableSlots === 0
                const isFirst = tabIndex === 0
                const isLast = tabIndex === tabs.length - 1
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => !isDisabled && setActiveTabForDoctor(doctor.id, tab.id as 'morning' | 'afternoon' | 'evening')}
                    disabled={isDisabled}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm transition-all duration-200",
                      isDisabled
                        ? "text-gray-400 cursor-not-allowed opacity-50"
                        : isActiveForThisDoctor
                          ? "text-gray-900 font-bold"
                          : "text-gray-600 hover:text-gray-900 font-medium"
                    )}
                    style={{
                      borderRadius: isFirst ? "8px 0 0 8px" : isLast ? "0 8px 8px 0" : 0,
                      ...(isActiveForThisDoctor ? {
                        border: "1px solid #be272c"
                      } : {})
                    }}
                  >
                    <TabIcon className="w-4 h-4" strokeWidth={1.25} />
                    <span>{tab.label}</span>
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      getAvailabilityColor(availableSlots)
                    )}></div>
                  </button>
                )
              })}
            </div>

            {/* Time Slots */}
            <div className="space-y-2">
              {(() => {
                const currentActiveTab = getActiveTab(doctor.id)
                const availableSlots = generateTimeSlots(currentActiveTab, doctor.slots[currentActiveTab], selectedDate || undefined)
                return availableSlots.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2" style={{ padding: "10px" }}>
                    {availableSlots.map((time, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedDoctorId(doctor.id)
                          setSelectedSlot(`${doctor.id}-${currentActiveTab}-${time}`)
                          onDoctorSelect?.(doctor)
                          onSlotSelect?.(doctor, time, currentActiveTab)
                        }}
                        className={cn(
                          "px-3 py-2 text-sm border rounded-lg transition-colors whitespace-nowrap",
                          selectedSlot === `${doctor.id}-${currentActiveTab}-${time}`
                            ? "border-primary bg-primary text-white"
                            : "border-gray-200 hover:border-primary hover:bg-primary/5"
                        )}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2" style={{ padding: "10px" }}>
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div
                        key={index}
                        className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed"
                      >
                        No Slot
                      </div>
                    ))}
                  </div>
                )
              })()}
            </div>
          </div>
          )
        })}
      </div>
    </div>
  )
}