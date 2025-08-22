import React, { useMemo } from 'react'
import { 
  Heart, Brain, Bone, Eye, Baby, Stethoscope, Activity, Pill, MapPin, Users, Search,
  Zap, Scissors, Microscope, Waves, Shield, Moon, Flame, Droplets, Wind
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'

const departments = [
  { id: 1, name: 'Cardiology', icon: Heart, description: 'Heart & Vascular', locations: 3, doctors: 12 },
  { id: 2, name: 'Neurology', icon: Brain, description: 'Brain & Nervous System', locations: 2, doctors: 8 },
  { id: 3, name: 'Orthopedics', icon: Bone, description: 'Bones & Joints', locations: 3, doctors: 15 },
  { id: 4, name: 'Ophthalmology', icon: Eye, description: 'Eye Care', locations: 2, doctors: 6 },
  { id: 5, name: 'Pediatrics', icon: Baby, description: 'Child Health', locations: 3, doctors: 10 },
  { id: 6, name: 'General Medicine', icon: Stethoscope, description: 'Primary Care', locations: 4, doctors: 20 },
  { id: 7, name: 'Emergency', icon: Activity, description: '24/7 Care', locations: 2, doctors: 5 },
  { id: 8, name: 'Pharmacy', icon: Pill, description: 'Medications', locations: 4, doctors: 3 },
  { id: 9, name: 'Dermatology', icon: Shield, description: 'Skin & Hair Care', locations: 2, doctors: 7 },
  { id: 10, name: 'Surgery', icon: Scissors, description: 'Surgical Procedures', locations: 3, doctors: 18 },
  { id: 11, name: 'Pathology', icon: Microscope, description: 'Lab & Diagnostics', locations: 4, doctors: 5 },
  { id: 12, name: 'Radiology', icon: Waves, description: 'Medical Imaging', locations: 3, doctors: 9 },
  { id: 13, name: 'Psychiatry', icon: Moon, description: 'Mental Health', locations: 2, doctors: 6 },
  { id: 14, name: 'Gastroenterology', icon: Droplets, description: 'Digestive System', locations: 2, doctors: 4 },
  { id: 15, name: 'Pulmonology', icon: Wind, description: 'Lung & Respiratory', locations: 2, doctors: 5 },
  { id: 16, name: 'Oncology', icon: Zap, description: 'Cancer Treatment', locations: 1, doctors: 8 },
  { id: 17, name: 'Urology', icon: Droplets, description: 'Kidney & Urinary', locations: 2, doctors: 6 },
  { id: 18, name: 'Physiotherapy', icon: Flame, description: 'Physical Therapy', locations: 3, doctors: 12 },
]

interface DepartmentSelectProps {
  onSelect: (department: any) => void
  selected?: number | null
  searchQuery?: string
  onSearchChange?: (query: string) => void
}

export const DepartmentSelect: React.FC<DepartmentSelectProps> = ({ 
  onSelect, 
  selected, 
  searchQuery = '',
  onSearchChange
}) => {
  const searchRef = React.useRef<HTMLInputElement>(null)
  
  const filteredDepartments = useMemo(() => {
    if (!searchQuery.trim()) return departments
    
    return departments.filter(dept =>
      dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])
  
  return (
    <div className="px-4 py-6">
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" strokeWidth={1.25} />
          <Input
            ref={searchRef}
            placeholder="Search departments..."
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="pl-10 h-12 bg-gray-50 border-gray-300 focus:bg-white focus:border-primary"
          />
        </div>
        {searchQuery && (
          <p className="text-sm text-gray-500 mt-2">
            Found {filteredDepartments.length} department{filteredDepartments.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      
      {/* Department List */}
      <div className="space-y-3">
        {filteredDepartments.length > 0 ? (
          filteredDepartments.map((dept) => {
            const Icon = dept.icon
            const isSelected = selected === dept.id
            
            return (
              <button
                key={dept.id}
                onClick={() => onSelect(dept)}
                className={cn(
                  "w-full p-3 rounded-xl border transition-all duration-200 group active:scale-[0.99]",
                  isSelected 
                    ? "bg-primary border-primary" 
                    : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                    isSelected
                      ? "bg-white/20 border border-white/30"
                      : "bg-primary/10 border border-primary"
                  )}>
                    <Icon className={cn(
                      "w-6 h-6",
                      isSelected ? "text-white" : "text-primary"
                    )} strokeWidth={1.25} />
                  </div>
                  
                  <div className="flex-1 text-left">
                    <h3 className={cn(
                      "font-semibold text-base mb-0.5",
                      isSelected ? "text-white" : "text-gray-900"
                    )}>
                      {dept.name}
                    </h3>
                    <p className={cn(
                      "text-sm",
                      isSelected ? "text-white/80" : "text-muted-foreground"
                    )}>
                      {dept.description}
                    </p>
                  </div>
                  
                  <div className="flex flex-col gap-1 text-right">
                    <div className={cn(
                      "flex items-center gap-1 text-sm",
                      isSelected ? "text-white/90" : "text-gray-600"
                    )}>
                      <MapPin className="w-3 h-3" strokeWidth={1.25} />
                      <span>{dept.locations} Locations</span>
                    </div>
                    <div className={cn(
                      "flex items-center gap-1 text-sm",
                      isSelected ? "text-white/90" : "text-gray-600"
                    )}>
                      <Users className="w-3 h-3" strokeWidth={1.25} />
                      <span>{dept.doctors} Doctors</span>
                    </div>
                  </div>
                </div>
              </button>
            )
          })
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6 text-gray-400" strokeWidth={1.25} />
            </div>
            <p className="text-gray-500 text-base">No departments found</p>
            <p className="text-gray-400 text-sm mt-1">Try searching with different keywords</p>
          </div>
        )}
      </div>
    </div>
  )
}