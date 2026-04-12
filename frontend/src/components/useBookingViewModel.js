import { createContext, useContext } from 'react'

export const BookingViewModelContext = createContext(null)

export function useBookingViewModel() {
  const ctx = useContext(BookingViewModelContext)
  if (!ctx) {
    throw new Error('useBookingViewModel must be used inside BookingViewModelProvider')
  }
  return ctx
}

