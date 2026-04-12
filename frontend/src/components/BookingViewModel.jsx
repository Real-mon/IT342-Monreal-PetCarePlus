import { useMemo, useState } from 'react'
import { BookingViewModelContext } from './useBookingViewModel.js'

export function BookingViewModelProvider({ children }) {
  const [provider, setProvider] = useState(null)
  const [service, setService] = useState(null)
  const [schedule, setSchedule] = useState(null)
  const [pet, setPet] = useState(null)
  const [booking, setBooking] = useState(null)

  const reset = () => {
    setProvider(null)
    setService(null)
    setSchedule(null)
    setPet(null)
    setBooking(null)
  }

  const value = useMemo(
    () => ({
      provider,
      setProvider,
      service,
      setService,
      schedule,
      setSchedule,
      pet,
      setPet,
      booking,
      setBooking,
      reset,
    }),
    [provider, service, schedule, pet, booking],
  )

  return (
    <BookingViewModelContext.Provider value={value}>
      {children}
    </BookingViewModelContext.Provider>
  )
}
