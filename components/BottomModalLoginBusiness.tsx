  import {
    Modal,
    View,
    Text,
    StyleSheet,
    Pressable,
    TouchableWithoutFeedback,
    Linking,
    TextInput,
    Alert,
    Platform,
    InputAccessoryView,
    KeyboardAvoidingView,
  } from "react-native";
  import { PropsWithChildren, useEffect, useState } from "react";
  import { GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
  import { router } from "expo-router";
  import Ionicons from "@expo/vector-icons/build/Ionicons";
  import { usePanGesure } from "@/utility/gesture";
  import { useLoginOrchestrator } from "@/controllers/orchestrators/loginOrchestrator";
  import { PUBLIC_LINKS } from "@/utility/publicConfig";

  type LoginModalProps = PropsWithChildren<{
    isVisible: boolean;
    onClose: () => void;
    setIsVisible?: (value: boolean) => void;
  }>;

  export default function BottomModalLoginBusiness({
    isVisible,
    onClose,
  }: LoginModalProps) {
    const [isSignUp, setIsSignUp] = useState(false);
    const [businessEmailInput, setBusinessEmailInput] = useState("");
    const [passwordInput, setPasswordInput] = useState("");
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    
    const { businessLoginOrch, inviteSubmitOrch, inviteLinkInput, setInviteLinkInput, isInviteValid } = useLoginOrchestrator();

    // Reset signup state when modal becomes visible
    useEffect(() => {
      if (isVisible) {
        setIsSignUp(false);
      }
    }, [isVisible]);

    const handleSafeClose = () => {
      setIsSignUp(false);
      onClose();
    };

    const panGesture = usePanGesure({
      onClose: handleSafeClose,
      threshold: 50,
      debounceMs: 150
    });

    const handleEmail = () => {
      const subject = encodeURIComponent("Go43 Business Enquiry");
      Linking.openURL(`mailto:${PUBLIC_LINKS.supportEmail}?subject=${subject}`);
    };

    const handleBusinessLogin = async () => {
      const response = await businessLoginOrch(businessEmailInput, passwordInput);
      if (response?.success) {
        onClose();
        router.push("/businessHomepage");
      } else {
        Alert.alert("Error", response?.data?.error);
      }
    };

    const navigateToPolicy = (url: string) => {
      onClose();
      setIsSignUp(false);
      router.push(`/policy?url=${url}`);
    };

    const handleInviteSubmit = async () => {
      const res = await inviteSubmitOrch(inviteLinkInput);
      if (res?.success) {
        onClose();
        router.push("/auth/businessSignUp");
      } else {
        Alert.alert("Error", res?.data?.message);
      }
    };

    const ACCESSORY_ID = 'fixed-accessory';
    
    return (
      <>
      <Modal 
        animationType="slide" 
        transparent 
        visible={isVisible}
        presentationStyle="overFullScreen"
      >
        <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.modalOverlay}>
          {/* Top Half - closes modal */}
          <TouchableWithoutFeedback onPress={onClose}>
            <View style={{ flex: 1 }} />
          </TouchableWithoutFeedback>

          {/* Bottom sheet */}
          <GestureDetector gesture={panGesture}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
            enabled={Platform.OS === "ios"}
          >
          <View style={styles.modalContent}>
              <View style={styles.dragIndicatorContainer}>
                <View style={styles.dragIndicator} />
              </View>

              <Text style={styles.title}>Go43 for Business</Text>

              <View style={styles.textWrap}>
                <Text style={styles.text}>
                  {isSignUp ? "Already have an account? " : "Don't have an account? "}
                </Text>
                <Pressable
                  style={styles.text}
                  onPress={() => setIsSignUp(!isSignUp)}
                >
                  <Text style={styles.pinkText}>
                    {isSignUp ? "Log in" : "Sign up"}
                  </Text>
                </Pressable>
              </View>

              {isSignUp ? (
                <View style={[styles.copyContainer]}>
                  <View style={styles.copyBox}>
                    <Text style={styles.copyText}>
                      Go43 is currently only available for selected businesses.
                    </Text>
                    <View style={{ height: 12 }} />
                    <Text style={styles.copyText}>
                      If you are a business interested in using our services, please contact
                      <Text onPress={handleEmail} style={styles.emailText}> {PUBLIC_LINKS.supportEmail}</Text>
                    </Text>
                  </View>
                  <View style={styles.inviteRow}>
                    <TextInput
                      style={[styles.input, styles.inviteInput]}
                      placeholder="Invite Code"
                      placeholderTextColor="#888"
                      value={inviteLinkInput}
                      onChangeText={setInviteLinkInput}
                      autoComplete="off"
                      
                    />
                    <Pressable
                      style={[styles.inviteSubmitButton, !isInviteValid && styles.inviteSubmitButtonDisabled]}
                      accessibilityState={{ disabled: !isInviteValid }}
                      disabled={!isInviteValid}
                      onPress={handleInviteSubmit}
                    >
                      <Ionicons
                        name="arrow-forward-outline"
                        size={20}
                        color={isInviteValid ? "#fff" : "#888"}
                      />
                    </Pressable>
                  </View>
                </View>
              ) : (
                <>
                  <TextInput
                      style={styles.input}
                      placeholder="Enter your business email"
                      placeholderTextColor="#888"
                      value={businessEmailInput}
                      onChangeText={setBusinessEmailInput}
                      autoCapitalize="none"
                      autoCorrect={false}
                      spellCheck={false}
                    />

                    <View style={styles.passwordWrapper}>
                      <TextInput
                        style={[styles.input, styles.passwordInput]}
                        placeholder="Enter your password"
                        placeholderTextColor="#888"
                        value={passwordInput}
                        onChangeText={setPasswordInput}
                        secureTextEntry={!isPasswordVisible}
                        autoCapitalize="none"
                        spellCheck={false}
                      />
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                        style={styles.eyeIconButton}
                      >
                        <Ionicons
                          name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
                          size={20}
                          color="#333"
                        />
                      </Pressable>
                    </View>

                    <Pressable style={styles.button} onPress={handleBusinessLogin}>
                      <Text style={styles.buttonText}>Login</Text>
                    </Pressable>
                </>
              )}
              <View style={styles.footer}>
              <Text style={styles.smallText}>By continuing you agree to our </Text>
                    {Platform.OS === 'web' ? (
                      <Pressable
                        style={styles.smallPinkText}
                        onPress={() => Linking.openURL(PUBLIC_LINKS.privacyPolicyUrl)}> 
                        <Text style={styles.smallPinkText}>Privacy Policy</Text>
                      </Pressable>
                    ) : (
                      <Pressable
                        style={styles.smallPinkText}
                        onPress={() => navigateToPolicy(PUBLIC_LINKS.privacyPolicyUrl)}> 
                        <Text style={styles.smallPinkText}>Privacy Policy</Text>
                      </Pressable>
                    )}  
                    <Text style={styles.smallText}> and </Text>
                    {Platform.OS === 'web' ? (
                      <Pressable
                        style={styles.smallPinkText}
                        onPress={() => Linking.openURL(PUBLIC_LINKS.termsUrl)}> 
                        <Text style={styles.smallPinkText}>Terms and Conditions</Text>
                      </Pressable>
                    ) : (
                      <Pressable
                        style={styles.smallPinkText}
                        onPress={() => navigateToPolicy(PUBLIC_LINKS.termsUrl)}> 
                        <Text style={styles.smallPinkText}>Terms and Conditions</Text>
                      </Pressable>
                    )}  
              </View>
          </View>
          </KeyboardAvoidingView>
          </GestureDetector>
        </View>
        </GestureHandlerRootView>
      </Modal>

      {Platform.OS === 'ios' && (
        <InputAccessoryView nativeID={ACCESSORY_ID}>
          <View
            // slightly taller than the QuickType delta
            style={{ height: 52, backgroundColor: '#F2F2F7' }}
            pointerEvents="none"
          />
        </InputAccessoryView>
      )}
      </>
    );
  }

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: 'rgba(0,0,0,0.01)', 
    },
    input: {
      borderWidth: 2,
      borderColor: "#25292e",
      borderRadius: 10,
      padding: 10,
      marginLeft: 6,
      marginBottom: 10,
      marginTop: 5,
      fontSize: 16,
      fontFamily: "Aileron",
    },
    buttonText: {
      fontSize: 16,
    color: "#fff",
    fontFamily: "Aileron",
    },
    textWrap: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 5,
      marginBottom: 10,
    },
    text: {
      fontSize: 14,
      marginLeft: 5,
      color: "#333",
      fontFamily: "Aileron",
    },
    pinkText: {
      fontSize: 14,
      marginVertical: 2,
      color: "#FF66C4",
      fontFamily: "Aileron",
      textDecorationLine: "underline",
    },
    modalContent: {
      justifyContent: "flex-start",
      padding: 12,
      minHeight: "40%",
      width: "100%",
      backgroundColor: "#FAFAFA",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      borderWidth: 2,
      borderColor: "#000000",
    },
    title: {
      fontSize: 20,
      fontWeight: "bold",
      marginTop: 10,
      marginLeft: 6,
      fontFamily: "Aileron",
      textAlign: "left",
    },
    copyContainer: {
      marginTop: 8,
      paddingHorizontal: 8,
    },
    copyBox: {
      backgroundColor: '#fff',
      borderWidth: 2,
      borderColor: '#000',
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 14,
      marginHorizontal: 6,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOpacity: 0.06,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 6,
      elevation: 2,
    },
    copyText: {
      fontSize: 14,
      color: "#333",
      fontFamily: "Aileron",
      marginBottom: 2,
    },
    emailText: {
      color: "#FF66C4",
      textDecorationLine: "underline",
      fontFamily: "Aileron",
      marginTop: 2,
    },
    emailIconBox: {
      alignSelf: "center",
      marginTop: 16,
      borderWidth: 2,
      borderColor: "#000",
      borderRadius: 10,
      width: 60,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#fff",
    },
    dragIndicatorContainer: {
      width: '100%',
      alignItems: 'center',
      paddingTop: 2,
      paddingBottom: 4,
    },
    dragIndicator: {
      width: 44,
      height: 5,
      borderRadius: 3,
      backgroundColor: '#C4C4C4',
    },
    button: {
      marginTop: 20,
      marginBottom: 20,
      backgroundColor: "#FF66C4",
      paddingVertical: 10,
      width: "60%",
      alignSelf: "center",
      alignItems: "center",
      borderRadius: 25,
      justifyContent: "center",
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 'auto',
      marginLeft: 10,
      marginRight: 10,
      marginBottom: 10,
    },
    smallText: {
      fontSize: 10,
      marginLeft: 5,
      color: "#333",
      fontFamily: "Aileron",
    },
    smallPinkText: {
      fontSize: 10,
      marginVertical: 2,
      color: "#FF66C4",
      fontFamily: "Aileron",
      textDecorationLine: "underline",
    },
    inviteRow: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    inviteInput: {
      flex: 1,
      marginRight: 8,
    },
    inviteSubmitButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#FF66C4',
      alignItems: 'center',
      justifyContent: 'center',
    },
    inviteSubmitButtonDisabled: {
      backgroundColor: '#C4C4C4',
    },
    passwordWrapper: {
      position: 'relative',
    },
    passwordInput: {
      paddingRight: 40,
    },
    eyeIconButton: {
      position: 'absolute',
      right: 14,
      top: 14,
      height: 20,
      width: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });