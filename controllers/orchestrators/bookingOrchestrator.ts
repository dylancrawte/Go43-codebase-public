import { useState, useEffect } from "react";
import { BookingsManagementService } from "../services/bookingsServices";
import { Campaign } from "@/app/types";
import { useBookingsStore } from "@/store/bookingsStore";
import { MetricsDataCompact } from "@/components/MetricsBar";
import { MediaService } from "../services/mediaServices";
import { useAuthStore } from "@/store/authStore";
import { useBusinessAuthStore } from "@/store/businessAuthStore";
import { Alert } from "react-native";

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

type UserVideo = {
  _id: string;
  title: string;
  uri: string;
  videoId: string;
  description: string;
  duration: number;
  uploadedBy: string;
  campaignId: string;
  createdAt: string;
};

export const useBookingOrchestrator = (userId?: string) => {
    const [isBooking, setIsBooking] = useState(false);
    const [isCancelBookingProcessing, setIsCancelBookingProcessing] = useState(false);
    // List for campaign-confirmed bookings (business metrics)
    const [confirmedBookings, setConfirmedBookings] = useState<ConfirmedBooking[]>([]);
    // Map for user's bookings (fan bookings screen)
    const [confirmedBookingsMap, setConfirmedBookingsMap] = useState<{[key: string]: Campaign}>({});
    const [bookingIds, setBookingIds] = useState<{[campaignId: string]: string}>({});
    const [bookingStatusMap, setBookingStatusMap] = useState<{[campaignId: string]: string}>({});
    const [isFetchingBookings, setIsFetchingBookings] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [isLoadingConfirmedBookings, setIsLoadingConfirmedBookings] = useState(false);
    const [loadingVideos, setLoadingVideos] = useState<Set<string>>(new Set());
    const [userVideos, setUserVideos] = useState<Map<string, UserVideo[]>>(new Map());
    const [videoMetrics, setVideoMetrics] = useState<Map<string, MetricsDataCompact[]>>(new Map());
    const [isLoadingBookings, setIsLoadingBookings] = useState(false);
    
    
    const [pendingBookingsCount, setPendingBookingsCount] = useState(0);

    const confirmBooking = async (userId: string, campaignId: string, status: string) => {
        setIsBooking(true);

        try {
            const response = await BookingsManagementService.createBooking(userId, campaignId, status) 
    
            if (response.success) {
            useBookingsStore.getState().addBooking(response.data);    
            return { success: true, message: "Booking requested", booking: response.data }
            } else {
                return { success: false, message: response.error || "Failed to create booking" }
                }
        } catch (error: any) {
            return { success: false, message: "Failed to create booking" };
        } finally {
            setIsBooking(false);
        }  
    }

    const cancelBookings = async (bookingIds: {[key: string]: string}, campaignId: string) => {
        setIsCancelBookingProcessing(true);
        
        try {
            // extract booking ID
            const bookingID = BookingsManagementService.extractBookingID(bookingIds, campaignId);

            if (!bookingID) {
                return { success: false, message: "Booking ID not found" };
            }

            // cancel booking
            const result = await BookingsManagementService.cancelBooking(bookingID);

            if (result.success) {
                return { success: true, message: "Booking cancelled successfully" };
            } else {
                return { success: false, message: result.error || "Failed to cancel booking" };
            }
        } catch (error: any) {
            return { success: false, message: "Failed to cancel booking" };
        } finally {
            setIsCancelBookingProcessing(false);
        }
    }

    const fetchBookings = async () => {
        if (!userId) {
            setIsFetchingBookings(false);
            return { success: false, message: "User not authenticated" }
        }

        setIsFetchingBookings(true);

        try {
            const result = await BookingsManagementService.fetchUserBookings(userId);
            if (result.success && result.data) {
                setConfirmedBookingsMap(result.data.bookingsMap);
                setBookingIds(result.data.bookingIdsMap);
                setBookingStatusMap(result.data.bookingStatusMap || {});
                return { success: true, message: "Bookings loaded successfully" };
            } else {
                const errorMessage = result.error || "Failed to fetch bookings";
                return { success: false, message: errorMessage };
            }
        } catch (error: any) {
            const errorMessage = "Failed to load bookings";
            return { success: false, message: errorMessage };
        } finally {
            setIsFetchingBookings(false);
        }
    }

    const fetchPendingBookingsPerCampaign = async (campaignId: string) => {
        try {
            const result = await BookingsManagementService.fetchPendingBookingsByCampaign(String(campaignId));
            if (!result.error) {
              setPendingBookingsCount(result.data?.length || 0);
              return { success: true, message: "Pending bookings loaded successfully", data: result.data };
            } else {
                return { success: false, message: result.error || "Failed to fetch pending bookings", data: null };
            }
          } catch (error) {
            console.error('Error fetching pending bookings count:', error);
          }
    }

    const fetchConfirmedBookingsService = async (campaignId: string) => {
      setIsLoadingConfirmedBookings(true);
      try {
        const result = await BookingsManagementService.fetchConfirmedBookingsByCampaign(campaignId);
        if (result.error) {
          setConfirmedBookings([]);
        } else {
          const bookingsWithMetrics = (result.data || []).map((booking: ConfirmedBooking) => ({
            ...booking,
            metrics: {
              views: 0,
              likes: 0,
              shares: 0,
              comments: 0,
            }
          }));
          setConfirmedBookings(bookingsWithMetrics);
        
          // iterate bookings and calls fetchUserVideos for each confirmed userz
          bookingsWithMetrics.forEach(async (booking: ConfirmedBooking) => {
            const userId = booking.userID?._id;
            if (userId) {
              await fetchUserVideos(userId, campaignId);
            }
          });
        }
      } catch (error) {
        console.error('Error fetching confirmed bookings:', error);
        setConfirmedBookings([]);
      } finally {
        setIsLoadingConfirmedBookings(false);
      }
    }

    const fetchUserVideos = async (userId: string, campaignId: string) => {
        if (!userId || !campaignId) return;
        
        setLoadingVideos(prev => new Set([...prev, userId]));
        
        try {
          const result = await MediaService.getUserVideos(userId, campaignId);
          
          if (result.success && result.videos) {
            setUserVideos(prev => new Map([...prev, [userId, result.videos || []]]));
            
            // Fetch real metrics from TikTok API
            const videos = result.videos || [];
            if (videos.length > 0) {
              // Check both user and business auth stores for token
              const userToken = useAuthStore.getState().token;
              const businessToken = useBusinessAuthStore.getState().token;
              const token = userToken || businessToken;
              
              if (token) {
                const videoIds = videos.map((video: UserVideo) => video._id);
                const metricsResult = await MediaService.queryVideoMetrics(videoIds, token);
                
                if (metricsResult.success && metricsResult.metrics) {
                  // Map metrics to videos in the same order
                  const realMetrics = videos.map((video: UserVideo) => {
                    const metrics = metricsResult.metrics?.[video._id];
                    return metrics || { views: 0, likes: 0, shares: 0, comments: 0 };
                  });
                  setVideoMetrics(prev => new Map([...prev, [userId, realMetrics]]));
                } else {
                  console.warn('Failed to fetch real metrics, using zeros:', metricsResult.error);
                  const zeroMetrics = videos.map(() => ({ views: 0, likes: 0, shares: 0, comments: 0 }));
                  setVideoMetrics(prev => new Map([...prev, [userId, zeroMetrics]]));
                }
              } else {
                console.warn('No auth token available (checked both user and business stores), using zeros for metrics');
                const zeroMetrics = videos.map(() => ({ views: 0, likes: 0, shares: 0, comments: 0 }));
                setVideoMetrics(prev => new Map([...prev, [userId, zeroMetrics]]));
              }
            } else {
              setVideoMetrics(prev => new Map([...prev, [userId, []]]));
            }
          } else {
            console.error('Failed to fetch videos for user', userId, ':', result.error);
            setUserVideos(prev => new Map([...prev, [userId, []]]));
            setVideoMetrics(prev => new Map([...prev, [userId, []]]));
          }
        } catch (error) {
          console.error('Error fetching user videos:', error);
          setUserVideos(prev => new Map([...prev, [userId, []]]));
          setVideoMetrics(prev => new Map([...prev, [userId, []]]));
        } finally {
          setLoadingVideos(prev => {
            const newSet = new Set(prev);
            newSet.delete(userId);
            return newSet;
          });
        }
      };

    const removeConfirmedBooking = async (bookingID: string) => {
        Alert.alert('Remove User', 'Are you sure you want to remove this user?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Remove', style: 'destructive', onPress: () => {
              try {
                BookingsManagementService.cancelBooking(bookingID).then(async (result) => {
                if (result.success) {
                  setConfirmedBookings(prev => prev.filter(booking => booking._id !== bookingID));
                } else {
                  console.error('Failed to remove user:', result.error);
                }
              }).catch((error: any) => {
                console.error('Error removing user:', error);
              }).finally(() => {
                setIsLoadingConfirmedBookings(false);
              });
              } catch (error: any) {
                setIsLoadingConfirmedBookings(false);
              }
            },
          }
        ]);  
    }

    const approveBookingOrch = async (bookingID: string) => {
      return await BookingsManagementService.approveBooking(bookingID);
    };

    const rejectBookingOrch = async (bookingID: string) => {
      return await BookingsManagementService.rejectBooking(bookingID);
    };

    useEffect(() => {
        if (userId) {
            useBookingsStore.getState().hydrateBookings();
            fetchBookings();
        }
    }, [userId]);

    // drag down refresh
    const onRefresh = async () => {
        setRefreshing(true);
        await fetchBookings();
        setRefreshing(false);
    };

    return {
        //useState hooks
        confirmedBookings, // array
        confirmedBookingsMap, // map
        bookingIds,
        bookingStatusMap,
        isFetchingBookings,
        refreshing,
        onRefresh,
        pendingBookingsCount,
        setPendingBookingsCount,
        isLoadingConfirmedBookings,
        setIsLoadingConfirmedBookings,
        loadingVideos,
        userVideos,
        videoMetrics,
        isLoadingBookings,
        //orchestrator functions
        fetchBookings,
        confirmBooking,
        cancelBookings,
        fetchPendingBookingsPerCampaign,
        fetchConfirmedBookingsService,
        removeConfirmedBooking,
        approveBookingOrch,
        rejectBookingOrch,
    }
}