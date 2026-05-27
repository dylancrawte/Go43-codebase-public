import { View, Text, StyleSheet, TextInput, Pressable, Image, ActivityIndicator, Platform, KeyboardAvoidingView, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import type { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useGenreOrchestrator } from "@/controllers/orchestrators/genreOrchestrator";
import { useCampaignOrchestrator } from "@/controllers/orchestrators/campaignOrchestrator";

export type CampaignFormData = {
  eventName: string;
  image?: string;
  brief: string;
  date: string;
  time: string;
  artist: string;
  genreTags: string[];
  location: string;
  numberOfCreators: string;
  contentDeliveryDeadline: string;
  spotifyLink: string;
};

type CampaignFormProps = {
  mode: 'create' | 'edit';
  initialData?: Partial<CampaignFormData>;
  onSave: (data: CampaignFormData) => Promise<void>;
  onDelete?: () => Promise<void>;
  isSaving?: boolean;
  isDeleting?: boolean;
  onBack?: () => void | Promise<void>;
};

export default function CampaignForm({ mode, initialData, onSave, onDelete, isSaving = false, isDeleting = false, onBack }: CampaignFormProps) {
  // Form state
  const [name, setName] = useState(initialData?.eventName || '');
  const [brief, setBrief] = useState(initialData?.brief || '');
  const [date, setDate] = useState(initialData?.date || '');
  const [time, setTime] = useState(initialData?.time || '');
  const [artist, setArtist] = useState(initialData?.artist || '');
  const [location, setLocation] = useState(initialData?.location || '');
  const [numberOfCreators, setNumberOfCreators] = useState(initialData?.numberOfCreators || '');
  const [contentDeliveryDeadline, setContentDeliveryDeadline] = useState(initialData?.contentDeliveryDeadline || '');
  const [spotifyLink, setSpotifyLink] = useState(initialData?.spotifyLink || '');

  // Date/Time picker state
  const [dateValue, setDateValue] = useState<Date>(initialData?.date ? new Date(initialData.date) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [timeValue, setTimeValue] = useState<Date>(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [deadlineDate, setDeadlineDate] = useState<Date>(initialData?.contentDeliveryDeadline ? new Date(initialData.contentDeliveryDeadline) : new Date());
  const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);

  const { 
    pickImageOrch, 
    isImageUploading, 
    image, 
    setImage,
  } = useCampaignOrchestrator();

  const {
    genreTags,
    currentGenre,
    filteredGenres,
    dropdownVisible,
    addGenre,
    removeGenre,
    updateGenreInput,
    showDropdown,
    hideDropdown,
    initializeGenreTags
  } = useGenreOrchestrator();

  const KEYBOARD_OFFSET = Platform.OS === "ios" ? 60 : 0;

  // Initialize form data
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      initializeGenreTags(
        Array.isArray(initialData.genreTags)
          ? initialData.genreTags
          : []
      );
      // Initialize image from initialData
      if (initialData.image) {
        setImage(initialData.image);
      }
    }
  }, [mode, initialData]);

  // Date picker handlers
  const toggleDatePicker = () => setShowDatePicker(!showDatePicker);
  const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === 'set') {
      const next = selectedDate ?? dateValue;
      setDateValue(next);
      if (Platform.OS === 'android') {
        setDate(next.toLocaleDateString());
        setShowDatePicker(false);
      }
    } else {
      setShowDatePicker(false);
    }
  };
  const confirmIOSDate = () => {
    setDate(dateValue.toLocaleDateString());
    setShowDatePicker(false);
  };

  // Time picker handlers
  const toggleTimePicker = () => setShowTimePicker(!showTimePicker);
  const onChangeTime = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === 'set') {
      const next = selectedDate ?? timeValue;
      setTimeValue(next);
      if (Platform.OS === 'android') {
        const formatted = next.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setTime(formatted);
        setShowTimePicker(false);
      }
    } else {
      setShowTimePicker(false);
    }
  };
  
  const confirmIOSTime = () => {
    const formatted = timeValue.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setTime(formatted);
    setShowTimePicker(false);
  };

  // Deadline picker handlers
  const toggleDeadlinePicker = () => setShowDeadlinePicker(!showDeadlinePicker);
  const onChangeDeadline = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === 'set') {
      const next = selectedDate ?? deadlineDate;
      setDeadlineDate(next);
      if (Platform.OS === 'android') {
        setContentDeliveryDeadline(next.toLocaleDateString());
        setShowDeadlinePicker(false);
      }
    } else {
      setShowDeadlinePicker(false);
    }
  };
  const confirmIOSDeadline = () => {
    const formatted = deadlineDate.toLocaleDateString();
    setContentDeliveryDeadline(formatted);
    setShowDeadlinePicker(false);
  };

  // Image picker
  const pickImage = async () => {
    await pickImageOrch();
  };

  // Form submission
  const handleSubmit = async () => {
    const formData: CampaignFormData = {
      eventName: name,
      brief,
      image,
      date,
      time,
      artist,
      genreTags,
      location,
      numberOfCreators,
      contentDeliveryDeadline,
      spotifyLink,
    };
    await onSave(formData);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, alignSelf: "stretch", width: "100%" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? KEYBOARD_OFFSET : 0}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
        automaticallyAdjustKeyboardInsets
      >
        <View style={styles.headerRow}>
          {onBack && (
            <Pressable onPress={onBack} style={{marginTop: 20}}>
              <Ionicons name="arrow-back" size={30} color="white" />
            </Pressable>
          )}
          <Pressable onPress={handleSubmit} disabled={isSaving} style={{marginTop: 20}}>
            {isSaving ? <ActivityIndicator color="#fff" /> : <Ionicons name="checkmark" size={30} color="white" />}
          </Pressable>
        </View>

        <View style={styles.headerContainer}>
          <Text style={styles.heading}>{mode === 'create' ? 'Create Campaign' : 'Edit Campaign'}</Text>
        </View>

        <View style={{ gap: 20 }}>
          {/* Image Upload */}
          <Pressable onPress={() => !isImageUploading && pickImage()}>
            {image ? (
              <View style={{ position: 'relative' }}>
                <Image source={{ uri: image }} style={styles.cover} resizeMode="cover" />
                <View style={styles.imageOverlay}>
                  <Ionicons name="create-outline" size={24} color="white" />
                  <Text style={styles.editImageText}>Tap to change image</Text>
                </View>
              </View>
            ) : (
              <View style={[styles.cover, { alignItems: 'center', justifyContent: 'center', backgroundColor: '#2F2F2F' }]}>
                {isImageUploading ? (
                  <ActivityIndicator size="small" color="#59D1D9" />
                ) : (
                  <>
                    <Ionicons name="image" size={28} color="#A3A3A3" />
                    <Text style={styles.subtext}>Tap to add image</Text>
                  </>
                )}
              </View>
            )}
          </Pressable>

          <Text style={styles.subHeaderText}>Event Details</Text>
          <View style={styles.separator} />

          <View>
            <Text style={styles.label}>Event Name</Text>
            <TextInput value={name} onChangeText={setName} placeholder="Campaign name" placeholderTextColor="#A3A3A3" style={styles.input} />
          </View>

          {/* Date Picker */}
          <View>
            <Text style={styles.label}>Date</Text>
            <View style={{ width: '100%' }}>
              {showDatePicker && (
                <DateTimePicker
                  mode='date'
                  display='spinner'
                  value={dateValue}
                  onChange={onChangeDate}
                  themeVariant='dark'
                  {...(Platform.OS === 'ios' ? ({ textColor: '#FFFFFF' } as any) : {})}
                  style={styles.datePicker}
                  minimumDate={new Date()}
                />
              )}
              {showDatePicker && Platform.OS === 'ios' && (
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', backgroundColor: 'transparent' }}>
                  <TouchableOpacity style={[styles.button]} onPress={toggleDatePicker}>
                    <Text style={[styles.buttonText, { color: 'white' }]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.button, styles.pickerButton, { marginBottom: 10 }]} onPress={confirmIOSDate}>
                    <Text style={[styles.buttonText, { color: 'white' }]}>Confirm</Text>
                  </TouchableOpacity>
                </View>
              )}
              {!showDatePicker && (
                <Pressable onPress={toggleDatePicker}>
                  <TextInput
                    style={styles.input}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#A3A3A3"
                    value={date}
                    onChangeText={setDate}
                    editable={false}
                    onPressIn={toggleDatePicker}
                  />
                </Pressable>
              )}
            </View>
          </View>

          {/* Time Picker */}
          <View>
            <Text style={styles.label}>Time</Text>
            <View style={{ width: '100%' }}>
              {showTimePicker && (
                <DateTimePicker
                  mode='time'
                  display='spinner'
                  value={timeValue}
                  onChange={onChangeTime}
                  themeVariant='dark'
                  {...(Platform.OS === 'ios' ? ({ textColor: '#FFFFFF', minuteInterval: 1 } as any) : {})}
                  {...(Platform.OS === 'android' ? { is24Hour: true } : {})}
                  style={styles.datePicker}
                />
              )}
              {showTimePicker && Platform.OS === 'ios' && (
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', backgroundColor: 'transparent' }}>
                  <TouchableOpacity style={[styles.button]} onPress={toggleTimePicker}>
                    <Text style={[styles.buttonText, { color: 'white' }]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.button, styles.pickerButton, { marginBottom: 10 }]} onPress={confirmIOSTime}>
                    <Text style={[styles.buttonText, { color: 'white' }]}>Confirm</Text>
                  </TouchableOpacity>
                </View>
              )}
              {!showTimePicker && (
                <Pressable onPress={toggleTimePicker}>
                  <TextInput
                    style={styles.input}
                    placeholder="HH:MM"
                    placeholderTextColor="#A3A3A3"
                    value={time}
                    onChangeText={setTime}
                    editable={false}
                    onPressIn={toggleTimePicker}
                  />
                </Pressable>
              )}
            </View>
          </View>

          <View>
            <Text style={styles.label}>Location</Text>
            <TextInput value={location} onChangeText={setLocation} placeholder="Location" placeholderTextColor="#A3A3A3" style={styles.input} />
          </View>

          <Text style={styles.subHeaderText}>Artist Details</Text>
          <View style={styles.separator} />

          <View>
            <Text style={styles.label}>Artist</Text>
            <TextInput value={artist} onChangeText={setArtist} placeholder="Artist" placeholderTextColor="#A3A3A3" style={styles.input} />
          </View>

          {/* Genre Selection */}
          <View>
            <Text style={styles.label}>Event genres</Text>
            <View style={{ position: 'relative' }}>
              <TextInput
                value={currentGenre}
                onChangeText={updateGenreInput}
                onFocus={() => showDropdown()}
                onSubmitEditing={() => addGenre()}
                placeholder="Add genres..."
                placeholderTextColor="#A3A3A3"
                style={styles.input}
                autoCapitalize="none"
                returnKeyType="done"
              />
              {dropdownVisible && filteredGenres.length > 0 && currentGenre.length > 0 && (
                <ScrollView style={styles.suggestionBox} keyboardShouldPersistTaps="handled">
                  {filteredGenres.slice(0, 5).map((g) => (
                    <TouchableOpacity
                      key={g._id}
                      onPress={() => { addGenre(g.name); hideDropdown(); }}
                      style={styles.suggestionItem}
                    >
                      <Text style={{ color: '#EBEBEB' }}>{g.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
            <View style={styles.genreTagsRow}>
              {genreTags.map((tag) => (
                <View key={tag} style={styles.genreTag}>
                  <Text style={styles.genreTagText}>{tag}</Text>
                  <Pressable onPress={() => removeGenre(tag)}>
                    <Text style={styles.genreTagRemove}>×</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          </View>

          <View>
            <Text style={styles.label}>Spotify link</Text>
            <TextInput value={spotifyLink} onChangeText={setSpotifyLink} placeholder="https://" placeholderTextColor="#A3A3A3" style={styles.input} autoCapitalize="none" />
          </View>

          <Text style={styles.subHeaderText}>Creator Details</Text>
          <View style={styles.separator} />

          <View>
            <Text style={styles.label}>Number of creators</Text>
            <TextInput value={numberOfCreators} onChangeText={setNumberOfCreators} placeholder="e.g. 5" placeholderTextColor="#A3A3A3" style={styles.input} keyboardType="numeric" />
          </View>

          {/* Deadline Picker */}
          <View>
            <Text style={styles.label}>Content delivery deadline</Text>
            <View style={{ width: '100%' }}>
              {showDeadlinePicker && (
                <DateTimePicker
                  mode='date'
                  display='spinner'
                  value={deadlineDate}
                  onChange={onChangeDeadline}
                  themeVariant='dark'
                  {...(Platform.OS === 'ios' ? ({ textColor: '#FFFFFF' } as any) : {})}
                  style={styles.datePicker}
                  minimumDate={new Date()}
                />
              )}
              {showDeadlinePicker && Platform.OS === 'ios' && (
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', backgroundColor: 'transparent' }}>
                  <TouchableOpacity style={[styles.button]} onPress={toggleDeadlinePicker}>
                    <Text style={[styles.buttonText, { color: 'white' }]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.button, styles.pickerButton, { marginBottom: 10 }]} onPress={confirmIOSDeadline}>
                    <Text style={[styles.buttonText, { color: 'white' }]}>Confirm</Text>
                  </TouchableOpacity>
                </View>
              )}
              {!showDeadlinePicker && (
                <Pressable onPress={toggleDeadlinePicker}>
                  <TextInput
                    style={styles.input}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#A3A3A3"
                    value={contentDeliveryDeadline}
                    onChangeText={setContentDeliveryDeadline}
                    editable={false}
                    onPressIn={toggleDeadlinePicker}
                  />
                </Pressable>
              )}
            </View>
          </View>

          <View>
            <Text style={styles.label}>Brief</Text>
            <TextInput
              value={brief}
              onChangeText={setBrief}
              placeholder="Describe the campaign brief"
              placeholderTextColor="#A3A3A3"
              style={[styles.input, { minHeight: 100, textAlignVertical: 'top' }]}
              multiline
            />
          </View>

          {/* Delete button for edit mode */}
          {mode === 'edit' && onDelete && (
            <Pressable
              onPress={onDelete}
              disabled={isDeleting || isSaving}
              style={[styles.deleteButton, { opacity: (isDeleting || isSaving) ? 0.6 : 1 }]}
            >
              {isDeleting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.deleteButtonText}>Cancel campaign</Text>
              )}
            </Pressable>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  heading: {
    fontSize: 30,
    fontWeight: "700",
    color: "#EBEBEB",
    marginBottom: 8,
    alignSelf: "center",
    fontFamily: "Aileron",
  },
  label: {
    color: "#EBEBEB",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    marginLeft: 5,
    fontFamily: "Aileron-Regular",
  },
  input: {
    backgroundColor: "#2F2F2F",
    color: "#EBEBEB",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderColor: "#4B4B4B",
    borderWidth: 1,
    marginLeft: 5,
  },
  cover: {
    width: '100%',
    height: 160,
    borderRadius: 3,
    borderColor: '#4B4B4B',
    borderWidth: 1,
  },
  genreTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  genreTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2F2F2F',
    borderColor: '#4B4B4B',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    marginLeft: 5,
  },
  genreTagText: {
    fontSize: 12,
    color: '#EBEBEB',
    marginRight: 6,
  },
  genreTagRemove: {
    fontSize: 14,
    color: '#A3A3A3',
    marginLeft: 2,
    marginTop: -2,
  },
  suggestionBox: {
    maxHeight: 160,
    backgroundColor: '#2F2F2F',
    borderColor: '#4B4B4B',
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 2,
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  suggestionItem: {
    padding: 10,
    borderBottomColor: '#3A3A3A',
    borderBottomWidth: 1,
  },
  datePicker: {
    height: 120,
    marginTop: -10,
  },
  pickerButton: {
    paddingHorizontal: 16,
  },
  button: {
    height: 44,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4B4B4B',
    backgroundColor: 'transparent',
  },
  buttonText: {
    fontSize: 16,
    color: '#59D1D9',
    fontWeight: '600',
    fontFamily: 'Aileron-Regular',
  },
  subtext: {
    color: "#C5C5C5",
    fontSize: 14,
    marginTop: 10,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 20,
  },
  deleteButton: {
    marginTop: 12,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A33',
    backgroundColor: 'transparent',
  },
  deleteButtonText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: '600',
  },
  subHeaderText: {
    color: "#EBEBEB",
    fontSize: 20,
    fontWeight: "600",
    fontFamily: "Aileron-Regular",
    position: "relative",
    marginTop: 8,
  },
  separator: {
    width: "100%",
    bottom: 8,
    maxWidth: 400,
    height: 1,
    backgroundColor: "white",
    alignSelf: "flex-start",
    marginLeft: 5
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  editImageText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Aileron-Regular',
  },
});

