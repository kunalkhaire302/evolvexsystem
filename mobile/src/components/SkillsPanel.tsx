import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { theme } from '../theme';
import { Skill } from '../types';

interface SkillsPanelProps {
    skills: Skill[];
    skillPoints: number;
    onUnlock: (skillId: string) => void;
    isUnlocking: string | null;
}

export const SkillsPanel: React.FC<SkillsPanelProps> = ({
    skills,
    skillPoints,
    onUnlock,
    isUnlocking,
}) => {
    const unlockedSkills = skills.filter((s) => s.unlocked);
    const availableSkills = skills.filter((s) => !s.unlocked);

    const renderSkill = (skill: Skill, canUnlock: boolean = false) => (
        <View key={skill.id} style={styles.skillCard}>
            <View style={styles.skillHeader}>
                <Text style={styles.skillIcon}>{skill.icon}</Text>
                <View style={styles.skillInfo}>
                    <Text style={styles.skillName}>{skill.name}</Text>
                    <Text style={styles.skillType}>
                        {skill.type === 'active' ? '⚔️ Active' : '🛡️ Passive'}
                    </Text>
                </View>
                {skill.unlocked && (
                    <View style={styles.levelBadge}>
                        <Text style={styles.levelText}>LV {skill.level}</Text>
                    </View>
                )}
            </View>

            <Text style={styles.skillDescription}>{skill.description}</Text>
            <Text style={styles.skillEffect}>Effect: {skill.effect}</Text>

            {canUnlock && !skill.unlocked && (
                <TouchableOpacity
                    style={[
                        styles.unlockButton,
                        (skillPoints < skill.cost || isUnlocking === skill.id) &&
                        styles.buttonDisabled,
                    ]}
                    onPress={() => onUnlock(skill.id)}
                    disabled={skillPoints < skill.cost || isUnlocking === skill.id}
                >
                    <Text style={styles.unlockButtonText}>
                        {isUnlocking === skill.id
                            ? 'Unlocking...'
                            : `🔓 Unlock (${skill.cost} SP)`}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {unlockedSkills.length > 0 && (
                <>
                    <Text style={styles.sectionTitle}>🎯 Unlocked Skills</Text>
                    {unlockedSkills.map((skill) => renderSkill(skill))}
                </>
            )}

            {availableSkills.length > 0 && (
                <>
                    <Text style={styles.sectionTitle}>🔒 Available to Unlock</Text>
                    {availableSkills.map((skill) => renderSkill(skill, true))}
                </>
            )}

            {skills.length === 0 && (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>⚔️</Text>
                    <Text style={styles.emptyText}>No skills available yet</Text>
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
        color: theme.colors.primary,
        marginBottom: theme.spacing.sm,
        marginTop: theme.spacing.sm,
    },
    skillCard: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: theme.colors.cardBorder,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.sm,
    },
    skillHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
    },
    skillIcon: {
        fontSize: 28,
        marginRight: theme.spacing.sm,
    },
    skillInfo: {
        flex: 1,
    },
    skillName: {
        fontSize: theme.fontSize.lg,
        fontWeight: '700',
        color: theme.colors.text,
    },
    skillType: {
        fontSize: theme.fontSize.xs,
        color: theme.colors.textMuted,
    },
    levelBadge: {
        backgroundColor: theme.colors.secondary + '40',
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: 2,
        borderRadius: theme.borderRadius.sm,
    },
    levelText: {
        fontSize: theme.fontSize.xs,
        fontWeight: '700',
        color: theme.colors.secondary,
    },
    skillDescription: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.xs,
    },
    skillEffect: {
        fontSize: theme.fontSize.xs,
        color: theme.colors.primary,
        fontStyle: 'italic',
    },
    unlockButton: {
        backgroundColor: theme.colors.secondary,
        borderRadius: theme.borderRadius.sm,
        paddingVertical: theme.spacing.sm,
        alignItems: 'center',
        marginTop: theme.spacing.sm,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    unlockButtonText: {
        fontSize: theme.fontSize.sm,
        fontWeight: '700',
        color: '#fff',
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
