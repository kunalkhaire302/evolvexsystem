import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';

interface LevelUpModalProps {
    visible: boolean;
    newLevel: number;
    rewards: string[];
    onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
    visible,
    newLevel,
    rewards,
    onClose,
}) => {
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 50,
                    friction: 7,
                    useNativeDriver: true,
                }),
                Animated.loop(
                    Animated.timing(rotateAnim, {
                        toValue: 1,
                        duration: 3000,
                        useNativeDriver: true,
                    })
                ),
            ]).start();
        } else {
            scaleAnim.setValue(0);
            rotateAnim.setValue(0);
        }
    }, [visible]);

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <Animated.View
                    style={[
                        styles.modal,
                        {
                            transform: [{ scale: scaleAnim }],
                        },
                    ]}
                >
                    <LinearGradient
                        colors={['rgba(112,0,255,0.3)', 'rgba(0,217,255,0.1)']}
                        style={styles.gradientBorder}
                    >
                        <View style={styles.modalContent}>
                            <Animated.Text
                                style={[
                                    styles.celebrationIcon,
                                    { transform: [{ rotate: spin }] },
                                ]}
                            >
                                🎉
                            </Animated.Text>

                            <Text style={styles.title}>LEVEL UP!</Text>

                            <View style={styles.levelContainer}>
                                <Text style={styles.levelText}>You've reached</Text>
                                <Text style={styles.levelNumber}>Level {newLevel}</Text>
                            </View>

                            {rewards.length > 0 && (
                                <View style={styles.rewardsContainer}>
                                    <Text style={styles.rewardsTitle}>Rewards:</Text>
                                    {rewards.map((reward, index) => (
                                        <Text key={index} style={styles.rewardItem}>
                                            ✨ {reward}
                                        </Text>
                                    ))}
                                </View>
                            )}

                            <TouchableOpacity style={styles.continueButton} onPress={onClose}>
                                <LinearGradient
                                    colors={[theme.colors.primary, theme.colors.secondary]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.buttonGradient}
                                >
                                    <Text style={styles.continueButtonText}>Continue</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.lg,
    },
    modal: {
        width: '100%',
        maxWidth: 350,
    },
    gradientBorder: {
        borderRadius: theme.borderRadius.xl,
        padding: 2,
    },
    modalContent: {
        backgroundColor: theme.colors.background,
        borderRadius: theme.borderRadius.xl - 2,
        padding: theme.spacing.xl,
        alignItems: 'center',
    },
    celebrationIcon: {
        fontSize: 64,
        marginBottom: theme.spacing.md,
    },
    title: {
        fontSize: 36,
        fontWeight: '900',
        color: theme.colors.primary,
        textShadowColor: theme.colors.primary,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 20,
        marginBottom: theme.spacing.md,
    },
    levelContainer: {
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
    },
    levelText: {
        fontSize: theme.fontSize.lg,
        color: theme.colors.textSecondary,
    },
    levelNumber: {
        fontSize: 48,
        fontWeight: '900',
        color: theme.colors.secondary,
        textShadowColor: theme.colors.secondary,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 15,
    },
    rewardsContainer: {
        width: '100%',
        backgroundColor: 'rgba(0,217,255,0.1)',
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.lg,
    },
    rewardsTitle: {
        fontSize: theme.fontSize.md,
        fontWeight: '700',
        color: theme.colors.text,
        marginBottom: theme.spacing.sm,
    },
    rewardItem: {
        fontSize: theme.fontSize.md,
        color: theme.colors.primary,
        marginBottom: theme.spacing.xs,
    },
    continueButton: {
        width: '100%',
        borderRadius: theme.borderRadius.md,
        overflow: 'hidden',
    },
    buttonGradient: {
        paddingVertical: theme.spacing.md,
        alignItems: 'center',
    },
    continueButtonText: {
        fontSize: theme.fontSize.lg,
        fontWeight: '700',
        color: '#000',
    },
});
