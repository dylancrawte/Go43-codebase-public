import { View, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

import EventCard from "../../components/EventCard";
import BottomModalCardsExplore from "../../components/BottomModalCardsExplore";
import { Campaign } from "../types";
import { useCampaignOrchestrator } from "@/controllers/orchestrators/campaignOrchestrator";
import { useTopOffset } from "@/utility/layoutConstants";

export default function ExploreScreen() {
  
  const [isBottomModalExploreVisible, setIsBottomModalExploreVisible] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const { 
    campaigns,
    isFetchingCampaigns,
    onRefresh,
    refreshing,
   } = useCampaignOrchestrator();
   // calling campaignOrchestrator here will call the useEffect hook in the orchestrator (fetchCampaigns)

  useEffect(() => {
    if (!isFetchingCampaigns) {
      setHasLoadedOnce(true);
    }
  }, [isFetchingCampaigns]);

  if (isFetchingCampaigns && !hasLoadedOnce) {
    return (
      <LinearGradient
        colors={["#FAFAFA", "#D9D9D9"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
        <View style={styles.container}>
          <ActivityIndicator 
          size="large" 
          color="#FF66C4" 
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
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
          style={{ flex: 1, marginTop: useTopOffset() }}
          // contentContainerStyle={{ flexGrow: 1, paddingTop: topOffset }}
          contentInsetAdjustmentBehavior="never"
          scrollIndicatorInsets={{ top: useTopOffset() }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FF66C4"
              colors={["#FF66C4"]}
              progressBackgroundColor="#FFFFFF"
              progressViewOffset={useTopOffset()}
            />
          }
        >
          <View style={styles.container}>
            {campaigns.map((campaign) => (
              <EventCard
                key={campaign._id}
                campaign={campaign}
                onPress={() => {
                  setSelectedCampaign(campaign);
                  setIsBottomModalExploreVisible(true);
                }}
                variant="explore"
              />
            ))}
          </View>
        </ScrollView>
        
        <BottomModalCardsExplore
          isVisible={isBottomModalExploreVisible}
          onClose={() => setIsBottomModalExploreVisible(false)}
          campaign={selectedCampaign}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

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
