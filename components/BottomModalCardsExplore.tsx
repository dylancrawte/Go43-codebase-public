import {
  Modal,
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  TouchableWithoutFeedback,
  Linking,
  ScrollView,
} from "react-native";
import { PropsWithChildren } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from 'expo-linear-gradient';
import { GestureDetector } from 'react-native-gesture-handler';

import { Campaign } from "@/app/types";
import { useAuthStore } from "../store/authStore";
import { useBookingOrchestrator } from "@/controllers/orchestrators/bookingOrchestrator";
import { usePanGesure } from "@/utility/gesture";
import { router } from "expo-router";
import { useToast } from "@/components/CustomToast";
  

type ModalProps = PropsWithChildren<{
  isVisible: boolean;
  onClose: () => void;
  campaign?: Campaign | null;
  onBookingChange?: () => void;
  bookingStatus?: string | null;
  bookingIds?: {[campaignId: string]: string};
}>;

export default function BottomModalCardsExplore({
  isVisible,
  onClose,
  campaign,
  onBookingChange,
  bookingStatus,
  bookingIds,
}: ModalProps) {

  const {
    confirmBooking,
    cancelBookings
  } = useBookingOrchestrator();

  const user = useAuthStore((s) => s.user);

  const { showToast } = useToast();
  
  const handleRequestBooking = async () => {
    if (!campaign || !user) return;

    const result = await confirmBooking(user._id, campaign._id, "pending");

    showToast(result.message, "success");

    if (result.success) {
      onBookingChange?.();
    }

    onClose();
  };

  const panGesture = usePanGesure({
    onClose,
    threshold: 50,
    debounceMs: 150
  });

  const handleCancelBookings = async () => {
    // Validation
    if (!campaign || !user || !bookingIds) return;

    const result = await cancelBookings(bookingIds, campaign._id);

    showToast(result.message, result.success ? "success" : "error");

    if (result.success) {
      onBookingChange?.();
    }

    onClose();
  };

  const handleLinkVideos = async () => {
    if (!campaign) return;
    onClose();
    router.push({
      pathname: '/tiktokLink',
      params: {
        campaignId: campaign._id,
        campaignName: campaign.eventName,
      }
    })
  };

  return (
    <Modal animationType="slide" transparent={true} visible={isVisible}>
      <View style={styles.modalOverlay}>
        {/* Top area - closes modal when tapped */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={{ flex: 1 }} />
        </TouchableWithoutFeedback>

        {/* Bottom half */}
         {/* TO DO: add pan gesture to close modal */}
            <GestureDetector gesture={panGesture}>
              <LinearGradient
                colors={['#FAFAFA', '#D9D9D9']}
                style={styles.modalContent}
              >
                <View style={styles.dragIndicatorContainer}>
                  <View style={styles.dragIndicator} />
                </View>
                
                <ScrollView 
                  style={styles.scrollView}
                  contentContainerStyle={styles.scrollViewContent}
                  showsVerticalScrollIndicator={false}
                >
                  <View style={styles.headerRow}>
                    <Text style={styles.title}>{campaign?.eventName}</Text>
                    
                    <View style={styles.freeBadge}>
                      <MaterialIcons name="confirmation-number" size={16} color="#0F5132" />
                      <Text style={styles.freeBadgeText}>Free Tickets</Text>
                    </View>
                  </View>
                  <View style={styles.imageWrapper}>
                    <Image
                      source={{ uri: campaign?.image }}
                      style={styles.image}
                    />
                  </View>
                  <View style={styles.chipsRow}>
                    <View style={styles.chip}>
                      <MaterialIcons name="event" size={16} color="#111" />
                      <Text style={styles.chipText}>{campaign?.date || 'Date TBA'}</Text>
                    </View>
                    <View style={styles.chip}>
                      <MaterialIcons name="place" size={16} color="#111" />
                      <Text style={styles.chipText}>{campaign?.location || 'Location TBA'}</Text>
                    </View>
                  </View>
                  {bookingStatus === "pending" && (
                      <View style={styles.pendingBadge}>
                        <MaterialIcons name="schedule" size={16} color="#856404" />
                        <Text style={styles.pendingBadgeText}>Pending</Text>
                      </View>
                    )}
                    {bookingStatus === "confirmed" && (
                      <View style={styles.confirmedBadge}>
                        <MaterialIcons name="check-circle" size={16} color="#0F5132" />
                        <Text style={styles.confirmedBadgeText}>Confirmed</Text>
                      </View>
                    )}
                  {campaign?.spotifyLink ? (
                    <Pressable
                      accessibilityRole="link"
                      accessibilityLabel="Open artist on Spotify"
                      style={styles.spotifyButton}
                      onPress={() => Linking.openURL(campaign.spotifyLink!)}
                    >
                      <Image source={require("../assets/images/Spotify_Primary_Logo_RGB_Black.png")} style={styles.spotifyIcon} />
                      <Text style={styles.spotifyButtonText}>Listen on Spotify</Text>
                      <MaterialIcons name="open-in-new" size={18} color="#fff" />
                    </Pressable>
                  ) : null}
                  <View style={styles.textContainer}>
                    <Text style={styles.sectionTitle}>About this event</Text>
                    <Text style={styles.text}>
                      {campaign?.brief}
                    </Text>
                  </View>
                  </ScrollView>

                {/* Fixed Footer */}
                <View style={styles.footer}>
                  {!bookingStatus ? (
                    <View>
                    <Pressable
                      style={styles.requestBookingButton}
                      onPress={handleRequestBooking}
                    >
                      <Text style={styles.requestBookingButtonText}>
                        Request Free Tickets
                      </Text>
                    </Pressable>
                    <Text style={styles.helperText}>
                      You'll receive a confirmation once approved. This request does not guarantee entry until confirmed.
                    </Text>
                    </View>
                  ) : bookingStatus === "pending" || bookingStatus === "confirmed" ? (
                    <View style={styles.buttonRow}>
                      <Pressable
                        style={styles.pendingButton}
                        onPress={handleCancelBookings}
                      >
                        <Text style={styles.cancelButtonText}>
                          Cancel booking
                        </Text>
                      </Pressable>
                      <Pressable
                        style={styles.tiktokButton}
                        onPress={handleLinkVideos}
                      >
                        <View style={styles.buttonRow}>
                        <Image source={require("../assets/images/TikTok_Icon_Black_Circle.png")} style={styles.tiktokIcon} />
                        <Text style={styles.tiktokButtonText}>
                          Link Videos
                        </Text>
                        </View>
                      </Pressable>
                    </View>
                  ) : null}
                </View>
            </LinearGradient>
          </GestureDetector>
        </View>
  </Modal>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    height: "83%",
    width: "100%",
    backgroundColor: "#FAFAFA",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: "absolute",
    bottom: 0,
    padding: 10,
    borderWidth: 2,
    borderColor: "#000000",
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'transparent',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  image: {
    width: "100%",
    height: 150,
    borderRadius: 12,
    resizeMode: "cover",
    marginTop: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 5,
    marginLeft: 5,
    fontFamily: "Aileron",
    textAlign: "left",
    flex: 1,
    flexWrap: "wrap",
  },
  headerRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingRight: 10,
    flexWrap: "wrap",
    gap: 8,
  },
  text: {
    fontSize: 14,
    marginLeft: 5,
    color: "#333",
    fontFamily: "Aileron",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  soundIcon: {
    marginLeft: 5,
    marginTop: 10,
  },
  requestBookingButton: {
    backgroundColor: "#000",
    borderWidth: 2,
    borderColor: "#000",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  requestBookingButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "AileronThin",
  },
  dragIndicatorContainer: {
    width: "100%",
    alignItems: "center",
    paddingTop: 2,
    paddingBottom: 4,
  },
  dragIndicator: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#C4C4C4",
  },
  textContainer: {
    marginTop: 10,
  },
  freeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#D1E7DD",
    borderWidth: 1,
    borderColor: "#A3CFBB",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
  },
  freeBadgeText: {
    color: "#0F5132",
    fontSize: 12,
    fontFamily: "Aileron",
  },
  imageWrapper: {
    position: "relative",
    width: "100%",
  },
  imageBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Aileron",
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 5,
    paddingTop: 10,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F2F2F2",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    maxWidth: "48%",
    flexShrink: 1,
  },
  chipText: {
    color: "#111",
    fontSize: 12,
    fontFamily: "Aileron",
    flexShrink: 1,
  },
  infoCard: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    backgroundColor: "#D1E7DD",
    borderColor: "#A3CFBB",
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginHorizontal: 5,
    marginTop: 12,
  },
  infoText: {
    color: "#0F5132",
    fontSize: 12,
    flex: 1,
    fontFamily: "Aileron",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    marginLeft: 5,
    color: "#111",
    fontFamily: "Aileron",
  },
  helperText: {
    marginTop: 8,
    textAlign: "center",
    color: "#666",
    fontSize: 12,
    paddingHorizontal: 16,
    fontFamily: "Aileron",
  },
  spotifyButton: {
    marginTop: 12,
    marginHorizontal: 5,
    backgroundColor: "#1DB954",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  spotifyButtonText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Aileron",
    flex: 1,
    marginLeft: 8,
  },
  spotifyIcon: {
    width: 20,
    height: 20,
    marginRight: 4,
  },
  pendingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFF3CD",
    borderWidth: 1,
    borderColor: "#FFEAA7",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 10,
    marginLeft: 5,
  },
  pendingBadgeText: {
    color: "#856404",
    fontSize: 10,
    fontFamily: "Aileron",
    fontWeight: '500',
  },
  pendingButton: {
    flex: 1,
    backgroundColor: "#DC3545",
    borderWidth: 2,
    borderColor: "#DC3545",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  tiktokButton: {
    flex: 1,
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "#000",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  pendingButtonText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "AileronThin",
  },
  confirmedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#28A745",
    borderWidth: 1,
    borderColor: "#28A745",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 10,
    marginLeft: 5,
  },
  confirmedBadgeText: {
    color: "#0F5132",
    fontSize: 10,
    fontFamily: "Aileron",
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#DC3545",
    borderWidth: 2,
    borderColor: "#DC3545",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",

  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Aileron",
  },
  tiktokButtonText: {
    color: "black",
    fontSize: 16,
    fontFamily: "Aileron",
  },
  confirmedButton: {
    flex: 1,
    backgroundColor: "#28A745",
    borderWidth: 2,
    borderColor: "#28A745",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  tiktokIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
    resizeMode: "contain",
  },
}); 