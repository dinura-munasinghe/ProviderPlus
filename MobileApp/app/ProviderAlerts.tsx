"use no memo";
import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Switch, ActivityIndicator, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { useFocusEffect } from '@react-navigation/native';
import { fetchProviderBookings, ProviderBooking } from '../app/services/ordersService';

const TYPE_COLOR: Record<string, string> = {
  confirmed:  '#28A745',
  pending:    '#FF9800',
  completed:  '#00C6FF',
  cancelled:  '#FF3B30',
};

export default function ProviderAlertsScreen() {
  const router = useRouter();
  const [isSinhala, setIsSinhala]         = useState(false);
  const [bookings, setBookings]           = useState<ProviderBooking[]>([]);
  const [loading, setLoading]             = useState(true);
  const [refreshing, setRefreshing]       = useState(false);

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await fetchProviderBookings();
      setBookings(data);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const getIcon = (status: string) => {
    if (status === 'confirmed')  return '✅';
    if (status === 'completed')  return '🏁';
    if (status === 'cancelled')  return '❌';
    return '⏳';
  };

  const getTitle = (status: string) => {
    if (status === 'confirmed')  return 'Booking Confirmed';
    if (status === 'completed')  return 'Job Completed';
    if (status === 'cancelled')  return 'Booking Cancelled';
    return 'New Booking Request';
  };

  return (
    <LinearGradient colors={['#1086b5', '#022373']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>

        {/* ── TOP BAR ── */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <View style={styles.languageToggle}>
            <Text style={[styles.langLabel, !isSinhala && styles.langLabelActive]}>ENG</Text>
            <Text style={styles.langDivider}>|</Text>
            <Text style={[styles.langLabel, isSinhala && styles.langLabelActive]}>සිං</Text>
            <Switch
              value={isSinhala}
              onValueChange={() => setIsSinhala(p => !p)}
              trackColor={{ false: 'rgba(255,255,255,0.3)', true: '#FF6B35' }}
              thumbColor={isSinhala ? '#fff' : '#f0f0f0'}
              ios_backgroundColor="rgba(255,255,255,0.3)"
              style={styles.switchStyle}
            />
          </View>
        </View>

        {/* ── HEADER ── */}
        <View style={styles.headerContainer}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerTitle}>Notifications</Text>
              <Text style={styles.headerSub}>{bookings.length} bookings</Text>
            </View>
          </View>
          <View style={styles.headerSeparator} />
        </View>

        {/* ── LIST ── */}
        {loading ? (
          <View style={styles.centred}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scroll}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor="#fff" />
            }
          >
            {bookings.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No notifications yet</Text>
              </View>
            ) : (
              bookings.map(booking => {
                const color = TYPE_COLOR[booking.status] ?? '#888';
                return (
                  <BlurView
                    key={booking.booking_id}
                    intensity={25}
                    tint="dark"
                    experimentalBlurMethod="dimezisBlurView"
                    style={styles.notifCard}
                  >
                    <View style={[styles.colorBar, { backgroundColor: color }]} />
                    <View style={[styles.iconCircle, { borderColor: color }]}>
                      <Text style={styles.iconText}>{getIcon(booking.status)}</Text>
                    </View>
                    <View style={styles.notifContent}>
                      <View style={styles.notifTopRow}>
                        <Text style={styles.notifTitle}>{getTitle(booking.status)}</Text>
                        <Text style={styles.notifTime}>{booking.date}</Text>
                      </View>
                      <Text style={styles.notifMessage} numberOfLines={2}>
                        {booking.user_name} booked your service on {booking.date} at {booking.time}.
                      </Text>
                    </View>
                  </BlurView>
                );
              })
            )}
            <View style={{ height: 100 }} />
          </ScrollView>
        )}

      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea:  { flex: 1 },

  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 10, paddingBottom: 8,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center', justifyContent: 'center',
  },
  backArrow: { color: 'white', fontSize: 30, fontWeight: '300', marginTop: -6 },
  languageToggle: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
  },
  langLabel:       { color: 'rgba(255,255,255,0.5)', fontWeight: '700', fontSize: 13, marginHorizontal: 3 },
  langLabelActive: { color: 'white' },
  langDivider:     { color: 'rgba(255,255,255,0.4)', marginHorizontal: 2 },
  switchStyle:     { marginLeft: 6, transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] },

  headerContainer: { paddingHorizontal: 20, paddingBottom: 4, marginTop: 4 },
  headerRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 },
  headerTitle:     { color: 'white', fontSize: 30, fontWeight: '800' },
  headerSub:       { color: '#D96C06', fontSize: 13, fontWeight: '600', marginTop: 2 },
  headerSeparator: { height: 1, backgroundColor: 'rgba(255,255,255,0.25)' },

  scroll:    { paddingHorizontal: 14, paddingTop: 12 },
  centred:   { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyCard: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 20, alignItems: 'center', marginTop: 40 },
  emptyText: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },

  notifCard: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 18, marginBottom: 10, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingRight: 14, paddingVertical: 14,
  },
  colorBar: { width: 4, alignSelf: 'stretch', borderRadius: 4, marginRight: 12 },
  iconCircle: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, marginRight: 12,
  },
  iconText:     { fontSize: 20 },
  notifContent: { flex: 1 },
  notifTopRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  notifTitle:   { color: 'white', fontWeight: '700', fontSize: 14, flex: 1, marginRight: 6 },
  notifTime:    { color: 'rgba(255,255,255,0.45)', fontSize: 11 },
  notifMessage: { color: 'rgba(255,255,255,0.75)', fontSize: 13, lineHeight: 18 },
});