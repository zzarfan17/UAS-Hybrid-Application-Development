import React from 'react';
import { 
  View, Text, StyleSheet, Image, TouchableOpacity, 
  StatusBar, ScrollView, Linking, Platform 
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/GlobalContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
  const { user, signOut } = useAuth(); 
  const router = useRouter();

  // --- FUNGSI LOGOUT LANGSUNG (LOGIKA BRUTAL ANTI-BUG) ---
  const handleLogout = async () => {
    // Pakai console.warn supaya muncul warning kuning di layar HP/Browser
    console.warn(">>> TOMBOL LOGOUT DITEKAN!"); 

    try {
      // 1. Hapus Storage Manual (Jurus Kunci)
      await AsyncStorage.removeItem('user');
      console.warn(">>> AsyncStorage 'user' dihapus!");

      // 2. Panggil Context (Opsional, tapi bagus buat update state)
      if (signOut) {
          await signOut();
          console.warn(">>> Context signOut beres!");
      }

      // 3. NAVIGASI PAKSA
      // Kita pakai setTimeout biar script di atas selesai dulu
      setTimeout(() => {
          console.warn(">>> Memindahkan ke halaman Login...");
          
          // Coba dismiss dulu
          if (router.canDismiss()) {
              router.dismissAll();
          }
          
          // Ganti halaman ke root
          router.replace('/'); 
      }, 500);

    } catch (error) {
      console.error(">>> ERROR LOGOUT:", error);
      // Tetap paksa pindah walau error
      router.replace('/');
    }
  };

  // --- Fungsi CS ---
  const handleCS = () => {
    const phoneNumber = "62895367009750"; 
    const message = "Halo Admin, saya butuh bantuan.";
    const url = `whatsapp://send?text=${message}&phone=${phoneNumber}`;
    Linking.openURL(url).catch(() => Linking.openURL(`https://wa.me/${phoneNumber}?text=${message}`));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#007BFF" />

      {/* HEADER (Sesuai Gambar) */}
      <LinearGradient colors={['#007BFF', '#0052D4']} style={styles.header}>
        <View style={styles.profileHeader}>
           <View style={styles.avatarContainer}>
              <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }} style={styles.avatar} />
              <View style={styles.editIconBadge}><Ionicons name="camera" size={12} color="#007BFF" /></View>
           </View>
           <Text style={styles.nameText}>{user?.name || "Pengguna"}</Text>
           <Text style={styles.statusText}>Member Setia</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        
        {/* INFO CARD (Isinya Email, HP, Bergabung - Sesuai Gambar) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informasi Akun</Text>
          
          {/* Email */}
          <View style={styles.infoRow}>
             <View style={styles.iconContainer}><Ionicons name="mail-outline" size={18} color="#007BFF" /></View>
             <View>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.value}>{user?.email || "-"}</Text>
             </View>
          </View>
          <View style={styles.divider} />
          
          {/* Nomor HP */}
          <View style={styles.infoRow}>
             <View style={styles.iconContainer}><Ionicons name="call-outline" size={18} color="#007BFF" /></View>
             <View>
                <Text style={styles.label}>No. HP</Text>
                <Text style={styles.value}>{user?.phone || "-"}</Text>
             </View>
          </View>
          <View style={styles.divider} />

          {/* Bergabung (Sesuai Gambar) */}
          <View style={styles.infoRow}>
             <View style={styles.iconContainer}><Ionicons name="calendar-outline" size={18} color="#007BFF" /></View>
             <View>
                <Text style={styles.label}>Bergabung</Text>
                <Text style={styles.value}>{formatDate(user?.created_at)}</Text>
             </View>
          </View>
        </View>

        {/* MENU LAINNYA */}
        <Text style={styles.sectionLabel}>Menu Lainnya</Text>
        <View style={styles.menuContainer}>
            
            {/* Edit Profile (Sesuai Gambar ada Badge oranye) */}
            <TouchableOpacity style={styles.menuItem} onPress={() => console.warn("Fitur Maintenance")}>
                <View style={[styles.menuIconBox, { backgroundColor: '#E6F0FF' }]}>
                    <Ionicons name="create-outline" size={20} color="#007BFF" />
                </View>
                <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                    <Text style={styles.menuTextBasic}>Edit Profile</Text>
                    <View style={styles.maintenanceBadge}>
                        <Text style={styles.maintenanceText}>*Masih diperbaiki</Text>
                    </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#ccc" />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            {/* Bantuan CS */}
            <TouchableOpacity style={styles.menuItem} onPress={handleCS}>
                <View style={[styles.menuIconBox, { backgroundColor: '#E8F5E9' }]}>
                    <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
                </View>
                <Text style={styles.menuText}>Bantuan & CS</Text>
                <Ionicons name="chevron-forward" size={18} color="#ccc" />
            </TouchableOpacity>
        </View>

        {/* TOMBOL LOGOUT LANGSUNG (MERAH BESAR) */}
        <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={handleLogout}
            activeOpacity={0.7} 
        >
           <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={{height: 20}} /> 
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' }, 
  header: { height: 220, justifyContent: 'center', alignItems: 'center', paddingBottom: 30, borderBottomLeftRadius: 25, borderBottomRightRadius: 25 },
  profileHeader: { alignItems: 'center' },
  avatarContainer: { marginBottom: 10, position: 'relative', elevation: 5 },
  avatar: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: '#fff' }, 
  editIconBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#fff', padding: 6, borderRadius: 15, elevation: 2 },
  nameText: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 2 },
  statusText: { color: 'rgba(255,255,255,0.8)', fontSize: 12, backgroundColor: 'rgba(0,0,0,0.1)', paddingHorizontal: 10, paddingVertical: 2, borderRadius: 15 },
  contentContainer: { paddingHorizontal: 20, marginTop: -40, paddingBottom: 30 }, 
  
  // CARD STYLE
  card: { backgroundColor: '#fff', borderRadius: 15, padding: 20, elevation: 3, marginBottom: 20 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  
  // INFO ROWS
  infoRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 6 },
  iconContainer: { width: 35, height: 35, backgroundColor: '#E6F0FF', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  label: { fontSize: 11, marginBottom: 1, color: '#666' },
  value: { fontSize: 14, fontWeight: '600', color: '#333' },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 8, marginLeft: 47 },
  
  // SECTION TITLE
  sectionLabel: { fontSize: 13, fontWeight: 'bold', marginBottom: 8, marginLeft: 5, color: '#666' },
  
  // MENU CONTAINER
  menuContainer: { backgroundColor: '#fff', borderRadius: 15, padding: 5, marginBottom: 20, elevation: 2 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12 },
  menuIconBox: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  menuText: { flex: 1, fontSize: 14, fontWeight: '500', color: '#333' },
  menuTextBasic: { fontSize: 14, fontWeight: '500', color: '#333' }, 
  menuDivider: { height: 1, backgroundColor: '#F5F7FA', marginLeft: 56 },
  
  // BADGE STYLE (Untuk *Masih diperbaiki)
  maintenanceBadge: { marginLeft: 8, backgroundColor: '#FFF3E0', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  maintenanceText: { fontSize: 10, color: '#FF9800', fontWeight: 'bold' },

  // LOGOUT BUTTON
  logoutButton: { backgroundColor: '#FF416C', paddingVertical: 12, borderRadius: 12, alignItems: 'center', elevation: 3 },
  logoutText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
});