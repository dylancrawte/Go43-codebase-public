import { Alert, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import {
  getCloudinaryUploadEndpoint,
  getCloudinaryUploadPreset,
} from "@/utility/publicConfig";

interface UploadResult {
  success: boolean;
  data?: {
      url: string;
      publicId: string;
  };
  error?: string;
  details?: any;
}

interface TikTokVideo {
  id: string;
  title: string;
  cover_image_url: string;
  create_time: number;
  duration: number;
  video_description: string;
}

interface TikTokListResponse {
  videos: TikTokVideo[];
  cursor: number;
  has_more: boolean;
}

interface TikTokApiResult {
  success: boolean;
  data?: TikTokListResponse;
  error?: string;
}

type ProgressCallback = (progress: number) => void;

export class MediaService {
    private static readonly CONFIG = {
      get CLOUDINARY_ENDPOINT() {
        return getCloudinaryUploadEndpoint();
      },
      BACKEND_ENDPOINT: `${process.env.EXPO_PUBLIC_BACKEND_URL}`,
      get UPLOAD_PRESET() {
        return getCloudinaryUploadPreset();
      },
      TIKTOK_API_ENDPOINT: "https://open.tiktokapis.com/v2/video/list/",
    };
    
    private static validateFile(fileOrUri: any, fileType: "video" | "image"): { isValid: boolean; error?: string } {
      if (!fileOrUri) {
        return { isValid: false, error: `No ${fileType} file provided` };
    }

    if (Platform.OS === "web") {
        if (typeof fileOrUri === "string" && !fileOrUri.startsWith("blob:")) {
            return { isValid: false, error: "Invalid blob URL format" };
        }
        if (!(fileOrUri instanceof File) && typeof fileOrUri !== "string") {
            return { isValid: false, error: "File must be File object or blob URL" };
        }
    } else {
        if (typeof fileOrUri !== "string") {
            return { isValid: false, error: "File URI must be a string on mobile" };
        }
    }
    
    return { isValid: true };
    }

    private static async createFormData(fileOrUri: any, fileType: "video" | "image", userId?: string): Promise<FormData> {
      const data = new FormData(); 

      if (Platform.OS === "web") {
        if (typeof fileOrUri === "string" && fileOrUri.startsWith("blob:")) {
            const response = await fetch(fileOrUri);
            if (!response.ok) {
                throw new Error(`Failed to fetch blob: ${response.statusText}`);
            }
            const blob = await response.blob();
            const file = new File([blob], 
                fileType === "video" ? 'video.mp4' : 'image.png', 
                { type: fileType === "video" ? 'video/mp4' : 'image/png' }
            );
            data.append("file", file);
        } else {
            data.append("file", fileOrUri);
        }
    } else {
        data.append("file", {
            uri: fileOrUri,
            type: fileType === "video" ? "video/mp4" : "image/png",
            name: fileType === "video" ? "video.mp4" : "image.png",
        } as any);
      }

      data.append("upload_preset", this.CONFIG.UPLOAD_PRESET);

      // Add folder parameter for user-specific uploads
      if (userId) {
        data.append("folder", `users/${userId}/videos`);
    }

      return data
    }

    //upload either video or image to cloudinary
    private static async uploadToCloudinary(fileOrUri: any, fileType: "video" | "image", userId?: string, onProgress?: ProgressCallback): Promise<UploadResult> {
        // Validation
        const validation = this.validateFile(fileOrUri, fileType);
        if (!validation.isValid) {
            return {
                success: false,
                error: validation.error || "Invalid File"
            };
        }

        try {
          const data = await this.createFormData(fileOrUri, fileType, userId);  
          
          // Use XMLHttpRequest for progress tracking
          return new Promise((resolve) => {
            const xhr = new XMLHttpRequest();
            let fallbackTimer: any = null;
            let fallbackProgress = 0;

            xhr.upload.addEventListener('loadstart', () => {
              if (onProgress) onProgress(0);
              // fallback ramp when length is not computable
              if (!fallbackTimer && onProgress) {
                fallbackTimer = setInterval(() => {
                  fallbackProgress = Math.min(fallbackProgress + 1, 55);
                  onProgress(fallbackProgress);
                }, 300);
              }
            });

            xhr.upload.addEventListener('progress', (event) => {
              if (event.lengthComputable && onProgress) {
                const progress = Math.round((event.loaded / event.total) * 100);
                onProgress(progress);
                if (fallbackTimer) { clearInterval(fallbackTimer); fallbackTimer = null; }
              }
            });
      
            xhr.addEventListener('load', () => {
              if (fallbackTimer) { clearInterval(fallbackTimer); fallbackTimer = null; }
              if (xhr.status === 200) {
                const result = JSON.parse(xhr.responseText);
                if (result.secure_url) {
                  resolve({
                    success: true,
                    data: { url: result.secure_url, publicId: result.public_id || "" }
                  });
                } else {
                  resolve({ success: false, error: `No secure URL returned` });
                }
              } else {
                resolve({ success: false, error: `Upload failed: ${xhr.status}` });
              }
            });
      
            xhr.addEventListener('error', () => {
              if (fallbackTimer) { clearInterval(fallbackTimer); fallbackTimer = null; }
              resolve({ success: false, error: `${fileType} upload failed` });
            });
      
            // Send to Cloudinary
            const endpoint = `${this.CONFIG.CLOUDINARY_ENDPOINT}/${fileType}/upload`;
            xhr.open('POST', endpoint);
            xhr.send(data);
          });
        } catch (error: any) {
          return { success: false, error: error.message };
        }
      }

    static async uploadImageToCloudinary(fileOrUri: any, userId?: string): Promise<UploadResult> {
        return this.uploadToCloudinary(fileOrUri, "image", userId);
    }

    private static CAMPAIGN_IMAGE_RULES = {
      minWidth: 800,
      minHeight: 450,
      maxFileSize: 2 * 1024 * 1024, // 2MB
      acceptedRatios: [
        { ratio: 16/9, tolerance: 1 },
        { ratio: 4/3, tolerance: 1 }
      ]
    };

    private static validateImage(width: number, height: number, fileSize?: number): { valid: boolean; error?: string } {
      // Check minimum dimensions
      if (width < this.CAMPAIGN_IMAGE_RULES.minWidth || height < this.CAMPAIGN_IMAGE_RULES.minHeight) {
        return {
          valid: false,
          error: `Image must be at least ${this.CAMPAIGN_IMAGE_RULES.minWidth}x${this.CAMPAIGN_IMAGE_RULES.minHeight}px`
        };
      }
    
      // Check file size if provided
      if (fileSize && fileSize > this.CAMPAIGN_IMAGE_RULES.maxFileSize) {
        return {
          valid: false,
          error: `Image size must be less than 2MB`
        };
      }
    
      // Check aspect ratio
      const imageRatio = width / height;
      const isValidRatio = this.CAMPAIGN_IMAGE_RULES.acceptedRatios.some(({ ratio, tolerance }) => {
        return Math.abs(imageRatio - ratio) <= tolerance;
      });
    
      if (!isValidRatio) {
        return {
          valid: false,
          error: "Image must have a 16:9 or 4:3 aspect ratio"
        };
      }
    
      return { valid: true };
    };

    static async pickImage() {
      try {
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          quality: 1,
          // Add these options for better validation
          exif: false,
          base64: false,
        });
    
        if (!result.canceled && result.assets.length > 0) {
          const asset = result.assets[0];
          
          // Validate the image
          const validation = this.validateImage(
            asset.width || 0,
            asset.height || 0,
            asset.fileSize
          );
    
          // if (!validation.valid) {
          //   Alert.alert(
          //     "Invalid Image",
          //     validation.error + "\n\nRecommended: 1200x675px (16:9) or 1200x900px (4:3)",
          //     [{ text: "OK" }]
          //   );
          //   return;
          // }
    
          // Image is valid, set it
          return asset.uri;
        }
      } catch (error) {
        console.error("Error picking image:", error);
        Alert.alert("Error", "Failed to select image. Please try again.");
      }
    };

    static async fetchVideoListAPI(
        accessToken: string, 
        maxCount: number = 10, 
        cursor?: number,
        fields?: string[] // fields for returned data
    ): Promise<TikTokApiResult> {
        try {
            if (!accessToken) {
                return {
                    success: false,
                    error: "TikTok access token is required"
                };
            }

            // Build query parameters
            const queryParams = new URLSearchParams();
            if (fields && fields.length > 0) {
                queryParams.append('fields', fields.join(','));
            }

            const url = `${this.CONFIG.TIKTOK_API_ENDPOINT}?${queryParams.toString()}`;
            

            // Prepare request body
            const requestBody: any = {
                max_count: Math.min(maxCount, 20) // TikTok API max is 20
            };

            if (cursor) {
                requestBody.cursor = cursor;
            } else {
                // Add cursor as null if not provided (some APIs require this)
                requestBody.cursor = null;
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                let errorText = '';
                let errorData = {};
                
                try {
                    errorText = await response.text();
                    if (errorText) {
                        errorData = JSON.parse(errorText);
                    }
                } catch (parseError) {
                    // Could not parse error response
                }
                
                return {
                    success: false,
                    error: `TikTok API error: ${response.status} - ${errorData || errorText || response.statusText}`
                };
            }

            const data = await response.json();

            if (data.error && data.error.code !== 'ok') {
                return {
                    success: false,
                    error: `TikTok API error: ${data.error.message || 'Unknown error'}`
                };
            }

            console.log("TikTok API Response Data: ", data.data);
            console.log("TikTok API Response Data videos mediaservice: ", data.data.videos[0].cover_image_url);
            


            return {
                success: true,
                data: data.data,
            };

        } catch (error: any) {
            console.error('TikTok API fetch error:', error);
            return {
                success: false,
                error: `Failed to fetch TikTok videos: ${error.message}`
            };
        }
    }

    static async getTikTokVideos(accessToken: string, maxCount: number = 10): Promise<TikTokApiResult> {
        const commonFields = [
            'id',
            'title', 
            'cover_image_url',
            'create_time',
            'duration',
            'video_description'
        ];

        return this.fetchVideoListAPI(accessToken, maxCount, undefined, commonFields);
    }

    static async saveTikTokVideo(
        videoData: {
            title: string;
            uri: string;
            videoId: string;
            description: string;
            duration: number;
            campaignId: string;
        },
        authToken: string
    ): Promise<{ success: boolean; video?: any; error?: string }> {
        try {
            const response = await fetch(`${this.CONFIG.BACKEND_ENDPOINT}/api/videos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(videoData)
            });

            const result = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    error: result.error || `HTTP ${response.status}: ${response.statusText}`
                };
            }

            return {
                success: true,
                video: result.video
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to save video'
            };
        }
    }

    static async getSavedVideosForCampaign(
        campaignId: string,
        authToken: string
    ): Promise<{ success: boolean; videos?: any[]; error?: string }> {
        try {
            const response = await fetch(`${this.CONFIG.BACKEND_ENDPOINT}/api/videos/campaign/${campaignId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                }
            });

            const result = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    error: result.error || `HTTP ${response.status}: ${response.statusText}`
                };
            }

            return {
                success: true,
                videos: result.videos
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to fetch saved videos'
            };
        }
    }

    static async deleteVideo(
        videoId: string,
        authToken: string
    ): Promise<{ success: boolean; error?: string }> {
        try {
            const response = await fetch(`${this.CONFIG.BACKEND_ENDPOINT}/api/videos/${videoId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                }
            });

            const result = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    error: result.error || `HTTP ${response.status}: ${response.statusText}`
                };
            }

            return {
                success: true
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to delete video'
            };
        }
    }

    static async getUserVideos(
        userId: string,
        campaignId: string
    ): Promise<{ success: boolean; videos?: any[]; error?: string }> {
        try {
            const response = await fetch(`${this.CONFIG.BACKEND_ENDPOINT}/api/videos/user/${userId}/campaign/${campaignId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const result = await response.json();

            console.log("User Videos Response: ", result);

            if (!response.ok) {
                return {
                    success: false,
                    error: result.error || `HTTP ${response.status}: ${response.statusText}`
                };
            }

            return {
                success: true,
                videos: result.videos
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to fetch user videos'
            };
        }
    }

    static async updateVideoBoostCode(
      videoId: string,
      boostCode: string,
      authToken: string
  ): Promise<{ success: boolean; error?: string }> {
      try {
          const response = await fetch(`${this.CONFIG.BACKEND_ENDPOINT}/api/videos/${videoId}/boost-code`, {
              method: 'PATCH',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${authToken}`
              },
              body: JSON.stringify({ boostCode })
          });

          const result = await response.json();

          if (!response.ok) {
              return {
                  success: false,
                  error: result.error || `HTTP ${response.status}: ${response.statusText}`
              };
          }

          return {
              success: true
          };
      } catch (error: any) {
          return {
              success: false,
              error: error.message || 'Failed to update boost code'
          };
      }
   }

   static async queryVideoMetrics(
      videoIds: string[],
      authToken: string
  ): Promise<{ success: boolean; metrics?: Record<string, { views: number; likes: number; shares: number; comments: number }>; error?: string }> {
      try {
          const response = await fetch(`${this.CONFIG.BACKEND_ENDPOINT}/api/videos/query-metrics`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${authToken}`
              },
              body: JSON.stringify({ videoIds })
          });

          const result = await response.json();

          if (!response.ok) {
              return {
                  success: false,
                  error: result.error || `HTTP ${response.status}: ${response.statusText}`
              };
          }

          return {
              success: true,
              metrics: result.metrics || {}
          };
      } catch (error: any) {
          return {
              success: false,
              error: error.message || 'Failed to query video metrics'
          };
      }
   }
}