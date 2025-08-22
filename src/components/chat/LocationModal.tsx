import React, { useState } from 'react'
import { ChatModal } from './ChatModal'
import { LocationSelect } from '../booking/LocationSelect'

interface LocationModalProps {
  isOpen: boolean
  onSelect: (location: any) => void
  selected?: number
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onSelect,
  selected: _selected
}) => {
  const [selectedLocation, setSelectedLocation] = useState<any>(null)

  const handleLocationSelect = (location: any) => {
    setSelectedLocation(location)
  }

  const handleSubmit = () => {
    if (selectedLocation) {
      onSelect(selectedLocation)
    }
  }

  return (
    <ChatModal
      isOpen={isOpen}
      title="Select Hospital Location"
      onSubmit={handleSubmit}
      submitLabel="Continue"
      isSubmitDisabled={!selectedLocation}
    >
      <div className="p-4">
        <LocationSelect
          onSelect={handleLocationSelect}
          selected={selectedLocation?.id}
          userLocation={null}
        />
      </div>
    </ChatModal>
  )
}