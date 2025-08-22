import React, { useState, useEffect } from 'react'
import { MapPin, Navigation, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface LocationPermissionProps {
  onLocationGranted: (location: { lat: number; lng: number }) => void
  onSkip: () => void
}

export const LocationPermission: React.FC<LocationPermissionProps> = ({ onLocationGranted, onSkip }) => {
  const [status, setStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied' | 'error'>('idle')
  const [error, setError] = useState<string>('')

  // Clear any cached location data on component mount
  useEffect(() => {
    // Clear localStorage if it contains any location data
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.includes('location') || key.includes('geolocation') || key.includes('position'))) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key))
  }, [])

  const requestLocation = async () => {
    if (!navigator.geolocation) {
      setStatus('error')
      setError('Geolocation is not supported by this browser')
      return
    }

    setStatus('requesting')
    setError('')

    // Clear any existing permissions and cache
    try {
      // Check if permissions API is available
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName })
        console.log('Current permission state:', permission.state)
      }
    } catch (err) {
      console.log('Permissions API not available')
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setStatus('granted')
        onLocationGranted({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
      },
      (error) => {
        setStatus('denied')
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError('Location access denied. Please refresh the page and allow location access, or check your browser settings.')
            break
          case error.POSITION_UNAVAILABLE:
            setError('Location information is unavailable.')
            break
          case error.TIMEOUT:
            setError('Location request timed out. Please try again.')
            break
          default:
            setError('An unknown error occurred while retrieving location.')
            break
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0 // Never use cached location
      }
    )
  }

  return (
    <div className="px-4 py-8">
      <div className="max-w-md mx-auto text-center">
        {/* Icon */}
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          {status === 'requesting' ? (
            <Loader2 className="w-10 h-10 text-primary animate-spin" strokeWidth={1.25} />
          ) : status === 'granted' ? (
            <Navigation className="w-10 h-10 text-primary" strokeWidth={1.25} />
          ) : status === 'denied' || status === 'error' ? (
            <AlertCircle className="w-10 h-10 text-red-500" strokeWidth={1.25} />
          ) : (
            <MapPin className="w-10 h-10 text-primary" strokeWidth={1.25} />
          )}
        </div>

        {/* Title and Description */}
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          {status === 'granted' ? 'Location Found!' : 'Find Nearby Hospitals'}
        </h2>
        
        <p className="text-gray-600 mb-8 leading-relaxed">
          {status === 'granted' 
            ? 'Great! We\'ll show you the nearest hospitals with accurate distances and travel times.'
            : status === 'denied' || status === 'error'
              ? error
              : 'Allow location access to see nearby hospitals sorted by distance and get accurate travel times by car.'
          }
        </p>

        {/* Action Buttons */}
        <div className="space-y-4">
          {status === 'idle' && (
            <>
              <Button
                onClick={requestLocation}
                className="w-full h-14 bg-primary hover:bg-primary/90 text-base font-medium"
              >
                <MapPin className="w-5 h-5 mr-2" strokeWidth={1.25} />
                Allow Location Access
              </Button>
              <Button
                onClick={onSkip}
                variant="outline"
                className="w-full h-12 text-sm"
              >
                Skip for now
              </Button>
            </>
          )}
          
          {status === 'requesting' && (
            <div className="flex items-center justify-center gap-3 text-primary">
              <Loader2 className="w-5 h-5 animate-spin" strokeWidth={1.25} />
              <span className="text-base font-medium">Getting your location...</span>
            </div>
          )}

          {(status === 'denied' || status === 'error') && (
            <>
              <Button
                onClick={requestLocation}
                className="w-full h-14 bg-primary hover:bg-primary/90 text-base font-medium"
              >
                <MapPin className="w-5 h-5 mr-2" strokeWidth={1.25} />
                Try Again
              </Button>
              <Button
                onClick={onSkip}
                variant="outline"
                className="w-full h-12 text-sm"
              >
                Continue without location
              </Button>
            </>
          )}

          {status === 'granted' && (
            <div className="flex items-center justify-center gap-2 text-green-600">
              <Navigation className="w-5 h-5" strokeWidth={1.25} />
              <span className="text-base font-medium">Location accessed successfully</span>
            </div>
          )}
        </div>

        {/* Privacy Note */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 leading-relaxed">
            <AlertCircle className="w-4 h-4 inline mr-1" strokeWidth={1.25} />
            We only use your location to calculate distances to hospitals. Your location is not stored or shared.
          </p>
        </div>
      </div>
    </div>
  )
}