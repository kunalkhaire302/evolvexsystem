import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../theme';
import { Quest } from '../types';

interface QuestCardProps {
    quest: Quest;
    onComplete: (questId: string) => void;
    onDelete?: (questId: string) => void;
    isCompleting: boolean;
}

export const QuestCard: React.FC<QuestCardProps> = ({
    quest,
    onComplete,
    onDelete,
    isCompleting,
}) => {
    const questId = quest.id || quest._id || '';

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy':
                return theme.colors.easy;
            case 'medium':
                return theme.colors.warning;
            case 'hard':
                return theme.colors.danger;
            default:
                return theme.colors.textSecondary;
        }
    };

    const difficultyColor = getDifficultyColor(quest.difficulty);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <View
                        style={[styles.difficultyBadge, { backgroundColor: difficultyColor + '30' }]}
                    >
                        <Text style={[styles.difficultyText, { color: difficultyColor }]}>
                            {quest.difficulty.toUpperCase()}
                        </Text>
                    </View>
                    {quest.is_custom && (
                        <View style={styles.customBadge}>
                            <Text style={styles.customText}>CUSTOM</Text>
                        </View>
                    )}
                    {quest.is_daily && (
                        <View style={styles.dailyBadge}>
                            <Text style={styles.dailyText}>DAILY</Text>
                        </View>
                    )}
                </View>
            </View>

            <Text style={styles.title}>{quest.title}</Text>
            <Text style={styles.description}>{quest.description}</Text>

            <View style={styles.rewards}>
                <View style={styles.rewardItem}>
                    <Text style={styles.rewardIcon}>✨</Text>
                    <Text style={styles.rewardText}>+{quest.exp_reward} EXP</Text>
                </View>
                <View style={styles.rewardItem}>
                    <Text style={styles.rewardIcon}>⚡</Text>
                    <Text style={styles.rewardText}>-{quest.stamina_cost} Stamina</Text>
                </View>
                {quest.stat_bonus && (
                    <View style={styles.rewardItem}>
                        <Text style={styles.rewardIcon}>📈</Text>
                        <Text style={styles.rewardText}>
                            +{quest.stat_bonus.amount} {quest.stat_bonus.type}
                        </Text>
                    </View>
                )}
            </View>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.completeButton, isCompleting && styles.buttonDisabled]}
                    onPress={() => onComplete(questId)}
                    disabled={isCompleting}
                >
                    <Text style={styles.completeButtonText}>
                        {isCompleting ? 'Completing...' : '✓ Complete'}
                    </Text>
                </TouchableOpacity>

                {quest.is_custom && onDelete && (
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => onDelete(questId)}
                    >
                        <Text style={styles.deleteButtonText}>🗑️</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: theme.colors.cardBorder,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.sm,
    },
    header: {
        marginBottom: theme.spacing.xs,
    },
    titleRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    badge: {
        marginRight: theme.spacing.xs,
        marginBottom: theme.spacing.xs,
    },
    difficultyBadge: {
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: 2,
        borderRadius: theme.borderRadius.sm,
    },
    difficultyText: {
        fontSize: theme.fontSize.xs,
        fontWeight: '700',
    },
    customBadge: {
        backgroundColor: 'rgba(112,0,255,0.3)',
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: 2,
        borderRadius: theme.borderRadius.sm,
    },
    customText: {
        fontSize: theme.fontSize.xs,
        fontWeight: '700',
        color: theme.colors.secondary,
    },
    dailyBadge: {
        backgroundColor: 'rgba(0,217,255,0.3)',
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: 2,
        borderRadius: theme.borderRadius.sm,
    },
    dailyText: {
        fontSize: theme.fontSize.xs,
        fontWeight: '700',
        color: theme.colors.primary,
    },
    title: {
        fontSize: theme.fontSize.lg,
        fontWeight: '700',
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    description: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.md,
    },
    rewards: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: theme.spacing.md,
    },
    rewardItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: theme.spacing.md,
    },
    rewardIcon: {
        fontSize: 14,
        marginRight: 4,
    },
    rewardText: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.primary,
        fontWeight: '600',
    },
    actions: {
        flexDirection: 'row',
    },
    completeButton: {
        flex: 1,
        backgroundColor: theme.colors.primary,
        borderRadius: theme.borderRadius.sm,
        paddingVertical: theme.spacing.sm,
        alignItems: 'center',
        marginRight: theme.spacing.sm,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    completeButtonText: {
        fontSize: theme.fontSize.md,
        fontWeight: '700',
        color: '#000',
    },
    deleteButton: {
        backgroundColor: 'rgba(255,68,68,0.2)',
        borderRadius: theme.borderRadius.sm,
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    deleteButtonText: {
        fontSize: 18,
    },
});
