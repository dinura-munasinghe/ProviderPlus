import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Dimensions, Alert } from 'react-native';
import { GiftedChat, Bubble, IMessage } from 'react-native-gifted-chat';
import { ChatService } from './services/chatService'; // Corrected import path

const { width } = Dimensions.get('window');

// --- 1. PROVIDER CARD COMPONENT ---
const ProviderCard = ({ provider, onPress }: { provider: any, onPress: () => void }) => (
    <TouchableOpacity onPress={onPress} style={styles.cardContainer}>
        <View style={styles.cardIcon}>
            <Text style={{ fontSize: 30 }}>🛠️</Text>
        </View>
        <View>
            <Text style={styles.cardName}>{provider.name || "Unknown Provider"}</Text>
            <Text style={styles.cardCategory}>{provider.category || "General"}</Text>
            {provider.score ? (
                <Text style={styles.cardScore}>Match: {provider.score}</Text>
            ) : null}
        </View>
    </TouchableOpacity>
);

export default function ChatScreen() {
    const [messages, setMessages] = useState<IMessage[]>([]);

    useEffect(() => {
        setMessages([
            {
                _id: 1,
                text: 'Hello! I am Servy. I can help you find plumbers, electricians, or organize events.',
                createdAt: new Date(),
                user: {
                    _id: 2,
                    name: 'Servy',
                    avatar: 'https://cdn-icons-png.flaticon.com/512/4712/4712027.png',
                },
            },
        ]);
    }, []);

    // --- 2. SEND MESSAGE & GET RESPONSE ---
    const onSend = useCallback(async (newMessages: IMessage[] = []) => {
        setMessages(previousMessages => GiftedChat.append(previousMessages, newMessages));
        const userText = newMessages[0].text;

        try {
            const data = await ChatService.sendMessage(userText);

            // DEBUG: Check if providers are actually arriving
            console.log("Providers received:", data.providers);

            const botMessage: IMessage = {
                _id: Math.random().toString(),
                text: data.ai_reply,
                createdAt: new Date(),
                user: {
                    _id: 2,
                    name: 'Servy',
                    avatar: 'https://cdn-icons-png.flaticon.com/512/4712/4712027.png',
                },
                // @ts-ignore
                providers: data.providers || []
            };

            setMessages(previousMessages => GiftedChat.append(previousMessages, [botMessage]));

        } catch (error: any) {
            Alert.alert("Error", "Could not connect to Servy. Is the backend running?");
        }
    }, []);

    // --- 3. RENDER CUSTOM CARDS ---
    const renderCustomView = (props: any) => {
        const { currentMessage } = props;
        if (currentMessage.providers && currentMessage.providers.length > 0) {
            return (
                <View style={styles.recommendationContainer}>
                    <Text style={styles.recommendationTitle}>Recommended Providers:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {currentMessage.providers.map((prov: any, index: number) => (
                            <ProviderCard
                                key={index}
                                provider={prov}
                                onPress={() => Alert.alert("Provider Selected", `You chose ${prov.name}`)}
                            />
                        ))}
                    </ScrollView>
                </View>
            );
        }
        return null;
    };

    // --- 4. BUBBLE STYLES ---
    const renderBubble = (props: any) => (
        <Bubble
            {...props}
            wrapperStyle={{
                right: { backgroundColor: '#007AFF', maxWidth: width * 0.8 },
                left: { backgroundColor: '#E5E5EA', maxWidth: width * 0.8 },
            }}
            textStyle={{
                right: { color: '#fff' },
                left: { color: '#000' },
            }}
        />
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>AI Assistant</Text>
            </View>

            <GiftedChat
                messages={messages}
                onSend={messages => onSend(messages)}
                user={{ _id: 1 }}
                renderBubble={renderBubble}
                renderCustomView={renderCustomView}
            />
        </SafeAreaView>
    );
}

// --- 5. STYLES ---
const styles = StyleSheet.create({
    header: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    recommendationContainer: {
        padding: 5,
        height: 150,
        marginTop: 5,
    },
    recommendationTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
        marginBottom: 5,
        marginLeft: 5,
    },
    cardContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 10,
        marginRight: 10,
        width: 160,
        height: 110,
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    },
    cardIcon: {
        marginBottom: 5,
    },
    cardName: {
        fontWeight: 'bold',
        fontSize: 14,
        color: '#333',
    },
    cardCategory: {
        color: '#666',
        fontSize: 12,
    },
    cardScore: {
        color: '#007AFF',
        fontSize: 10,
        fontWeight: 'bold',
        marginTop: 2,
    }
});