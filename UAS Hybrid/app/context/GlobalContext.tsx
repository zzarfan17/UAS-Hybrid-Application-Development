import { createContext, useContext } from 'react';

// Kita ubah tipe data AuthContext agar menyimpan data user lengkap, bukan cuma boolean
export const AuthContext = createContext({
  signIn: (userData: any) => {},
  signOut: () => {},
  user: null, // Menyimpan { id, name, email }
  isLoggedIn: false,
});

export const BookingContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useBookings() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBookings must be used within a BookingProvider');
  }
  return context;
}