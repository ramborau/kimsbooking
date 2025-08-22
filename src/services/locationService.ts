interface UserLocation {
  lat: number
  lng: number
}

interface Hospital {
  id: number
  name: string
  address: string
  coordinates: {
    lat: number
    lng: number
  }
  phone: string
  timing: string
  available: boolean
}

interface DistanceResult {
  distance: {
    text: string
    value: number // in meters
  }
  duration: {
    text: string
    value: number // in seconds
  }
  status: string
}

const GOOGLE_API_KEY = 'AIzaSyD4uqm7MrsLtKbTS0-jJrjXkvGuvyso3Tg'

// Hospital locations with coordinates
const hospitals: Hospital[] = [
  {
    id: 1,
    name: 'KIMS Main Hospital',
    address: '1-8-31/1, Minister Road, Secunderabad',
    coordinates: { lat: 17.4399, lng: 78.4983 },
    timing: '24/7',
    phone: '+91 40 4488 5000',
    available: true
  },
  {
    id: 2,
    name: 'KIMS Kondapur',
    address: 'Kondapur, Hyderabad',
    coordinates: { lat: 17.4569, lng: 78.3677 },
    timing: '8:00 AM - 10:00 PM',
    phone: '+91 40 4488 5100',
    available: true
  },
  {
    id: 3,
    name: 'KIMS Gachibowli',
    address: 'Gachibowli, Hyderabad',
    coordinates: { lat: 17.4435, lng: 78.3479 },
    timing: '8:00 AM - 8:00 PM',
    phone: '+91 40 4488 5200',
    available: true
  },
  {
    id: 4,
    name: 'KIMS Rajahmundry',
    address: 'Rajahmundry, Andhra Pradesh',
    coordinates: { lat: 17.0047, lng: 81.7777 },
    timing: '8:00 AM - 9:00 PM',
    phone: '+91 40 4488 5300',
    available: false
  }
]

export const calculateDistances = async (
  userLocation: UserLocation
): Promise<(Hospital & { distance?: DistanceResult })[]> => {
  try {
    // Create origins and destinations for Google Distance Matrix API
    const origins = [`${userLocation.lat},${userLocation.lng}`]
    const destinations = hospitals.map(h => `${h.coordinates.lat},${h.coordinates.lng}`)
    
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json?` +
      new URLSearchParams({
        origins: origins.join('|'),
        destinations: destinations.join('|'),
        mode: 'driving',
        units: 'metric',
        avoid: 'tolls',
        key: GOOGLE_API_KEY
      })
    )

    if (!response.ok) {
      throw new Error('Failed to fetch distance data')
    }

    const data = await response.json()

    if (data.status !== 'OK') {
      throw new Error(`Google API error: ${data.status}`)
    }

    // Combine hospital data with distance results
    const hospitalsWithDistances = hospitals.map((hospital, index) => {
      const element = data.rows[0]?.elements[index]
      
      return {
        ...hospital,
        distance: element && element.status === 'OK' ? {
          distance: element.distance,
          duration: element.duration,
          status: element.status
        } : undefined
      }
    })

    // Sort by travel time (duration), then by distance if duration is same
    return hospitalsWithDistances.sort((a, b) => {
      // Available hospitals first
      if (a.available && !b.available) return -1
      if (!a.available && b.available) return 1
      
      // Then sort by distance/time if both have distance data
      if (a.distance && b.distance) {
        const timeDiff = a.distance.duration.value - b.distance.duration.value
        if (timeDiff !== 0) return timeDiff
        return a.distance.distance.value - b.distance.distance.value
      }
      
      // If one has distance data and other doesn't, prioritize the one with data
      if (a.distance && !b.distance) return -1
      if (!a.distance && b.distance) return 1
      
      // Default sorting by id if no distance data
      return a.id - b.id
    })

  } catch (error) {
    console.error('Error calculating distances:', error)
    
    // Return hospitals with fallback distance calculations (straight-line distance)
    return hospitals.map(hospital => ({
      ...hospital,
      distance: {
        distance: {
          text: calculateStraightLineDistance(userLocation, hospital.coordinates) + ' km',
          value: calculateStraightLineDistance(userLocation, hospital.coordinates) * 1000
        },
        duration: {
          text: 'Est. ' + Math.round(calculateStraightLineDistance(userLocation, hospital.coordinates) * 2) + ' min',
          value: calculateStraightLineDistance(userLocation, hospital.coordinates) * 120 // rough estimate: 2 min per km
        },
        status: 'ESTIMATED'
      }
    })).sort((a, b) => {
      if (a.available && !b.available) return -1
      if (!a.available && b.available) return 1
      return (a.distance?.distance.value || 0) - (b.distance?.distance.value || 0)
    })
  }
}

// Haversine formula for straight-line distance
const calculateStraightLineDistance = (
  pos1: UserLocation,
  pos2: { lat: number; lng: number }
): number => {
  const R = 6371 // Earth's radius in kilometers
  const dLat = ((pos2.lat - pos1.lat) * Math.PI) / 180
  const dLng = ((pos2.lng - pos1.lng) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((pos1.lat * Math.PI) / 180) *
    Math.cos((pos2.lat * Math.PI) / 180) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c * 100) / 100 // Round to 2 decimal places
}

export { hospitals }
export type { Hospital, DistanceResult, UserLocation }