import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
  Modal,
  Platform,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FONTS, SIZES } from '../constants/theme';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  saveWorkout,
  updateWorkout,
  deleteWorkout,
  getCustomTypes,
  addCustomType
} from '../utils/storage';

const C = {
  BG_PRIMARY: "#121212",
  CARD_BG: "#1E1E1E",
  TEXT_LIGHT: "#FFFFFFE6",
  TEXT_MUTED: "#AAAAAA",
  BORDER: "#333333",
  PROGRESS_BG: "#444444",
  PRIMARY_ACCENT: "#6C63FF",
  ORANGE_ACCENT: "#FF8C00",
  SUCCESS_ACCENT: "#00C853",
  REST_DAY_ACCENT: "#F08080",
  WHITE: "#FFFFFF",
  BLACK: "#000000",
};

export default function AddWorkout() {
  const navigation = useNavigation();
  const route = useRoute();
  const editingWorkout = route.params?.workout;

  const [workoutType, setWorkoutType] = useState('Strength');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [isRestDay, setIsRestDay] = useState(false);

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [calories, setCalories] = useState('');
  const [intensity, setIntensity] = useState('Moderate');

  const [customTypes, setCustomTypes] = useState([]);
  const [defaultTypes] = useState(['Strength', 'Cardio', 'Yoga', 'HIIT', 'Pilates', 'Other']);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');

  const intensityLevels = ['Low', 'Moderate', 'High', 'Extreme'];

  useEffect(() => {
    loadTypes();
    if (editingWorkout) {
      setWorkoutType(editingWorkout.type);
      setDuration(editingWorkout.duration.toString());
      setNotes(editingWorkout.notes);
      setIsRestDay(editingWorkout.isRestDay);
      setDate(new Date(editingWorkout.date));
      if (editingWorkout.calories) setCalories(editingWorkout.calories.toString());
      if (editingWorkout.intensity) setIntensity(editingWorkout.intensity);
    } else if (route.params?.initialDate) {
      setDate(new Date(route.params.initialDate));
    }
  }, [editingWorkout, route.params]);

  const loadTypes = async () => {
    try {
      const types = await getCustomTypes();
      const uniqueCustom = types.filter(t => !defaultTypes.includes(t));
      setCustomTypes(uniqueCustom);
    } catch (error) {}
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleAddCustomType = async () => {
    if (!newTypeName.trim()) return;
    const trimmedName = newTypeName.trim();
    if (defaultTypes.includes(trimmedName) || customTypes.includes(trimmedName)) {
      Alert.alert('Error', 'This workout type already exists.');
      return;
    }
    try {
      await addCustomType(trimmedName);
      setCustomTypes([...customTypes, trimmedName]);
      setWorkoutType(trimmedName);
      setNewTypeName('');
      setIsModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to save custom type');
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      "Delete Workout",
      "Are you sure you want to delete this workout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteWorkout(editingWorkout.id);
              navigation.goBack();
            } catch {
              Alert.alert('Error', 'Failed to delete workout');
            }
          }
        }
      ]
    );
  };

  const handleSave = async () => {
    if (!isRestDay && !duration) {
      Alert.alert('Missing Field', 'Please enter a duration for your workout.');
      return;
    }

    try {
      const workoutData = {
        id: editingWorkout ? editingWorkout.id : `uuid-${Date.now()}`,
        date: date.toISOString().split('T')[0],
        type: isRestDay ? 'Rest' : workoutType,
        duration: isRestDay ? 0 : parseInt(duration),
        calories: isRestDay ? 0 : parseInt(calories) || 0,
        intensity: isRestDay ? 'Rest' : intensity,
        notes,
        isRestDay
      };

      const json = await AsyncStorage.getItem("stepup_data");
      const data = json ? JSON.parse(json) : { workouts: [] };

      if (editingWorkout) {
        const updated = data.workouts.map(w =>
          w.id === workoutData.id ? workoutData : w
        );
        data.workouts = updated;
      } else {
        data.workouts.push(workoutData);
      }

      await AsyncStorage.setItem("stepup_data", JSON.stringify(data));
      Alert.alert('Success', 'Workout saved successfully!');
      navigation.goBack();

    } catch {
      Alert.alert('Error', 'Failed to save workout');
    }
  };

  const allTypes = [...defaultTypes, ...customTypes];

  return (
    <View style={[styles.container, { backgroundColor: C.BG_PRIMARY }]}>

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.iconButton, { backgroundColor: C.CARD_BG }]}
        >
          <Ionicons name="close" size={24} color={C.TEXT_LIGHT} />
        </TouchableOpacity>

        <Text style={[FONTS.h2, { color: C.TEXT_LIGHT }]}>
          {editingWorkout ? 'Edit Workout' : 'Log Workout'}
        </Text>

        {editingWorkout ? (
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: C.CARD_BG }]}
            onPress={handleDelete}
          >
            <Ionicons name="trash-outline" size={24} color="red" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <TouchableOpacity
          style={[styles.dateCard, { backgroundColor: C.CARD_BG }]}
          onPress={() => setShowDatePicker(true)}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="calendar-outline" size={24} color={C.TEXT_LIGHT} />
            <Text style={[styles.dateText, { color: C.TEXT_LIGHT, marginLeft: 10 }]}>
              {date.toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={20} color={C.TEXT_MUTED} />
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            maximumDate={new Date()}
            themeVariant={"dark"}
          />
        )}

        <View style={[styles.card, { backgroundColor: C.CARD_BG }]}>
          <View style={styles.rowCenter}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons
                name="bed-outline"
                size={24}
                color={C.TEXT_LIGHT}
                style={{ marginRight: 10 }}
              />
              <Text style={[styles.label, { color: C.TEXT_LIGHT }]}>
                Rest Day
              </Text>
            </View>

            <Switch
              trackColor={{ false: C.BORDER, true: C.PRIMARY_ACCENT }}
              thumbColor={isRestDay ? "#fff" : "#f4f4f4"}
              value={isRestDay}
              onValueChange={setIsRestDay}
            />
          </View>

          <Text style={[styles.subtext, { color: C.TEXT_MUTED }]}>
            Mark this day as a rest day to keep your streak.
          </Text>
        </View>

        {!isRestDay && (
          <>
            <Text style={[styles.sectionTitle, { color: C.TEXT_LIGHT }]}>
              Workout Type
            </Text>

            <View style={styles.typeContainer}>
              {allTypes.map(type => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    {
                      backgroundColor:
                        workoutType === type ? C.PRIMARY_ACCENT : C.CARD_BG,
                      borderColor:
                        workoutType === type ? C.PRIMARY_ACCENT : C.BORDER
                    }
                  ]}
                  onPress={() => setWorkoutType(type)}
                >
                  <Text
                    style={[
                      styles.typeText,
                      {
                        color:
                          workoutType === type ? C.WHITE : C.TEXT_LIGHT
                      }
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={[
                  styles.typeButton,
                  {
                    backgroundColor: C.CARD_BG,
                    borderColor: C.BORDER,
                    flexDirection: "row",
                    alignItems: "center"
                  }
                ]}
                onPress={() => setIsModalVisible(true)}
              >
                <Ionicons name="add" size={20} color={C.TEXT_LIGHT} />
                <Text style={[styles.typeText, { marginLeft: 5, color: C.TEXT_LIGHT }]}>
                  Custom
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.rowContainer}>
              <View
                style={[
                  styles.inputCard,
                  { backgroundColor: C.CARD_BG, flex: 1, marginRight: 10 }
                ]}
              >
                <Text style={[styles.inputLabel, { color: C.TEXT_MUTED }]}>
                  Duration
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                  <TextInput
                    style={[styles.durationInput, { color: C.TEXT_LIGHT }]}
                    value={duration}
                    onChangeText={setDuration}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={C.TEXT_MUTED}
                  />
                  <Text style={[styles.unitText, { color: C.TEXT_MUTED }]}>
                    min
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.inputCard,
                  { backgroundColor: C.CARD_BG, flex: 1, marginLeft: 10 }
                ]}
              >
                <Text style={[styles.inputLabel, { color: C.TEXT_MUTED }]}>
                  Calories
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                  <TextInput
                    style={[styles.durationInput, { color: C.TEXT_LIGHT }]}
                    value={calories}
                    onChangeText={setCalories}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={C.TEXT_MUTED}
                  />
                  <Text style={[styles.unitText, { color: C.TEXT_MUTED }]}>
                    kcal
                  </Text>
                </View>
              </View>
            </View>

            <Text style={[styles.sectionTitle, { color: C.TEXT_LIGHT }]}>
              Intensity
            </Text>
            <View style={styles.typeContainer}>
              {intensityLevels.map(level => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.typeButton,
                    {
                      backgroundColor:
                        intensity === level ? C.PRIMARY_ACCENT : C.CARD_BG,
                      borderColor:
                        intensity === level ? C.PRIMARY_ACCENT : C.BORDER,
                      paddingHorizontal: 20
                    }
                  ]}
                  onPress={() => setIntensity(level)}
                >
                  <Text
                    style={[
                      styles.typeText,
                      {
                        color:
                          intensity === level ? C.WHITE : C.TEXT_LIGHT
                      }
                    ]}
                  >
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <Text style={[styles.sectionTitle, { color: C.TEXT_LIGHT }]}>
          Notes
        </Text>
        <TextInput
          style={[
            styles.notesInput,
            { backgroundColor: C.CARD_BG, color: C.TEXT_LIGHT }
          ]}
          value={notes}
          onChangeText={setNotes}
          placeholder="How did it feel?..."
          placeholderTextColor={C.TEXT_MUTED}
          multiline
        />

        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: C.PRIMARY_ACCENT }]}
          onPress={handleSave}
        >
          <Ionicons name="checkmark-circle-outline" size={24} color={C.WHITE} />
          <Text style={styles.saveButtonText}>Save Workout</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: C.CARD_BG }]}>
            <Text style={[styles.modalTitle, { color: C.TEXT_LIGHT }]}>
              New Workout Type
            </Text>

            <TextInput
              style={[
                styles.modalInput,
                { backgroundColor: C.BG_PRIMARY, color: C.TEXT_LIGHT }
              ]}
              value={newTypeName}
              onChangeText={setNewTypeName}
              placeholder="e.g. Pilates"
              placeholderTextColor={C.TEXT_MUTED}
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: C.CARD_BG, borderWidth: 1, borderColor: C.BORDER, marginRight: 10 }
                ]}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: C.TEXT_LIGHT }]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: C.PRIMARY_ACCENT, marginLeft: 10 }
                ]}
                onPress={handleAddCustomType}
              >
                <Text style={[styles.modalButtonText, { color: C.WHITE }]}>
                  Add
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    marginBottom: 20,
  },
  iconButton: {
    padding: 8,
    borderRadius: 20
  },
  scrollView: {
    paddingHorizontal: SIZES.padding
  },
  sectionTitle: {
    ...FONTS.h3,
    marginBottom: 15,
    marginTop: 10,
    fontWeight: 'bold',
    fontSize: 18
  },
  card: {
    borderRadius: 15,
    padding: 15,
    marginBottom: 20
  },
  dateCard: {
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600'
  },
  rowCenter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5
  },
  label: {
    fontSize: 16,
    fontWeight: '600'
  },
  subtext: {
    fontSize: 12
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20
  },
  typeButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1
  },
  typeText: {
    fontWeight: '600',
    fontSize: 14
  },
  rowContainer: {
    flexDirection: 'row',
    marginBottom: 20
  },
  inputCard: {
    borderRadius: 15,
    padding: 15,
    alignItems: 'center'
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 5
  },
  durationInput: {
    fontSize: 32,
    fontWeight: 'bold',
    minWidth: 40,
    textAlign: 'center'
  },
  unitText: {
    fontSize: 14,
    marginLeft: 5
  },
  notesInput: {
    borderRadius: 15,
    padding: 15,
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
    fontSize: 16
  },
  saveButton: {
    padding: 15,
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 8
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    width: '80%',
    borderRadius: 20,
    padding: 20
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center'
  },
  modalInput: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 16
  },
  modalButtons: {
    flexDirection: 'row'
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center'
  },
  modalButtonText: {
    fontWeight: '600'
  }
});