import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { API_URL } from '../constants/Api';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState(''); // State baru untuk No HP
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    // --- 1. VALIDASI FORMAT (Diperketat) ---
    
    // Cek Kosong
    if(!name || !email || !phone || !password) {
        const msg = "Semua kolom wajib diisi!";
        return Platform.OS === 'web' ? alert(msg) : Alert.alert("Error", msg);
    }

    // Cek Nama
    if (name.length < 3) {
        const msg = "Nama terlalu pendek (min. 3 huruf)";
        return Platform.OS === 'web' ? alert(msg) : Alert.alert("Info", msg);
    }

    // --- PERBAIKAN BUG EMAIL DI SINI ---
    // Regex ini memastikan ada karakter sebelum @, setelah @, DAN WAJIB ada titik (.)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
        // Pesan sesuai request Anda
        const msg = "Format email salah. Pastikan menggunakan @ dan domain (contoh: @gmail.com)";
        return Platform.OS === 'web' ? alert(msg) : Alert.alert("Info", msg);
    }

    // Cek No HP
    if (phone.length < 10 || !/^\d+$/.test(phone)) {
        const msg = "Nomor HP tidak valid (min. 10 angka)";
        return Platform.OS === 'web' ? alert(msg) : Alert.alert("Info", msg);
    }

    // Cek Password
    if (password.length < 6) {
        const msg = "Password terlalu lemah (min. 6 karakter)";
        return Platform.OS === 'web' ? alert(msg) : Alert.alert("Info", msg);
    }

    // --- 2. KIRIM KE SERVER (Cek Duplikat) ---
    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/register`, {
        name, email, phone, password
      });
      
      const successMsg = "Registrasi Berhasil! Silakan Login.";
      if (Platform.OS === 'web') alert(successMsg);
      else Alert.alert("Sukses", successMsg);
      
      router.back(); 
    } catch (error) {
      // --- LOGIKA POPUP DUPLIKAT ---
      // Pesan ini dikirim langsung dari server.js
      // Jika duplikat, server kirim: "Email sudah terdaftar!" atau "Nomor HP sudah terdaftar!"
      let pesanError = "Gagal Mendaftar.";

      if (error.response) {
        pesanError = error.response.data; // <--- Ini yang memunculkan popup "Email sudah terdaftar"
      } else if (error.request) {
        pesanError = "Gagal terhubung ke server.";
      }

      if (Platform.OS === 'web') alert(pesanError);
      else Alert.alert("Perhatian", pesanError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.headerContainer}>
           <Image 
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2975/2975175.png' }} 
            style={styles.logo}
           />
           <Text style={styles.title}>Daftar Akun Baru</Text>
           <Text style={styles.subtitle}>Nikmati kemudahan laundry antar-jemput.</Text>
        </View>

        <View style={styles.formContainer}>
          
          {/* Input Nama */}
          <View style={styles.inputWrapper}>
             <Ionicons name="person-outline" size={20} color="#666" style={styles.icon} />
             <TextInput 
                placeholder="Nama Lengkap" 
                style={styles.input} 
                value={name} onChangeText={setName} 
             />
          </View>

          {/* Input Email */}
          <View style={styles.inputWrapper}>
             <Ionicons name="mail-outline" size={20} color="#666" style={styles.icon} />
             <TextInput 
                placeholder="Email Address" 
                style={styles.input} 
                value={email} onChangeText={setEmail} 
                autoCapitalize="none"
                keyboardType="email-address"
             />
          </View>

          {/* Input No HP (BARU) */}
          <View style={styles.inputWrapper}>
             <Ionicons name="call-outline" size={20} color="#666" style={styles.icon} />
             <TextInput 
                placeholder="Nomor WhatsApp / HP" 
                style={styles.input} 
                value={phone} onChangeText={setPhone} 
                keyboardType="phone-pad"
             />
          </View>

          {/* Input Password */}
          <View style={styles.inputWrapper}>
             <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.icon} />
             <TextInput 
                placeholder="Password" 
                style={styles.input} 
                value={password} onChangeText={setPassword} 
                secureTextEntry
             />
          </View>

          <TouchableOpacity style={styles.registerButton} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>DAFTAR SEKARANG</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()} style={{marginTop: 20}}>
            <Text style={{color: '#666', textAlign: 'center'}}>Sudah punya akun? <Text style={{color: '#007BFF', fontWeight: 'bold'}}>Login</Text></Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F9FF' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  headerContainer: { alignItems: 'center', marginBottom: 30 },
  logo: { width: 80, height: 80, marginBottom: 15 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0056b3', marginBottom: 5 },
  subtitle: { fontSize: 14, color: '#666' },
  formContainer: { backgroundColor: '#fff', padding: 25, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F5FA', borderRadius: 12, marginBottom: 15, paddingHorizontal: 15, height: 50, borderWidth: 1, borderColor: 'transparent' },
  icon: { marginRight: 10 },
  input: { flex: 1, color: '#333' },
  registerButton: { backgroundColor: '#28a745', height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 10, shadowColor: '#28a745', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 4 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 }
});