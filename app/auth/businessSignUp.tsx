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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBusinessProfileOrchestrator } from "@/controllers/orchestrators/businessProfileOrchestrator";

export default function BusinessSignUp() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    form,
    updateField,
    passwordErrors,
    handleSignUp,
  } = useBusinessProfileOrchestrator();

  const handleSignUpSubmit = async () => {
    const result = await handleSignUp();
    if (!result.success) {
      alert(result.error);
    } else {
      router.push("/businessHomepage");
    }
  };

  return (
    <View style={styles.imageContainer}>
      <Image
        source={require("@/assets/images/BackgroundImage1.png")}
        style={styles.backgroundImage}
      />

        <ScrollView
          contentContainerStyle={[styles.overlayContent, { paddingBottom: insets.bottom + 24 }]}
        automaticallyAdjustKeyboardInsets   // 👈 iOS: built-in keyboard handling
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="always"
        >
          <View style={styles.header}>
            <Pressable style={styles.backButton} onPress={() => router.push("/")}>
              <MaterialIcons name="arrow-back" size={24} color="#000000" />
            </Pressable>
            <Text style={styles.title}>Create a business account</Text>
          </View>

          <Text style={styles.sectionHeader}>Business Details</Text>
          <View style={styles.separator} />
          <Text style={styles.fieldLabel}>Business name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Shoreditch House"
            placeholderTextColor="#888"
            value={form.businessName}
            onChangeText={(text) => updateField("businessName", text)}
          />
          <Text style={styles.fieldLabel}>Business email</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. bookings@company.com"
            placeholderTextColor="#888"
            autoCapitalize="none"
            keyboardType="email-address"
            value={form.businessEmail}
            onChangeText={(text) => updateField("businessEmail", text)}
          />
          <Text style={styles.fieldLabel}>Password</Text>
          <TextInput
            style={[styles.input, passwordErrors.isPasswordTooShort && styles.inputError]}
            placeholder="e.g. 8+ characters"
            placeholderTextColor="#888"
            secureTextEntry
            value={form.password || ""}
            onChangeText={(text) => updateField("password", text)}
          />
          {passwordErrors.isPasswordTooShort && (
            <Text style={styles.errorText}>Password must be at least 8 characters</Text>
          )}

          <Text style={styles.fieldLabel}>Confirm Password</Text>
          <TextInput
            style={[
              styles.input, 
              passwordErrors.showPasswordMismatch && styles.inputError
            ]}
            placeholder="Confirm your password"
            placeholderTextColor="#888"
            secureTextEntry
            value={form.confirmPassword || ""}
            onChangeText={(text) => updateField("confirmPassword", text)}
          />
          {passwordErrors.showPasswordMismatch && (
            <Text style={styles.errorText}>Passwords do not match</Text>
          )}

          <Text style={styles.sectionHeader}>Company Info</Text>
          <View style={styles.separator} />
          <Text style={styles.fieldLabel}>Business address</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 123 Main St, London"
            placeholderTextColor="#888"
            value={form.businessAddress}
            onChangeText={(text) => updateField("businessAddress", text)}
          />
          <Text style={styles.fieldLabel}>Business type</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Venue, Promoter"
            placeholderTextColor="#888"
            value={form.businessType}
            onChangeText={(text) => updateField("businessType", text)}
          />

          <Text style={styles.sectionHeader}>Contact Details</Text>
          <View style={styles.separator} />
          <Text style={styles.fieldLabel}>Contact name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Alex Turner"
            placeholderTextColor="#888"
            value={form.businessContactName}
            onChangeText={(text) => updateField("businessContactName", text)}
          />
          <Text style={styles.fieldLabel}>Contact role</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Events Manager"
            placeholderTextColor="#888"
            value={form.businessContactRole}
            onChangeText={(text) => updateField("businessContactRole", text)}
          />
          <Text style={styles.fieldLabel}>Contact phone</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. +44 7123 456789"
            placeholderTextColor="#888"
            keyboardType="phone-pad"
            value={form.businessContactNumber}
            onChangeText={(text) => updateField("businessContactNumber", text)}
          />

          <Pressable style={styles.signUpButton} onPress={handleSignUpSubmit}>
            <Text style={styles.signUpButtonText}>Create Business Account</Text>
          </Pressable>
        </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
    opacity: 0.3,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    fontFamily: "AileronBold",
    marginLeft: 20,
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
    width: 260,
    justifyContent: "center",
  },
  signUpButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  gradient: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    opacity: 0.3,
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
  backButton: {
    position: "absolute",
    left: 1,
    zIndex: 10,
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


