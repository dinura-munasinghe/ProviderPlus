import apiClient from './apiClient';

export interface ProviderData {
    id: string;
    name: string;
    email: string;
    phone_number: string;
    category: { id: string; name: string; slug: string };
    description: string;
    profile_image: string | null;
    portfolio_images: string[];
    is_verified: boolean;
    rating: number;
    tags: string[];
    location: { type: string; coordinates: [number, number] } | null;
    total_documents: number;
    verified_documents: number;
    pending_documents: number;
    rejected_documents: number;
    completed_jobs?: number;
    education?: { institution: string; qualification: string; year?: string }[];
    experience?: { title: string; years: number; description?: string }[];
    recommendations?: { name: string; comment: string; rating: number }[];
    rates?: { label: string; amount: string; unit?: string }[];
}

export async function getProviderById(providerId: string): Promise<ProviderData> {
    const response = await apiClient.get(`category-search/provider/${providerId}`);
    return response.data;
}
