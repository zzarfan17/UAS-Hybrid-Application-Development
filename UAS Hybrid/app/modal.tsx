import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  Platform, 
  Alert, 
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useBookings } from './context/GlobalContext';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { API_URL } from '../constants/Api';
import { useAuth } from './context/GlobalContext'; // Tambah ini

const TAHUN_INI = new Date().getFullYear().toString();
const HARI = Array.from({ length: 31 }, (_, i) => (i + 1).toString()); 
const BULAN = [ "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember" ];
const JAM = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const MENIT = ["00", "15", "30", "45"];
const WARNA_TEMA = '#007BFF';

export default function BookingModal() {
  const { user } = useAuth(); // Ambil data user yang sedang login
  const router = useRouter();
  const { addBooking } = useBookings();
  const { serviceId, serviceName } = useLocalSearchParams();
  const [namaPelanggan, setNamaPelanggan] = useState('');
  const [catatan, setCatatan] = useState('');
  const [pilihHari, setPilihHari] = useState('1');
  const [pilihBulan, setPilihBulan] = useState('Januari');
  const [pilihJam, setPilihJam] = useState('09');
  const [pilihMenit, setPilihMenit] = useState('00');

  const handleConfirmBooking = async () => {
    if (!namaPelanggan.trim()) {
      Alert.alert('Error', 'Nama pelanggan wajib diisi');
      return;
    }

    const tanggalPesan = `${TAHUN_INI}-${mapBulanKeAngka(pilihBulan)}-${pilihHari} ${pilihJam}:${pilihMenit}:00`;
    // Format MySQL: YYYY-MM-DD HH:MM:SS (Penting!)

    try {
      await axios.post(`${API_URL}/bookings`, {
        user_id: user.id, // ID dari context
        service_id: serviceId,
        booking_date: tanggalPesan, 
        notes: `Nama: ${namaPelanggan}. Catatan: ${catatan}`
      });

      Alert.alert('Sukses', 'Pesanan berhasil dibuat!');
      router.back();
      router.replace('/(tabs)/mybookings'); // Langsung arahkan ke history
    } catch (error) {
      console.log(error);
      Alert.alert('Gagal', 'Gagal membuat pesanan. Cek koneksi.');
    }
  };

  // Helper function untuk ubah nama bulan jadi angka
  const mapBulanKeAngka = (bulan) => {
     const index = BULAN.indexOf(bulan);
     return (index + 1).toString().padStart(2, '0');
  };

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: 'Form Pemesanan', presentation: 'modal' }} />
      
      <Text style={styles.title}>Konfirmasi Pesanan</Text>
      <Text style={styles.serviceName}>{serviceName}</Text>
      
      <Text style={styles.label}>Nama Pelanggan</Text>
      <TextInput
        style={styles.input}
        placeholder="Masukkan nama Anda"
        value={namaPelanggan}
        onChangeText={setNamaPelanggan}
      />
      
      <Text style={styles.label}>Tanggal Penjemputan</Text>
      <View style={styles.pickerRow}>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={pilihHari} onValueChange={setPilihHari}>
            {HARI.map((hari) => <Picker.Item key={hari} label={hari} value={hari} />)}
          </Picker>
        </View>
        <View style={[styles.pickerContainer, { flex: 2 }]}>
          <Picker selectedValue={pilihBulan} onValueChange={setPilihBulan}>
            {BULAN.map((bulan) => <Picker.Item key={bulan} label={bulan} value={bulan} />)}
          </Picker>
        </View>
      </View>
      
      <Text style={styles.label}>Jam Penjemputan</Text>
      <View style={styles.pickerRow}>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={pilihJam} onValueChange={setPilihJam}>
            {JAM.map((jam) => <Picker.Item key={jam} label={jam} value={jam} />)}
          </Picker>
        </View>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={pilihMenit} onValueChange={setPilihMenit}>
            {MENIT.map((menit) => <Picker.Item key={menit} label={menit} value={menit} />)}
          </Picker>
        </View>
      </View>
      
      <Text style={styles.label}>Catatan Tambahan (Opsional)</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Contoh: Ada pakaian luntur, mohon dipisah"
        value={catatan}
        onChangeText={setCatatan}
        multiline
      />
      
      {}
      <View style={{ marginTop: 20, paddingBottom: 50 }}>
        <TouchableOpacity 
          style={styles.customButton} 
          onPress={handleConfirmBooking}
        >
          <Text style={styles.customButtonText}>Konfirmasi Pemesanan</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 18,
    color: '#555',
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9'
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  pickerContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
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