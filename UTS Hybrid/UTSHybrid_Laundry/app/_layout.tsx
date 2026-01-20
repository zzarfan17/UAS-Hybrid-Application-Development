import React, { useState } from 'react';
import { Slot } from 'expo-router';
import { AuthContext, BookingContext } from './context/GlobalContext'; 

export default function RootLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [bookings, setBookings] = useState([]);

  const authContextValue = {
    signIn: () => setIsLoggedIn(true),
    signOut: () => setIsLoggedIn(false),
    isLoggedIn,
  };

  const bookingContextValue = {
    bookings,
    addBooking: (newBooking) => {
      setBookings([...bookings, newBooking]);
      console.log('Booking Ditambahkan!', newBooking);
    },
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      <BookingContext.Provider value={bookingContextValue}>
        <Slot /> 
      </BookingContext.Provider>
    </AuthContext.Provider>
  );
}