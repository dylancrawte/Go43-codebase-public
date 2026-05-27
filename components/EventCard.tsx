import { Campaign } from "../app/types";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { genreUtils } from "@/utility/genreUtils";

type variant = "explore" | "bookings";

type Props = {
  campaign?: Campaign;
  title?: string;
  description?: string;
  image?: any;
  onPress: () => void;
  variant?: variant;
  bookingStatus?: "pending" | "confirmed" | "cancelled" | "completed" | string;
};

export default function EventCard({
  campaign,
  image,
  onPress,
  variant = "explore",
  bookingStatus,
}: Props) {
  if (!campaign) return null;

  let tags: string[] = genreUtils.normaliseGenreTags(campaign.genreTags);

  const displayTitle = campaign?.eventName || "Untitled Event";
  const displayLocation = campaign?.location || "Location TBD";
  const displayDate = campaign?.date || "Date TBD";
  const displayTime = campaign?.time || "Time TBD";
  const displayImage = campaign?.image 
    ? { uri: campaign.image.replace('@', '') } 
    : image;
    
  const renderContent = () => {
    switch (variant) {
      case "explore":
        return (
          <TouchableOpacity
            style={[styles.card]}
            onPress={onPress}
            activeOpacity={0.8}
          >
            {(displayImage || image) && (
              <View style={styles.imageWrapper}>
                <Image 
                  source={displayImage || image} 
                  style={styles.image}
                  resizeMode="cover"
                  onError={() => {}}
                 />
                <LinearGradient
                  colors={["transparent", "#000000"]}
                  style={styles.imageOverlay}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 0, y: 1 }}
                />
              </View>
            )}

            <View style={styles.contentContainerColumn}>
              <Text style={styles.title}>{displayTitle}</Text>
              <View style={styles.descriptionTagRow}>
                <View>
                <Text style={styles.description}>{displayLocation}</Text>
                <Text style={styles.description}>{displayDate}</Text>
                </View>
                <View style={styles.tagRow}>
                {tags.slice(0, 2).map((tag: string) => (
                  <Pressable key={tag} style={styles.tagButton}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </Pressable>
                ))}
                {tags.length === 3 && (
                  <Pressable key={tags[2]} style={styles.tagButton}>
                    <Text style={styles.tagText}>{tags[2]}</Text>
                  </Pressable>
                )}
                {tags.length > 3 && (
                  <Pressable key="more-tags" style={styles.tagButton}>
                    <Text style={styles.tagText}>
                      +{tags.length - 2}
                    </Text>
                  </Pressable>
                )}
                </View>
              </View>
            </View>
          </TouchableOpacity>
        );
      case "bookings":
        return (
          <TouchableOpacity
            style={[
              styles.card,
              variant === "bookings" &&
                (bookingStatus === "confirmed"
                  ? styles.cardBookingConfirmed
                  : bookingStatus === "pending"
                  ? styles.cardBookingPending
                  : styles.cardBookingDefault),
            ]}
            onPress={onPress}
            activeOpacity={0.8}
          >
            {displayImage && (
              <View style={styles.imageWrapper}>
                <Image source={displayImage} style={styles.image} />
                <LinearGradient
                  colors={["transparent", "#000000"]}
                  style={styles.imageOverlay}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 0, y: 1 }}
                />
              </View>
            )}

            <View style={styles.contentContainerColumn}>
              <View style={styles.textContent}>
                <Text style={styles.title}>{displayTitle}</Text>
                <Text style={styles.description}>{displayLocation}</Text>
                <Text style={styles.description}>{displayDate}</Text>
                
              </View>
            </View>
            <View style={styles.badgeAbsolute}>
              {bookingStatus === "confirmed" ? (
                <Text style={styles.badgeTextConfirmed}>✅ Confirmed</Text>
              ) : bookingStatus === "pending" ? (
                <Text style={styles.badgeTextPending}>⏳ Pending</Text>
              ) : null}
            </View>
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };
  return renderContent();
}

// ------------- STYLESHEET DEFINITIONS -------------
const styles = StyleSheet.create({
  card: {
    backgroundColor: "#000000",
    borderRadius: 12,
    width: 340,
    marginVertical: 10,
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 3,
    height: 230,
    borderColor: "#000000",
    borderWidth: 1.5,
  },
  image: {
    height: 175,
    width: "100%",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    fontFamily: "Aileron",
    marginLeft: 1,
  },
  description: {
    marginTop: 1,
    color: "#EBEBEB",
    fontFamily: "Aileron",
    marginLeft: 1,
    marginBottom: 1,
    fontSize: 12,
  },
  imageWrapper: {
    overflow: "hidden",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    position: "relative",
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardBooking: {
    borderColor: "green",
    borderWidth: 2,
  },
  cardBookingConfirmed: {
    borderColor: "green",
    borderWidth: 2,
  },
  cardBookingPending: {
    borderColor: "orange",
    borderWidth: 2,
  },
  cardBookingDefault: {
    borderColor: "#000000",
    borderWidth: 1.5,
  },
  badge: {
    marginTop: 8,
    backgroundColor: "#e0ffe0",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  badgeText: {
    color: "green",
    fontWeight: "bold",
    fontSize: 8,
  },
  badgeTextConfirmed: {
    color: "green",
    fontWeight: "bold",
    fontSize: 8,
  },
  badgeTextPending: {
    color: "orange",
    fontWeight: "bold",
    fontSize: 8,
  },
  tagButton: {
    backgroundColor: "#000000",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: "flex-start",
    borderColor: "#EEFF00",
    borderWidth: 1,
    marginBottom: 5,
    marginLeft: 10,
  },
  tagText: {
    color: "#fff",
    fontSize: 8,
    fontFamily: "AileronBold",
  },
  textContent: {
    marginRight: 8,
  },
  badgeAbsolute: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: "#333333",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: "flex-end",
  },
  contentContainerColumn: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-end",
    paddingHorizontal: 10,
    marginBottom: 10,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  descriptionTagRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: "auto",
    paddingRight: 10,
    marginRight: 10,
  },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
});
