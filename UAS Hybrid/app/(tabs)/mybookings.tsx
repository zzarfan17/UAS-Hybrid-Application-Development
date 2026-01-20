import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, ActivityIndicator, 
  RefreshControl, StatusBar, Platform, TouchableOpacity, 
  Modal, Linking, Alert, Dimensions
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router'; 
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons'; 
import * as Clipboard from 'expo-clipboard'; 
import { useAuth } from '../context/GlobalContext';
import { API_URL } from '../../constants/Api';

const BANK_INFO = {
  bank: "BCA",
  noRek: "013197419", 
  atasNama: "MUHAMMAD ZHARFAN FITHRAT" 
};

const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0
  }).format(number);
};

// --- KOMPONEN TIMER ---
const BookingTimer = ({ createdAt, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const orderTime = new Date(createdAt).getTime();
    const targetTime = orderTime + (10 * 60 * 1000); 

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetTime - now;

      if (distance < 0) {
        clearInterval(interval); 
        setTimeLeft("Expired");
        if (onExpire) onExpire(); 
      } else {
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [createdAt]);

  if (!timeLeft || timeLeft === "Expired") return null;

  return (
    <View style={styles.timerContainer}>
      <Ionicons name="time-outline" size={14} color="#D32F2F" style={{marginRight: 4}} />
      <Text style={styles.timerText}>Bayar dalam: {timeLeft}</Text>
    </View>
  );
};

export default function MyBookingsScreen() {
  const { user } = useAuth(); // Pastikan user punya field created_at
  const router = useRouter(); 
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchBookings = async () => {
    if (!user) return;
    try {
      const antiCache = new Date().getTime(); 
      const response = await axios.get(`${API_URL}/bookings/${user.id}?time=${antiCache}`);
      setBookings(response.data);
    } catch (error) {
      console.error("Gagal ambil data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchBookings(); }, [user]));
  const onRefresh = () => { setRefreshing(true); fetchBookings(); };

  const handleAutoDelete = async (item) => {
    try {
      await axios.delete(`${API_URL}/bookings/${item.id}`);
      setBookings(current => current.filter(o => o.id !== item.id));
    } catch (error) {
      fetchBookings(); 
    }
  };

  const handleCancelOrder = (item) => {
    const executeDelete = async () => {
      try {
        await axios.delete(`${API_URL}/bookings/${item.id}`);
        setBookings(current => current.filter(o => o.id !== item.id));
        if (Platform.OS === 'web') window.alert("✅ Pesanan berhasil dihapus.");
        else Alert.alert("Sukses", "Pesanan berhasil dihapus.");
      } catch (error) {
        Alert.alert("Gagal", "Terjadi kesalahan.");
      }
    };
    if (Platform.OS === 'web') {
      setTimeout(() => { if (window.confirm(`Hapus pesanan ini selamanya?`)) executeDelete(); }, 100);
    } else {
      Alert.alert("Hapus Pesanan?", "Yakin?", [{ text: "Batal" }, { text: "Hapus", style: "destructive", onPress: executeDelete }]);
    }
  };

  // --- LOGIKA DISKON CERDAS (ANTI BUG) ---
  const handleOpenPayment = (item) => {
    const rawPriceString = item.total_price || "0";
    const rawPriceNumber = parseInt(rawPriceString.replace(/[^0-9]/g, '')) || 0;
    
    // 1. Cek Umur Akun
    let isNewAccount = false;
    if (user && user.created_at) {
        const joinDate = new Date(user.created_at);
        const today = new Date();
        const diffTime = Math.abs(today - joinDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        
        // Diskon hanya untuk akun < 7 hari
        if (diffDays <= 7) isNewAccount = true;
    } else {
        // Fallback kalau data created_at tidak ada, anggap akun baru (opsional)
        isNewAccount = true; 
    }

    // 2. Hitung Harga
    let finalPriceNumber = rawPriceNumber;
    let originalPriceDisplay = formatRupiah(rawPriceNumber);
    
    if (isNewAccount) {
        finalPriceNumber = rawPriceNumber * 0.80; // Diskon 20%
    }

    setSelectedOrder({ 
      ...item, 
      originalPriceDisplay: originalPriceDisplay,
      finalPriceDisplay: formatRupiah(finalPriceNumber),
      finalPriceNumber: finalPriceNumber,
      isDiscounted: isNewAccount // Simpan status diskon
    });
    setModalVisible(true);
  };

  const copyToClipboard = async (text) => {
    await Clipboard.setStringAsync(String(text)); 
    if (Platform.OS === 'web') window.alert(`✅ Disalin: ${text}`);
    else Alert.alert("Berhasil", "Disalin!");
  };

  const handleConfirmWA = () => {
    if (!selectedOrder) return;
    const diskonText = selectedOrder.isDiscounted ? "(Sudah Diskon 20%)" : "";
    const text = `Halo Admin, saya transfer *${selectedOrder.finalPriceDisplay}* ${diskonText} ke BCA a/n ${BANK_INFO.atasNama} utk Order #${selectedOrder.id}`;
    const url = `whatsapp://send?text=${encodeURIComponent(text)}&phone=62895367009750`;
    Linking.openURL(url).catch(() => Linking.openURL(`https://wa.me/62895367009750?text=${encodeURIComponent(text)}`));
    setModalVisible(false);
  };

  const getStatusColor = (s) => (!s || s === 'pending' ? '#FFC107' : s === 'cancelled' ? '#DC3545' : s === 'processed' ? '#007BFF' : '#28A745');
  const getStatusLabel = (s) => (!s || s === 'pending' ? 'Menunggu' : s === 'cancelled' ? 'Hangus' : s === 'processed' ? 'Diproses' : 'Selesai');

  const renderItem = ({ item }) => {
    let displayPrice = item.total_price || "Rp 0";
    let displayAddress = "-", displayTime = "-", displayNote = "-";
    const rawNote = item.notes || "";
    if (rawNote.includes('Alamat:') || rawNote.includes('Waktu:')) {
       const parts = rawNote.split('|');
       parts.forEach(part => {
          const txt = part.trim();
          if (txt.startsWith('Alamat:')) displayAddress = txt.replace('Alamat:', '').trim();
          if (displayTime === "-" && txt.startsWith('Waktu:')) displayTime = txt.replace('Waktu:', '').trim();
          if (txt.startsWith('Catatan:')) { const clean = txt.replace('Catatan:', '').trim(); if (clean && clean.toLowerCase() !== 'undefined') displayNote = clean; }
       });
    } else if (rawNote && rawNote !== "-") displayNote = rawNote;
    const isPending = !item.status || item.status === '' || item.status.toLowerCase() === 'pending';
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
            <Text style={styles.serviceTitle}>{item.service_name}</Text>
            <View style={{alignItems: 'flex-end'}}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
                </View>
                {isPending && <BookingTimer createdAt={item.created_at} onExpire={() => handleAutoDelete(item)} />}
            </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoBlock}><Text style={styles.label}>Total:</Text><Text style={styles.priceValue}>{displayPrice}</Text></View>
        <View style={styles.infoBlock}><Text style={styles.label}>Alamat:</Text><Text style={styles.valueText}>{displayAddress}</Text></View>
        <View style={styles.infoBlock}><Text style={styles.label}>Waktu:</Text><Text style={styles.valueText}>{displayTime}</Text></View>
        <View style={styles.infoBlockLast}><Text style={styles.label}>Catatan:</Text><Text style={styles.valueText}>{displayNote}</Text></View>
        {isPending && (
            <View style={styles.actionRow}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => handleCancelOrder(item)}>
                    <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                    <Text style={styles.cancelButtonText}>Hapus</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.payButton} onPress={() => handleOpenPayment(item)}>
                    <Ionicons name="card-outline" size={18} color="#fff" style={{marginRight: 6}} />
                    <Text style={styles.payButtonText}>Bayar</Text>
                </TouchableOpacity>
            </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#007BFF" />
      <View style={styles.header}><Text style={styles.headerTitle}>Pesanan Saya</Text></View>
      {loading ? ( <ActivityIndicator size="large" color="#007BFF" style={{ marginTop: 50 }} /> ) : bookings.length === 0 ? (
        <View style={styles.emptyStateCreative}>
           <Ionicons name="basket-outline" size={120} color="#E0E0E0" style={styles.emptyIcon} />
           <Text style={styles.emptyTitleCreative}>Keranjang Masih Kosong!</Text>
           <Text style={styles.emptySubtitleCreative}>Sepertinya kamu belum punya riwayat laundry nih. Baju kotor udah numpuk? Yuk, pesan sekarang!</Text>
            <TouchableOpacity style={styles.emptyButtonCreative} onPress={() => router.push('/home')}>
              <Text style={styles.emptyButtonTextCreative}>Mulai Pesan Laundry</Text>
            </TouchableOpacity>
        </View>
      ) : (
        <FlatList data={bookings} keyExtractor={(item) => item.id.toString()} renderItem={renderItem} contentContainerStyle={styles.listContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} />
      )}

      <Modal visible={modalVisible} transparent={true} onRequestClose={() => setModalVisible(false)}>
         <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
               <TouchableOpacity onPress={() => setModalVisible(false)} style={{alignSelf:'flex-end'}}><Ionicons name="close" size={24}/></TouchableOpacity>
               <Text style={styles.modalTitle}>Info Pembayaran</Text>
               <View style={styles.bankCard}>
                 <Text style={styles.bankLabel}>BCA</Text>
                 <View style={styles.copyContainer}>
                    <Text style={styles.norekText}>{BANK_INFO.noRek}</Text>
                    <TouchableOpacity onPress={() => copyToClipboard(BANK_INFO.noRek)}><Ionicons name="copy-outline" size={20} color="#007BFF" style={{marginLeft:8}}/></TouchableOpacity>
                 </View>
                 <View style={{alignItems: 'center', marginTop: 10}}>
                    <Text style={{fontSize: 14, color: '#666', marginBottom: 2}}>a/n</Text>
                    <Text style={styles.atasNamaText}>{BANK_INFO.atasNama}</Text>
                 </View>
               </View>

               {/* --- TAMPILAN DINAMIS (DISKON vs NORMAL) --- */}
               <View style={{alignItems:'center', marginBottom:20}}>
                   <Text style={{fontSize:12, color:'#666', marginBottom: 5}}>Total Transfer:</Text>
                   
                   {/* Jika Diskon: Tampilkan Harga Coret. Jika Normal: Sembunyikan */}
                   {selectedOrder?.isDiscounted && (
                       <Text style={{fontSize:16, color:'#999', textDecorationLine: 'line-through', marginBottom: 2}}>
                           {selectedOrder?.originalPriceDisplay}
                       </Text>
                   )}

                   <View style={styles.copyContainer}>
                     <Text style={{fontSize:24, fontWeight:'bold', color: selectedOrder?.isDiscounted ? '#007BFF' : '#333'}}>
                        {selectedOrder?.finalPriceDisplay}
                     </Text>
                     <TouchableOpacity onPress={() => copyToClipboard(selectedOrder?.finalPriceNumber)}><Ionicons name="copy-outline" size={22} color={selectedOrder?.isDiscounted ? '#007BFF' : '#333'} style={{marginLeft:8}}/></TouchableOpacity>
                   </View>
                   
                   {/* Badge Hanya Muncul Kalau Dapat Diskon */}
                   {selectedOrder?.isDiscounted && (
                       <View style={{backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, marginTop: 5}}>
                          <Text style={{color: '#2E7D32', fontSize: 12, fontWeight: 'bold'}}>Hemat 20% (Promo Akun Baru)</Text>
                       </View>
                   )}
               </View>

               <TouchableOpacity style={styles.waButton} onPress={handleConfirmWA}><Text style={styles.waButtonText}>Konfirmasi Pembayaran</Text></TouchableOpacity>
            </View>
         </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { backgroundColor: '#007BFF', paddingTop: 50, paddingBottom: 15, paddingHorizontal: 20, marginBottom: 10 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  listContent: { padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#eee', elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  serviceTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', flex: 1 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-end', marginBottom: 4 },
  statusText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  timerContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  timerText: { fontSize: 12, color: '#D32F2F', fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginBottom: 10 },
  infoBlock: { marginBottom: 8 }, infoBlockLast: { marginBottom: 15 },
  label: { fontSize: 12, color: '#888' }, priceValue: { fontSize: 16, fontWeight: 'bold', color: '#007BFF' }, valueText: { fontSize: 14, color: '#333' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  payButton: { backgroundColor: '#007BFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 8, flex: 1, marginLeft: 5 },
  payButtonText: { color: '#fff', fontWeight: 'bold' },
  cancelButton: { backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#FF3B30', flex: 1, marginRight: 5 },
  cancelButtonText: { color: '#FF3B30', fontWeight: 'bold', marginLeft: 5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', padding: 25, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  bankCard: { backgroundColor: '#f0f2f5', padding: 20, borderRadius: 12, alignItems: 'center', marginBottom: 15, borderWidth: 1, borderColor:'#ddd', borderStyle:'dashed' },
  bankLabel: { fontSize: 14, color: '#666' }, norekText: { fontSize: 24, fontWeight: 'bold', color: '#007BFF' }, atasNamaText: { fontWeight: '600', fontSize: 16, color: '#333', textAlign: 'center' },
  copyContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  waButton: { backgroundColor: '#25D366', padding: 12, borderRadius: 10, alignItems: 'center' }, waButtonText: { color: '#fff', fontWeight: 'bold' },
  emptyStateCreative: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30, marginTop: 50 },
  emptyIcon: { marginBottom: 20, opacity: 0.8 },
  emptyTitleCreative: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 10, textAlign: 'center' },
  emptySubtitleCreative: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 30, lineHeight: 20, paddingHorizontal: 20 },
  emptyButtonCreative: { backgroundColor: '#007BFF', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 25, elevation: 3 },
  emptyButtonTextCreative: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});