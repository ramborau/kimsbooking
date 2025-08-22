import React, { useState } from 'react'
import { ChatModal } from './ChatModal'
import { DatePicker } from '../booking/DatePicker'

interface DateTimeModalProps {
  isOpen: boolean
  onSelect: (doctor: any, slot: string, date: Date | null) => void
  selectedDate?: Date | null
}

export const DateTimeModal: React.FC<DateTimeModalProps> = ({
  isOpen,
  onSelect,
  selectedDate
}) => {
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null)
  const [selectedSlot, setSelectedSlot] = useState<string>('')
  const [currentDate, setCurrentDate] = useState<Date | null>(selectedDate || null)

  const handleDateSelect = (date: Date | null) => {
    setCurrentDate(date)
  }

  const handleDoctorSlotSelect = (doctor: any, slot: string, _period: string) => {
    setSelectedDoctor(doctor)
    setSelectedSlot(slot)
  }

  const handleSubmit = () => {
    if (selectedDoctor && selectedSlot && currentDate) {
      onSelect(selectedDoctor, selectedSlot, currentDate)
    }
  }

  const formatSelectedDate = () => {
    if (!currentDate) return 'No date selected'
    return currentDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  return (
    <ChatModal
      isOpen={isOpen}
      title="Select Date & Time"
      onSubmit={handleSubmit}
      submitLabel="Continue"
      isSubmitDisabled={!selectedDoctor || !selectedSlot || !currentDate}
    >
      <div className="p-4">
        {currentDate && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm font-semibold text-blue-800">
              Selected Date: {formatSelectedDate()}
            </div>
          </div>
        )}
        <DatePicker
          onSelect={handleDateSelect}
          selected={currentDate}
          popupSelectedDate={null}
          onDoctorSlotSelect={handleDoctorSlotSelect}
        />
      </div>
    </ChatModal>
  )
}