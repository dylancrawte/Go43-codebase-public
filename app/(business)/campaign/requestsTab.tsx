import { View, Text, StyleSheet, Pressable, Image, ActivityIndicator, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { useBookingOrchestrator } from "@/controllers/orchestrators/bookingOrchestrator";

type PendingBooking = {
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
};

type RequestsTabProps = {
  campaignId: string;
  onApprove: () => void;
};

export default function RequestsTab({ campaignId, onApprove }: RequestsTabProps) {
  const [pendingBookings, setPendingBookings] = useState<PendingBooking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);

  const { fetchPendingBookingsPerCampaign, approveBookingOrch, rejectBookingOrch } = useBookingOrchestrator();

  useEffect(() => {
    fetchPendingBookings();
  }, [campaignId]);

  const fetchPendingBookings = async () => {
    if (!campaignId) return;
    
    setIsLoadingBookings(true);
    try {
      const result = await fetchPendingBookingsPerCampaign(campaignId);
      if (!result?.success) {
        setPendingBookings([]);
      } else {
        setPendingBookings(result?.data || []);
      }
    } catch (error) {
      console.error('Error fetching pending bookings:', error);
      setPendingBookings([]);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const handleApproveBooking = async (bookingID: string) => {
    try {
      const result = await approveBookingOrch(bookingID);
      if (result.success) {
        setPendingBookings(prev => prev.filter(booking => booking._id !== bookingID));
        onApprove(); // Notify parent to refresh metrics
        console.log('Booking approved successfully');
      } else {
        console.error('Failed to approve booking:', result.error);
      }
    } catch (error) {
      console.error('Error approving booking:', error);
    }
  };

  const handleRejectBooking = async (bookingID: string) => {
    try {
      const result = await rejectBookingOrch(bookingID);
      if (result.success) {
        setPendingBookings(prev => prev.filter(booking => booking._id !== bookingID));
        console.log('Booking rejected successfully');
      } else {
        console.error('Failed to reject booking:', result.error);
      }
    } catch (error) {
      console.error('Error rejecting booking:', error);
    }
  };

  if (isLoadingBookings) {
    return (
      <View style={styles.noRequestsContainer}>
        <ActivityIndicator size="large" color="#EBEBEB" />
      </View>
    );
  }

  if (pendingBookings.length === 0) {
    return (
      <View style={styles.noRequestsContainer}>
        <Text style={styles.noRequestsText}>No pending requests</Text>
      </View>
    );
  }

  return (
    <View style={{ gap: 15, marginTop: 20 }}>
      {pendingBookings.map((booking) => (
        <View key={booking._id} style={styles.requestCard}>
          <View style={styles.requestLeft}>
            <View style={styles.profilePlaceholder}>
              {booking.userID?.avatarUrl ? (
                <Pressable onPress={() => Linking.openURL(booking.userID?.tiktokLink || '')}>
                  <Image source={{ uri: booking.userID.avatarUrl }} style={styles.profilePlaceholder} />
                </Pressable>
              ) : (
                <Text style={styles.avatarText}>
                  {booking.userID?.username?.charAt(0)?.toUpperCase() || '?'}
                </Text>
              )}
            </View>
            <View style={styles.usernameContainer}>
              <Text style={styles.username}>{booking.userID?.displayName || booking.userID?.username || 'Unknown User'}</Text>
              <View style={styles.platformInfo}>
                <Pressable 
                  style={styles.platformIcon} 
                  onPress={() => {
                    if (booking.userID?.tiktokLink) {
                      Linking.openURL(booking.userID.tiktokLink);
                    } else {
                      console.log('User does not have TikTok link');
                      console.log('User ID:', booking.userID);
                    }
                  }}
                >
                  <Image source={require("@/assets/images/TikTok_Icon_Black_Circle.png")} style={styles.platformIcon} />
                </Pressable>
              </View>
            </View>
          </View>
          
          <View style={styles.requestActions}>
            <Pressable style={[styles.actionButton, styles.approveButton]} onPress={() => handleApproveBooking(booking._id)}>
              <Ionicons name="checkmark" size={16} color="#4CAF50" />
            </Pressable>
            <Pressable style={[styles.actionButton, styles.rejectButton]} onPress={() => handleRejectBooking(booking._id)}>
              <Ionicons name="close" size={16} color="#F44336" />
            </Pressable>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  noRequestsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  noRequestsText: {
    color: '#EBEBEB',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Aileron-Regular',
  },
  requestCard: {
    backgroundColor: '#666666',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  requestLeft: {
    alignItems: 'flex-start',
    gap: 8,
    flex: 1,
    flexDirection: 'row',
  },
  profilePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#EBEBEB',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Aileron-Regular',
  },
  username: {
    color: '#EBEBEB',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Aileron-Regular',
    flexWrap: 'wrap',
  },
  usernameContainer: {
    flex: 1,
    alignItems: 'flex-start',
    gap: 4,
  },
  platformInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  platformIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center', 
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  rejectButton: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
  },
});
