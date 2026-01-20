import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { API_URL } from '../constants/Api';
import { useAuth } from './context/GlobalContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signIn } = useAuth();

  const handleLogin = async () => {
    // 1. Cek Input
    if(!email || !password) return Alert.alert("Ups!", "Email dan password harus diisi ya.");
    
    console.log("--- MULAI LOGIN ---");
    console.log("Target URL:", `${API_URL}/auth/login`);
    console.log("Data:", { email, password });

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email, password
      });

      console.log("Respon Sukses:", response.data); // Cek di Console Browser (F12)
      
      // Pastikan struktur datanya benar. 
      // Jika backend mengirim { data: user }, maka pakai response.data.data
      // Jika backend mengirim langsung user, pakai response.data
      if (response.data.data) {
          signIn(response.data.data);
      } else {
          signIn(response.data);
      }

      // Perintahkan router untuk pindah ke halaman Home sekarang juga!
      router.replace('/home');
      
    } catch (error) {
      // Ambil pesan error dari backend
      let pesanError = "Gagal Login.";
      
      if (error.response) {
        // Ini akan mengambil teks: "Email atau Password anda salah" dari server.js
        pesanError = error.response.data; 
      } else if (error.request) {
        pesanError = "Gagal terhubung ke server. Pastikan Backend Nyala & Port Sama!";
      }

      if (Platform.OS === 'web') {
        alert(pesanError);
      } else {
        Alert.alert("Info", pesanError);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* --- HEADER GAMBAR --- */}
        <View style={styles.headerContainer}>
           <Image 
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2975/2975175.png' }} 
            style={styles.logo}
           />
           <Text style={styles.title}>Laundry Pintar</Text>
           <Text style={styles.subtitle}>Cuci bersih, hidup praktis.</Text>
        </View>

        {/* --- FORM CONTAINER --- */}
        <View style={styles.formContainer}>
          
          {/* Input Email */}
          <View style={styles.inputWrapper}>
             <Ionicons name="mail-outline" size={20} color="#666" style={styles.icon} />
             <TextInput 
              placeholder="Email Anda" 
              style={styles.input} 
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
             />
          </View>

          {/* Input Password */}
          <View style={styles.inputWrapper}>
             <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.icon} />
             <TextInput 
              placeholder="Password" 
              style={styles.input} 
              value={password}
              onChangeText={setPassword}
              secureTextEntry
             />
          </View>

          {/* Tombol Login */}
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
            {loading ? (
               <ActivityIndicator color="#fff" />
            ) : (
               <Text style={styles.loginText}>MASUK SEKARANG</Text>
            )}
          </TouchableOpacity>

          {/* Link Register */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Belum punya akun? </Text>
            <TouchableOpacity onPress={() => router.push("/register")}>
              <Text style={styles.linkText}>Daftar di sini</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FF', // Background biru sangat muda
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0056b3',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  formContainer: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 20,
    // Efek Bayangan (Shadow)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F5FA',
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 50,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#333',
  },
  loginButton: {
    backgroundColor: '#007BFF',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#007BFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  loginText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#666',
  },
  linkText: {
    color: '#007BFF',
    fontWeight: 'bold',
  }
});