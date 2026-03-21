import { useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import apiClient from '../services/apiClient';

const SEND_INTERVAL_MS = 60_000; // 1 minute

/**
 * useProviderLocationSender
 *
 * Drop this hook into any screen the provider sees while en route
 * (e.g. their dashboard or an active-job screen).
 * It requests GPS permission, then sends the provider's current
 * coordinates to POST /tracking/live-location every 60 seconds.
 * Cleans up automatically when the screen unmounts.
 *
 * Usage:
 *   useProviderLocationSender({ enabled: jobIsActive });
 */
export function useProviderLocationSender({
      enabled = true,
      bookingId,
}: {
    enabled?: boolean;
    bookingId: string;
}) {
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (!enabled) return;

        let cancelled = false;

        const sendLocation = async () => {
            try {
                // Request permission if not already granted
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    console.warn('[Tracking] Location permission not granted — cannot send position.');
                    return;
                }

                const position = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                });

                if (cancelled) return; // Screen unmounted before GPS resolved

                await apiClient.post('/geo/live-location', {
                    booking_id: bookingId,
                    latitude:  position.coords.latitude,
                    longitude: position.coords.longitude,
                });

                console.log(
                    `[Tracking] Sent live location: ${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}`
                );
            } catch (error) {
                // Non-fatal — next interval will retry
                console.warn('[Tracking] Failed to send location:', error);
            }
        };

        // Send immediately on mount, then on interval
        sendLocation();
        intervalRef.current = setInterval(sendLocation, SEND_INTERVAL_MS);

        return () => {
            cancelled = true;
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [enabled]);
}
