import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';
import { User } from '../types';

interface StatusWindowProps {
    user: User;
    onRestoreStamina: () => void;
    isRestoring: boolean;
}

export const StatusWindow: React.FC<StatusWindowProps> = ({
    user,
    onRestoreStamina,
    isRestoring,
}) => {
    const expPercent = (user.exp / user.exp_to_next_level) * 100;
    const healthPercent = (user.health / user.max_health) * 100;
    const staminaPercent = (user.stats.stamina / user.stats.max_stamina) * 100;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>⚡ Status Window</Text>
            </View>

            {/* Level Display */}
            <View style={styles.levelSection}>
                <View style={styles.levelDisplay}>
                    <Text style={styles.levelLabel}>LEVEL</Text>
                    <Text style={styles.levelValue}>{user.level}</Text>
                </View>

                {/* EXP Bar */}
                <View style={styles.barContainer}>
                    <View style={styles.barLabel}>
                        <Text style={styles.barLabelText}>EXP</Text>
                        <Text style={styles.barValueText}>
                            {user.exp} / {user.exp_to_next_level}
                        </Text>
                    </View>
                    <View style={styles.barBackground}>
                        <LinearGradient
                            colors={[theme.colors.primary, theme.colors.secondary]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={[styles.barFill, { width: `${expPercent}%` }]}
                        />
                    </View>
                </View>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                    <Text style={styles.statIcon}>💪</Text>
                    <View style={styles.statInfo}>
                        <Text style={styles.statLabel}>Strength</Text>
                        <Text style={styles.statValue}>{user.stats.strength}</Text>
                    </View>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statIcon}>⚡</Text>
                    <View style={styles.statInfo}>
                        <Text style={styles.statLabel}>Agility</Text>
                        <Text style={styles.statValue}>{user.stats.agility}</Text>
                    </View>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statIcon}>🧠</Text>
                    <View style={styles.statInfo}>
                        <Text style={styles.statLabel}>Intelligence</Text>
                        <Text style={styles.statValue}>{user.stats.intelligence}</Text>
                    </View>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statIcon}>🔋</Text>
                    <View style={styles.statInfo}>
                        <Text style={styles.statLabel}>Stamina</Text>
                        <Text style={styles.statValue}>
                            {user.stats.stamina}/{user.stats.max_stamina}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Health Bar */}
            <View style={styles.barContainer}>
                <View style={styles.barLabel}>
                    <Text style={styles.barLabelText}>❤️ Health</Text>
                    <Text style={styles.barValueText}>
                        {user.health} / {user.max_health}
                    </Text>
                </View>
                <View style={styles.barBackground}>
                    <View
                        style={[
                            styles.barFill,
                            styles.healthBar,
                            { width: `${healthPercent}%` },
                        ]}
                    />
                </View>
            </View>

            {/* Skill Points */}
            <View style={styles.skillPointsSection}>
                <Text style={styles.skillPointsLabel}>Skill Points Available:</Text>
                <Text style={styles.skillPointsValue}>{user.skill_points}</Text>
            </View>

            {/* Rest Button */}
            <TouchableOpacity
                style={[styles.restButton, isRestoring && styles.restButtonDisabled]}
                onPress={onRestoreStamina}
                disabled={isRestoring || user.stats.stamina >= user.stats.max_stamina}
            >
                <Text style={styles.restButtonText}>
                    🛌 {isRestoring ? 'Resting...' : 'Rest (Restore Stamina)'}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: theme.borderRadius.lg,
        borderWidth: 1,
        borderColor: theme.colors.cardBorder,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
    },
    header: {
        marginBottom: theme.spacing.md,
    },
    headerText: {
        fontSize: theme.fontSize.lg,
        fontWeight: '700',
        color: theme.colors.primary,
    },
    levelSection: {
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    levelDisplay: {
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
    },
    levelLabel: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.textSecondary,
        fontWeight: '600',
    },
    levelValue: {
        fontSize: 48,
        fontWeight: '900',
        color: theme.colors.primary,
        textShadowColor: theme.colors.primary,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 15,
    },
    barContainer: {
        width: '100%',
        marginBottom: theme.spacing.sm,
    },
    barLabel: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.xs,
    },
    barLabelText: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.textSecondary,
    },
    barValueText: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.text,
        fontWeight: '600',
    },
    barBackground: {
        height: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: theme.borderRadius.full,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        borderRadius: theme.borderRadius.full,
    },
    healthBar: {
        backgroundColor: theme.colors.danger,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: theme.spacing.md,
    },
    statItem: {
        width: '50%',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.spacing.sm,
    },
    statIcon: {
        fontSize: 24,
        marginRight: theme.spacing.sm,
    },
    statInfo: {
        flex: 1,
    },
    statLabel: {
        fontSize: theme.fontSize.xs,
        color: theme.colors.textMuted,
    },
    statValue: {
        fontSize: theme.fontSize.lg,
        fontWeight: '700',
        color: theme.colors.text,
    },
    skillPointsSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(112,0,255,0.2)',
        borderRadius: theme.borderRadius.sm,
        padding: theme.spacing.sm,
        marginBottom: theme.spacing.md,
    },
    skillPointsLabel: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.textSecondary,
    },
    skillPointsValue: {
        fontSize: theme.fontSize.xl,
        fontWeight: '700',
        color: theme.colors.secondary,
    },
    restButton: {
        backgroundColor: 'rgba(0,217,255,0.1)',
        borderWidth: 1,
        borderColor: theme.colors.cardBorder,
        borderRadius: theme.borderRadius.sm,
        padding: theme.spacing.md,
        alignItems: 'center',
    },
    restButtonDisabled: {
        opacity: 0.5,
    },
    restButtonText: {
        fontSize: theme.fontSize.md,
        fontWeight: '600',
        color: theme.colors.textSecondary,
    },
});
