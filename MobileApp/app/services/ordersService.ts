import apiClient from '../services/apiClient';


export interface Booking {
    booking_id: string;
    provider_id: string;
    provider_name: string;
    category_name: string;
    summary: string;
    date: string;   // YYYY-MM-DD
    time: string;   // HH:MM
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    created_at: string;
}


export const fetchMyBookings = async (): Promise<Booking[]> => {
    const res = await apiClient.get('/messaging/booking/my');
    return res.data;
};
