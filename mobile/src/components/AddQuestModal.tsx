import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    TextInput,
    Alert,
} from 'react-native';
import { theme } from '../theme';
import { Quest } from '../types';

interface AddQuestModalProps {
    visible: boolean;
    onClose: () => void;
    onAdd: (quest: Partial<Quest>) => Promise<void>;
}

export const AddQuestModal: React.FC<AddQuestModalProps> = ({
    visible,
    onClose,
    onAdd,
}) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
    const [expReward, setExpReward] = useState('50');
    const [staminaCost, setStaminaCost] = useState('10');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!title || !description) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setIsSubmitting(true);
        try {
            await onAdd({
                title,
                description,
                difficulty,
                exp_reward: parseInt(expReward) || 50,
                stamina_cost: parseInt(staminaCost) || 10,
            });
            // Reset form
            setTitle('');
            setDescription('');
            setDifficulty('easy');
            setExpReward('50');
            setStaminaCost('10');
            onClose();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to create quest');
        } finally {
            setIsSubmitting(false);
        }
    };

    const difficulties: Array<'easy' | 'medium' | 'hard'> = ['easy', 'medium', 'hard'];

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <Text style={styles.title}>Create Custom Quest</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Quest Title</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., Complete Assignment"
                            placeholderTextColor={theme.colors.textMuted}
                            value={title}
                            onChangeText={setTitle}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Describe what needs to be done..."
                            placeholderTextColor={theme.colors.textMuted}
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={3}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Difficulty</Text>
                        <View style={styles.difficultyRow}>
                            {difficulties.map((d) => (
                                <TouchableOpacity
                                    key={d}
                                    style={[
                                        styles.difficultyButton,
                                        difficulty === d && styles.difficultyButtonActive,
                                        difficulty === d && {
                                            borderColor:
                                                d === 'easy'
                                                    ? theme.colors.easy
                                                    : d === 'medium'
                                                        ? theme.colors.warning
                                                        : theme.colors.danger,
                                        },
                                    ]}
                                    onPress={() => setDifficulty(d)}
                                >
                                    <Text
                                        style={[
                                            styles.difficultyButtonText,
                                            difficulty === d && {
                                                color:
                                                    d === 'easy'
                                                        ? theme.colors.easy
                                                        : d === 'medium'
                                                            ? theme.colors.warning
                                                            : theme.colors.danger,
                                            },
                                        ]}
                                    >
                                        {d.toUpperCase()}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>EXP Reward</Text>
                            <TextInput
                                style={styles.input}
                                value={expReward}
                                onChangeText={setExpReward}
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={{ width: theme.spacing.md }} />
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Stamina Cost</Text>
                            <TextInput
                                style={styles.input}
                                value={staminaCost}
                                onChangeText={setStaminaCost}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>

                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={[styles.submitButton, isSubmitting && styles.buttonDisabled]}
                            onPress={handleSubmit}
                            disabled={isSubmitting}
                        >
                            <Text style={styles.submitButtonText}>
                                {isSubmitting ? 'Creating...' : 'Create Quest'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.lg,
    },
    modal: {
        width: '100%',
        backgroundColor: theme.colors.backgroundSecondary,
        borderRadius: theme.borderRadius.lg,
        borderWidth: 1,
        borderColor: theme.colors.cardBorder,
        padding: theme.spacing.lg,
    },
    title: {
        fontSize: theme.fontSize.xl,
        fontWeight: '700',
        color: theme.colors.primary,
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
        fontSize: theme.fontSize.md,
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    difficultyRow: {
        flexDirection: 'row',
    },
    difficultyButton: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderWidth: 1,
        borderColor: theme.colors.cardBorder,
        borderRadius: theme.borderRadius.sm,
        paddingVertical: theme.spacing.sm,
        alignItems: 'center',
        marginHorizontal: theme.spacing.xs,
    },
    difficultyButtonActive: {
        borderWidth: 2,
    },
    difficultyButtonText: {
        fontSize: theme.fontSize.sm,
        fontWeight: '600',
        color: theme.colors.textSecondary,
    },
    row: {
        flexDirection: 'row',
    },
    actions: {
        flexDirection: 'row',
        marginTop: theme.spacing.md,
    },
    submitButton: {
        flex: 1,
        backgroundColor: theme.colors.primary,
        borderRadius: theme.borderRadius.sm,
        paddingVertical: theme.spacing.md,
        alignItems: 'center',
        marginRight: theme.spacing.sm,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    submitButtonText: {
        fontSize: theme.fontSize.md,
        fontWeight: '700',
        color: '#000',
    },
    cancelButton: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: theme.borderRadius.sm,
        paddingVertical: theme.spacing.md,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: theme.fontSize.md,
        fontWeight: '600',
        color: theme.colors.textSecondary,
    },
});
