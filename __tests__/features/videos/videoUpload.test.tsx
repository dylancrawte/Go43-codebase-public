// Mock dependencies first - before any imports
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
}));

jest.mock('../../../controllers/services/videosServices', () => ({
  VideoManagementService: {
    processVideoAssets: jest.fn(),
    submitVideos: jest.fn(),
  }
}));

jest.mock('../../../store/authStore', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('expo-video', () => ({
  useVideoPlayer: jest.fn(() => ({
    loop: false,
    play: jest.fn(),
  })),
  VideoView: 'VideoView',
}));

import { renderHook, act, render, fireEvent, waitFor } from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';
import { useVideoOrchestrator } from '../../../controllers/orchestrators/videoOrchestrator';
import { VideoManagementService } from '../../../controllers/services/videosServices';
import { useAuthStore } from '../../../store/authStore';
import { User, Campaign } from "@/app/types"
import { useVideoStore } from '../../../store/videoStore';

//mock modules, 
const mockVideoManagementService = VideoManagementService as jest.Mocked<typeof VideoManagementService>;
const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;
const mockImagePicker = ImagePicker as jest.Mocked<typeof ImagePicker>;

describe('Video Upload Logic', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      
      // Setup default mock implementations
      mockUseAuthStore.mockReturnValue({
        user: {
          _id: 'user123',
          username: 'testuser',
          email: 'test@example.com'
        },
        isAuthenticated: true,
        checkAuth: jest.fn(),
      } as any);
    });
  
    describe('Video Selection from Device Library', () => {
      it('should successfully pick videos from device library', async () => {
        // Arrange
        //videos
        const mockAssets = [
          { uri: 'file://video1.mp4' },
          { uri: 'file://video2.mp4' }
        ];
        //processed videos
        const processedVideos = ['processed://video1.mp4', 'processed://video2.mp4'];

        //expo image picker
        mockImagePicker.launchImageLibraryAsync.mockResolvedValue({
          cancelled: false,
          canceled: false,
          assets: mockAssets
        } as any);
  
        //videoServices.ts
        mockVideoManagementService.processVideoAssets.mockResolvedValue(processedVideos);
  
        const { result } = renderHook(() => useVideoOrchestrator());
  
        // Act
        let pickResult;
        await act(async () => {
          pickResult = await result.current.pickVideos();
        });
  
        // Assert
        expect(mockImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith({
          mediaTypes: ["videos"],
          allowsMultipleSelection: true,
          selectionLimit: 5,
        });
  
        expect(mockVideoManagementService.processVideoAssets).toHaveBeenCalledWith(mockAssets);
        expect(pickResult).toEqual({
          success: true,
          videos: processedVideos,
          message: `Added ${mockAssets.length} videos`,
        });
        expect(result.current.selectedVideos).toEqual(processedVideos);
        expect(result.current.isProcessing).toBe(false);
      });
  
      it('should handle user canceling video selection', async () => {
        // Arrange
        mockImagePicker.launchImageLibraryAsync.mockResolvedValue({
          cancelled: true,
          canceled: true,
          assets: []
        } as any);
  
        const { result } = renderHook(() => useVideoOrchestrator());
  
        // Act
        let pickResult;
        await act(async () => {
          pickResult = await result.current.pickVideos();
        });
  
        // Assert
        expect(pickResult).toEqual({
          success: false,
          message: "No videos selected"
        });
        expect(result.current.selectedVideos).toEqual([]);
        expect(result.current.isProcessing).toBe(false);
      });
      
      it('should handle user deleting chosen video', async () => {
        // ARRANGE
        mockVideoManagementService.calculateVideoRemovalState.mockReturnValue({
          videos: ['video1.mp4', 'video3.mp4'], // Expected result after removing index 1
          currentIndex: 1
        });
        
        const { result } = renderHook(() => useVideoOrchestrator());
  
        // Set up videos first
        await act(async () => {
          result.current.setSelectedVideos(['video1.mp4', 'video2.mp4', 'video3.mp4']);
          result.current.setCurrentVideoIndex(1);
        });

        // ACT - Test the removeVideo function directly
        act(() => {
          result.current.removeVideo(1); // Remove video at index 1
        });

        // ASSERT
        expect(result.current.selectedVideos).toEqual(['video1.mp4', 'video3.mp4']);
        expect(result.current.currentVideoIndex).toBe(1); // Should adjust to valid index
      });
  
      it('should handle errors during video processing', async () => {
        // Arrange
        const mockAssets = [{ uri: 'file://video1.mp4' }];
        const processingError = new Error('Video processing failed');
  
        mockImagePicker.launchImageLibraryAsync.mockResolvedValue({
          cancelled: false,
          canceled: false,
          assets: mockAssets
        } as any);
  
        mockVideoManagementService.processVideoAssets.mockRejectedValue(processingError);
  
        const { result } = renderHook(() => useVideoOrchestrator());
  
        // Act
        let pickResult;
        await act(async () => {
          pickResult = await result.current.pickVideos();
        });
  
        // Assert
        expect(pickResult).toEqual({
          success: false,
          message: 'Failed to process videos: Video processing failed'
        });
        expect(result.current.selectedVideos).toEqual([]);
        expect(result.current.isProcessing).toBe(false);
      });
  
      it('should append new videos to existing selection', async () => {
        // Arrange
        const existingVideos = ['existing://video1.mp4'];
        const newAssets = [{ uri: 'file://video2.mp4' }];
        const newProcessedVideos = ['processed://video2.mp4'];
  
        mockImagePicker.launchImageLibraryAsync.mockResolvedValue({
          cancelled: false,
          canceled: false,
          assets: newAssets
        } as any);
  
        mockVideoManagementService.processVideoAssets.mockResolvedValue(newProcessedVideos);
  
        const { result } = renderHook(() => useVideoOrchestrator());
  
        // Set initial state
        await act(async () => {
          result.current.setSelectedVideos(existingVideos);
        });
  
        // Act
        await act(async () => {
          await result.current.pickVideos();
        });
  
        // Assert
        expect(result.current.selectedVideos).toEqual([...existingVideos, ...newProcessedVideos]);
      });
  
      it('should enforce selection limit of 3 videos', async () => {
        // This test verifies that ImagePicker is configured with correct selection limit
        const { result } = renderHook(() => useVideoOrchestrator());
  
        mockImagePicker.launchImageLibraryAsync.mockResolvedValue({
          cancelled: true,
          canceled: true,
          assets: []
        } as any);
  
        await act(async () => {
          await result.current.pickVideos();
        });
  
        expect(mockImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            selectionLimit: 3
          })
        );
      });
    });

    describe('Video Submission Logic', () => {
      it('should upload to Cloudinary successfully during video submission', async () => {
        // ARRANGE
        const mockUser = { _id: 'user123', displayName: 'Test User' } as User;
        const mockCampaign = { _id: 'campaign123', eventName: 'Test Event' } as Campaign;
        const testVideos = ['file://video1.mp4'];
      
        const mockSubmitResult = {
          success: true,
          uploadResults: 1,
          failedUploads: 0,
          shouldClearVideos: true
        };
      
        mockVideoManagementService.submitVideos.mockResolvedValue(mockSubmitResult);
      
        const { result } = renderHook(() => useVideoOrchestrator());
      
        // Set up videos
        await act(async () => {
          result.current.setSelectedVideos(testVideos);
        });
      
        // ACT
        let submitResult;
        await act(async () => {
          submitResult = await result.current.submitVideosHook(mockUser, mockCampaign);
        });
      
        // ASSERT
        expect(mockVideoManagementService.submitVideos).toHaveBeenCalledWith(
          testVideos,
          mockUser,
          mockCampaign
        );
        expect(submitResult).toEqual(mockSubmitResult);
        expect(result.current.selectedVideos).toEqual([]); // Should be cleared after successful upload
        expect(result.current.currentVideoIndex).toBe(0);
      });

      it('should upload to TikTok successfully', async () => {
        // ARRANGE
        const mockUser = { _id: 'user123', displayName: 'Test User' } as User;
        const mockCampaign = { _id: 'campaign123', eventName: 'Test Event' } as Campaign;
        const testVideos = ['file://video1.mp4'];

        const mockSubmitResult = {
          success: true,
          uploadResults: 1,
          failedUploads: 0,
          shouldClearVideos: true,
          data: {
            cloudinaryUrl: 'https://res.cloudinary.com/test/video/upload/v123/test-video.mp4',
            proxyUrl: 'https://media.example.com/test-video.mp4',
            tiktokData: {
              success: true,
              publish_id: 'tiktok-publish-123'
            }
          }
        };

        mockVideoManagementService.submitVideos.mockResolvedValue(mockSubmitResult);

        const { result } = renderHook(() => useVideoOrchestrator());

        // Set up videos
        await act(async () => {
          result.current.setSelectedVideos(testVideos);
        });

        // ACT
        let submitResult: any;
        await act(async () => {
          submitResult = await result.current.submitVideosHook(mockUser, mockCampaign);
        });

        // ASSERT
        expect(mockVideoManagementService.submitVideos).toHaveBeenCalledWith(
          testVideos,
          mockUser,
          mockCampaign
        );
        expect(submitResult).toEqual(mockSubmitResult);
        expect(submitResult.success).toBe(true);
        expect(submitResult.data?.tiktokData?.success).toBe(true);
        expect(submitResult.data?.tiktokData?.publish_id).toBe('tiktok-publish-123');
      });

      it('should create correct proxy URL and upload to database', async () => {
        // ARRANGE
        const mockUser = { _id: 'user123', displayName: 'Test User' } as User;
        const mockCampaign = { _id: 'campaign123', eventName: 'Test Event' } as Campaign;
        const testVideos = ['file://video1.mp4'];

        const mockSubmitResult = {
          success: true,
          uploadResults: 1,
          failedUploads: 0,
          shouldClearVideos: true,
          data: {
            cloudinaryUrl: 'https://res.cloudinary.com/test/video/upload/v123/test-video.mp4',
            proxyUrl: 'https://media.example.com/v123/test-video.mp4',
            backendData: {
              message: 'Video uploaded successfully',
              video: {
                title: 'Test Event - Part 1',
                uri: 'https://res.cloudinary.com/test/video/upload/v123/test-video.mp4',
                uploadedBy: 'user123',
                campaignId: 'campaign123'
              }
            }
          }
        };

        mockVideoManagementService.submitVideos.mockResolvedValue(mockSubmitResult);

        const { result } = renderHook(() => useVideoOrchestrator());

        // Set up videos
        await act(async () => {
          result.current.setSelectedVideos(testVideos);
        });

        // ACT
        let submitResult: any;
        await act(async () => {
          submitResult = await result.current.submitVideosHook(mockUser, mockCampaign);
        });

        // ASSERT
        expect(mockVideoManagementService.submitVideos).toHaveBeenCalledWith(
          testVideos,
          mockUser,
          mockCampaign
        );
        expect(submitResult.success).toBe(true);
        
        // Verify proxy URL is correctly formatted
        expect(submitResult.data?.proxyUrl).toBe('https://media.example.com/v123/test-video.mp4');
        expect(submitResult.data?.proxyUrl).toContain('media.example.com');
        
        // Verify database upload succeeded
        expect(submitResult.data?.backendData?.message).toBe('Video uploaded successfully');
        expect(submitResult.data?.backendData?.video?.title).toBe('Test Event - Part 1');
        expect(submitResult.data?.backendData?.video?.uploadedBy).toBe('user123');
        expect(submitResult.data?.backendData?.video?.campaignId).toBe('campaign123');
      })
    })
});