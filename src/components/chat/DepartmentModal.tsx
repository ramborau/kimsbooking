import React, { useState } from 'react'
import { ChatModal } from './ChatModal'
import { DepartmentSelect } from '../booking/DepartmentSelect'

interface DepartmentModalProps {
  isOpen: boolean
  onSelect: (department: any) => void
  selected?: number
}

export const DepartmentModal: React.FC<DepartmentModalProps> = ({
  isOpen,
  onSelect,
  selected: _selected
}) => {
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const handleDepartmentSelect = (dept: any) => {
    setSelectedDepartment(dept)
  }

  const handleSubmit = () => {
    if (selectedDepartment) {
      onSelect(selectedDepartment)
    }
  }

  return (
    <ChatModal
      isOpen={isOpen}
      title="Select Medical Department"
      onSubmit={handleSubmit}
      submitLabel="Continue"
      isSubmitDisabled={!selectedDepartment}
    >
      <div className="p-4">
        <DepartmentSelect
          onSelect={handleDepartmentSelect}
          selected={selectedDepartment?.id}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>
    </ChatModal>
  )
}