import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  StatusBar,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Get screen width for the swipeable cards
const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.82;

const ProviderDash = () => {
  const [isLanguageSinhala, setIsLanguageSinhala] = useState(false);

  const toggleLanguage = () => setIsLanguageSinhala((previousState) => !previousState);

  return (
    <LinearGradient
          colors={['#00C6FF', '#0072FF']}
          style={styles.container}
        >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <SafeAreaView style={styles.safeArea}>
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <View style={styles.headerLeft}>
            <TouchableOpacity>
              <Ionicons name="chevron-back" size={28} color="#ffffff" />
            </TouchableOpacity>
            <Text style={styles.logoText}>P</Text>
          </View>

          <View style={styles.headerRight}>
            <Text style={styles.languageText}>ENG | සිං</Text>
            <Switch
              trackColor={{ false: '#767577', true: '#FF8C00' }}
              thumbColor={'#ffffff'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleLanguage}
              value={isLanguageSinhala}
              style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
            />
          </View>
        </View>

        <Text style={styles.pageTitle}>Provider Dashboard</Text>

        {/* Main Vertical Scrollable Content */}
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* AI Smart Overview Card */}
          <View style={[styles.card, styles.aiCard]}>
            <View style={styles.aiHeader}>
              <Text style={styles.aiIcon}>✨</Text>
              <Text style={styles.aiTitle}>AI Smart Overview</Text>
            </View>
            <Text style={styles.aiText}>
              <Text style={{fontWeight: 'bold'}}>📈 Demand Spike:</Text> 45 users in the Gampaha area searched for 'emergency pipe leak' in the last 12 hours.
            </Text>
            <TouchableOpacity style={styles.aiButton}>
              <Text style={styles.aiButtonText}>Update Service Radius</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Stats Section */}
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.card, styles.statCard]}>
              <Text style={styles.statLabel}>Today's Earnings</Text>
              <Text style={styles.statValue}>LKR 4,500</Text>
            </View>
            <View style={[styles.card, styles.statCard]}>
              <Text style={styles.statLabel}>Jobs Done</Text>
              <Text style={styles.statValue}>12</Text>
            </View>
            <View style={[styles.card, styles.statCard]}>
              <Text style={styles.statLabel}>Avg Rating</Text>
              <Text style={styles.statValue}>⭐ 4.8</Text>
            </View>
            <View style={[styles.card, styles.statCard]}>
              <Text style={styles.statLabel}>Profile Views</Text>
              <Text style={styles.statValue}>230</Text>
            </View>
          </View>

          {/* Action Center - HORIZONTAL SWIPE CARDS */}
          <Text style={styles.sectionTitle}>At a Glance</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH + 15} // Card width + marginRight for smooth snapping
            decelerationRate="fast"
            contentContainerStyle={styles.actionScrollContent}
          >
            {/* Card 1: Pending Request */}
            <View style={[styles.card, styles.swipeCard]}>
              <View style={styles.jobHeader}>
                <View>
                  <Text style={styles.badgeTextUrgent}>New Request</Text>
                  <Text style={styles.jobTitle}>Blocked Sink Repair</Text>
                </View>
                <Text style={styles.jobPrice}>LKR 2,500</Text>
              </View>
              <Text style={styles.jobDetails}>📍 12 Temple Rd, Gampaha</Text>
              <Text style={styles.jobDetails}>🕒 Today, 2:00 PM</Text>
              <View style={styles.jobActions}>
                <TouchableOpacity style={[styles.actionBtn, styles.declineBtn]}>
                  <Text style={styles.declineBtnText}>Decline</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.acceptBtn]}>
                  <Text style={styles.acceptBtnText}>Accept</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Card 2: Upcoming Appointment */}
            <View style={[styles.card, styles.swipeCard]}>
              <View style={styles.jobHeader}>
                <View>
                  <Text style={styles.badgeTextInfo}>Up Next</Text>
                  <Text style={styles.jobTitle}>Pipe Installation</Text>
                </View>
              </View>
              <Text style={styles.jobDetails}>👤 Kamal Perera</Text>
              <Text style={styles.jobDetails}>📍 45 Main St, Colombo</Text>
              <Text style={styles.jobDetails}>🕒 Tomorrow, 10:00 AM</Text>
              <View style={styles.jobActions}>
                <TouchableOpacity style={[styles.actionBtn, styles.secondaryBtn]}>
                  <Text style={styles.secondaryBtnText}>Directions</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.primaryBtn]}>
                  <Text style={styles.primaryBtnText}>Call Customer</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Card 3: Recent Completion */}
            <View style={[styles.card, styles.swipeCard]}>
              <View style={styles.jobHeader}>
                <View>
                  <Text style={styles.badgeTextSuccess}>Completed</Text>
                  <Text style={styles.jobTitle}>Water Heater Fix</Text>
                </View>
                <Text style={styles.jobPrice}>+LKR 5,000</Text>
              </View>
              <Text style={styles.jobDetails}>✅ Payment added to wallet</Text>
              <Text style={styles.jobDetails}>⭐ Customer left a 5-star review</Text>
              <View style={styles.jobActions}>
                <TouchableOpacity style={[styles.actionBtn, styles.primaryBtn]}>
                  <Text style={styles.primaryBtnText}>View Receipt</Text>
                </TouchableOpacity>
              </View>
            </View>

          </ScrollView>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 40,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
    fontStyle: 'italic',
    marginLeft: 5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 5,
  },
  pageTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
    paddingHorizontal: 20, // Moved padding here from container so horizontal scroll goes to edge
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    marginLeft: 5,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  aiCard: {
    borderColor: '#0CB6FF',
    borderWidth: 2,
    marginTop: 10,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  aiIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#004BB5',
  },
  aiText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
    marginBottom: 16,
  },
  aiButton: {
    backgroundColor: '#004BB5',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  aiButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    marginBottom: 15,
    alignItems: 'center',
    paddingVertical: 20,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222222',
  },
  // --- Swipeable Action Center Styles ---
  actionScrollContent: {
    paddingBottom: 10, // Shadow clipping prevention
    paddingRight: 20, // Add padding to the end of the scroll
  },
  swipeCard: {
    width: CARD_WIDTH,
    marginRight: 15, // Space between cards
    marginBottom: 5,
  },
  badgeTextUrgent: {
    color: '#dc3545',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  badgeTextInfo: {
    color: '#007AFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  badgeTextSuccess: {
    color: '#28a745',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222222',
  },
  jobPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745',
  },
  jobDetails: {
    fontSize: 14,
    color: '#555555',
    marginBottom: 6,
  },
  jobActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  declineBtn: {
    backgroundColor: '#f8d7da',
  },
  declineBtnText: {
    color: '#dc3545',
    fontWeight: 'bold',
  },
  acceptBtn: {
    backgroundColor: '#28a745',
  },
  acceptBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  primaryBtn: {
    backgroundColor: '#004BB5',
  },
  primaryBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  secondaryBtn: {
    backgroundColor: '#e2e6ea',
  },
  secondaryBtnText: {
    color: '#333333',
    fontWeight: 'bold',
  },
});

export default ProviderDash;