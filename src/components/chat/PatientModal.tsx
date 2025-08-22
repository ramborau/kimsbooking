import React, { useState } from 'react'
import { ChatModal } from './ChatModal'
import { PatientForm } from '../booking/PatientForm'

interface PatientModalProps {
  isOpen: boolean
  onSubmit: (patientData: any) => void
  initialData?: any
}

export const PatientModal: React.FC<PatientModalProps> = ({
  isOpen,
  onSubmit,
  initialData = {}
}) => {
  const [patientData, setPatientData] = useState<any>(null)
  const [isFormValid, setIsFormValid] = useState(false)

  const handlePatientFormSubmit = (data: any) => {
    setPatientData(data)
    setIsFormValid(true)
  }

  const handleSubmit = () => {
    if (patientData && isFormValid) {
      onSubmit(patientData)
    }
  }

  return (
    <ChatModal
      isOpen={isOpen}
      title="Patient Information"
      onSubmit={handleSubmit}
      submitLabel="Book Appointment"
      isSubmitDisabled={!isFormValid}
    >
      <div className="p-4">
        <PatientForm
          onSubmit={handlePatientFormSubmit}
          initialData={initialData}
        />
      </div>
    </ChatModal>
  )
}