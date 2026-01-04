import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';
import { useAuth } from '../context/AuthContext';
import { API } from '../api/client';
import { Quest, Skill, Title } from '../types';

import { StatusWindow } from '../components/StatusWindow';
import { QuestCard } from '../components/QuestCard';
import { AddQuestModal } from '../components/AddQuestModal';
import { SkillsPanel } from '../components/SkillsPanel';
import { TitlesPanel } from '../components/TitlesPanel';
import { LevelUpModal } from '../components/LevelUpModal';

type TabType = 'skills' | 'titles';

export const DashboardScreen: React.FC = () => {
    const { user, logout, refreshProfile } = useAuth();

    // State
    const [quests, setQuests] = useState<Quest[]>([]);
    const [skills, setSkills] = useState<Skill[]>([]);
    const [titles, setTitles] = useState<Title[]>([]);
    const [activeTab, setActiveTab] = useState<TabType>('skills');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);
    const [completingQuestId, setCompletingQuestId] = useState<string | null>(null);
    const [unlockingSkillId, setUnlockingSkillId] = useState<string | null>(null);
    const [showAddQuestModal, setShowAddQuestModal] = useState(false);
    const [showLevelUpModal, setShowLevelUpModal] = useState(false);
    const [levelUpData, setLevelUpData] = useState({ level: 0, rewards: [] as string[] });

    // Fetch data
    const fetchData = useCallback(async () => {
        try {
            const [questsRes, skillsRes, titlesRes] = await Promise.all([
                API.getAvailableQuests(),
                API.getSkills(),
                API.getTitles(),
            ]);
            setQuests(questsRes.quests || []);
            setSkills(skillsRes.skills || []);
            setTitles(titlesRes.titles || []);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const onRefresh = async () => {
        setIsRefreshing(true);
        await Promise.all([fetchData(), refreshProfile()]);
        setIsRefreshing(false);
    };

    // Actions
    const handleRestoreStamina = async () => {
        setIsRestoring(true);
        try {
            await API.restoreStamina();
            await refreshProfile();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to restore stamina');
        } finally {
            setIsRestoring(false);
        }
    };

    const handleCompleteQuest = async (questId: string) => {
        setCompletingQuestId(questId);
        try {
            const result = await API.completeQuest(questId);

            if (result.leveled_up) {
                const rewards = [`+${result.exp_gained} EXP`];
                if (result.skill_points_gained) {
                    rewards.push(`+${result.skill_points_gained} Skill Points`);
                }
                if (result.stat_increase) {
                    rewards.push(`+${result.stat_increase.amount} ${result.stat_increase.stat}`);
                }
                setLevelUpData({ level: result.new_level, rewards });
                setShowLevelUpModal(true);
            }

            await Promise.all([fetchData(), refreshProfile()]);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to complete quest');
        } finally {
            setCompletingQuestId(null);
        }
    };

    const handleDeleteQuest = async (questId: string) => {
        Alert.alert('Delete Quest', 'Are you sure you want to delete this quest?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await API.deleteQuest(questId);
                        await fetchData();
                    } catch (error: any) {
                        Alert.alert('Error', error.message || 'Failed to delete quest');
                    }
                },
            },
        ]);
    };

    const handleAddQuest = async (questData: Partial<Quest>) => {
        await API.addQuest(questData);
        await fetchData();
    };

    const handleUnlockSkill = async (skillId: string) => {
        setUnlockingSkillId(skillId);
        try {
            await API.unlockSkill(skillId);
            await Promise.all([fetchData(), refreshProfile()]);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to unlock skill');
        } finally {
            setUnlockingSkillId(null);
        }
    };

    if (!user) return null;

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[theme.colors.background, '#0d0d15', theme.colors.background]}
                style={styles.gradient}
            />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.logoText}>EVOLVEX</Text>
                <View style={styles.headerRight}>
                    <Text style={styles.username}>{user.username}</Text>
                    <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={onRefresh}
                        tintColor={theme.colors.primary}
                        colors={[theme.colors.primary]}
                    />
                }
            >
                {/* Status Window */}
                <StatusWindow
                    user={user}
                    onRestoreStamina={handleRestoreStamina}
                    isRestoring={isRestoring}
                />

                {/* Quests Panel */}
                <View style={styles.panel}>
                    <View style={styles.panelHeader}>
                        <Text style={styles.panelTitle}>🎯 Available Quests</Text>
                        <View style={styles.panelActions}>
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => setShowAddQuestModal(true)}
                            >
                                <Text style={styles.actionButtonText}>+ Add</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionButton} onPress={onRefresh}>
                                <Text style={styles.actionButtonText}>↻ Refresh</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {quests.length > 0 ? (
                        quests.map((quest) => (
                            <QuestCard
                                key={quest.id || quest._id}
                                quest={quest}
                                onComplete={handleCompleteQuest}
                                onDelete={quest.is_custom ? handleDeleteQuest : undefined}
                                isCompleting={completingQuestId === (quest.id || quest._id)}
                            />
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyIcon}>🎯</Text>
                            <Text style={styles.emptyText}>No quests available</Text>
                        </View>
                    )}
                </View>

                {/* Skills & Titles Panel */}
                <View style={styles.panel}>
                    <View style={styles.panelHeader}>
                        <Text style={styles.panelTitle}>⚔️ Skills & Titles</Text>
                    </View>

                    {/* Tabs */}
                    <View style={styles.tabs}>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'skills' && styles.tabActive]}
                            onPress={() => setActiveTab('skills')}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    activeTab === 'skills' && styles.tabTextActive,
                                ]}
                            >
                                Skills
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'titles' && styles.tabActive]}
                            onPress={() => setActiveTab('titles')}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    activeTab === 'titles' && styles.tabTextActive,
                                ]}
                            >
                                Titles
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Tab Content */}
                    <View style={styles.tabContent}>
                        {activeTab === 'skills' ? (
                            <SkillsPanel
                                skills={skills}
                                skillPoints={user.skill_points}
                                onUnlock={handleUnlockSkill}
                                isUnlocking={unlockingSkillId}
                            />
                        ) : (
                            <TitlesPanel titles={titles} />
                        )}
                    </View>
                </View>
            </ScrollView>

            {/* Modals */}
            <AddQuestModal
                visible={showAddQuestModal}
                onClose={() => setShowAddQuestModal(false)}
                onAdd={handleAddQuest}
            />

            <LevelUpModal
                visible={showLevelUpModal}
                newLevel={levelUpData.level}
                rewards={levelUpData.rewards}
                onClose={() => setShowLevelUpModal(false)}
            />
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.md,
        paddingTop: 50,
        paddingBottom: theme.spacing.md,
    },
    logoText: {
        fontSize: 24,
        fontWeight: '900',
        color: theme.colors.primary,
        textShadowColor: theme.colors.primary,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    username: {
        fontSize: theme.fontSize.md,
        color: theme.colors.text,
        fontWeight: '600',
        marginRight: theme.spacing.sm,
    },
    logoutButton: {
        backgroundColor: 'rgba(255,68,68,0.2)',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.borderRadius.sm,
    },
    logoutText: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.danger,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: theme.spacing.md,
        paddingBottom: theme.spacing.xl,
    },
    panel: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: theme.borderRadius.lg,
        borderWidth: 1,
        borderColor: theme.colors.cardBorder,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
    },
    panelHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    panelTitle: {
        fontSize: theme.fontSize.lg,
        fontWeight: '700',
        color: theme.colors.primary,
    },
    panelActions: {
        flexDirection: 'row',
    },
    actionButton: {
        backgroundColor: 'rgba(0,217,255,0.1)',
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.borderRadius.sm,
        borderWidth: 1,
        borderColor: theme.colors.cardBorder,
        marginLeft: theme.spacing.xs,
    },
    actionButtonText: {
        fontSize: theme.fontSize.xs,
        color: theme.colors.primary,
        fontWeight: '600',
    },
    tabs: {
        flexDirection: 'row',
        marginBottom: theme.spacing.md,
    },
    tab: {
        flex: 1,
        paddingVertical: theme.spacing.sm,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabActive: {
        borderBottomColor: theme.colors.primary,
    },
    tabText: {
        fontSize: theme.fontSize.md,
        color: theme.colors.textMuted,
        fontWeight: '600',
    },
    tabTextActive: {
        color: theme.colors.primary,
    },
    tabContent: {
        minHeight: 200,
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
