import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    Alert
} from 'react-native';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        // For Viva Demo: Just navigate to the main app
        // You can add "if (email === ...)" logic here if you want
        router.replace('/chatbot');
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >

                {/* 1. LOGO / BRANDING AREA */}
                <View style={styles.headerContainer}>
                    <View style={styles.logoBox}>
                        <Text style={styles.logoText}>P+</Text>
                    </View>
                    <Text style={styles.welcomeText}>Welcome Back!</Text>
                    <Text style={styles.subText}>Sign in to find your perfect provider</Text>
                </View>

                {/* 2. INPUT FIELDS */}
                <View style={styles.formContainer}>
                    <Text style={styles.inputLabel}>Email Address</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="hello@providerplus.lk"
                        placeholderTextColor="#aaa"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <Text style={styles.inputLabel}>Password</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your password"
                        placeholderTextColor="#aaa"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    {/* Forgot Password Link */}
                    <TouchableOpacity onPress={() => Alert.alert("Reset", "Reset link sent!")}>
                        <Text style={styles.forgotText}>Forgot Password?</Text>
                    </TouchableOpacity>

                    {/* 3. LOGIN BUTTON */}
                    <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                        <Text style={styles.loginButtonText}>Log In</Text>
                    </TouchableOpacity>
                </View>

                {/* 4. FOOTER */}
                <View style={styles.footerContainer}>
                    <Text style={styles.footerText}>Dont have an account? </Text>
                    <TouchableOpacity onPress={() => Alert.alert("Sign Up", "Navigate to Register")}>
                        <Text style={styles.signupText}>Sign Up</Text>
                    </TouchableOpacity>
                </View>

            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// --- STYLES ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    keyboardView: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    // Header
    headerContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoBox: {
        width: 80,
        height: 80,
        backgroundColor: '#007AFF', // Brand Blue
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: "#007AFF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    logoText: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold',
    },
    welcomeText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    subText: {
        fontSize: 16,
        color: '#666',
    },
    // Form
    formContainer: {
        width: '100%',
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        backgroundColor: '#F5F5F5',
        height: 50,
        borderRadius: 12,
        paddingHorizontal: 16,
        marginBottom: 20,
        fontSize: 16,
        color: '#333',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    forgotText: {
        textAlign: 'right',
        color: '#007AFF',
        fontWeight: '600',
        marginBottom: 30,
    },
    loginButton: {
        backgroundColor: '#007AFF',
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#007AFF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    // Footer
    footerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 30,
    },
    footerText: {
        color: '#666',
        fontSize: 15,
    },
    signupText: {
        color: '#007AFF',
        fontWeight: 'bold',
        fontSize: 15,
    },
});