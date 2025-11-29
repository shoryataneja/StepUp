import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Modal, ScrollView } from 'react-native';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import { getWorkouts, seedInitialData } from '../../utils/storage';
import { Ionicons } from '@expo/vector-icons';

const RecentWorkouts = () => {
    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedWorkout, setSelectedWorkout] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        loadWorkouts();
    }, []);

    const loadWorkouts = async () => {
        try {
            await seedInitialData();
            const allWorkouts = await getWorkouts();

            // Sort by date (most recent first) and take top 5
            const sortedWorkouts = allWorkouts
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 5);

            setWorkouts(sortedWorkouts);
        } catch (error) {
            console.error('Error loading workouts:', error);
        } finally {
            setLoading(false);
        }
    };

    const getIconName = (type) => {
        const lowerType = type?.toLowerCase() || '';
        if (lowerType.includes('cardio') || lowerType.includes('run')) return 'walk';
        if (lowerType.includes('yoga')) return 'body';
        if (lowerType.includes('strength')) return 'barbell';
        return 'fitness';
    };

    const getIconColors = (type) => {
        const lowerType = type?.toLowerCase() || '';
        if (lowerType.includes('cardio') || lowerType.includes('run')) {
            return { bg: 'rgba(255, 107, 157, 0.2)', color: '#FF6B9D' };
        }
        if (lowerType.includes('yoga')) {
            return { bg: 'rgba(138, 92, 246, 0.2)', color: '#8A5CF6' };
        }
        if (lowerType.includes('strength')) {
            return { bg: 'rgba(46, 107, 241, 0.2)', color: COLORS.primaryBlue };
        }
        return { bg: 'rgba(46, 107, 241, 0.2)', color: COLORS.primaryBlue };
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Recent Workouts</Text>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={COLORS.primaryBlue} />
                </View>
            </View>
        );
    }

    if (workouts.length === 0) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Recent Workouts</Text>
                </View>
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No workouts yet. Start logging your activities!</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Recent Workouts</Text>
                <TouchableOpacity>
                    <Text style={styles.viewAll}>View All</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.list}>
                {workouts.map((workout) => {
                    const iconColors = getIconColors(workout.type);
                    return (
                        <TouchableOpacity
                            key={workout.id}
                            style={styles.card}
                            onPress={() => {
                                setSelectedWorkout(workout);
                                setModalVisible(true);
                            }}
                        >
                            <View style={styles.leftContent}>
                                <View style={[styles.iconContainer, { backgroundColor: iconColors.bg }]}>
                                    <Ionicons
                                        name={getIconName(workout.type)}
                                        size={20}
                                        color={iconColors.color}
                                    />
                                </View>
                                <View>
                                    <Text style={styles.cardTitle}>{workout.type}</Text>
                                    <Text style={styles.cardStats}>
                                        {workout.duration} min • {workout.calories || 0} kcal
                                    </Text>
                                </View>
                            </View>
                            <Text style={styles.time}>{formatDate(workout.date)}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Workout Details</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color={COLORS.textWhite} />
                            </TouchableOpacity>
                        </View>

                        {selectedWorkout && (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Type</Text>
                                    <Text style={styles.detailValue}>{selectedWorkout.type}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Date</Text>
                                    <Text style={styles.detailValue}>{formatDate(selectedWorkout.date)}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Duration</Text>
                                    <Text style={styles.detailValue}>{selectedWorkout.duration} min</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Calories</Text>
                                    <Text style={styles.detailValue}>{selectedWorkout.calories || 0} kcal</Text>
                                </View>
                                {selectedWorkout.steps && (
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Steps</Text>
                                        <Text style={styles.detailValue}>{selectedWorkout.steps}</Text>
                                    </View>
                                )}
                                {selectedWorkout.notes && (
                                    <View style={styles.notesContainer}>
                                        <Text style={styles.detailLabel}>Notes</Text>
                                        <Text style={styles.notesText}>{selectedWorkout.notes}</Text>
                                    </View>
                                )}
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: SIZES.padding,
        marginBottom: 100, // Space for bottom nav
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        ...FONTS.h2,
        color: COLORS.textWhite,
    },
    viewAll: {
        color: COLORS.primaryBlue,
        fontSize: 14,
        fontWeight: '600',
    },
    list: {
        gap: 12,
    },
    card: {
        backgroundColor: COLORS.cardDark,
        borderRadius: 20,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    leftContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardTitle: {
        color: COLORS.textWhite,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    cardStats: {
        color: COLORS.textGray,
        fontSize: 14,
    },
    time: {
        color: COLORS.textGray,
        fontSize: 14,
    },
    loadingContainer: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    emptyContainer: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: COLORS.textGray,
        fontSize: 14,
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: COLORS.cardDark,
        borderRadius: 20,
        width: '100%',
        maxHeight: '80%',
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        ...FONTS.h2,
        color: COLORS.textWhite,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    detailLabel: {
        color: COLORS.textGray,
        fontSize: 16,
    },
    detailValue: {
        color: COLORS.textWhite,
        fontSize: 16,
        fontWeight: '600',
    },
    notesContainer: {
        marginTop: 16,
    },
    notesText: {
        color: COLORS.textWhite,
        fontSize: 16,
        marginTop: 8,
        lineHeight: 24,
    },
});

export default RecentWorkouts;
