import { Stack } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useBookings } from '../context/GlobalContext';

function BookingCard({ item }) {
  let statusBarColor = '#FFA500';
  let statusText = item.status;

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.serviceName}</Text>
      <Text style={styles.cardInfo}>Dipesan oleh: {item.namaPelanggan}</Text>
      {}
      <Text style={styles.cardInfo}>Jadwal: {item.tanggalPesan}</Text>
      {item.catatan ? (
        <Text style={styles.cardInfo}>Catatan: {item.catatan}</Text>
      ) : null}
      
      <View style={styles.statusBarContainer}>
        <View style={[styles.statusBar, { backgroundColor: statusBarColor }]} />
      </View>
      <Text style={styles.statusText}>{statusText}</Text>
    </View>
  );
}

export default function MyBookingsScreen() {
  const { bookings } = useBookings();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Pesananku' }} />
      
      <FlatList
        data={bookings}
        renderItem={({ item }) => <BookingCard item={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Anda belum memiliki pesanan.</Text>
            <Text style={styles.emptySubText}>Buat pesanan di tab "Home"!</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#eee',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardInfo: {
    fontSize: 14,
    color: '#444',
    marginBottom: 4,
  },
  statusBarContainer: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginTop: 12,
    overflow: 'hidden',
  },
  statusBar: {
    height: '100%',
    width: '33%', 
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFA500',
    marginTop: 6,
    textAlign: 'right',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555',
  },
  emptySubText: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
  },
});