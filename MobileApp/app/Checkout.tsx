import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { StripeProvider, useStripe } from '@stripe/stripe-react-native';

// --- CONFIGURATION ---
const STRIPE_PUBLISHABLE_KEY = "pk_test_your_key_here"; // Get this from Stripe Dashboard
const BACKEND_URL = "https://your-api-endpoint.com"; // Your Node.js/Firebase backend

const PaymentScreenContent = () => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);

  // 1. Fetch parameters from your backend
  const fetchPaymentSheetParams = async () => {
    // In a real Uni project, your backend creates a 'PaymentIntent'
    // For now, this is a placeholder for your fetch call
    const response = await fetch(`${BACKEND_URL}/payment-sheet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const { paymentIntent, ephemeralKey, customer } = await response.json();

    return {
      paymentIntent,
      ephemeralKey,
      customer,
    };
  };

  // 2. Initialize the UI
  const initializePaymentSheet = async () => {
    setLoading(true);
    try {
      // In a "Demo" without a backend, this part will fail until you provide a real ClientSecret
      const { paymentIntent, customer } = await fetchPaymentSheetParams();

      const { error } = await initPaymentSheet({
        merchantDisplayName: "Provider+ Ltd.",
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: paymentIntent,
        allowsDelayedPaymentMethods: true,
        defaultBillingDetails: { name: 'Dinura Munasinghe' }
      });

      if (error) {
        Alert.alert("Error", error.message);
      }
    } catch (e) {
      console.log("Backend not connected yet - integration ready.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializePaymentSheet();
  }, []);

  // 3. Trigger the Payment UI
  const openPaymentSheet = async () => {
    const { error } = await presentPaymentSheet();

    if (error) {
      Alert.alert(`Error code: ${error.code}`, error.message);
    } else {
      Alert.alert('Success', 'Your payment is confirmed! (Demo Mode)');
    }
  };

  return (
    <LinearGradient colors={['#00ADF5', '#0072FF']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Final Step</Text>

        <BlurView
          intensity={40}
          tint="light"
          experimentalBlurMethod="dimezisBlurView"
          style={styles.glassCard}
        >
          <Text style={styles.label}>BOOKING FOR</Text>
          <Text style={styles.serviceName}>Advanced Tech Support</Text>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>SUBTOTAL</Text>
            <Text style={styles.priceText}>LKR 2,500</Text>
          </View>
        </BlurView>

        <TouchableOpacity
          onPress={openPaymentSheet}
          style={styles.buttonWrapper}
          disabled={loading}
        >
          <LinearGradient
            colors={['#E91E63', '#C2185B']}
            style={styles.payButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>PROCEED TO PAY (STRIPE)</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.footerNote}>Demo Mode: Supervisor Review Copy</Text>
      </ScrollView>
    </LinearGradient>
  );
};

// Main Export wrapping with Provider
export default function PaymentScreen() {
  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <PaymentScreenContent />
    </StripeProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 25, paddingTop: 80 },
  title: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 40, textAlign: 'center' },
  glassCard: {
    padding: 30,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    overflow: 'hidden',
    marginBottom: 50,
  },
  label: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  serviceName: { color: '#fff', fontSize: 22, fontWeight: '600', marginTop: 8, marginBottom: 20 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceText: { color: '#fff', fontSize: 24, fontWeight: '800' },
  buttonWrapper: { shadowColor: '#E91E63', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 10 },
  payButton: { paddingVertical: 20, borderRadius: 20, alignItems: 'center', minHeight: 60, justifyContent: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 1.5 },
  footerNote: { color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: 20, fontSize: 12 }
});

export default Checkout;