import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Button, Animated } from 'react-native';
import { Stack, Link, useRouter } from 'expo-router';
import { useAuth } from '../context/GlobalContext';
import { Ionicons } from '@expo/vector-icons';

const GAMBAR_BARU = 'https://i.imgur.com/2nQ39bF.png';
const LAUNDRY_SERVICES = [
  { id: '1', nama: 'Cuci Kering Lipat (Reguler)', durasi: '2 Hari', harga: 'Rp 7.000 / kg', gambar: GAMBAR_BARU, deskripsi: 'Pakaian dicuci bersih menggunakan deterjen berkualitas, dikeringkan, dan dilipat rapi. Minimal 3kg.', rating: 4.8, testimoni: 'Wangi dan rapi banget! - Budi' },
  { id: '2', nama: 'Cuci Setrika (Reguler)', durasi: '2-3 Hari', harga: 'Rp 10.000 / kg', gambar: GAMBAR_BARU, deskripsi: 'Paket lengkap cuci, kering, dan setrika uap. Pakaian Anda siap pakai dan bebas kusut. Minimal 3kg.', rating: 4.9, testimoni: 'Setrikanya licin dan rapi, recommended. - Ani' },
  { id: '3', nama: 'Paket Kilat (1 Hari)', durasi: '1 Hari', harga: 'Rp 15.000 / kg', gambar: GAMBAR_BARU, deskripsi: 'Butuh cepat? Layanan ekspres 1 hari selesai untuk cuci kering lipat. S&K berlaku.', rating: 4.7, testimoni: 'Sangat membantu untuk yang butuh cepat. - Citra' },
];

function ServiceCard({ item, index }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      delay: index * 100,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, index]);

  return (
    <Animated.View style={{ opacity: fadeAnim }}> 
      <Link href={{ pathname: "/detail", params: { id: item.id } }} asChild>
        <TouchableOpacity style={styles.card}>
          <Image source={{ uri: item.gambar }} style={styles.cardImage} />
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{item.nama}</Text>
            <Text style={styles.cardInfo}>{item.durasi} • {item.harga}</Text>
          </View>
          <Text style={styles.cardButton}>Pesan</Text>
        </TouchableOpacity>
      </Link>
    </Animated.View>
  );
}

function CustomHeader() {
  return (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>Pilih Paket Pilihanmu</Text>
      <Text style={styles.headerSubtitle}>Layanan cepat, bersih, dan profesional.</Text>
    </View>
  );
}

export default function HomeScreen() {
  const { signOut } = useAuth();
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Layanan Laundry',
          headerRight: () => (
            <TouchableOpacity onPress={signOut} style={{ marginRight: 15 }}>
              <Ionicons name="log-out-outline" size={28} color="#ff0000" />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <FlatList
        data={LAUNDRY_SERVICES}
        renderItem={({ item, index }) => <ServiceCard item={item} index={index} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16 }}
        ListHeaderComponent={<CustomHeader />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    paddingVertical: 10,
    paddingHorizontal: 5,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    color: '#666',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  cardImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#eee',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardInfo: {
    fontSize: 14,
    color: '#666',
  },
  cardButton: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007BFF',
    marginLeft: 8,
  },
});