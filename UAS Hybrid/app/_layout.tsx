import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Slot, useRouter, useSegments } from 'expo-router'; // Tambah useSegments
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { API_URL } from '../constants/Api';
import { AuthContext, BookingContext } from './context/GlobalContext';

export default function RootLayout() {
  const [user, setUser] = useState(null); 
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const segments = useSegments();
  const router = useRouter();

  // 1. Cek User Saat Aplikasi Dibuka
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
          setIsLoggedIn(true);
        }
      } catch (e) {
        console.log("Gagal load user", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  // 2. SATPAM NAVIGASI (PENTING!)
  // Kode ini akan jalan otomatis setiap kali status 'user' berubah.
  useEffect(() => {
    if (isLoading) return; // Tunggu loading selesai

    // Cek apakah user sedang berada di dalam area (tabs)
    const inAuthGroup = segments[0] === '(tabs)';

    if (!user && inAuthGroup) {
      // KASUS: User KOSONG (Logout), tapi masih di dalam (tabs)
      // TINDAKAN: Tendang ke halaman Login
      console.log(">>> Satpam: User Logout Detected. Redirecting to Login...");
      router.replace('/');
    } 
    else if (user && segments[0] === undefined) {
      // KASUS: User ADA (Login), tapi ada di halaman Login
      // TINDAKAN: Arahkan ke Home (Opsional, biar UX bagus)
      router.replace('/home');
    }
  }, [user, segments, isLoading]);


  // 3. Definisi Fungsi Context
  const authContextValue = {
    signIn: async (userData) => {
      setUser(userData);
      setIsLoggedIn(true);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
    },
    signOut: async () => {
      console.log(">>> Fungsi signOut dipanggil di _layout");
      try {
        await AsyncStorage.removeItem('user'); // 1. Hapus memori HP
        setBookings([]);                       // 2. Bersihkan data booking
        setUser(null);                         // 3. Hapus State (Ini akan memicu Satpam)
        setIsLoggedIn(false);
      } catch (error) {
        console.error("Gagal SignOut:", error);
      }
    },
    user, 
    isLoggedIn,
  };

  const bookingContextValue = {
    bookings,
    fetchBookings: async () => {
      if (!user) return;
      try {
        const response = await axios.get(`${API_URL}/bookings/${user.id}`);
        setBookings(response.data);
      } catch (error) {
        console.log("Gagal ambil booking", error);
      }
    },
    addBooking: async (newBookingData) => { /* Handled in modal */ },
  };

  // Tampilkan Layar Putih/Loading saat cek sesi
  if (isLoading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      <BookingContext.Provider value={bookingContextValue}>
         <Slot /> 
      </BookingContext.Provider>
    </AuthContext.Provider>
  );
}