import React from 'react'
import { cn } from '@/lib/utils'

interface StickyFooterProps {
  children: React.ReactNode
  className?: string
}

export const StickyFooter: React.FC<StickyFooterProps> = ({
  children,
  className
}) => {
  return (
    <footer
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 bg-white border-t shadow-[0_-4px_12px_rgba(0,0,0,0.06)]",
        className
      )}
    >
      {children}
    </footer>
  )
}