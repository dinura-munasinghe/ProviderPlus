import apiClient from './apiClient';

// Define the shape of the response we expect from Python
export interface ChatResponse {
    ai_reply: string;
    providers: any[];

    // --- ADD THESE NEW FIELDS ---
    needs_clarification: boolean;
    clarification_question?: string; // '?' means it might be null
    search_filters?: any[];          // Useful to console.log this for the Viva!
}

export const ChatService = {
    sendMessage: async (userText: string): Promise<ChatResponse> => {
        try {
            // We only need the endpoint path here
            const response = await apiClient.post<ChatResponse>('/ai-chat/chat', {
                user_text: userText
            });
            return response.data;
        } catch (error) {
            console.error("❌ API Error:", error);
            throw error;
        }
    }
};