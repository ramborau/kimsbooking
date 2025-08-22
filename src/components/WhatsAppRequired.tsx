import React from 'react'
import { MessageCircle, ArrowRight } from 'lucide-react'
import { getWhatsAppRedirectUrl } from '@/utils/userAgentDetection'

export const WhatsAppRequired: React.FC = () => {
  const handleGoToWhatsApp = () => {
    window.location.href = getWhatsAppRedirectUrl()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-8 text-center">
        {/* WhatsApp Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
            <MessageCircle className="w-10 h-10 text-green-600" strokeWidth={1.25} />
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            WhatsApp Required
          </h1>
          <p className="text-gray-600 leading-relaxed">
            This booking function is only available through WhatsApp. 
            Please open this link from WhatsApp to continue with your appointment booking.
          </p>
        </div>

        {/* Hospital Info */}
        <div className="bg-gray-50 rounded-2xl p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">KIMS Hospital</h3>
          <p className="text-sm text-gray-600">
            Book your appointment securely through WhatsApp
          </p>
        </div>

        {/* Go to WhatsApp Button */}
        <button
          onClick={handleGoToWhatsApp}
          className="w-full h-14 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors duration-200 flex items-center justify-center gap-3 active:scale-[0.98]"
        >
          <MessageCircle className="w-5 h-5" strokeWidth={1.25} />
          <span>Go to WhatsApp</span>
          <ArrowRight className="w-5 h-5" strokeWidth={1.25} />
        </button>

        {/* Help Text */}
        <p className="text-xs text-gray-500 mt-4">
          You'll be redirected to WhatsApp to continue
        </p>
      </div>
    </div>
  )
}