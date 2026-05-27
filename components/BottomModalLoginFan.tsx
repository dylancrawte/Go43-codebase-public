import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableWithoutFeedback,
  Image,
  Linking,
  Platform,
} from "react-native";
import { PropsWithChildren } from "react";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { GestureDetector } from "react-native-gesture-handler";
import { useLoginOrchestrator } from "@/controllers/orchestrators/loginOrchestrator";
import { usePanGesure } from "@/utility/gesture";
import { PUBLIC_LINKS } from "@/utility/publicConfig";

type LoginModalProps = PropsWithChildren<{
  isVisible: boolean;
  onClose: () => void;
}>;

export default function BottomModalLoginFan({
  isVisible,
  onClose,
}: LoginModalProps) {
  
  const [isSignUp, setIsSignUp] = useState(false);

  const { tiktokStart } = useLoginOrchestrator();

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

  const handleTikTok = async () => {
    console.log("tiktok start");
    onClose();
    await tiktokStart();
  }

  const router = useRouter();

  const navigateToPolicy = (url: string) => {
    onClose();
    router.push(`/policy?url=${url}`);
  };

  return (
    <Modal animationType="slide" transparent visible={isVisible}>
      <View style={styles.modalOverlay}>
        {/* Top Half - closes modal */}
        <TouchableWithoutFeedback onPress={() => { onClose(); setIsSignUp(false); }}>
          <View style={{ flex: 1 }} />
        </TouchableWithoutFeedback>

        {/* Bottom sheet */}
        <GestureDetector gesture={panGesture}>
          <View style={styles.modalContentLogin}>
            <View style={styles.dragIndicatorContainer}>
              <View style={styles.dragIndicator} />
            </View>

            <View>
              <Text style={styles.title}>
                {isSignUp ? "Create a free account" : "Log in to your account"}
              </Text>
            </View>

            <View style={styles.textWrap}>
              <Text style={styles.text}>
                {isSignUp ? "Already have an account? " : "Need an account? "}
                <Text onPress={() => setIsSignUp(!isSignUp)} style={styles.pinkText}>
                  {isSignUp ? "Log in" : "Sign up"}
                </Text>
              </Text>
            </View>

            <Pressable
              style={styles.signInButton}
              onPress={() => handleTikTok()}
            >
              <Image
                source={require("../assets/images/TIKTOK_NOTE_BLACK.png")}
                style={styles.tiktokIcon}
              />
              <View style={styles.textContainer}>
                <Text style={styles.signInText}>Continue with TikTok</Text>
              </View>
            </Pressable>

            <Pressable style={styles.comingSoonButton} disabled>
              <Text style={styles.comingSoonText}>More login options coming soon ...</Text>
            </Pressable>

            <View style={styles.footer}>
              <Text style={styles.smallText}>
                By continuing you agree to our{' '}
                {Platform.OS === 'web' ? (
                  <Text 
                    style={styles.smallPinkText}
                    onPress={() => Linking.openURL(PUBLIC_LINKS.privacyPolicyUrl)}
                  >Privacy Policy</Text>
                ) : (
                  <Text 
                    style={styles.smallPinkText}
                    onPress={() => navigateToPolicy(PUBLIC_LINKS.privacyPolicyUrl)}
                  >Privacy Policy</Text>
                )}
                {' '}and{' '}
                {Platform.OS === 'web' ? (
                  <Text 
                    style={styles.smallPinkText}
                    onPress={() => Linking.openURL(PUBLIC_LINKS.termsUrl)}
                  >Terms and Conditions</Text>
                ) : (
                  <Text 
                    style={styles.smallPinkText}
                    onPress={() => navigateToPolicy(PUBLIC_LINKS.termsUrl)}
                  >Terms and Conditions</Text>
                )}
              </Text>
            </View>
          </View>
        </GestureDetector>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContentLogin: {
  minHeight: '39%',
  backgroundColor: "#FAFAFA",
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  borderWidth: 2,
  borderColor: "#000",
  padding: 10,
  overflow: 'hidden',
  },
  input: {
    borderWidth: 2,
    borderColor: "#25292e",
    borderRadius: 10,
    padding: 10,
    marginLeft: 4,
    marginTop: 5,
    marginBottom: 10,
    fontSize: 16,
    fontFamily: "Aileron",
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
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
    marginLeft: 10,
    fontFamily: "Aileron",
    textAlign: "left",
  },
  text: {
    fontSize: 14,
    marginLeft: 5,
    color: "#333",
    fontFamily: "Aileron",
  },
  smallText: {
    fontSize: 10,
    marginLeft: 10,
    marginTop: 5,
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
  smallPinkText: {
    fontSize: 10,
    marginVertical: 2,
    color: "#FF66C4",
    fontFamily: "Aileron",
    textDecorationLine: "underline",
  },
  tiktokButton: {
    marginTop: 15,
    marginBottom: 10,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  tiktokButtonImage: {
    width: 200,
    height: 30,
    resizeMode: 'contain',
    margin: 10,
    borderRadius: 12,
    borderWidth: 1,
    
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  textWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 5,
  },
  loginButton: {
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
  loginText: {
    fontSize: 16,
    color: "#fff",
    fontFamily: "Aileron",
  },
  signInButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
    marginBottom: 25,
    backgroundColor: "white",
    paddingVertical: 8,
    paddingHorizontal: 16,
    paddingLeft: 15,
    width: "90%",
    alignSelf: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tiktokIcon: {
    width: 30,
    height: 30,
    marginRight: 12,
    resizeMode: "contain",
  },
  textContainer: {
    flex: 1,
    alignItems: "center",
    marginLeft: -42, // Offset the icon width + margin to center text
    
  },
  signInText: {
    fontSize: 14,
    color: "#454545",
    fontFamily: "AileronLight",
  },
  comingSoonButton: {
    backgroundColor: "#F5F5F5",
    paddingVertical: 12,
    paddingHorizontal: 16,
    paddingLeft: 15,
    width: "90%",
    alignSelf: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginBottom: 10,
    opacity: 0.7,
  },
  comingSoonText: {
    fontSize: 12,
    color: "#888888",
    fontFamily: "AileronLight",
    textAlign: "center",
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 20,
  },
  inviteRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
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
  signUpContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    marginTop: 8,
    marginBottom: 20,
  },
  signUpBox: {
    borderWidth: 2,
    borderColor: '#25292e',
    borderRadius: 10,
    padding: 14,
    marginHorizontal: 4,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  signUpBoxText: {
    fontSize: 14,
    color: "#333",
    fontFamily: "Aileron",
    marginBottom: 2,
  },
  signUpSpacer: {
    height:55,
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
  closeButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    zIndex: 1000,
  },
}); 