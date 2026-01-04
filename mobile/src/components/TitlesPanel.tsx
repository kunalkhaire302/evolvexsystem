import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { theme } from '../theme';
import { Title } from '../types';

interface TitlesPanelProps {
    titles: Title[];
}

export const TitlesPanel: React.FC<TitlesPanelProps> = ({ titles }) => {
    const unlockedTitles = titles.filter((t) => t.unlocked);
    const lockedTitles = titles.filter((t) => !t.unlocked);

    const renderTitle = (title: Title) => (
        <View
            key={title.id}
            style={[styles.titleCard, !title.unlocked && styles.titleCardLocked]}
        >
            <View style={styles.titleHeader}>
                <Text style={styles.titleIcon}>{title.unlocked ? '🏆' : '🔒'}</Text>
                <View style={styles.titleInfo}>
                    <Text
                        style={[styles.titleName, !title.unlocked && styles.titleNameLocked]}
                    >
                        {title.name}
                    </Text>
                    {title.unlocked && title.bonus && (
                        <Text style={styles.titleBonus}>+{title.bonus}</Text>
                    )}
                </View>
            </View>

            <Text
                style={[
                    styles.titleDescription,
                    !title.unlocked && styles.titleDescriptionLocked,
                ]}
            >
                {title.description}
            </Text>

            {!title.unlocked && (
                <Text style={styles.titleRequirement}>
                    📋 Requirement: {title.requirement}
                </Text>
            )}
        </View>
    );

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {unlockedTitles.length > 0 && (
                <>
                    <Text style={styles.sectionTitle}>🏆 Earned Titles</Text>
                    {unlockedTitles.map(renderTitle)}
                </>
            )}

            {lockedTitles.length > 0 && (
                <>
                    <Text style={styles.sectionTitle}>🔒 Locked Titles</Text>
                    {lockedTitles.map(renderTitle)}
                </>
            )}

            {titles.length === 0 && (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>🏆</Text>
                    <Text style={styles.emptyText}>No titles available yet</Text>
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: theme.fontSize.md,
        fontWeight: '700',
        color: theme.colors.warning,
        marginBottom: theme.spacing.sm,
        marginTop: theme.spacing.sm,
    },
    titleCard: {
        backgroundColor: 'rgba(255,215,0,0.1)',
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: 'rgba(255,215,0,0.3)',
        padding: theme.spacing.md,
        marginBottom: theme.spacing.sm,
    },
    titleCardLocked: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderColor: theme.colors.cardBorder,
        opacity: 0.7,
    },
    titleHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
    },
    titleIcon: {
        fontSize: 24,
        marginRight: theme.spacing.sm,
    },
    titleInfo: {
        flex: 1,
    },
    titleName: {
        fontSize: theme.fontSize.lg,
        fontWeight: '700',
        color: '#ffd700',
    },
    titleNameLocked: {
        color: theme.colors.textSecondary,
    },
    titleBonus: {
        fontSize: theme.fontSize.xs,
        color: theme.colors.success,
        fontWeight: '600',
    },
    titleDescription: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.textSecondary,
    },
    titleDescriptionLocked: {
        color: theme.colors.textMuted,
    },
    titleRequirement: {
        fontSize: theme.fontSize.xs,
        color: theme.colors.textMuted,
        marginTop: theme.spacing.xs,
        fontStyle: 'italic',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: theme.spacing.xl,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: theme.spacing.sm,
        opacity: 0.5,
    },
    emptyText: {
        fontSize: theme.fontSize.md,
        color: theme.colors.textMuted,
    },
});
