import React, { useEffect, useState } from 'react'
import { ChevronLeft, Search, X, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'

interface StickyHeaderProps {
  title: string
  step?: string
  onBack?: () => void
  showBack?: boolean
  showSearch?: boolean
  onSearchClick?: () => void
  currentStep?: number
  totalSteps?: number
  searchQuery?: string
  onSearchChange?: (query: string) => void
  showGetDistance?: boolean
  onGetDistance?: () => void
  showLanguageSwitcher?: boolean
  showSelectDate?: boolean
  onSelectDate?: () => void
}

export const StickyHeader: React.FC<StickyHeaderProps> = ({
  title,
  onBack,
  showBack = true,
  showSearch = false,
  currentStep = 1,
  totalSteps = 7,
  searchQuery = '',
  onSearchChange,
  showGetDistance = false,
  onGetDistance,
  showLanguageSwitcher = false,
  showSelectDate = false,
  onSelectDate
}) => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [showSearchInput, setShowSearchInput] = useState(false)
  const [isArabic, setIsArabic] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const progressPercentage = (currentStep / totalSteps) * 100

  const handleSearchToggle = () => {
    if (showSearchInput) {
      setShowSearchInput(false)
      onSearchChange?.('')
    } else {
      setShowSearchInput(true)
    }
  }

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b transition-all duration-300",
        isScrolled ? "py-3 shadow-sm" : "py-5"
      )}
    >
      <div className="px-4 flex items-center justify-between">
        {!showSearchInput && (
          <>
            <div className="flex items-center gap-3">
              {showBack && onBack && (
                <button
                  onClick={onBack}
                  className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Go back"
                >
                  <ChevronLeft className="w-5 h-5" strokeWidth={1.25} />
                </button>
              )}
              <div className="flex flex-col">
                <h1 className={cn(
                  "font-semibold text-gray-900 transition-all duration-300",
                  "text-[21px]"
                )}>
                  {title}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Language Switcher - show only when not scrolled */}
              {showLanguageSwitcher && !isScrolled && (
                <div className="flex w-20">
                  <button
                    onClick={() => setIsArabic(false)}
                    className={cn(
                      "flex items-center justify-center px-2.5 py-2 text-sm font-medium transition-all duration-300 ease-in-out border w-10",
                      "rounded-l-lg rounded-r-none",
                      !isArabic
                        ? "bg-red-50 text-primary border-primary z-10"
                        : "bg-red-50 text-primary border-primary opacity-50 z-0"
                    )}
                    style={{
                      zIndex: !isArabic ? 10 : 0
                    }}
                  >
                    <div className="w-5 h-3.5 rounded-sm overflow-hidden">
                      <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Flag_of_the_United_States.svg/2880px-Flag_of_the_United_States.svg.png" 
                        alt="English"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setIsArabic(true)}
                    className={cn(
                      "flex items-center justify-center px-2.5 py-2 text-sm font-medium transition-all duration-300 ease-in-out border w-10",
                      "rounded-r-lg rounded-l-none",
                      isArabic
                        ? "bg-red-50 text-primary border-primary z-10"
                        : "bg-red-50 text-primary border-primary opacity-50 z-0"
                    )}
                    style={{
                      zIndex: isArabic ? 10 : 0
                    }}
                  >
                    <div className="w-5 h-3.5 rounded-sm overflow-hidden">
                      <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Arabic-Language-Flag.svg/1599px-Arabic-Language-Flag.svg.png" 
                        alt="Arabic"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </button>
                </div>
              )}
              {showSearch && isScrolled && (
                <button
                  onClick={handleSearchToggle}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5 text-gray-600" strokeWidth={1.25} />
                </button>
              )}
              {showGetDistance && onGetDistance && (
                <button
                  onClick={onGetDistance}
                  className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Get Distance
                </button>
              )}
              {showSelectDate && onSelectDate && (
                <button
                  onClick={onSelectDate}
                  className="flex items-center gap-2 px-3 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Calendar className="w-4 h-4" strokeWidth={1.25} />
                  Select Date
                </button>
              )}
            </div>
          </>
        )}
        
        {showSearchInput && (
          <div className="flex items-center gap-3 w-full animate-in fade-in-50 duration-300">
            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" strokeWidth={1.25} />
              <Input
                placeholder="Search departments..."
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="pl-10 h-9 bg-gray-50 border-gray-300 focus:bg-white focus:border-primary text-base"
                autoFocus
              />
            </div>
            <button
              onClick={handleSearchToggle}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
              aria-label="Close search"
            >
              <X className="w-4 h-4 text-gray-600" strokeWidth={1.25} />
            </button>
          </div>
        )}
      </div>
      
      {/* Progress Line - Flush at bottom of header */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100">
        <div 
          className="h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </header>
  )
}