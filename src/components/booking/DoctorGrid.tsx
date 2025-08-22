import React from 'react'
import { Star, Award, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

const doctors = [
  {
    id: 1,
    name: 'Dr. Rajesh Kumar',
    degree: 'MBBS, MD (Cardiology)',
    experience: '15+ years',
    rating: 4.9,
    reviews: 245,
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=doctor1&backgroundColor=b6e3f4',
    available: true,
    nextSlot: '10:30 AM'
  },
  {
    id: 2,
    name: 'Dr. Priya Sharma',
    degree: 'MBBS, DM (Cardiology)',
    experience: '12+ years',
    rating: 4.8,
    reviews: 189,
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=doctor2&backgroundColor=ffd5dc',
    available: true,
    nextSlot: '11:00 AM'
  },
  {
    id: 3,
    name: 'Dr. Amit Verma',
    degree: 'MBBS, MD, FACC',
    experience: '20+ years',
    rating: 4.9,
    reviews: 412,
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=doctor3&backgroundColor=c0aede',
    available: false,
    nextSlot: 'Tomorrow'
  },
  {
    id: 4,
    name: 'Dr. Sneha Patel',
    degree: 'MBBS, MD (Medicine)',
    experience: '8+ years',
    rating: 4.7,
    reviews: 156,
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=doctor4&backgroundColor=ffd5dc',
    available: true,
    nextSlot: '2:00 PM'
  },
  {
    id: 5,
    name: 'Dr. Vikram Singh',
    degree: 'MBBS, MS, MCh',
    experience: '18+ years',
    rating: 4.9,
    reviews: 523,
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=doctor5&backgroundColor=b6e3f4',
    available: true,
    nextSlot: '3:30 PM'
  },
  {
    id: 6,
    name: 'Dr. Anita Reddy',
    degree: 'MBBS, DNB',
    experience: '10+ years',
    rating: 4.8,
    reviews: 201,
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=doctor6&backgroundColor=ffd5dc',
    available: true,
    nextSlot: '4:00 PM'
  }
]

interface DoctorGridProps {
  onSelect: (doctor: any) => void
  selected?: number | null
}

export const DoctorGrid: React.FC<DoctorGridProps> = ({ onSelect, selected }) => {
  return (
    <div className="grid grid-cols-2 gap-3 px-4 py-6">
      {doctors.map((doctor) => {
        const isSelected = selected === doctor.id
        
        return (
          <button
            key={doctor.id}
            onClick={() => doctor.available && onSelect(doctor)}
            disabled={!doctor.available}
            className={cn(
              "relative p-4 rounded-2xl border-2 transition-all duration-200 text-left group",
              isSelected 
                ? "border-primary bg-primary/5 shadow-sm" 
                : doctor.available
                  ? "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm active:scale-[0.98]"
                  : "border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed"
            )}
          >
            {isSelected && (
              <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center z-10">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
            
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full overflow-hidden mb-3 ring-2 ring-gray-100">
                <img 
                  src={doctor.image} 
                  alt={doctor.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <h3 className="font-semibold text-base text-gray-900 text-center mb-1">
                {doctor.name}
              </h3>
              
              <p className="text-sm text-muted-foreground text-center mb-2 line-clamp-2">
                {doctor.degree}
              </p>
              
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-0.5">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" strokeWidth={1.25} />
                  <span className="text-sm font-medium">{doctor.rating}</span>
                </div>
                <span className="text-sm text-muted-foreground">({doctor.reviews})</span>
              </div>
              
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                <Award className="w-3 h-3" strokeWidth={1.25} />
                <span>{doctor.experience}</span>
              </div>
              
              {doctor.available && (
                <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                  <Clock className="w-3 h-3" strokeWidth={1.25} />
                  <span>{doctor.nextSlot}</span>
                </div>
              )}
              
              {!doctor.available && (
                <div className="text-sm text-red-600 font-medium">
                  Not Available Today
                </div>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}