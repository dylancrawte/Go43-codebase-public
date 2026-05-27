import { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Image, Pressable, TextInput, Alert, Keyboard, Platform, KeyboardAvoidingView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useBusinessAuthStore } from "@/store/businessAuthStore";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBusinessProfileOrchestrator } from "@/controllers/orchestrators/businessProfileOrchestrator";

export default function BusinessProfile() {
  const business = useBusinessAuthStore((s) => s.business);
  const [editing, setEditing] = useState(false);
  
  const {
    form,
    updateField,
    resetForm,
    initializeForm,
    handleUpdateProfile,
    handleDeleteAccount,
  } = useBusinessProfileOrchestrator(business);

  // Initialize form when business data loads or changes
  useEffect(() => {
    if (business) {
      initializeForm(business);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [business?._id, initializeForm]);

  const goBack = () => router.back();

  const insets = useSafeAreaInsets();
  const KEYBOARD_OFFSET = insets.top - 100;

  return (
    <LinearGradient
      colors={["#373737", "#311C36"]}
      locations={[0.4, 0.8]}
      style={{ flex: 1 }}
    >
        <KeyboardAvoidingView
      style={{ flex: 1, alignSelf: "stretch", width: "100%" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? KEYBOARD_OFFSET : 0}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        automaticallyAdjustKeyboardInsets
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
        onScrollBeginDrag={() => Keyboard.dismiss()}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerRow}>
          <Pressable onPress={goBack} style={{ padding: 4 }}>
            <Ionicons name="arrow-back" size={26} color="#EBEBEB" />
          </Pressable>
        </View>

        <View style={styles.logoContainer}>
          <Image
            source={require("@/assets/images/GO43-LOGO.jpeg")}
            style={styles.logoImage}
          />
          <Text style={styles.logoText}>{business?.businessName || "Business"}</Text>
        </View>

          <View style={{ gap: 14 }}>
            <Text style={styles.sectionHeading}>Business Details</Text>
            <View style={styles.card}>
              {editing ? (
                <>
                  <EditRow label="Business name" value={form.businessName} onChangeText={(t) => updateField("businessName", t)} />
                  <EditRow label="Business email" value={form.businessEmail} onChangeText={(t) => updateField("businessEmail", t)} />
                  <EditRow label="Business type" value={form.businessType} onChangeText={(t) => updateField("businessType", t)} />
                </>
              ) : (
                <>
                  <FieldRow label="Business name" value={business.businessName} />
                  <FieldRow label="Business email" value={business.businessEmail} />
                  <FieldRow label="Business type" value={business.businessType} />
                </>
              )}
            </View>

            <Text style={styles.sectionHeading}>Company Info</Text>
            <View style={styles.card}>
              {editing ? (
                <EditRow label="Address" value={form.businessAddress} onChangeText={(t) => updateField("businessAddress", t)} multiline />
              ) : (
                <FieldRow label="Address" value={business.businessAddress} multiline />
              )}
            </View>

            <Text style={styles.sectionHeading}>Primary Contact</Text>
            <View style={styles.card}>
              {editing ? (
                <>
                  <EditRow label="Name" value={form.businessContactName} onChangeText={(t) => updateField("businessContactName", t)} />
                  <EditRow label="Role" value={form.businessContactRole} onChangeText={(t) => updateField("businessContactRole", t)} />
                  <EditRow label="Phone" value={form.businessContactNumber} onChangeText={(t) => updateField("businessContactNumber", t)} keyboardType="phone-pad" />
                </>
              ) : (
                <>
                  <FieldRow label="Name" value={business.businessContactName} />
                  <FieldRow label="Role" value={business.businessContactRole} />
                  <FieldRow label="Phone" value={String(business.businessContactNumber || "")} />
                </>
              )}
            </View>

            <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 10 }}>
              {!editing ? (
                <Pressable style={styles.actionButton} onPress={() => setEditing(true)}>
                  <Ionicons name="pencil-outline" size={24} color="#EBEBEB" />
                </Pressable>
              ) : (
                <>
                  <Pressable style={[styles.actionButton, { backgroundColor: "transparent", borderColor: "#EBEBEB" }]} onPress={() => {
                    setEditing(false);
                    resetForm(business);
                  }}>
                    <Text style={styles.actionText}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.actionButton, { backgroundColor: "#FF66C4", borderColor: "#FF66C4" }]}
                    onPress={async () => {
                      const res = await handleUpdateProfile();
                      if (!res.success) return Alert.alert("Error", res.error);
                      setEditing(false);
                    }}
                  >
                    <Text style={[styles.actionText, { color: "#fff" }]}>Save</Text>
                  </Pressable>
                </>
              )}
            </View>

              <Pressable
                style={styles.deleteButton}
                onPress={() => {
                  Alert.alert(
                    "Delete Account",
                    "Are you sure you want to delete your business account? This action cannot be undone and will permanently remove all your data.",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Delete",
                        style: "destructive",
                        onPress: async () => {
                          const res = await handleDeleteAccount();
                          if (!res.success) {
                            Alert.alert("Error", res.error);
                            return;
                          }
                          Alert.alert("Account Deleted", "Your business account has been permanently deleted.", [
                            { text: "OK", onPress: () => router.replace("/") }
                          ]);
                        }
                      }
                    ]
                  );
                }}
              >
                <Ionicons name="trash-outline" size={20} color="#fff" />
                <Text style={styles.deleteButtonText}>Delete Account</Text>
              </Pressable>
            </View>
        <View style={{ height: 24 }} />
      </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

function FieldRow({ label, value, multiline = false }: { label: string; value?: string; multiline?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, multiline && { lineHeight: 20 }]} numberOfLines={multiline ? 3 : 1}>
        {value || "-"}
      </Text>
    </View>
  );
}

function EditRow({ label, value, onChangeText, multiline = false, keyboardType }: { label: string; value?: string; onChangeText: (t: string) => void; multiline?: boolean; keyboardType?: any }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <TextInput
        style={[styles.rowInput, multiline && { height: 72, textAlignVertical: "top" }]}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        placeholderTextColor="#888"
        keyboardType={keyboardType}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 30,
    gap: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingBottom: 10,
  },
  logoContainer: {
    alignItems: "center",
    paddingBottom: 4,
  },
  logoImage: {
    width: 82,
    height: 82,
    borderRadius: 10,
  },
  logoText: {
    color: "#EBEBEB",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 14,
  },
  sectionHeading: {
    color: "#EBEBEB",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 4,
  },
  card: {
    backgroundColor: "#3D3D3D",
    borderColor: "#EBEBEB",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 14,
  },
  rowLabel: {
    color: "#CFCFCF",
    fontSize: 13,
    width: 120,
  },
  rowValue: {
    color: "#EBEBEB",
    fontSize: 14,
    flex: 1,
  },
  rowInput: {
    color: "#EBEBEB",
    fontSize: 14,
    flex: 1,
    borderWidth: 1,
    borderColor: "#EBEBEB",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 10,
  },
  emptyTitle: {
    color: "#EBEBEB",
    fontSize: 18,
    fontWeight: "700",
  },
  emptySubtitle: {
    color: "#CFCFCF",
    fontSize: 14,
  },
  ctaButton: {
    backgroundColor: "#FF66C4",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    marginTop: 10,
  },
  ctaText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FF66C4",
    backgroundColor: "transparent",
  },
  actionText: {
    color: "#EBEBEB",
    fontWeight: "700",
    fontSize: 14,
  },
  deleteSection: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "rgba(255, 0, 0, 0.1)",
    borderColor: "#FF4444",
    borderWidth: 1,
    borderRadius: 12,
    gap: 8,
  },
  deleteSectionTitle: {
    color: "#FF4444",
    fontSize: 16,
    fontWeight: "700",
  },
  deleteSectionSubtitle: {
    color: "#FF8888",
    fontSize: 12,
    marginBottom: 8,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF4444",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    marginTop: 16,
    
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
});


