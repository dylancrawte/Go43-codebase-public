import { useEffect, useRef, useState } from "react";
import { View as RNView } from "react-native";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Image,
  Pressable,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../store/authStore";
import { useProfileOrchestrator } from "@/controllers/orchestrators/profileOrchestrator";
import { useGenreOrchestrator } from "@/controllers/orchestrators/genreOrchestrator";
import { useToast } from "@/components/CustomToast";

export default function ProfileScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  // UI state
  const [isUpdateVisible, setIsUpdateVisible] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [tiktokLink, setTiktokLink] = useState('');
  // Bookings state
  

  const { user, logout, saveUpdatedUser } = useAuthStore();

  const userId = user?._id

  const {
    formData,
    setFormData,
    confirmedBookings,
    isLoadingBookings,
    //orchestrator functions
    updateProfile,  
    fetchConfirmedBookingsOrch,
    confirmDeleteAccountOrch,
  } = useProfileOrchestrator(user);

  const {
    currentGenre,
    genreTags,
    filteredGenres,
    dropdownVisible,        
    //orchestrator functions
    addGenre,
    removeGenre,
    updateGenreInput,     
    showDropdown,
    hideDropdown,
    initializeGenreTags   
  } = useGenreOrchestrator();

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

  const handleDeleteAccount = async () => {
    Alert.alert("Are you sure you want to delete your account?", "This action cannot be undone and will permanently remove all your data.", [
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const res = await confirmDeleteAccountOrch();
          if (res.success) {
            router.replace("/");
          } else {
            Alert.alert("Error", res?.error || "An unexpected error occurred while deleting your account");
          }
        }
      },
      {
        text: "Cancel",
        style: "cancel",
        onPress: () => {}
      }
    ])
  };
  

// ------------------------ update profile ----------------------------
  const resetEditingStates = () => {
    setIsUpdateVisible(false);
    setIsEditingName(false);
    setIsEditingEmail(false);
    setIsEditingPhone(false);
  };

  const handleUpdateProfile = async () => {
    const profileData = { 
      userId, 
      fullName: formData.fullName, 
      email: formData.email,         
      phoneNumber: formData.phoneNumber, 
      tiktokUsername: user?.displayName,
      genres: genreTags,
      tiktokLink: tiktokLink
    }

    const result = await updateProfile(profileData, user)

    showToast(result.message, result.success ? "success" : "error");
    
    if (result.success) {
      await saveUpdatedUser(result.updatedUser);
      resetEditingStates();
    }
  }
// ------------------------------ (end) --------------------------------------


// ----------------------------- genres ---------------------------

  useEffect(() => {
    if (user) {
        initializeGenreTags(user.genres || []);
        fetchConfirmedBookings();
        setTiktokLink(user.tiktokLink || '');
    }
  }, [user]);

  const fetchConfirmedBookings = async () => {
    if (!user?._id) return;
    
    await fetchConfirmedBookingsOrch(user._id);
  };

  const handleAddGenre = (genreName?: string) => {
    
    const result = addGenre(genreName);
    if (result.success) {
      setIsUpdateVisible(true);
    } else {
      alert(result.message);
    }
  };


  const handleRemoveGenre = (tag: string) => {
    const result = removeGenre(tag);
    
    if (result.success) {
        setIsUpdateVisible(true); 
    }
  };
// -------------------------- (end) ------------------------

  const scrollRef = useRef<ScrollView | null>(null);
  const genreSectionRef = useRef<RNView | null>(null);
  const [genreSectionY, setGenreSectionY] = useState(0);

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: "#f5f5f5" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <Image
        source={require("../assets/images/cover-photo.jpg")}
        style={styles.bgImage}
        blurRadius={2}
      />
      {/* Back Button */}
      <Pressable style={styles.backButton} onPress={() => router.push("/(fan)/explore")}> 
        <Ionicons name="arrow-back" size={28} color="#222" />
      </Pressable>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >

        {/* ---------------- Profile Section ---------------- */}
        {/* profile picture and username */}
        <View style={styles.profileSection}>
          {user?.avatarUrl && !avatarError ? (
            <Image
              source={{ uri: user?.avatarUrl }}
              style={styles.profileImage}
              onError={() => setAvatarError(true)}
              onLoad={() => setAvatarError(false)}
            />
          ) : (
            <Ionicons
              name="person-circle-outline"
              size={120}
              color="#000000"
              style={styles.defaultProfileIcon}
            />
          )}
          <Text style={styles.usernameText}>
            {user?.username || user?.displayName || "User"}
          </Text>
          </View>
          
          {/* Silver tier progress */}
      <View style={styles.tierContainer}>
        <View style={styles.tierRow}>
          <Ionicons name="medal-outline" size={22} color="#CD7F32" />
          <Text style={styles.tierLabel}>Bronze tier</Text>
        </View>
        <View style={styles.tierProgressTrack}>
          <View style={[styles.tierProgressFill, { width: "0%" }]} />
        </View>
        <Text style={styles.tierProgressCaption}>0% complete</Text>
      </View>
        

        {/* Account details */}
        <Text style={styles.sectionHeader}>Account details</Text>
        <View style={styles.separator} />

        <View style={styles.fieldContainer}>
          
          
          {/* if name field is not being edited*/}
          {!isEditingName && (formData.fullName || user?.fullName) ? (
          <Pressable 
            style={styles.displayField} 
            onPress={() => setIsEditingName(true)}
          >
            <Text style={styles.displayText}>
              {formData.fullName || user?.fullName} 
            </Text>
            <Ionicons name="pencil" size={16} color="#666" />
          </Pressable>
          ) : (        
            <TextInput
            style={styles.input}
            placeholder="Full name"
            value={formData.fullName}
            onChangeText={(text) => setFormData({...formData, fullName: text})}
            onFocus={() => setIsUpdateVisible(true)}
            onBlur={() => {
              setIsEditingName(false);
            }}
            autoFocus={isEditingName}
          />
        )}
        

        {!isEditingEmail && (formData.email || user?.email) ? (
        <Pressable 
          style={styles.displayField} 
          onPress={() => setIsEditingEmail(true)}
        >
          <Text style={styles.displayText}>
            {formData.email || user?.email}  {/* ✅ Show updated value */}
          </Text>
          <Ionicons name="pencil" size={16} color="#666" />
        </Pressable>
          ) : (
            <TextInput
            style={styles.input}
            placeholder="Email address"
            value={formData.email}
            onChangeText={(text) => setFormData({...formData, email: text})}
            onFocus={() => setIsUpdateVisible(true)}
            onBlur={() => {
              setIsEditingEmail(false);
            }}
            autoFocus={isEditingEmail}
          />
        )}

        {!isEditingPhone && (formData.phoneNumber || user?.phoneNumber) ? (
          <Pressable 
            style={styles.displayField} 
            onPress={() => setIsEditingPhone(true)}
          >
            <Text style={styles.displayText}>
              {formData.phoneNumber || user?.phoneNumber}  {/* ✅ Show updated value */}
            </Text>
            <Ionicons name="pencil" size={16} color="#666" />
          </Pressable>
        ) : (
          <TextInput
          style={styles.input}
          placeholder="Phone number"
          value={formData.phoneNumber}
          onChangeText={(text) => setFormData({...formData, phoneNumber: text})}
          onFocus={() => setIsUpdateVisible(true)}
          onBlur={() => {
            setIsEditingPhone(false);
          }}
          autoFocus={isEditingPhone}
          keyboardType="phone-pad"
          />
      )}
      
      </View>
      {/* Socials */}
      <Text style={styles.sectionHeader}>Social Profiles</Text>
      <View style={styles.separator} />


      {/* ----------- This bit is for when TikTok approve API use-------------- */}
      {/* {shouldShowConnectButton ? (
        <TouchableOpacity style={styles.socialContainer} onPress={handleTikTok}>
          <View style={styles.socialInputContainer}>
            <Image
              source={require("../assets/images/TikTok_Icon_Black_Circle.png")}
              style={styles.socialIcon}
            />
            <Text style={styles.socialTextInput}>
              {user?.tiktokId ? "Reconnect your TikTok" : "Connect your TikTok"}
            </Text>
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.socialContainer}>
          <View style={styles.socialInputContainer}>
            <Image
              source={require("../assets/images/TikTok_Icon_Black_Circle.png")}
              style={styles.socialIcon}
            />
            <Text style={styles.socialConnectedText}>{user.displayName}</Text>
          </View>
        </View>
      )} */}

        <View style={styles.socialContainer}>
          <View style={styles.socialInputContainer}>
            <Image
              source={require("../assets/images/TikTok_Icon_Black_Circle.png")}
              style={styles.socialIcon}
            />
            <TextInput 
              style={styles.socialTextInput}
              placeholder="Paste TikTok link..."
              placeholderTextColor="#999"
              value={tiktokLink}
              onChangeText={(text) => {
                setTiktokLink(text);
                setIsUpdateVisible(true);
              }}
              onFocus={() => setIsUpdateVisible(true)}
            />
          </View>
        </View>


        {/* Music genre preferences*/}
        <Text style={styles.sectionHeader}>Music Genre Preferences</Text>
        <View style={styles.separator} />
        <View
          ref={genreSectionRef}
          onLayout={(e) => setGenreSectionY(e.nativeEvent.layout.y)}
          style={{ width: "100%", position: "relative", zIndex: 20 }}
        >
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Add genre preference..."
            value={currentGenre}
            onChangeText={updateGenreInput}
            onFocus={() => {
              showDropdown();
              setIsUpdateVisible(true);
              requestAnimationFrame(() => {
                const yTarget = Math.max(genreSectionY - 200, 0);
                scrollRef.current?.scrollTo({ y: yTarget, animated: true });
              });
            }}
            
            
            returnKeyType="done"
          />

          {/* genre list drop down */}
          {dropdownVisible && filteredGenres.length > 0 && currentGenre.length > 0 && (
            <ScrollView 
            style={styles.suggestionBox}
            keyboardShouldPersistTaps="handled">
              {filteredGenres.slice(0, 5).map((g) => (
                <TouchableOpacity
                  key={g._id}
                  onPress={() => {
                    
                    handleAddGenre(g.name);
                    hideDropdown();
                  }} 
                  style={styles.suggestionItem}
                >
                  <Text>{g.name}</Text>
              </TouchableOpacity>
            ))}
           </ScrollView>
        )}
      </View>

      <View style={styles.genreTagsRow}>
        {genreTags.map((tag) => (
          <View key={tag} style={styles.genreTag}>
            <Text style={styles.genreTagText}>{tag}</Text>
            <Pressable onPress={() => handleRemoveGenre(tag)}>
              <Text style={styles.genreTagRemove}>×</Text>
            </Pressable>
          </View>
        ))}
      </View>


      {/* Save Button */}
      <View style={styles.saveContainer}>
      {isUpdateVisible && (
          <Pressable style={styles.saveButton} onPress={handleUpdateProfile}>
            <Text style={styles.saveButtonText}>Update</Text>
          </Pressable>
        )}
      </View>

      {/* My Events */}
      <Text style={styles.sectionHeader}>My Events</Text>
      {/* TikTok Request Notification Indicator */}
      <View style={styles.notificationDot} />
      <View style={styles.separator} />
      
      {isLoadingBookings ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your events...</Text>
        </View>
      ) : confirmedBookings.length === 0 ? (
        <View style={styles.noEventsContainer}>
          <Text style={styles.noEventsText}>No confirmed events yet</Text>
        </View>
      ) : (
        <View style={styles.eventsContainer}>
          {confirmedBookings
            .filter((booking: any) => booking.campaignID && booking.campaignID._id) // Filter out bookings with null/undefined campaignID
            .map((booking: any) => {
              // Additional safety check to prevent crashes
              if (!booking.campaignID || !booking.campaignID._id) {
                return null;
              }
              
              return (
                <Pressable
                  key={booking._id}
                  style={styles.eventCard}
                  onPress={() => {
                    try {
                      router.push({
                        pathname: "/tiktokLink",
                        params: {
                          campaignId: booking.campaignID._id,
                          campaignName: booking.campaignID.eventName || booking.campaignID.title || 'Event'
                        }
                      });
                    } catch (error) {
                      console.error('Error navigating to tiktok link:', error);
                      alert('Unable to open tiktok link');
                    }
                  }}
                >
                  <Image
                    source={{ uri: booking.campaignID.image || '' }}
                    style={styles.eventImage}
                    resizeMode="cover"
                    onError={() => {}}
                  />
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventTitle} numberOfLines={2}>
                      {booking.campaignID.eventName || booking.campaignID.title || 'Event'}
                    </Text>
                    <Text style={styles.eventDate}>
                      {booking.campaignID.date || 'Date TBA'}
                    </Text>
                    <Text style={styles.eventLocation}>
                      {booking.campaignID.location || 'Location TBA'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#666" />
                </Pressable>
              );
            })
            .filter(Boolean) // Remove any null entries
          }
        </View>
      )}

         {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </Pressable>
        </View>

        {/* Account Deletion Section */}
        <View style={styles.logoutContainer}>
          <Pressable style={styles.deleteAccountButton} onPress={handleDeleteAccount}>
            <Text style={styles.deleteAccountButtonText}>Delete Account</Text>
          </Pressable>
        </View>
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  bgImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    minHeight: 900,
    opacity: 0.7,
    resizeMode: "cover",
    zIndex: 0,
  },
  backButton: {
    position: "absolute",
    top: 48,
    left: 16,
    zIndex: 2,
    padding: 4,
    elevation: 2,
    backgroundColor: "transparent",
  },
  scrollContent: {
    paddingTop: 80,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  tierContainer: {
    marginTop: 4,
    marginBottom: 12,
  },
  tierRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  tierLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#CD7F32",
  },
  tierProgressTrack: {
    height: 8,
    borderRadius: 6,
    backgroundColor: "#D3D3D3",
    overflow: "hidden",
    position: "relative",
  },
  tierProgressFill: {
    height: "100%",
    backgroundColor: "#FF66C4",
  },

  tierProgressCaption: {
    marginTop: 6,
    fontSize: 12,
    color: "#FF66C4",
    fontWeight: "400",
  },
  bottomSpacer: {
    height: 200,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 24,
    marginBottom: 12,
    color: "#222",
  },
  input: {
    backgroundColor: "#fff",
    borderColor: "#000",
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 14,
    fontSize: 16,
    color: "#C5C5C5",
  },
  socialContainer: {
    marginBottom: 14,
  },
  socialInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderColor: "#000",
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  socialIcon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
    marginRight: 12,
  },
  socialTextInput: {
    flex: 1,
    fontSize: 16,
    color: "#C5C5C5",
    fontFamily: "Aileron",
  },
  socialConnectedText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    fontFamily: "Aileron",
  },
  genreTagsRow: {
    flexDirection: "row",
    
    flexWrap: "wrap",
    marginTop: 8,
    zIndex: 10,
  },
  genreTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  genreTagText: {
    fontSize: 14,
    color: "#333",
    marginRight: 6,
  },
  genreTagRemove: {
    fontSize: 16,
    color: "#888",
    marginLeft: 2,
    marginTop: -2,
  },
  saveContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: "#F8F8F8",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    opacity: 0.9,
    borderWidth: 2,
    borderColor: "#FF66C4",
  },
  saveButtonText: {
    color: "#000",
    fontSize: 14,
    textAlign: "center",
    fontFamily: "Aileron",
  },
  logoutContainer: {
    alignItems: "center",
    marginTop: 16,
  },
  logoutButton: {
    backgroundColor: "red",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    opacity: 0.9,
  },
  logoutButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  suggestionBox: {
    maxHeight: 120,
    backgroundColor: "#fff",
    borderColor: "#aaa",
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 2, // small gap below input
    zIndex: 100,
    position: "absolute",
    top: 48, // or adjust to match your input height
    left: 0,
    width: "100%",
  },
  suggestionItem: {
    padding: 10,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
    zIndex: 100,
  },
  fieldContainer: {
    marginBottom: 14,
  },
  displayField: {
    backgroundColor: "#fff",
    borderColor: "#000",
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  displayText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 10,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  defaultProfileIcon: {
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  usernameText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#222",
    fontFamily: "Aileron",
    textAlign: "center",
    textShadowColor: "rgba(255, 255, 255, 0.8)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  separator: {
    width: "100%",
    maxWidth: 400,
    height: 1,
    backgroundColor: "black",
    marginBottom: 16,
    alignSelf: "flex-start",
  },
  textLink: {
    color: "#000",
    fontSize: 16,
    fontFamily: "Aileron",
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Aileron-Regular',
  },
  noEventsContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noEventsText: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Aileron-Regular',
  },
  eventsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  eventCard: {
    backgroundColor: '#E8E8E8',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  eventInfo: {
    flex: 1,
    gap: 4,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    fontFamily: 'Aileron-Regular',
  },
  eventDate: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Aileron-Regular',
  },
  eventLocation: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Aileron-Regular',
  },
  notificationDot: {
    position: 'absolute',
    top: Platform.OS === "ios" ? 15 : 25,
    right: 5,
    width: 12,
    height: 12,
  },
  deleteAccountButton: {
    backgroundColor: 'grey',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  deleteAccountButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Aileron-Regular',
  },

});
