import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    StyleSheet, View, Text, TouchableOpacity,
    ActivityIndicator, Platform,
} from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './services/apiClient';

const POLL_INTERVAL_MS = 60_000;
const API_KEY_CACHE    = 'maps_api_key';

// ── Types ─────────────────────────────────────────────────────────────────────

interface TrackingData {
    provider_name:      string;
    provider_latitude:  number | null;
    provider_longitude: number | null;
    user_latitude:      number | null;
    user_longitude:     number | null;
    has_live_location:  boolean;
}

// ── Base map HTML — loads immediately, no markers yet ─────────────────────────
// Markers are injected later via injectJavaScript() once we have coordinates.
// The map starts loading tiles the moment this renders.

const buildBaseHtml = (apiKey: string): string => `
<!DOCTYPE html> + 
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0,
        maximum-scale=1.0, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map;
    var providerMarker = null;
    var userMarker     = null;
    var routeRenderer  = null;

    function initMap() {
      // Start centred on Sri Lanka — markers will be added once data arrives
      map = new google.maps.Map(document.getElementById('map'), {
        zoom: 8,
        center: { lat: 7.8731, lng: 80.7718 },
        disableDefaultUI: true,
        zoomControl: true,
        gestureHandling: 'greedy',
      });

      // Tell React Native the map is ready to receive marker data
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'MAP_READY' }));
    }

    // Called by React Native via injectJavaScript once we have coordinates
    function placeMarkers(provLat, provLng, userLat, userLng, providerName) {
      var provPos = { lat: provLat, lng: provLng };
      var userPos = { lat: userLat, lng: userLng };

      // Remove old markers if updating
      if (providerMarker) providerMarker.setMap(null);
      if (userMarker)     userMarker.setMap(null);

      // Provider — blue circle
      providerMarker = new google.maps.Marker({
        position: provPos,
        map: map,
        title: providerName,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 14,
          fillColor: '#0072FF',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        },
      });

      // User — red standard pin
      userMarker = new google.maps.Marker({
        position: userPos,
        map: map,
        title: 'Your Location',
        icon: {
          path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
          scale: 9,
          fillColor: '#FF3B30',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      });

      // Fit both markers on screen
      var bounds = new google.maps.LatLngBounds();
      bounds.extend(provPos);
      bounds.extend(userPos);
      map.fitBounds(bounds, { top: 80, right: 40, bottom: 80, left: 40 });

      // Draw route line using Directions API (no extra round-trip)
      var directionsService  = new google.maps.DirectionsService();
      var directionsRenderer = new google.maps.DirectionsRenderer({
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#0072FF',
          strokeWeight: 4,
          strokeOpacity: 0.85,
        },
      });
      directionsRenderer.setMap(map);

      directionsService.route({
        origin:      provPos,
        destination: userPos,
        travelMode:  google.maps.TravelMode.DRIVING,
      }, function(result, status) {
        if (status === 'OK') {
          directionsRenderer.setDirections(result);
          var leg = result.routes[0].legs[0];
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type:     'ETA_UPDATE',
            duration: leg.duration.text,
            distance: leg.distance.text,
          }));
        }
      });
    }
  </script>
  <script
    src="https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap"
    async defer>
  </script>
</body>
</html>
`;

// ── Component ─────────────────────────────────────────────────────────────────

export default function MapScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ bookingId: string }>();
    const bookingId = Array.isArray(params.bookingId)
        ? params.bookingId[0]
        : params.bookingId;

    const webViewRef = useRef<WebView>(null);

    const [apiKey,       setApiKey]       = useState('');
    const [mapReady,     setMapReady]     = useState(false); // true once JS map is ready
    const [tracking,     setTracking]     = useState<TrackingData | null>(null);
    const [pendingCoords,setPendingCoords]= useState<{
        provLat: number; provLng: number;
        userLat: number; userLng: number;
    } | null>(null);
    const [etaMin,       setEtaMin]       = useState('—');
    const [distanceKm,   setDistanceKm]   = useState('—');
    const [dataLoading,  setDataLoading]  = useState(true);
    const [error,        setError]        = useState<string | null>(null);

    // ── Step 1: Get API key (cached first, then fresh) ────────────────────────

    useEffect(() => {
        (async () => {
            // Use cache immediately — unblocks WebView render right away
            const cached = await AsyncStorage.getItem(API_KEY_CACHE);
            if (cached) { setApiKey(cached); return; }

            // No cache — fetch from backend
            try {
                const res = await apiClient.get('/geo/config/maps-key');
                const key = res.data.key as string;
                setApiKey(key);
                AsyncStorage.setItem(API_KEY_CACHE, key);
            } catch {
                setError('Could not load map. Please try again.');
            }
        })();
    }, []);

    // ── Step 2: Fetch tracking data ───────────────────────────────────────────

    const fetchTracking = useCallback(async () => {
        if (!bookingId) {
            setError('No booking ID provided.');
            setDataLoading(false);
            return;
        }

        try {
            // Refresh key in background (don't await — don't block tracking fetch)
            apiClient.get('/geo/config/maps-key')
                .then(r => {
                    const k = r.data.key as string;
                    AsyncStorage.setItem(API_KEY_CACHE, k);
                })
                .catch(() => {});

            const res  = await apiClient.get(`/geo/${bookingId}`);
            const data = res.data as TrackingData;
            setTracking(data);

            let provLat = data.provider_latitude;
            let provLng = data.provider_longitude;
            let userLat = data.user_latitude;
            let userLng = data.user_longitude;

            // Fall back to AsyncStorage for user location
            if (!userLat || !userLng) {
                const stored = await AsyncStorage.getItem('user_location');
                if (stored) {
                    const p = JSON.parse(stored);
                    userLat = p.latitude;
                    userLng = p.longitude;
                }
            }

            if (provLat && provLng && userLat && userLng) {
                const coords = { provLat, provLng, userLat, userLng };
                setPendingCoords(coords);

                // If map is already ready, inject now.
                // If not, the MAP_READY handler below will pick up pendingCoords.
                if (mapReady) {
                    injectMarkers(coords, data.provider_name);
                }
            } else {
                setError('Waiting for provider location…');
            }
        } catch (e: any) {
            setError(e?.response?.data?.detail ?? 'Could not load tracking data.');
        } finally {
            setDataLoading(false);
        }
    }, [bookingId, mapReady]);

    // ── Step 3: Poll every 60 seconds ─────────────────────────────────────────

    useEffect(() => {
        fetchTracking();
        const interval = setInterval(fetchTracking, POLL_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [fetchTracking]);

    // ── Inject markers into the live WebView ──────────────────────────────────

    const injectMarkers = (
        coords: { provLat: number; provLng: number; userLat: number; userLng: number },
        name: string,
    ) => {
        const safeName = name.replace(/'/g, "\\'");
        webViewRef.current?.injectJavaScript(`
            placeMarkers(
                ${coords.provLat}, ${coords.provLng},
                ${coords.userLat}, ${coords.userLng},
                '${safeName}'
            );
            true;
        `);
    };

    // ── Handle messages from WebView ──────────────────────────────────────────

    const onMessage = (event: WebViewMessageEvent) => {
        try {
            const msg = JSON.parse(event.nativeEvent.data);

            if (msg.type === 'MAP_READY') {
                setMapReady(true);
                // If tracking data already arrived before the map was ready, inject now
                if (pendingCoords && tracking) {
                    injectMarkers(pendingCoords, tracking.provider_name);
                }
            }

            if (msg.type === 'ETA_UPDATE') {
                setEtaMin(msg.duration);
                setDistanceKm(msg.distance);
            }
        } catch {
            // Ignore malformed messages
        }
    };

    // ── Error (full screen — only if key failed before map could load) ────────

    if (error && !apiKey) {
        return (
            <View style={styles.centered}>
                <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={() => {
                    setError(null);
                    setDataLoading(true);
                    fetchTracking();
                }}>
                    <Text style={styles.retryBtnText}>Try Again</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <View style={styles.container}>

            {/* ── WEBVIEW MAP — renders as soon as apiKey is ready ── */}
            {apiKey ? (
                <WebView
                    ref={webViewRef}
                    style={styles.map}
                    source={{ html: buildBaseHtml(apiKey) }}
                    onMessage={onMessage}
                    javaScriptEnabled
                    domStorageEnabled
                    scrollEnabled={false}
                    bounces={false}
                    // Prevents the map gestures from conflicting with
                    // the parent scroll view if this is ever nested
                    nestedScrollEnabled={false}
                />
            ) : (
                // Waiting for key
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#0072FF" />
                    <Text style={styles.loadingText}>Loading map…</Text>
                </View>
            )}

            {/* Data loading overlay — transparent, just shows a small spinner */}
            {dataLoading && apiKey && (
                <View style={styles.dataLoadingOverlay} pointerEvents="none">
                    <View style={styles.dataLoadingPill}>
                        <ActivityIndicator size="small" color="#0072FF" />
                        <Text style={styles.dataLoadingText}>Fetching location…</Text>
                    </View>
                </View>
            )}

            {/* ── BACK BUTTON ── */}
            <SafeAreaView style={styles.backWrapper} pointerEvents="box-none">
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={20} color="#333" />
                </TouchableOpacity>
            </SafeAreaView>

            {/* ── ETA CARD ── */}
            <View style={styles.etaCard}>
                <View style={styles.etaCardTop}>
                    <Text style={styles.providerLabel} numberOfLines={1}>
                        {tracking?.provider_name ?? 'Loading…'}
                    </Text>
                    {tracking && (
                        <View style={[
                            styles.liveBadge,
                            { backgroundColor: tracking.has_live_location ? '#28A745' : '#FF9800' }
                        ]}>
                            <View style={styles.liveDot} />
                            <Text style={styles.liveBadgeText}>
                                {tracking.has_live_location ? 'LIVE' : 'LAST KNOWN'}
                            </Text>
                        </View>
                    )}
                </View>

                <Text style={styles.etaSubtitle}>Provider is on the way</Text>

                {error ? (
                    <Text style={styles.etaError}>{error}</Text>
                ) : (
                    <View style={styles.etaRow}>
                        <View style={styles.etaItem}>
                            <Text style={styles.etaValue}>{etaMin}</Text>
                            <Text style={styles.etaLabel}>ETA</Text>
                        </View>
                        <View style={styles.etaSep} />
                        <View style={styles.etaItem}>
                            <Text style={styles.etaValue}>{distanceKm}</Text>
                            <Text style={styles.etaLabel}>Distance</Text>
                        </View>
                    </View>
                )}
            </View>

            {/* ── LEGEND + REFRESH ── */}
            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#0072FF' }]} />
                    <Text style={styles.legendText}>Provider</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#FF3B30' }]} />
                    <Text style={styles.legendText}>Your Location</Text>
                </View>
                <TouchableOpacity
                    style={styles.refreshBtn}
                    onPress={() => { setDataLoading(true); fetchTracking(); }}
                >
                    <Ionicons name="refresh" size={14} color="#0072FF" />
                    <Text style={styles.refreshText}>Refresh</Text>
                </TouchableOpacity>
            </View>

        </View>
    );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    map:       { flex: 1 },

    centered: {
        flex: 1, alignItems: 'center', justifyContent: 'center',
        gap: 14, paddingHorizontal: 32, backgroundColor: '#fff',
    },
    loadingText:  { color: '#555', fontSize: 15 },
    errorText:    { color: '#333', fontSize: 15, textAlign: 'center', lineHeight: 22 },
    retryBtn:     { backgroundColor: '#0072FF', borderRadius: 25, paddingVertical: 11, paddingHorizontal: 30 },
    retryBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

    // Small overlay spinner while tracking data loads (map already visible)
    dataLoadingOverlay: {
        position: 'absolute', top: 0, left: 0, right: 0,
        alignItems: 'center',
        paddingTop: Platform.OS === 'android' ? 100 : 80,
    },
    dataLoadingPill: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: 'rgba(255,255,255,0.92)',
        borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
        shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 }, elevation: 4,
    },
    dataLoadingText: { color: '#555', fontSize: 13 },

    // Back button
    backWrapper: {
        position: 'absolute', top: 0, left: 0,
        paddingTop: Platform.OS === 'android' ? 40 : 0,
    },
    backBtn: {
        margin: 16, width: 40, height: 40, borderRadius: 20,
        backgroundColor: '#fff',
        alignItems: 'center', justifyContent: 'center',
        shadowColor: '#000', shadowOpacity: 0.15,
        shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 4,
    },

    // ETA card
    etaCard: {
        position: 'absolute', bottom: 72, left: 16, right: 16,
        backgroundColor: '#fff', borderRadius: 20, padding: 18,
        shadowColor: '#000', shadowOpacity: 0.15,
        shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 8,
    },
    etaCardTop: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: 4,
    },
    providerLabel: { fontSize: 15, fontWeight: '700', color: '#1a1a1a', flex: 1, marginRight: 8 },
    liveBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3,
    },
    liveDot:       { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
    liveBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
    etaSubtitle:   { fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
    etaRow:        { flexDirection: 'row', alignItems: 'center' },
    etaItem:       { flex: 1, alignItems: 'center' },
    etaValue:      { fontSize: 30, fontWeight: '900', color: '#0072FF' },
    etaLabel:      { fontSize: 11, color: '#888', marginTop: 2 },
    etaSep:        { width: 1, height: 36, backgroundColor: '#eee', marginHorizontal: 8 },
    etaError:      { fontSize: 13, color: '#FF9800', fontStyle: 'italic' },

    // Legend
    legend: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 20, paddingTop: 10,
        paddingBottom: Platform.OS === 'ios' ? 28 : 14,
        borderTopWidth: 1, borderTopColor: '#eee', gap: 16,
    },
    legendItem:  { flexDirection: 'row', alignItems: 'center', gap: 6 },
    legendDot:   { width: 12, height: 12, borderRadius: 6 },
    legendText:  { fontSize: 13, color: '#555', fontWeight: '500' },
    refreshBtn:  {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        marginLeft: 'auto', backgroundColor: '#EEF4FF',
        borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6,
    },
    refreshText: { color: '#0072FF', fontSize: 12, fontWeight: '700' },
});
