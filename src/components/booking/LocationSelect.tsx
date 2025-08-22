import React, { useState, useEffect } from 'react'
import { MapPin, Clock, Loader2, Car, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { calculateDistances, type Hospital, type UserLocation } from '@/services/locationService'

interface LocationSelectProps {
  onSelect: (location: any) => void
  selected?: number | null
  userLocation?: UserLocation | null
}

export const LocationSelect: React.FC<LocationSelectProps> = ({ onSelect, selected, userLocation }) => {
  const [locations, setLocations] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadLocations = async () => {
      if (userLocation) {
        setLoading(true)
        try {
          const hospitalsWithDistances = await calculateDistances(userLocation)
          setLocations(hospitalsWithDistances)
        } catch (error) {
          console.error('Failed to load hospital distances:', error)
          // Fallback to default hospitals if calculation fails
          const { hospitals } = await import('@/services/locationService')
          setLocations(hospitals)
        } finally {
          setLoading(false)
        }
      } else {
        // Load default hospitals without distance calculation
        const { hospitals } = await import('@/services/locationService')
        setLocations(hospitals)
      }
    }

    loadLocations()
  }, [userLocation])

  return (
    <div className="px-4 py-6">
      
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" strokeWidth={1.25} />
          <span className="text-base text-gray-600">Calculating distances...</span>
        </div>
      )}
      
      <div className="space-y-4">
        {locations.filter(location => location.available).map((location) => {
          const isSelected = selected === location.id
          const distance = (location as any).distance
          
          return (
            <button
              key={location.id}
              onClick={() => onSelect(location)}
              className={cn(
                "w-full p-5 rounded-2xl border-2 transition-all duration-200 text-left group relative",
                isSelected 
                  ? "border-primary bg-primary/5 shadow-lg" 
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md active:scale-[0.99]"
              )}
            >
              
              {/* Hospital Name and Address */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-900 text-lg leading-tight">
                    {location.name}
                  </h3>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 text-base text-gray-600">
                    <MapPin className="w-4 h-4 flex-shrink-0" strokeWidth={1.25} />
                    <span>{location.address.split(',').pop()?.trim() || location.address}</span>
                  </div>
                  {userLocation && distance && (
                    <div className="flex items-center gap-2 text-base text-gray-600">
                      <Car className="w-4 h-4 flex-shrink-0" strokeWidth={1.25} />
                      <span>
                        {Math.round(distance.duration.value / 60)} Mins
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Key Information Grid */}
              <div className="space-y-3">
                {/* Top Row - Hours and Additional Info */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Opening Hours */}
                  <div className="flex items-center gap-3 rounded-lg">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      isSelected ? "bg-primary" : "bg-[#f6f0f1]"
                    )}>
                      <Clock className={cn(
                        "w-4 h-4",
                        isSelected ? "text-white" : "text-primary"
                      )} strokeWidth={1.25} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Hours</p>
                      <p className="text-xs font-semibold text-gray-900">
                        {location.timing}
                      </p>
                    </div>
                  </div>
                  
                  {/* Next Slot */}
                  <div className="flex items-center gap-2 rounded-lg">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      isSelected ? "bg-primary" : "bg-[#f6f0f1]"
                    )}>
                      <Calendar className={cn(
                        "w-4 h-4",
                        isSelected ? "text-white" : "text-primary"
                      )} strokeWidth={1.25} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Next Slot</p>
                      <p className="text-xs font-semibold text-gray-900">25 Aug | 14:30</p>
                    </div>
                  </div>
                </div>
                
              </div>
              
            </button>
          )
        })}
      </div>
    </div>
  )
}