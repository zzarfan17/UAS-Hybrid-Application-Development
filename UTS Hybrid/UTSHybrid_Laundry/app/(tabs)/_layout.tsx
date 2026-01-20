import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { useAuth } from '../context/GlobalContext'; 
import { Ionicons } from '@expo/vector-icons';

const WARNA_TEMA = '#007BFF'; 

export default function TabsLayout() {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return <Redirect href="/" />;
  }

  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: WARNA_TEMA,
    }}>
      <Tabs.Screen 
        name="home"
        options={{ 
          title: 'Home', 
          headerShown: false, 
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
        }} 
      />
      <Tabs.Screen 
        name="mybookings"
        options={{ 
          title: 'My Bookings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list" color={color} size={size} />
          ),
        }} 
      />
    </Tabs>
  );
}