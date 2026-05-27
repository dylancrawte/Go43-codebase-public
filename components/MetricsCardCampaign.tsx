import { View, Text, StyleSheet, Image, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MetricsBar, { MetricsData } from "./MetricsBar";

export type CampaignMetrics = MetricsData;

export type CampaignData = {
  eventName: string;
  date: string;
  time: string;
  artist: string;
  genreTags: string[];
  location: string;
  brief: string;
  image: string;
  contentDeliveryDeadline: string;
  spotifyLink: string;
};

type Props = {
  campaignData: CampaignData;
  metrics: CampaignMetrics;
};

export default function CampaignMetricsCard({
  campaignData,
  metrics,
}: Props) {
  const { width: screenWidth } = useWindowDimensions();

  // Full-width cover height (clamped for phones/tablets)
  const coverHeight = Math.round(Math.max(140, Math.min(220, screenWidth * 0.35)));

  return (
    <View style={styles.outerBorder}>
      <View style={styles.row}>
        <Image 
          source={{ uri: campaignData.image }} 
          style={[styles.cover, { height: coverHeight, width: "100%" }]} 
          resizeMode="cover" 
        />

        <View style={[styles.panel]}>
          <View style={styles.topSection}>
            <View style={styles.headerRow}>
              <Text style={styles.eventName}>{campaignData.eventName}</Text>
              <View style={{marginTop: 4}}>
                <Ionicons name="chevron-forward" size={24} color="#FF66C4" />
              </View>
            </View>

            <View style={styles.datePill}>
              <Ionicons name="calendar-outline" size={18} color="#FFFFFF" />
              <Text style={styles.dateText}>{campaignData.date}</Text>
            </View>
            <View style={styles.locationPill}>
              <Ionicons name="location-outline" size={18} color="#FFFFFF" />
              <Text style={styles.locationText}>{campaignData.location}</Text>
            </View>
          </View>
          <MetricsBar metrics={metrics} />
        </View>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  outerBorder: {
    width: "100%",
    borderColor: "#EBEBEB",
    borderWidth: 2,
    borderRadius: 18,
    padding: 6,
    backgroundColor: "#2A2A2A",
  },
  row: {
    width: "100%",
    flexDirection: "column",
    alignItems: "stretch",
  },
  cover: {
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  panel: {
    flex: 1,
    backgroundColor: "#3D3D3D",
    padding: 12,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    justifyContent: "space-between",
  },
  topSection: {
    gap: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  eventName: {
    color: "#EBEBEB",
    fontSize: 20,
    fontWeight: "700",
    flex: 1,
    marginRight: 8,
  },
  artistBadge: {
    backgroundColor: "#4A90E2",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  artistText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  datePill: {
    alignSelf: "flex-start",
    backgroundColor: "#666666",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderColor: "yellow",
    borderWidth: 1,
  },
  locationPill: {
    alignSelf: "flex-start",
    backgroundColor: "#666666",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  dateText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  genreContainer: {
    flexDirection: "row",
    marginTop: 6,
  },
  genreTag: {
    backgroundColor: "#5A5A5A",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderColor: "yellow",
    borderWidth: 1,
  },
  genreText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "500",
  },
});
