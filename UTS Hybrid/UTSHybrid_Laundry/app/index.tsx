import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import { useAuth } from './context/GlobalContext'; 
import { Link, Redirect } from 'expo-router';

const WARNA_TEMA = '#007BFF';

export default function LoginScreen() {
  const { signIn, isLoggedIn } = useAuth(); 

  if (isLoggedIn) {
    return <Redirect href="/(tabs)/home" />;
  }

  return (
    <View style={styles.container}>
      {}
      <Image 
        source={{ uri: 'https://png.pngtree.com/png-clipart/20220818/ourmid/pngtree-blue-washing-machine-for-laundry-logo-png-image_6114594.png' }}
        style={styles.logo}
      />
      <Text style={styles.title}>Selamat Datang!</Text>
      <Text style={styles.subtitle}>Silakan login untuk memesan laundry.</Text>
      
      <TouchableOpacity 
        style={styles.customButton} 
        onPress={signIn}
      >
        <Text style={styles.customButtonText}>Login (Simulasi)</Text>
      </TouchableOpacity>
      
      <Link href="/register" style={styles.link}>
        Belum punya akun? Register di sini
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 15,
    backgroundColor: '#fff',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  link: {
    marginTop: 15,
    color: WARNA_TEMA,
    fontSize: 16,
  },
  customButton: {
    backgroundColor: WARNA_TEMA,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    elevation: 3,
  },
  customButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});