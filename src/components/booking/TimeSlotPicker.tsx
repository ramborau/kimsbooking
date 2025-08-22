import React, { useState } from 'react'
import { Sun, Cloud, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'

const timeSlots = {
  morning: [
    { time: '9:00 AM', available: true },
    { time: '9:30 AM', available: true },
    { time: '10:00 AM', available: false },
    { time: '10:30 AM', available: true },
    { time: '11:00 AM', available: true },
    { time: '11:30 AM', available: false },
  ],
  afternoon: [
    { time: '12:00 PM', available: true },
    { time: '12:30 PM', available: true },
    { time: '1:00 PM', available: false },
    { time: '1:30 PM', available: true },
    { time: '2:00 PM', available: true },
    { time: '2:30 PM', available: true },
    { time: '3:00 PM', available: false },
    { time: '3:30 PM', available: true },
    { time: '4:00 PM', available: true },
  ],
  evening: [
    { time: '5:00 PM', available: true },
    { time: '5:30 PM', available: false },
    { time: '6:00 PM', available: true },
    { time: '6:30 PM', available: true },
    { time: '7:00 PM', available: true },
    { time: '7:30 PM', available: false },
    { time: '8:00 PM', available: true },
  ]
}

interface TimeSlotPickerProps {
  onSelect: (time: string) => void
  selected?: string | null
}

export const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({ onSelect, selected }) => {
  const [activeTab, setActiveTab] = useState<'morning' | 'afternoon' | 'evening'>('morning')
  
  const tabs = [
    { id: 'morning' as const, label: 'Morning', icon: Sun, color: 'text-orange-500' },
    { id: 'afternoon' as const, label: 'Afternoon', icon: Cloud, color: 'text-blue-500' },
    { id: 'evening' as const, label: 'Evening', icon: Moon, color: 'text-indigo-500' },
  ]
  
  return (
    <div className="px-4 py-6">
      {/* Time Period Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 py-3 px-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-center gap-2",
                activeTab === tab.id
                  ? "border-primary bg-primary text-white"
                  : "border-gray-200 bg-white hover:border-gray-300"
              )}
            >
              <Icon 
                className={cn(
                  "w-4 h-4",
                  activeTab === tab.id ? "text-white" : tab.color
                )} 
                strokeWidth={1.25} 
              />
              <span className="text-base font-medium">{tab.label}</span>
            </button>
          )
        })}
      </div>
      
      {/* Time Slots Grid */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <h3 className="text-base font-semibold text-gray-700 mb-4">
          Available Slots
        </h3>
        
        <div className="grid grid-cols-3 gap-2">
          {timeSlots[activeTab].map((slot) => (
            <button
              key={slot.time}
              onClick={() => slot.available && onSelect(slot.time)}
              disabled={!slot.available}
              className={cn(
                "py-3 px-4 rounded-xl text-base font-medium transition-all duration-200",
                selected === slot.time
                  ? "bg-primary text-white border-2 border-primary"
                  : slot.available
                    ? "bg-gray-50 hover:bg-gray-100 border-2 border-gray-200 hover:border-gray-300 text-gray-700"
                    : "bg-gray-50 text-gray-300 border-2 border-gray-100 cursor-not-allowed line-through"
              )}
            >
              {slot.time}
            </button>
          ))}
        </div>
        
        <div className="mt-4 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gray-50 border-2 border-gray-200"></div>
            <span className="text-gray-600">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-primary"></div>
            <span className="text-gray-600">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gray-50 border-2 border-gray-100 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-[1px] bg-gray-300"></div>
              </div>
            </div>
            <span className="text-gray-600">Booked</span>
          </div>
        </div>
      </div>
    </div>
  )
}