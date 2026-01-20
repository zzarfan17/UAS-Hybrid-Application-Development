import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, Image, TouchableOpacity, 
  TextInput, ScrollView, Platform, Alert, StatusBar, KeyboardAvoidingView 
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from './context/GlobalContext';
import axios from 'axios';
import { API_URL } from '../constants/Api';

export default function DetailScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [address, setAddress] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [userNote, setUserNote] = useState(''); // State baru untuk Catatan Opsional
  const [loading, setLoading] = useState(false);

  const handleBooking = async () => {
    // 1. Validasi Input Wajib
    if (!address || !pickupTime) {
      const msg = "Mohon isi Alamat dan Waktu Jemput!";
      return Platform.OS === 'web' ? alert(msg) : Alert.alert("Ups!", msg);
    }

    // 2. Cek apakah User ID ada? (Seringkali error disini)
    if (!user || !user.id) {
       const msg = "Sesi login kedaluwarsa. Silakan login ulang.";
       return Platform.OS === 'web' ? alert(msg) : Alert.alert("Gagal", msg);
    }

    setLoading(true);
    try {
      // Trik: Gabungkan semua info ke dalam satu string 'notes' untuk Backend
      // Format: "Alamat: ... | Waktu: ... | Catatan: ..."
      let finalNotes = `Alamat: ${address} | Waktu: ${pickupTime}`;
      
      // Jika ada catatan tambahan, tempelkan juga
      if (userNote) {
        finalNotes += ` | Catatan: ${userNote}`;
      }

      const payload = {
        user_id: user.id,
        service_id: params.id,
        total_price: params.price, // Pastikan ini angka/string yang valid
        pickup_time: pickupTime,
        notes: finalNotes 
      };

      console.log("Mencoba kirim data:", payload); // Cek Console browser jika error

      await axios.post(`${API_URL}/bookings`, payload);

      const successMsg = "Pesanan Berhasil! Kurir akan segera meluncur.";
      if (Platform.OS === 'web') alert(successMsg);
      else Alert.alert("Sukses", successMsg);

      router.replace('/home'); 
      
    } catch (error) {
      console.error("Detail Error:", error);
      
      // --- DETEKTIF ERROR (Supaya tau penyebabnya) ---
      let pesanError = "Gagal memesan.";
      
      if (error.response) {
        // Jika Server menolak, tampilkan alasannya (misal: SQL Error)
        // Kita ambil data error-nya sejelas mungkin
        pesanError = `Server Error: ${JSON.stringify(error.response.data.sqlMessage || error.response.data)}`;
      } else if (error.request) {
        pesanError = "Gagal terhubung ke Backend (Cek Port 4000).";
      } else {
        pesanError = error.message;
      }

      if (Platform.OS === 'web') alert(pesanError);
      else Alert.alert("Gagal", pesanError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" />

      {/* --- HEADER --- */}
      <View style={styles.headerImageContainer}>
        <Image source={{ uri: params.image_url }} style={styles.headerImage} />
        <View style={styles.overlay} />
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{params.name}</Text>
          <View style={styles.headerBadges}>
             <View style={styles.badge}>
               <Ionicons name="time-outline" size={14} color="#fff" />
               <Text style={styles.badgeText}>{params.duration}</Text>
             </View>
             <View style={styles.badge}>
               <Ionicons name="star" size={14} color="#FFD700" />
               <Text style={styles.badgeText}>{params.rating}</Text>
             </View>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex:1}}>
        <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
          
          {/* Info Pemesan */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
               <Ionicons name="person-circle-outline" size={24} color="#007BFF" />
               <Text style={styles.sectionTitle}>Info Pemesan</Text>
            </View>
            <View style={styles.userInfoRow}>
              <View>
                <Text style={styles.label}>Nama Lengkap</Text>
                <Text style={styles.value}>{user?.name || "Tamu"}</Text>
              </View>
              <View>
                <Text style={styles.label}>Kontak</Text>
                <Text style={styles.value}>{user?.phone || "-"}</Text>
              </View>
            </View>
          </View>

          {/* Form Detail */}
          <View style={styles.card}>
             <View style={styles.sectionHeader}>
               <Ionicons name="location-outline" size={24} color="#FF5733" />
               <Text style={styles.sectionTitle}>Detail Penjemputan</Text>
            </View>

            <Text style={styles.inputLabel}>Alamat Lengkap</Text>
            <View style={styles.inputContainer}>
               <TextInput 
                  placeholder="Contoh: Jl. Merpati No. 10, Kost Biru" 
                  style={styles.input}
                  multiline
                  value={address}
                  onChangeText={setAddress}
               />
            </View>

            <Text style={styles.inputLabel}>Waktu Jemput</Text>
            <View style={styles.inputContainer}>
               <TextInput 
                  placeholder="Contoh: Besok jam 9 pagi" 
                  style={styles.input}
                  value={pickupTime}
                  onChangeText={setPickupTime}
               />
            </View>

            {/* --- INPUT BARU: CATATAN (OPSIONAL) --- */}
            <Text style={styles.inputLabel}>Catatan Tambahan (Opsional)</Text>
            <View style={styles.inputContainer}>
               <TextInput 
                  placeholder="Contoh: Jangan dibanting, Pakaian luntur pisahkan" 
                  style={styles.input}
                  value={userNote}
                  onChangeText={setUserNote}
               />
            </View>

          </View>

          {/* Harga */}
          <View style={styles.priceCard}>
             <Text style={styles.priceLabel}>Estimasi Harga</Text>
             <Text style={styles.priceValue}>{params.price}</Text>
          </View>

          <View style={{height: 100}} /> 
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.checkoutButton, loading && {backgroundColor: '#ccc'}]} 
          onPress={handleBooking}
          disabled={loading}
        >
          {loading ? (
             <Text style={styles.checkoutText}>Memproses...</Text>
          ) : (
             <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={styles.checkoutText}>Konfirmasi Pesanan</Text>
                <Ionicons name="chevron-forward" size={20} color="#fff" style={{marginLeft: 5}} />
             </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  headerImageContainer: { height: 250, width: '100%', position: 'relative' },
  headerImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  backButton: { position: 'absolute', top: 50, left: 20, padding: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20 },
  headerTitleContainer: { position: 'absolute', bottom: 20, left: 20 },
  headerTitle: { color: '#fff', fontSize: 26, fontWeight: 'bold', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: {width: 0, height: 1}, textShadowRadius: 10 },
  headerBadges: { flexDirection: 'row', marginTop: 10 },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15, marginRight: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  badgeText: { color: '#fff', marginLeft: 5, fontSize: 12, fontWeight: '600' },
  contentContainer: { padding: 20, paddingTop: 10 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginLeft: 10 },
  userInfoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontSize: 12, color: '#888', marginBottom: 4 },
  value: { fontSize: 15, color: '#333', fontWeight: '600' },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 8, marginTop: 5 },
  inputContainer: { backgroundColor: '#F9FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E0E0E0', paddingHorizontal: 15, paddingVertical: 12, marginBottom: 10 },
  input: { fontSize: 15, color: '#333' },
  priceCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#E6F0FF', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#CCE0FF' },
  priceLabel: { color: '#0056b3', fontSize: 14 },
  priceValue: { color: '#007BFF', fontSize: 18, fontWeight: 'bold' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', padding: 20, borderTopWidth: 1, borderTopColor: '#eee', paddingBottom: Platform.OS === 'ios' ? 30 : 20 },
  checkoutButton: { backgroundColor: '#007BFF', paddingVertical: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowColor: '#007BFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  checkoutText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});