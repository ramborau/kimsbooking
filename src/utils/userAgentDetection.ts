// WhatsApp user agent detection utility
export const isWhatsAppUserAgent = (): boolean => {
  if (typeof window === 'undefined') return false
  
  const userAgent = window.navigator.userAgent.toLowerCase()
  
  // Check for WhatsApp specific signatures
  const whatsappSignatures = [
    'wa4a',        // WhatsApp for Android
    'wai',         // WhatsApp for iOS
    'whatsapp'     // General WhatsApp
  ]
  
  return whatsappSignatures.some(signature => userAgent.includes(signature))
}

// Check if bypass parameter is present
export const isBypassEnabled = (): boolean => {
  if (typeof window === 'undefined') return false
  
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get('lc') === '1'
}

// Check if user should see the booking app
export const shouldShowBookingApp = (): boolean => {
  return isWhatsAppUserAgent() || isBypassEnabled()
}

// Get WhatsApp redirect URL
export const getWhatsAppRedirectUrl = (): string => {
  return 'https://wa.me/918390974974'
}