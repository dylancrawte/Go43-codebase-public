import { View, StyleSheet, ScrollView, ActivityIndicator, Dimensions, RefreshControl } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";
import { useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
;
import EventCard from "../../components/EventCard";
import { Campaign } from "@/app/types";
import { useAuthStore } from "@/store/authStore";
import { useBookingOrchestrator } from "@/controllers/orchestrators/bookingOrchestrator";
import { useTopOffset } from "@/utility/layoutConstants";
import BottomModalCardsExplore from "@/components/BottomModalCardsExplore";
import { MetricsDataCompact } from "@/components/MetricsBar";

type ConfirmedBooking = {
  _id: string;
  userID?: {
    _id: string;
    username?: string;
    displayName?: string;
    avatarUrl?: string;
    tiktokLink?: string;
  };
  campaignID: string;
  status: string;
  createdAt: string;
  metrics?: MetricsDataCompact;
};

export default function BookingsScreen() {
  
  const [isBottomModalBookingVisible, setIsBottomModalBookingVisible] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const openBookingModal = () => setIsBottomModalBookingVisible(true);
  const closeBookingModal = () => setIsBottomModalBookingVisible(false);

  const user = useAuthStore((s) => s.user);

  const {
    confirmedBookingsMap,
    bookingIds,
    bookingStatusMap,
    isFetchingBookings,
    refreshing,
    onRefresh,
    //orchestrator functions
    fetchBookings
  } = useBookingOrchestrator(user?._id);

  const topOffset = useTopOffset();

  // Mark first load completion to avoid full-screen loader during pull-to-refresh
  useEffect(() => {
    if (!isFetchingBookings) {
      setHasLoadedOnce(true);
    }
  }, [isFetchingBookings]);

  if (isFetchingBookings && !hasLoadedOnce) {
    return (
      <LinearGradient
        colors={["#FAFAFA", "#D9D9D9"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
        <View style={[styles.container, { paddingTop: topOffset, justifyContent: 'flex-start', alignItems: 'center' }]}>
          <ActivityIndicator 
          size="large" 
          color="#FF66C4" 
          style={{ marginTop: 12 }}
          />
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
    colors={["#FAFAFA", "#F0F0F0", "#E6E6E6", "#D9D9D9"]}
    locations={[0, 0.35, 0.7, 1]}
    start={{ x: 0, y: 0 }}
    end={{ x: 0, y: 1 }}
    style={styles.gradientBackground}
  >
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView 
        style={{ flex: 1, marginTop: topOffset }}
        // contentContainerStyle={{ flexGrow: 1, paddingTop: topOffset }}
        contentInsetAdjustmentBehavior="never"
        scrollIndicatorInsets={{ top: topOffset }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FF66C4"
            colors={["#FF66C4"]}
            progressBackgroundColor="#FFFFFF"
            progressViewOffset={topOffset}
          />
        }
      >
        <View style={styles.container}>
          {(Object.values(confirmedBookingsMap) as Campaign[]).map((campaign: Campaign) => {
            const bookingStatus = bookingStatusMap?.[campaign._id];
            return (
              <EventCard
                key={campaign._id}
                campaign={campaign}
                variant="bookings"
                bookingStatus={bookingStatus}
                onPress={() => {
                  setSelectedCampaign(campaign);
                  openBookingModal();
                }}
              />
            );
          })}
        </View>
      </ScrollView>
      
      <BottomModalCardsExplore
        isVisible={isBottomModalBookingVisible}
        onClose={closeBookingModal}
        campaign={selectedCampaign}
        onBookingChange={fetchBookings}
        bookingStatus={selectedCampaign?._id ? bookingStatusMap?.[selectedCampaign._id] || null : null}
        bookingIds={bookingIds}
      />
    </SafeAreaView>
  </LinearGradient>
  );
}

// ------------- STYLESHEET DEFINITIONS -------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  text: {
    color: "#fff",
  },
  gradientBackground: {
    flex: 1,
  },
});
