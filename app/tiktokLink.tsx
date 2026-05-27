import { useLocalSearchParams, router } from "expo-router";
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator, Alert, TouchableOpacity, Pressable, TextInput } from "react-native";
import { useEffect, useState } from "react";
import { MediaService } from "@/controllers/services/mediaServices";
import { useAuthStore } from "@/store/authStore";
import { Ionicons } from "@expo/vector-icons";
import { ToastType, useToast } from "@/components/CustomToast";

interface TikTokVideo {
  id: string;
  title: string;
  cover_image_url: string;
  create_time: number;
  duration: number;
  video_description: string;
}

export default function TikTokLink() {
  const { campaignName, campaignId } = useLocalSearchParams();
  const { user, token } = useAuthStore();
  const [videos, setVideos] = useState<TikTokVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [savingVideoId, setSavingVideoId] = useState<string | null>(null);
  const [removingVideoId, setRemovingVideoId] = useState<string | null>(null);
  const [savedVideoIds, setSavedVideoIds] = useState<Set<string>>(new Set());
  const [videoIdToDbIdMap, setVideoIdToDbIdMap] = useState<Map<string, string>>(new Map());
  const [boostCode, setBoostCode] = useState<Map<string, string>>(new Map());
  const [updatingBoostCode, setUpdatingBoostCode] = useState<string | null>(null);

  const { showToast } = useToast();

  useEffect(() => {
    fetchTikTokVideos();
    fetchSavedVideos();
  }, []);

  const fetchTikTokVideos = async () => {
    try {
      setLoading(true);
      setError(null);

      const tiktokAccessToken = user?.tiktokAccessToken;

      if (!tiktokAccessToken) {
        setError("TikTok access token not found. Please connect your TikTok account first.");
        return;
      }

      const result = await MediaService.getTikTokVideos(tiktokAccessToken, 20);

      const coverUrl = result.data?.videos[0].cover_image_url

      if (!coverUrl) {
        setError("Cover image URL not found");
        return;
      }

      if (result.success && result.data) {
        setVideos(result.data.videos);
      } else {
        setError("error: " + result.error || "Failed to fetch TikTok videos");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching videos");
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedVideos = async () => {
    if (!campaignId || !token) {
      return;
    }

    try {
      const result = await MediaService.getSavedVideosForCampaign(String(campaignId), token);
      
      if (result.success && result.videos) {
        const savedIds = new Set(result.videos.map((video: any) => video.videoId));
        const idMap = new Map(result.videos.map((video: any) => [video.videoId, video._id]));
        setSavedVideoIds(savedIds);
        setVideoIdToDbIdMap(idMap);
      }
    } catch (err: any) {
      console.error("Error fetching saved videos:", err);
    }
  };

  const handleSaveVideo = async (video: TikTokVideo) => {
    if (!campaignId) {
      showToast("Campaign ID not found. Please try again.", "error");
      return;
    }

    if (!token) {
      showToast("Authentication token not found. Please log in again.", "error");
      return;
    }

    setSavingVideoId(video.id);

    try {
      const videoData = {
        title: video.title || "Untitled Video",
        uri: video.cover_image_url, // Using cover image as URI for now
        videoId: video.id,
        description: video.video_description || video.title || "",
        duration: Math.round(video.duration),
        campaignId: String(campaignId)
      };

      const result = await MediaService.saveTikTokVideo(videoData, token);

      if (result.success) {
        // Add the video ID to the saved set
        setSavedVideoIds(prev => new Set([...prev, video.id]));
        // Add the database ID mapping
        setVideoIdToDbIdMap(prev => new Map(prev).set(video.id, result.video._id));
        showToast("Video saved successfully!", "success");
      } else {
        showToast(result.error || "Failed to save video", "error");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "An unexpected error occurred");
    } finally {
      setSavingVideoId(null);
    }
  };

  const handleRemoveVideo = async (video: TikTokVideo) => {
    if (!token) {
      Alert.alert("Error", "Authentication token not found. Please log in again.");
      return;
    }

    const dbVideoId = videoIdToDbIdMap.get(video.id);
    if (!dbVideoId) {
      Alert.alert("Error", "Video ID not found. Please try again.");
      return;
    }

    setRemovingVideoId(video.id);

    try {
      const result = await MediaService.deleteVideo(dbVideoId, token);

      if (result.success) {
        // Remove the video ID from the saved set and mapping
        setSavedVideoIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(video.id);
          return newSet;
        });
        setVideoIdToDbIdMap(prev => {
          const newMap = new Map(prev);
          newMap.delete(video.id);
          return newMap;
        });
        showToast("Video removed from campaign!", "success");
      } else {
        Alert.alert("Error", result.error || "Failed to remove video");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "An unexpected error occurred");
    } finally {
      setRemovingVideoId(null);
    }
  };

  const handleUpdateBoostCode = async (video: TikTokVideo) => {
    console.log("handleUpdateBoostCode called for video:", video.id);
    
    if (!token) {
      console.log("No token found");
      showToast("Authentication token not found. Please log in again.", "error");
      return;
    }
  
    const boostCodeValue = boostCode.get(video.id);
    console.log("Boost code value:", boostCodeValue);
    
    if (!boostCodeValue) {
      console.log("No boost code value found");
      showToast("Boost code not found. Please try again.", "error");
      return;
    }
  
    const dbVideoId = videoIdToDbIdMap.get(video.id);
    console.log("DB Video ID:", dbVideoId);
    
    if (!dbVideoId) {
      console.log("No DB video ID found");
      showToast("Video not found in database. Please save the video first.", "error");
      return;
    }
  
    console.log("Starting boost code update...");
    setUpdatingBoostCode(video.id);
  
    try {
      const result = await MediaService.updateVideoBoostCode(dbVideoId, boostCodeValue.trim(), token);
      console.log("Update result:", result);
  
      if (result.success) {
        console.log("Success - showing success toast");
        showToast("Boost code updated successfully!", "success");
      } else {
        console.log("Failed - showing error toast");
        showToast(result.error || "Failed to update boost code", "error");
      }
    } catch (error: any) {
      console.log("Caught error:", error);
      showToast(error.message || "An unexpected error occurred", "error");
    } finally {
      setUpdatingBoostCode(null);
    } 
  }

  const renderVideoItem = ({ item }: { item: TikTokVideo }) => {
    const isSaving = savingVideoId === item.id;
    const isRemoving = removingVideoId === item.id;
    const isSaved = savedVideoIds.has(item.id);
    const isLoading = isSaving || isRemoving;
    
    return (
    <View style={styles.videoItem}>
      <Image 
        source={{ 
          uri: item.cover_image_url,
          headers: {
            'Authorization': `Bearer ${user?.tiktokAccessToken}`,
            'Referer': 'https://www.tiktok.com'
          }
        }} 
        style={styles.thumbnail}
        onError={(error) => {
          console.log('Direct TikTok image failed:', error.nativeEvent.error);
          console.log('Failed URL:', item.cover_image_url);
        }}
        />
      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle} numberOfLines={2}>
          {item.title || item.video_description || "Untitled Video"}
        </Text>
        <Text style={styles.videoDuration}>
          Duration: {Math.round(item.duration)}s
        </Text>
        <Text style={styles.videoDate}>
          {new Date(item.create_time * 1000).toLocaleDateString()}
        </Text>
        <View style={styles.boostCodeContainer}>
        <TextInput
        style={styles.boostCodeInput}
        placeholder="Paste boost code here"
        value={boostCode.get(item.id) || ""}
        onChangeText={(text) => {
          const newBoostCodes = new Map(boostCode);
          newBoostCodes.set(item.id, text);
          setBoostCode(newBoostCodes);
        }}
        keyboardType="url"
        autoCapitalize="none"
      />
      <TouchableOpacity
    style={[
      styles.boostCodeButton,
      (!boostCode.get(item.id) || boostCode.get(item.id)?.trim() === "") && styles.boostCodeButtonDisabled
    ]}
    onPress={() => handleUpdateBoostCode(item)}
    disabled={updatingBoostCode === item.id || !boostCode.get(item.id) || boostCode.get(item.id)?.trim() === ""}
  >
    {updatingBoostCode === item.id ? (
      <ActivityIndicator size="small" color="#fff" />
    ) : (
      <Ionicons name="checkmark" size={16} color="#fff" />
    )}
  </TouchableOpacity>
      </View>
      </View>
      <View style={styles.buttonContainer}>
        {isSaved ? (
          <TouchableOpacity 
            style={[
              styles.removeButton,
              isLoading && styles.removeButtonDisabled
            ]}
            onPress={() => handleRemoveVideo(item)}
            disabled={isLoading}
          >
            {isRemoving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="close" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[
              styles.saveButton, 
              isLoading && styles.saveButtonDisabled
            ]}
            onPress={() => handleSaveVideo(item)}
            disabled={isLoading}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="add" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        )}
      </View>
      
    </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={30} color="#111" />
          </Pressable>
        </View>
        
        <Text style={styles.title}>{campaignName}</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Loading TikTok videos...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={30} color="#111" />
          </Pressable>
        </View>
        
        <Text style={styles.title}>{campaignName}</Text>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={30} color="#111" />
        </Pressable>
      </View>
      
      <Text style={styles.title}>{campaignName}</Text>
      <Text style={styles.subtitle}>Select a video to link to this campaign</Text>

      <FlatList
        data={videos}
        renderItem={renderVideoItem}
        keyExtractor={(item) => item.id}
        style={styles.videoList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No TikTok videos found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8F9FA",
        paddingTop: 60,
        paddingHorizontal: 20,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    backButton: {
        padding: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        fontFamily: 'Aileron',
        color: '#111',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        textAlign: 'center',
        fontFamily: 'Aileron',
        color: '#666',
        marginBottom: 12,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        fontFamily: 'Aileron',
        color: '#666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    errorText: {
        fontSize: 16,
        fontFamily: 'Aileron',
        color: '#DC3545',
        textAlign: 'center',
    },
    videoList: {
        flex: 1,
    },
    videoItem: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        alignItems: 'center',
    },
    thumbnail: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
    },
    videoInfo: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'space-between',
    },
    buttonContainer: {
        marginLeft: 12,
    },
    saveButton: {
        backgroundColor: '#59D1D9',
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveButtonDisabled: {
        backgroundColor: '#ccc',
    },
    removeButton: {
        backgroundColor: '#FF69B4', // Pink color for remove button
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeButtonDisabled: {
        backgroundColor: '#ccc',
    },
    videoTitle: {
        fontSize: 14,
        fontFamily: 'Aileron',
        fontWeight: '600',
        color: '#111',
        marginBottom: 4,
    },
    videoDuration: {
        fontSize: 12,
        fontFamily: 'Aileron',
        color: '#666',
        marginBottom: 2,
    },
    videoDate: {
        fontSize: 12,
        fontFamily: 'Aileron',
        color: '#999',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 16,
        fontFamily: 'Aileron',
        color: '#666',
        textAlign: 'center',
    },
    boostCodeInput: {
        fontSize: 12,
        fontFamily: 'Aileron',
        color: '#666',
        marginBottom: 12,
        marginTop: 4,
        borderBottomWidth: 1,
        borderColor: '#ccc',
        paddingVertical: 4,
    },
    boostCodeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      marginTop: 4,
    },
    boostCodeButton: {
      backgroundColor: '#59D1D9',
      borderRadius: 6,
      width: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 8,
    },
    boostCodeButtonDisabled: {
      backgroundColor: '#ccc',
    },
});