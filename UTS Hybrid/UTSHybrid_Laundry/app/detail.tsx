import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, Link, useLocalSearchParams, useRouter } from 'expo-router';

const WARNA_TEMA = '#007BFF';

const LAUNDRY_SERVICES = [
  { id: '1', nama: 'Cuci Kering Lipat (Reguler)', durasi: '2 Hari', harga: 'Rp 7.000 / kg', gambar: 'https://i.imgur.com/L8qf4qj.png', deskripsi: 'Pakaian dicuci bersih menggunakan deterjen berkualitas, dikeringkan, dan dilipat rapi. Minimal 3kg.', rating: 4.8, testimoni: 'Wangi dan rapi banget! - Budi' },
  { id: '2', nama: 'Cuci Setrika (Reguler)', durasi: '2-3 Hari', harga: 'Rp 10.000 / kg', gambar: 'https://i.imgur.com/L8qf4qj.png', deskripsi: 'Paket lengkap cuci, kering, dan setrika uap. Pakaian Anda siap pakai dan bebas kusut. Minimal 3kg.', rating: 4.9, testimoni: 'Setrikanya licin dan rapi, recommended. - Ani' },
  { id: '3', nama: 'Paket Kilat (1 Hari)', durasi: '1 Hari', harga: 'Rp 15.000 / kg', gambar: 'https://i.imgur.com/L8qf4qj.png', deskripsi: 'Butuh cepat? Layanan ekspres 1 hari selesai untuk cuci kering lipat. S&K berlaku.', rating: 4.7, testimoni: 'Sangat membantu untuk yang butuh cepat. - Citra' },
];

export default function DetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const service = LAUNDRY_SERVICES.find((item) => item.id === id);

  if (!service) {
    return (
      <View style={styles.container}>
        <Text>Layanan tidak ditemukan</Text>
      </View>
    );
  }
  
  const openBookingModal = () => {
    router.push({ 
      pathname: "/modal", 
      params: { 
        serviceId: service.id,
        serviceName: service.nama 
      } 
    });
  };

  return (
    <View style={{flex: 1}}>
      <ScrollView style={styles.container}>
        <Stack.Screen options={{ title: "Detail Layanan" }} />
        
        <Image source={{ uri: service.gambar }} style={styles.image} />
        <View style={styles.content}>
          <Text style={styles.title}>{service.nama}</Text>
          <Text style={styles.info}>{service.durasi} • {service.harga}</Text>
          
          <Text style={styles.sectionTitle}>Deskripsi</Text>
          <Text style={styles.description}>{service.deskripsi}</Text>
          
          <Text style={styles.sectionTitle}>Testimoni</Text>
          <Text style={styles.testimoni}>"{service.testimoni}" (Rating: {service.rating} / 5)</Text>

        </View>
      </ScrollView>
      
      {}
      <View style={styles.footerButtonContainer}>
        <TouchableOpacity 
          style={styles.customButton} 
          onPress={openBookingModal}
        >
          <Text style={styles.customButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: 300,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  info: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  testimoni: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#444',
  },
  footerButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  customButton: {
    backgroundColor: WARNA_TEMA,
    paddingVertical: 14,
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