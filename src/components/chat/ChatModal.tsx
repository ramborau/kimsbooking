import React from 'react'
import { X } from 'lucide-react'

interface ChatModalProps {
  isOpen: boolean
  onClose?: () => void
  title: string
  children: React.ReactNode
  showCloseButton?: boolean
  onSubmit?: () => void
  submitLabel?: string
  isSubmitDisabled?: boolean
}

export const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = false,
  onSubmit,
  submitLabel = "Continue",
  isSubmitDisabled = false
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          {showCloseButton && onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {onSubmit && (
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={onSubmit}
              disabled={isSubmitDisabled}
              className={`w-full py-3 px-4 rounded-xl font-semibold transition-colors duration-200 ${
                isSubmitDisabled
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-primary hover:bg-primary/90 text-white'
              }`}
            >
              {submitLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}