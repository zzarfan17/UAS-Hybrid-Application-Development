import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  Image, ActivityIndicator, StatusBar, Platform, RefreshControl 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient'; 
import { useAuth } from '../context/GlobalContext';
import { API_URL } from '../../constants/Api'; 

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [discountInfo, setDiscountInfo] = useState({ isEligible: false, timeLeft: '', daysSince: 0 });

  const calculateDiscount = () => {
    if (!user || !user.created_at) return;
    const dateString = user.created_at.replace(' ', 'T');
    const joinDate = new Date(dateString);
    const now = new Date();
    const deadline = new Date(joinDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    const timeLeftMs = deadline.getTime() - now.getTime();

    if (timeLeftMs > 0) {
      const days = Math.floor(timeLeftMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeLeftMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeftMs % (1000 * 60)) / 1000);
      setDiscountInfo({ isEligible: true, timeLeft: `${days}h ${hours}j ${minutes}m ${seconds}s`, daysSince: 0 }); 
    } else {
      const diffTime = Math.abs(now.getTime() - joinDate.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      setDiscountInfo({ isEligible: false, timeLeft: 'Expired', daysSince: diffDays });
    }
  };

  useEffect(() => {
    fetchServices();
    calculateDiscount();
    const timer = setInterval(calculateDiscount, 1000);
    return () => clearInterval(timer);
  }, [user]);

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${API_URL}/services`);
      setServices(response.data);
    } catch (error) { console.error(error); } finally { setLoading(false); setRefreshing(false); }
  };

  const onRefresh = () => { setRefreshing(true); fetchServices(); calculateDiscount(); };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#007BFF" />
      
      {/* Header Biru */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greetingText}>Halo,</Text>
            <Text style={styles.userNameText}>{user?.name || "Pelanggan"}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/profile')}>
            <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }} style={styles.avatar} />
          </TouchableOpacity>
        </View>

        {/* --- BANNER DISKON COMPACT (TETAP DIPERTAHANKAN) --- */}
        <View style={styles.bannerContainer}>
          {discountInfo.isEligible ? (
            <LinearGradient colors={['#FF416C', '#FF4B2B']} start={{x:0, y:0}} end={{x:1, y:0}} style={styles.bannerCompact}>
                <Ionicons name="gift" size={24} color="#fff" style={{marginRight: 10}} />
                <View style={{ flex: 1 }}> 
                  <Text style={styles.bannerTitleCompact}>DISKON 20% AKUN BARU!</Text>
                  <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 2}}>
                     <Ionicons name="time-outline" size={10} color="#fff" style={{marginRight: 4}} />
                     <Text style={styles.timerTextCompact}>{discountInfo.timeLeft}</Text>
                  </View>
                </View>
            </LinearGradient>
          ) : (
             <View style={[styles.bannerCompact, { backgroundColor: 'rgba(0,0,0,0.15)' }]}>
                <Ionicons name="shield-checkmark" size={24} color="#fff" style={{marginRight: 10}} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.bannerTitleCompact}>Member Setia</Text>
                  <Text style={styles.timerTextCompact}>{discountInfo.daysSince} hari bersama kami</Text>
                </View>
             </View>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <Text style={styles.sectionTitle}>Pilih Paket Pilihanmu</Text>

        {loading ? ( <ActivityIndicator size="large" color="#007BFF" /> ) : (
          <View>
            {services.map((service) => (
              <TouchableOpacity 
                key={service.id} 
                style={styles.listCard} 
                onPress={() => router.push({ pathname: '/detail', params: service })}
              >
                <Image source={{ uri: service.image_url }} style={styles.listImage} />
                <View style={styles.listContent}>
                  <View style={{flexDirection:'row', justifyContent:'space-between'}}>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    <View style={styles.ratingBadge}>
                      <Ionicons name="star" size={12} color="#FFD700" />
                      <Text style={styles.ratingText}>{service.rating}</Text>
                    </View>
                  </View>
                  <Text style={styles.servicePrice}>{service.price}</Text>
                  <View style={styles.durationBadge}>
                     <Ionicons name="time-outline" size={12} color="#666" />
                     <Text style={styles.durationText}>{service.duration}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' }, // Static White
  header: {
    backgroundColor: '#007BFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 50,
    paddingBottom: 20, 
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  greetingText: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  userNameText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  avatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: '#fff' },

  bannerContainer: { marginTop: 0 },
  
  // --- BANNER COMPACT STYLE ---
  bannerCompact: {
    flexDirection: 'row', alignItems: 'center',
    padding: 12, borderRadius: 12,
  },
  bannerTitleCompact: { color: '#fff', fontWeight: 'bold', fontSize: 15 }, 
  timerTextCompact: { color: 'rgba(255,255,255,0.9)', fontSize: 11, fontWeight: '500' },

  scrollContent: { padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15, textAlign: 'center', color: '#444' },

  listCard: {
    flexDirection: 'row', borderRadius: 12, marginBottom: 12, padding: 10, backgroundColor: '#fff',
    alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  listImage: { width: 70, height: 70, borderRadius: 10, resizeMode: 'contain', backgroundColor: '#F8F9FD' },
  listContent: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  serviceName: { fontSize: 15, fontWeight: 'bold', marginBottom: 4, color: '#333' },
  servicePrice: { fontSize: 14, color: '#007BFF', fontWeight: 'bold', marginBottom: 6 },
  ratingBadge: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontSize: 12, color: '#888', marginLeft: 4, fontWeight: 'bold' },
  
  // BAGIAN YANG TADI ERROR (SUDAH DIPERBAIKI):
  durationBadge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F2F5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  durationText: { fontSize: 11, color: '#666', marginLeft: 4 }
});