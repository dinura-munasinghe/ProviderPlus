import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    SafeAreaView,
    StatusBar,
    ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const ProviderChat = () => {
    return (
        <LinearGradient
            colors={['#00C6FF', '#0072FF']}
            style={styles.container}
        >
            <StatusBar barStyle="light-content" />
            <SafeAreaView style={{ flex: 1 }}>

                {/* Navigation Header */}
                <View style={styles.header}>
                    <TouchableOpacity><Ionicons name="chevron-back" size={28} color="#fff" /></TouchableOpacity>
                    <View style={styles.headerRight}>
                        <TouchableOpacity><Ionicons name="ellipsis-horizontal" size={24} color="#fff" style={{marginRight: 20}} /></TouchableOpacity>
                        <TouchableOpacity><Ionicons name="share-social-outline" size={24} color="#fff" /></TouchableOpacity>
                    </View>
                </View>

                {/* Provider Info Card */}
                <View style={styles.glassCard}>
                    <View style={styles.avatarContainer}>
                        {/* FIX: Using a direct web URI prevents the localhost 'Server Error'.
                           'resizeMode="cover"' ensures Nimal's photo fills the circle perfectly.
                        */}
                        <Image source={require('../assets/images/8fd666c5ddf277987fa36fc615f6f73a3587c900.jpg')}
                            style={styles.avatar}
                            resizeMode="cover"
                        />
                        <View style={styles.onlineIndicator} />
                    </View>
                    <View style={styles.profileTextContainer}>
                        <Text style={styles.nameText}>Nimal</Text>
                        <Text style={styles.roleText}>Plumber</Text>
                        <div style={styles.statusRow}>
                            <View style={styles.smallOnlineDot} />
                            <Text style={styles.statusText}>Online</Text>
                        </div>
                    </View>

                    {/* Shield icon matching your reference precisely */}
                    <View style={styles.shieldWrapper}>
                        <Ionicons name="shield-checkmark-outline" size={22} color="#fff" />
                    </View>
                </View>

                {/* Chat Messaging Area */}
                <ScrollView style={styles.messageList} contentContainerStyle={{ paddingBottom: 20 }}>
                    <View style={[styles.msgBubble, styles.incomingMsg]}>
                        <Text style={styles.msgText}>Hello ! I Can Help With Your Plumbing Issue. When Are You Free ?</Text>
                    </View>

                    <View style={[styles.msgBubble, styles.outgoingMsg]}>
                        <Text style={styles.msgText}>Hi ! Nimal Are You Available In Tomorrow 4 PM?</Text>
                    </View>

                    <View style={[styles.msgBubble, styles.typingIndicator]}>
                        <Text style={styles.msgText}>...</Text>
                    </View>
                </ScrollView>

                {/* Message Input Area */}
                <View style={styles.inputWrapper}>
                    <TextInput
                        placeholder="Ask From Servy..."
                        placeholderTextColor="rgba(255,255,255,0.7)"
                        style={styles.input}
                    />
                    <TouchableOpacity style={styles.sendBtn}>
                        <Ionicons name="send" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

            </SafeAreaView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    headerRight: { flexDirection: 'row', alignItems: 'center' },
    glassCard: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        marginHorizontal: 20,
        borderRadius: 25,
        padding: 15,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    avatarContainer: {
        width: 66,
        height: 66,
        position: 'relative'
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius:44, // Half of 66 for a perfect circle
        backgroundColor: '#444'
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 0,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#39FF14',
        borderWidth: 2,
        borderColor: '#2bb0ff'
    },
    profileTextContainer: { marginLeft: 15, flex: 1 },
    nameText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    roleText: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
    statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    smallOnlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#39FF14', marginRight: 5 },
    statusText: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
    shieldWrapper: {
        padding: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    messageList: { flex: 1, paddingHorizontal: 20, marginTop: 30 },
    msgBubble: {
        padding: 15,
        borderRadius: 20,
        marginBottom: 20,
        maxWidth: '80%',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    incomingMsg: { alignSelf: 'flex-start', borderBottomLeftRadius: 5 },
    outgoingMsg: {
        alignSelf: 'flex-end',
        borderBottomRightRadius: 5,
        backgroundColor: 'rgba(255, 255, 255, 0.15)'
    },
    typingIndicator: { width: 60, alignSelf: 'flex-start' },
    msgText: { color: '#fff', fontSize: 16, lineHeight: 22 },
    input: { flex: 1, color: '#fff', fontSize: 18 },
    inputWrapper: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        marginHorizontal: 20,
        marginBottom: 30,
        borderRadius: 30,
        paddingHorizontal: 20,
        paddingVertical: 15,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    sendBtn: { marginLeft: 10 }
});

export default ProviderChat;