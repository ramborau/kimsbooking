import { create } from 'zustand'

interface UserLocation {
  lat: number
  lng: number
}

interface BookingState {
  currentStep: number
  userLocation: UserLocation | null
  locationPermissionAsked: boolean
  bookingData: {
    department: any | null
    location: any | null
    date: Date | null
    doctor: any | null
    timeSlot: string | null
    patient: any | null
  }
  setCurrentStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  setUserLocation: (location: UserLocation) => void
  setLocationPermissionAsked: (asked: boolean) => void
  setDepartment: (department: any) => void
  setLocation: (location: any) => void
  setDate: (date: Date) => void
  setDoctor: (doctor: any) => void
  setTimeSlot: (timeSlot: string) => void
  setPatient: (patient: any) => void
  resetBooking: () => void
}

export const useBookingStore = create<BookingState>((set) => ({
  currentStep: 1,
  userLocation: null,
  locationPermissionAsked: false,
  bookingData: {
    department: null,
    location: null,
    date: null,
    doctor: null,
    timeSlot: null,
    patient: null,
  },
  setCurrentStep: (step) => set({ currentStep: step }),
  nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 7) })),
  prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),
  setUserLocation: (userLocation) => set({ userLocation }),
  setLocationPermissionAsked: (locationPermissionAsked) => set({ locationPermissionAsked }),
  setDepartment: (department) => set((state) => ({ 
    bookingData: { ...state.bookingData, department } 
  })),
  setLocation: (location) => set((state) => ({ 
    bookingData: { ...state.bookingData, location } 
  })),
  setDate: (date) => set((state) => ({ 
    bookingData: { ...state.bookingData, date } 
  })),
  setDoctor: (doctor) => set((state) => ({ 
    bookingData: { ...state.bookingData, doctor } 
  })),
  setTimeSlot: (timeSlot) => set((state) => ({ 
    bookingData: { ...state.bookingData, timeSlot } 
  })),
  setPatient: (patient) => set((state) => ({ 
    bookingData: { ...state.bookingData, patient } 
  })),
  resetBooking: () => set({ 
    currentStep: 1,
    userLocation: null,
    locationPermissionAsked: false,
    bookingData: {
      department: null,
      location: null,
      date: null,
      doctor: null,
      timeSlot: null,
      patient: null,
    }
  }),
}))