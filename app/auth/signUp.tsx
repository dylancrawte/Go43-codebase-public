import { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Image,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
//import { format, parse } from "date-fns";
import { useAuthStore } from "@/store/authStore";
import { useGenreOrchestrator } from "@/controllers/orchestrators/genreOrchestrator";
import { useSafeAreaInsets } from "react-native-safe-area-context";


export default function SignUp() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [tiktokLink, setTiktokLink] = useState("");

  // const [dateOfBirth, setDateOfBirth] = useState("");
  // const [location, setLocation] = useState("");

  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

  //using zustand store 
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const register = useAuthStore((state) => state.register);

  // genre orchestrator
  const {
    currentGenre,
    filteredGenres,
    genreTags,
    setGenreTags,
    dropdownVisible,
    addGenre,
    removeGenre,
    updateGenreInput,
    showDropdown,
    hideDropdown,
  } = useGenreOrchestrator();





  const validateForm = () => {
    const errors: string[] = [];

    // Required fields
    if (!firstName.trim()) errors.push("First name is required");
    if (!lastName.trim()) errors.push("Last name is required");
    if (!username.trim()) errors.push("Username is required");
    if (!email.trim()) errors.push("Email is required");
    if (!password) errors.push("Password is required");

    // Username validation
    if (username.length > 0 && username.length < 3) {
      errors.push("Username must be at least 3 characters long");
    }
    if (username.length > 30) {
      errors.push("Username must be less than 30 characters");
    }
    if (username.length > 0 && !/^[a-zA-Z0-9_]+$/.test(username)) {
      errors.push("Username can only contain letters, numbers, and underscores");
    }

    // Email validation
    if (email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push("Please enter a valid email address");
    }

    // Password validation
    if (password.length > 0 && password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }
    if (password.length > 128) {
      errors.push("Password must be less than 128 characters");
    }

    // Password confirmation
    if (confirmPassword && password !== confirmPassword) {
      errors.push("Passwords do not match");
    }

    // Name validation
    if (firstName.length > 50) {
      errors.push("First name must be less than 50 characters");
    }
    if (lastName.length > 50) {
      errors.push("Last name must be less than 50 characters");
    }

    // TikTok link validation
    if (tiktokLink.length > 0) {
      const tiktokRegex = /^(https?:\/\/)?(www\.)?(tiktok\.com|vm\.tiktok\.com|m\.tiktok\.com)\/(@\w+|\w+)/;
      if (!tiktokRegex.test(tiktokLink)) {
        errors.push("Please enter a valid TikTok URL (e.g., tiktok.com/@username or www.tiktok.com/username)");
      }
    }

    return errors;
  };

  const handleSignUp = async () => {
    // Client-side validation
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      alert(validationErrors.join('\n'));
      return;
    }

    const result = await register(
      firstName,
      lastName,
      username,
      email,
      password,
      phoneNumber,
      genreTags,
      tiktokLink,
      //dateOfBirth,
    );

    if (!result.success) {
      alert(result.error);
    } else {
      router.push("/explore");
    }
  };

  const handleGenreFocus = () => {
    showDropdown();
    // Simple scroll to move genre section up
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: 1000000, animated: true });
    }, 100);
  };

  const insets = useSafeAreaInsets();

  return (
    <View style={styles.imageContainer}>
      <Image
        source={require("@/assets/images/BackgroundImage1.png")}
        style={styles.backgroundImage}
      />
  
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={[styles.overlayContent, { paddingBottom: insets.bottom + 24 }]}
        automaticallyAdjustKeyboardInsets   // 👈 iOS: built-in keyboard handling
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="always"
      >
      <View>
      <View style={styles.header}>
      <Pressable style={styles.backButton} onPress={() => router.push("/")}>
        <MaterialIcons name="arrow-back" size={24} color="#000000" />
      </Pressable>
        <Text style={styles.title}>Sign up for an account</Text>
        </View>
        <Text style={styles.sectionHeader}>Account Details</Text>
        <View style={styles.separator} />
        <Text style={styles.fieldLabel}>Username</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. johnsmith"
          placeholderTextColor="#888"
          value={username}
          onChangeText={setUsername}
        />
        <Text style={styles.fieldLabel}>Password</Text>
         <TextInput
          style={[styles.input, password.length > 0 && password.length < 8 && styles.inputError]}
          placeholder="e.g. 8+ characters"
          placeholderTextColor="#888"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        {password.length > 0 && password.length < 8 && (
          <Text style={styles.errorText}>Password must be at least 8 characters</Text>
        )}

        <Text style={styles.fieldLabel}>Confirm password</Text>
        <TextInput
          style={[
            styles.input, 
            confirmPassword.length > 0 && password !== confirmPassword && styles.inputError
          ]}
          placeholder="Re-enter password"
          placeholderTextColor="#888"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        {confirmPassword.length > 0 && password !== confirmPassword && (
          <Text style={styles.errorText}>Passwords do not match</Text>
        )}
        <Text style={styles.sectionHeader}>Personal Details</Text>
        <View style={styles.separator} />
        <Text style={styles.fieldLabel}>First name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. John"
          placeholderTextColor="#888"
          value={firstName}
          onChangeText={setFirstName}
        />
        <Text style={styles.fieldLabel}>Last name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Smith"
          placeholderTextColor="#888"
          value={lastName}
          onChangeText={setLastName}
        />
       
        <Text style={styles.fieldLabel}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. name@example.com"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
        />
        <Text style={styles.fieldLabel}>Phone number</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. +44 7123 456789"
          placeholderTextColor="#888"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />
        
        <Text style={styles.fieldLabel}>TikTok Link</Text>
        <TextInput
          style={styles.input}
          placeholder="Paste your profile link here..."
          placeholderTextColor="#888"
          value={tiktokLink}
          onChangeText={setTiktokLink}
          keyboardType="url"
          autoCapitalize="none"
        />
       
        {/* Genres */}
        <Text style={styles.sectionHeader}>Music Genre Preferences</Text>
        <View style={styles.separator} />
        <View style={{position: "relative"}}>
          <TextInput
            style={[styles.input]}
            placeholder="e.g. Jazz, Afrobeats"
            placeholderTextColor="#888"
            
            value={currentGenre}
            onChangeText={updateGenreInput}
            onFocus={handleGenreFocus}
            returnKeyType="done"
          />
          {dropdownVisible && filteredGenres.length > 0 && currentGenre.length > 0 && (
            <ScrollView style={styles.suggestionBox} keyboardShouldPersistTaps="handled">
              {filteredGenres.slice(0, 5).map((g) => (
                <Pressable
                  key={g._id}
                  onPress={() => {
                    const res = addGenre(g.name);
                    if (!res.success) return;
                    hideDropdown();
                  }}
                  style={styles.suggestionItem}
                >
                  <Text>{g.name}</Text>
                </Pressable>
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

        

          <Pressable style={styles.signUpButton} onPress={handleSignUp}>
            <Text style={styles.signUpButtonText}>Create Account</Text>
          </Pressable>
        
      </View>
      </ScrollView>



      {/*
      <TextInput
        style={styles.input}
        placeholder="Location"
        value={location}
        onChangeText={setLocation}
      />
      <TextInput
        style={styles.input}
        placeholder="Instagram & TikTok links"
        value={socialLinks}
        onChangeText={setSocialLinks}
      />

      <Pressable
        style={styles.profilePictureBox}
        onPress={handleProfilePictureChange}
      >
        <Text style={styles.profileText}>Profile Picture</Text>
        <Text style={styles.profileSubText}>click to change</Text>
      </Pressable>*/}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#eee",
  },
  overlayContent: {
    justifyContent: "flex-start",
    padding: 20,
    paddingTop: 60,
  },
  imageContainer: {
    flex: 1,
    position: "relative",
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
    opacity: 0.4,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    position: "absolute",
  },
  backButton: {
    position: "absolute",
    left: 5,
    zIndex: 10,
  },
  backButtonText: {
    color: "black",
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    fontFamily: "AileronBold",
    marginLeft: 4,
    marginRight: 4,
  },
  input: {
    width: "100%",
    maxWidth: 400,
    height: 44,
    borderWidth: 1,
    borderColor: "#FF66C4",
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 14,
    backgroundColor: "#fff",
    fontSize: 16,
    fontFamily: "Aileron",
    position: "relative",
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 6,
  },
  separator: {
    width: "100%",
    height: 1,
    backgroundColor: "#000",
    marginBottom: 12,
  },
  fieldLabel: {
    color: "#000",
    fontSize: 14,
    fontWeight: "500",
    alignSelf: "flex-start",
    width: "100%",
    maxWidth: 400,
    marginBottom: 6,
  },
  suggestionBox: {
    backgroundColor: "#fff",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 4,
    marginTop: -10,
    marginBottom: 10,
    maxHeight: 150,
    width: "100%",
    zIndex: 100,
    position: 'absolute',
    top: 48,
    left: 0,
  },
  suggestionItem: {
    padding: 10,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
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
    borderColor: "#000",
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
  profilePictureBox: {
    width: 60,
    height: 60,
    backgroundColor: "black",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  profileText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 10,
  },
  profileSubText: {
    color: "white",
    fontSize: 8,
  },
  signUpButton: {
    backgroundColor: "#FF66C4",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    alignItems: "center",
    alignSelf: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.3)",
    marginTop: 20,
    width: 200,
    justifyContent: "center",
  },
  signUpButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  // duplicate styles removed (suggestionBox, suggestionItem)
  gradient: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    opacity: 0.4,
  },
  header: {
    width: "100%",
    maxWidth: 400,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginBottom: 24,
  },
  inputError: {
    borderColor: "#FF4444",
    borderWidth: 2,
  },
  errorText: {
    color: "#FF4444",
    fontSize: 12,
    fontWeight: "500",
    marginTop: -10,
    marginBottom: 10,
    alignSelf: "flex-start",
    width: "100%",
    maxWidth: 400,
  },
});