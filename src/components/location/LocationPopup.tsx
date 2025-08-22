import React, { useState } from 'react'
import { MapPin, Navigation, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LocationPopupProps {
  isVisible: boolean
  onLocationGranted: (location: { lat: number; lng: number }) => void
  onLocationDenied: () => void
}

export const LocationPopup: React.FC<LocationPopupProps> = ({
  isVisible,
  onLocationGranted,
  onLocationDenied
}) => {
  const [isRequesting, setIsRequesting] = useState(false)

  const requestLocation = () => {
    console.log('=== Location request initiated ===')
    console.log('User agent:', navigator.userAgent)
    console.log('Protocol:', window.location.protocol)
    console.log('Host:', window.location.host)
    
    if (!navigator.geolocation) {
      console.error('Geolocation not supported')
      alert('Geolocation is not supported by this browser.')
      onLocationDenied()
      return
    }

    console.log('Geolocation API is available')
    setIsRequesting(true)

    // Check permissions first
    if ('permissions' in navigator) {
      console.log('Checking permissions...')
      navigator.permissions.query({ name: 'geolocation' as PermissionName }).then((result) => {
        console.log('Current geolocation permission state:', result.state)
        
        if (result.state === 'denied') {
          console.log('Permission already denied')
          alert('Location access is permanently denied. Please go to browser settings, reset permissions for this site, and refresh the page.')
          setIsRequesting(false)
          onLocationDenied()
          return
        }

        // If permission is granted or prompt, proceed with location request
        console.log('Proceeding with location request...')
        makeLocationRequest()
        
      }).catch((err) => {
        console.log('Permissions API error:', err)
        // Fallback to direct location request
        makeLocationRequest()
      })
    } else {
      console.log('Permissions API not available, making direct request')
      makeLocationRequest()
    }
  }

  const makeLocationRequest = () => {
    console.log('Making geolocation request...')
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('✅ Location received successfully!')
        console.log('Coords:', {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        })
        
        setIsRequesting(false)
        onLocationGranted({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
      },
      (error) => {
        console.error('❌ Location error occurred')
        console.error('Error code:', error.code)
        console.error('Error message:', error.message)
        console.error('Full error:', error)
        
        let errorMessage = 'Unable to get your location.\n\n'
        switch (error.code) {
          case 1: // PERMISSION_DENIED
            errorMessage += '🚫 Permission Denied: You blocked location access.\n\nTo fix:\n1. Click the location icon in your browser\'s address bar\n2. Select "Allow"\n3. Refresh the page'
            break
          case 2: // POSITION_UNAVAILABLE
            errorMessage += '📍 Position Unavailable: Your device cannot determine your location.'
            break
          case 3: // TIMEOUT
            errorMessage += '⏱️ Timeout: Location request took too long.'
            break
          default:
            errorMessage += '❓ Unknown error occurred.'
            break
        }
        
        alert(errorMessage)
        setIsRequesting(false)
        onLocationDenied()
      },
      {
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 0
      }
    )
  }

  const handleDeny = () => {
    onLocationDenied()
  }

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
            <MapPin className="w-8 h-8 text-primary" strokeWidth={1.25} />
          </div>
          
          {/* Content */}
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Find Nearby Hospitals
            </h3>
            <p className="text-gray-600 text-base leading-relaxed">
              Allow location access to see nearby hospitals sorted by distance with accurate travel times
            </p>
          </div>
          
          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={requestLocation}
              disabled={isRequesting}
              className="w-full h-12 text-base font-medium bg-primary hover:bg-primary/90 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isRequesting ? (
                <>
                  <Navigation className="w-4 h-4 animate-pulse" strokeWidth={1.25} />
                  Getting location...
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4" strokeWidth={1.25} />
                  Allow Location
                </>
              )}
            </button>
            <button
              onClick={handleDeny}
              disabled={isRequesting}
              className="w-full h-12 text-base font-medium border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Deny
            </button>
          </div>
          
          {/* Privacy note */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              We only use your location to show nearby hospitals. Not stored or shared.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}