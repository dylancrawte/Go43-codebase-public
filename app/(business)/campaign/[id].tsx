import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import CustomTabBar from "@/components/CustomTabBar";
import RequestsTab from "./requestsTab";
import MetricsTab from "./metricsTab";

import { useBookingOrchestrator } from "@/controllers/orchestrators/bookingOrchestrator";

export default function CampaignDetailsScreen() {
  const { id, title } = useLocalSearchParams<{ id: string; title?: string }>();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'metrics' | 'requests'>('metrics');
  const [metricsKey, setMetricsKey] = useState(0);

  const { pendingBookingsCount, fetchPendingBookingsPerCampaign } = useBookingOrchestrator();

  useEffect(() => {
    const screenTitle = title ? String(title) : "Campaign";
    navigation.setOptions({ title: screenTitle } as any);
  }, [title, navigation]);

  useEffect(() => {
    fetchPendingBookingsCount();
  }, [id, activeTab]);

  const fetchPendingBookingsCount = async () => {
    if (id) {
      fetchPendingBookingsPerCampaign(String(id));
    } else {
      return { success: false, message: "Campaign ID is required" };
    }
  };

  const handleApprove = () => {
    // Refresh metrics tab when a booking is approved
    setMetricsKey(prev => prev + 1);
    fetchPendingBookingsCount();
  };

  // Mock navigation props for CustomTabBar
  const mockNavigationProps = {
    state: {
      routes: [
        { key: 'metrics', name: 'metrics' },
        { key: 'requests', name: 'requests' }
      ],
      index: activeTab === 'metrics' ? 0 : 1
    },
    descriptors: {
      metrics: { key: 'metrics', options: { title: 'Metrics' } },
      requests: { key: 'requests', options: { title: 'Requests' } }
    },
    navigation: {
      navigate: (name: string) => setActiveTab(name as 'metrics' | 'requests'),
      emit: () => ({ defaultPrevented: false })
    }
  } as any;

  return (
    <LinearGradient
      colors={["#373737", "#112D2F"]}
      locations={[0.4, 1]}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={{marginTop: 20}}>
          <Ionicons name="arrow-back" size={30} color="white" />
        </Pressable>
        <Pressable onPress={() => router.push({ pathname: "/(business)/campaign/[id]/edit", params: { id: String(id), title: String(title || "") } })}>
          <Ionicons name="create-outline" size={30} color="white" />
        </Pressable>
        </View>
        <View style={styles.headerContainer}>
          <Text style={styles.heading}>{title || "Campaign"}</Text>
        </View>

        {/* Custom Tab Bar */}
        <CustomTabBar
          {...mockNavigationProps}
          backgroundColor="#59D1D9"
          activeTabColor="#fff"
          inactiveTextColor="#fff"
          activeTextColor="#000"
          inline={true}
          badges={{
            requests: pendingBookingsCount
          }}
        />
       
        {/* Tab Content */}
        {activeTab === 'metrics' ? (
          <MetricsTab key={metricsKey} campaignId={String(id)} />
        ) : (
          <RequestsTab campaignId={String(id)} onApprove={handleApprove} />
        )}
      </ScrollView>
    </LinearGradient>
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 20,
  },
});
