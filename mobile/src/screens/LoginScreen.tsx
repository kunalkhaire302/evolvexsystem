import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';
import { useAuth } from '../context/AuthContext';

export const LoginScreen: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login, register } = useAuth();

    const handleSubmit = async () => {
        if (!username || !password || (!isLogin && !email)) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setIsLoading(true);
        try {
            if (isLogin) {
                await login(username, password);
            } else {
                await register(username, email, password);
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setUsername('');
        setEmail('');
        setPassword('');
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[theme.colors.background, '#0d0d15', theme.colors.background]}
                style={styles.gradient}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Logo */}
                    <View style={styles.logoContainer}>
                        <Text style={styles.logoText}>EVOLVEX</Text>
                        <Text style={styles.logoSubtext}>SYSTEM</Text>
                        <Text style={styles.tagline}>AI-Driven Adaptive Leveling Platform</Text>
                    </View>

                    {/* Form Card */}
                    <View style={styles.formCard}>
                        <Text style={styles.formTitle}>
                            {isLogin ? 'Welcome Back' : 'Join EVOLVEX'}
                        </Text>
                        <Text style={styles.formSubtitle}>
                            {isLogin
                                ? 'Login to continue your journey'
                                : 'Create your account and start leveling up'}
                        </Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Username</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your username"
                                placeholderTextColor={theme.colors.textMuted}
                                value={username}
                                onChangeText={setUsername}
                                autoCapitalize="none"
                            />
                        </View>

                        {!isLogin && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Email</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your email"
                                    placeholderTextColor={theme.colors.textMuted}
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                        )}

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Password</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your password"
                                placeholderTextColor={theme.colors.textMuted}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={handleSubmit}
                            disabled={isLoading}
                        >
                            <LinearGradient
                                colors={[theme.colors.primary, theme.colors.secondary]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.buttonGradient}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#000" />
                                ) : (
                                    <Text style={styles.submitButtonText}>
                                        {isLogin ? 'Login' : 'Create Account'}
                                    </Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        <View style={styles.switchContainer}>
                            <Text style={styles.switchText}>
                                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                            </Text>
                            <TouchableOpacity onPress={toggleMode}>
                                <Text style={styles.switchLink}>
                                    {isLogin ? 'Register here' : 'Login here'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Features */}
                    <View style={styles.featuresGrid}>
                        <View style={styles.featureCard}>
                            <Text style={styles.featureIcon}>📊</Text>
                            <Text style={styles.featureTitle}>Real-Time Stats</Text>
                        </View>
                        <View style={styles.featureCard}>
                            <Text style={styles.featureIcon}>🎯</Text>
                            <Text style={styles.featureTitle}>Adaptive Quests</Text>
                        </View>
                        <View style={styles.featureCard}>
                            <Text style={styles.featureIcon}>⚔️</Text>
                            <Text style={styles.featureTitle}>Skill Progression</Text>
                        </View>
                        <View style={styles.featureCard}>
                            <Text style={styles.featureIcon}>🏆</Text>
                            <Text style={styles.featureTitle}>Achievements</Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    gradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: theme.spacing.lg,
        paddingTop: 60,
        paddingBottom: theme.spacing.xl,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
    },
    logoText: {
        fontSize: 48,
        fontWeight: '900',
        color: theme.colors.primary,
        textShadowColor: theme.colors.primary,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 20,
    },
    logoSubtext: {
        fontSize: 24,
        fontWeight: '400',
        color: theme.colors.secondary,
        marginTop: -8,
    },
    tagline: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.sm,
    },
    formCard: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: theme.borderRadius.lg,
        borderWidth: 1,
        borderColor: theme.colors.cardBorder,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.xl,
    },
    formTitle: {
        fontSize: theme.fontSize.xxl,
        fontWeight: '700',
        color: theme.colors.primary,
        textAlign: 'center',
        marginBottom: theme.spacing.xs,
    },
    formSubtitle: {
        fontSize: theme.fontSize.md,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginBottom: theme.spacing.lg,
    },
    inputGroup: {
        marginBottom: theme.spacing.md,
    },
    label: {
        fontSize: theme.fontSize.sm,
        fontWeight: '600',
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.xs,
    },
    input: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderWidth: 1,
        borderColor: theme.colors.cardBorder,
        borderRadius: theme.borderRadius.sm,
        padding: theme.spacing.md,
        color: theme.colors.text,
        fontSize: theme.fontSize.lg,
    },
    submitButton: {
        marginTop: theme.spacing.md,
        borderRadius: theme.borderRadius.sm,
        overflow: 'hidden',
    },
    buttonGradient: {
        paddingVertical: theme.spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitButtonText: {
        fontSize: theme.fontSize.lg,
        fontWeight: '700',
        color: '#000',
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: theme.spacing.lg,
    },
    switchText: {
        color: theme.colors.textSecondary,
    },
    switchLink: {
        color: theme.colors.primary,
        fontWeight: '600',
    },
    featuresGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    featureCard: {
        width: '48%',
        backgroundColor: 'rgba(0,217,255,0.05)',
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: theme.colors.cardBorder,
        padding: theme.spacing.md,
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    featureIcon: {
        fontSize: 28,
        marginBottom: theme.spacing.xs,
    },
    featureTitle: {
        fontSize: theme.fontSize.sm,
        fontWeight: '600',
        color: theme.colors.text,
        textAlign: 'center',
    },
});
