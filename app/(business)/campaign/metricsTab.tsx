import { View, Text, StyleSheet, Pressable, Image, ActivityIndicator, Linking, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import MetricsBar, { MetricsDataCompact } from "@/components/MetricsBar";
import { useBookingOrchestrator } from "@/controllers/orchestrators/bookingOrchestrator";

type MetricsTabProps = {
  campaignId: string;
};

export default function MetricsTab({ campaignId }: MetricsTabProps) {
  const [expandedDropdowns, setExpandedDropdowns] = useState<Set<string>>(new Set());

  const { 
    isLoadingConfirmedBookings,
    fetchConfirmedBookingsService, 
    loadingVideos, 
    userVideos, 
    videoMetrics, 
    removeConfirmedBooking, 
    confirmedBookings 
  } = useBookingOrchestrator();

  useEffect(() => {
    fetchConfirmedBookings();
  }, [campaignId]);

  useEffect(() => {
    console.log('Confirmed bookings:', confirmedBookings);
  }, [confirmedBookings]);

  const fetchConfirmedBookings = async () => {
    if (!campaignId) return;
    await fetchConfirmedBookingsService(campaignId);
  };

  const aggregateUserMetrics = (userId: string): MetricsDataCompact => {
    const metrics = videoMetrics.get(userId) || [];
    return metrics.reduce((total, metric) => ({
      views: total.views + metric.views,
      likes: total.likes + metric.likes,
      shares: total.shares + metric.shares,
      comments: total.comments + metric.comments,
    }), { views: 0, likes: 0, shares: 0, comments: 0 });
  };

  const toggleDropdown = (userId: string) => {
    setExpandedDropdowns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const handleRemoveUser = async (bookingID: string) => {
    await removeConfirmedBooking(bookingID);
  };

  if (isLoadingConfirmedBookings) {
    return (
      <View style={styles.noRequestsContainer}>
        <ActivityIndicator size="large" color="#EBEBEB" />
        <Text style={styles.noRequestsText}>Loading confirmed users...</Text>
      </View>
    );
  }

  return (
    <View style={{ gap: 15, marginTop: 20 }}>
      <View style={styles.pill}>
        <Text style={styles.pillText}>✅ Confirmed Users ({confirmedBookings.length})</Text>
      </View>
      {confirmedBookings.length === 0 ? (
        <View style={styles.noRequestsContainer}>
          <Text style={styles.noRequestsText}>No confirmed users yet</Text>
        </View>
      ) : (
        confirmedBookings.map((booking) => {
          const userId = booking.userID?._id || '';
          const videos = userVideos.get(userId) || [];
          const isLoadingVideos = loadingVideos.has(userId);
          const isExpanded = expandedDropdowns.has(userId);
          
          return (
            <View key={booking._id} style={styles.confirmedUserCard}>
              <View style={styles.confirmedUserLeft}>
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
                  <Text style={styles.username}>{booking.userID?.displayName || booking.userID?.username ||  'Unknown User'}</Text>
                  {videos.length > 0 && (
                    <View style={{ marginRight: 40 }}>
                      <MetricsBar 
                        metrics={aggregateUserMetrics(userId)} 
                        compact={true} 
                        gradientColors={["#59D1D9", "#4BC0C8"]}
                      />
                    </View>
                  )}
                  
                  {/* Videos Dropdown */}
                  <TouchableOpacity 
                    style={styles.videosDropdownButton}
                    onPress={() => toggleDropdown(userId)}
                  >
                    <Text style={styles.videosDropdownText}>
                      Videos ({videos.length})
                    </Text>
                    <Ionicons 
                      name={isExpanded ? "chevron-up" : "chevron-down"} 
                      size={16} 
                      color="#59D1D9" 
                    />
                  </TouchableOpacity>
                  
                  {isExpanded && (
                    <View style={styles.videosDropdown}>
                      {isLoadingVideos ? (
                        <View style={styles.videosLoadingContainer}>
                          <ActivityIndicator size="small" color="#59D1D9" />
                          <Text style={styles.videosLoadingText}>Loading videos...</Text>
                        </View>
                      ) : videos.length === 0 ? (
                        <Text style={styles.noVideosText}>No videos uploaded yet</Text>
                      ) : (
                        <View style={styles.videosList}>
                          {videos.map((video, index) => {
                            const storedMetrics = videoMetrics.get(userId) || [];
                            const videoMetricsData: MetricsDataCompact = storedMetrics[index] || { views: 0, likes: 0, shares: 0, comments: 0 };
                            
                            return (
                              <View key={video._id} style={styles.videoItem}>
                                <View style={styles.videoTopRow}>
                                  <View style={styles.videoThumbnailContainer}>
                                    <Image source={{ uri: video.uri }} style={styles.videoThumbnail} />
                                  </View>
                                  <View style={styles.videoMetricsBar}>
                                    <View style={styles.metricsBarWrapper}>
                                      <MetricsBar 
                                        metrics={videoMetricsData} 
                                        compact={true} 
                                        gradientColors={["#59D1D9", "#4BC0C8"]}
                                      />
                                    </View>
                                  </View>
                                </View>
                                <View style={styles.videoInfo}>
                                  <Text style={styles.videoTitle} numberOfLines={2}>
                                    {video.title || 'Untitled Video'}
                                  </Text>
                                  <Text style={styles.videoDuration}>
                                    {Math.round(video.duration)}s
                                  </Text>
                                  <Text style={styles.videoDate}>
                                    {new Date(video.createdAt).toLocaleDateString()}
                                  </Text>
                                  {/* TikTok Metrics Display */}
                                  {/* <View style={styles.videoStatsContainer}>
                                    <View style={styles.statItem}>
                                      <Ionicons name="eye-outline" size={12} color="#59D1D9" />
                                      <Text style={styles.statText}>{formatNumber(videoMetricsData.views)}</Text>
                                    </View>
                                    <View style={styles.statItem}>
                                      <Ionicons name="heart-outline" size={12} color="#59D1D9" />
                                      <Text style={styles.statText}>{formatNumber(videoMetricsData.likes)}</Text>
                                    </View>
                                    <View style={styles.statItem}>
                                      <Ionicons name="chatbubble-outline" size={12} color="#59D1D9" />
                                      <Text style={styles.statText}>{formatNumber(videoMetricsData.comments)}</Text>
                                    </View>
                                  </View> */}
                                </View>
                              </View>
                            );
                          })}
                        </View>
                      )}
                    </View>
                  )}
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.removeButton}
                onPress={() => handleRemoveUser(booking._id)}
              >
                <Ionicons name="close" size={16} color="#F44336" />
              </TouchableOpacity>
            </View>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
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
  pillText: {
    color: "#EBEBEB",
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "Aileron-Regular",
  },
  subtext: {
    color: "#C5C5C5",
    fontSize: 14,
  },
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
  confirmedUserCard: {
    backgroundColor: '#666666',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    position: 'relative',
    alignSelf: 'stretch',
  },
  confirmedUserLeft: {
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
    minWidth: 0,
  },
  removeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videosDropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(89, 209, 217, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 8,
    marginRight: 40,
  },
  videosDropdownText: {
    color: '#59D1D9',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Aileron-Regular',
  },
  videosDropdown: {
    marginTop: 8,
    marginRight: 40,
    backgroundColor: 'rgba(89, 209, 217, 0.05)',
    borderRadius: 8,
    paddingTop: 8,
    paddingHorizontal: 8,
    paddingBottom: 0,
    alignSelf: 'flex-start',
    width: '100%',
  },
  videosList: {
    gap: 6,
    paddingBottom: 0,
  },
  videosLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  videosLoadingText: {
    color: '#59D1D9',
    fontSize: 12,
    fontFamily: 'Aileron-Regular',
  },
  noVideosText: {
    color: '#999',
    fontSize: 12,
    fontFamily: 'Aileron-Regular',
    textAlign: 'center',
    paddingVertical: 12,
  },
  videoItem: {
    flexDirection: 'column',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 6,
    padding: 8,
    gap: 8,
  },
  videoTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  videoThumbnailContainer: {
    alignItems: 'center',
    gap: 4,
  },
  videoThumbnail: {
    width: 40,
    height: 40,
    borderRadius: 4,
    backgroundColor: '#444',
  },
  videoMetricsBar: {
    flex: 1,
  },
  metricsBarWrapper: {
    marginTop: -8,
  },
  videoInfo: {
    flex: 1,
    marginLeft: 0,
  },
  videoMetricsContainer: {
    marginLeft: 8,
    width: '73%',
  },
  videoTitle: {
    color: '#EBEBEB',
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'Aileron-Regular',
    marginBottom: 2,
  },
  videoDuration: {
    color: '#999',
    fontSize: 10,
    fontFamily: 'Aileron-Regular',
    marginBottom: 1,
  },
  videoDate: {
    color: '#666',
    fontSize: 9,
    fontFamily: 'Aileron-Regular',
  },
  videoStatsContainer: {
    flexDirection: 'row',
    marginTop: 6,
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    color: '#59D1D9',
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'Aileron-Regular',
  },
});
