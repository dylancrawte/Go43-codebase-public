import { waitFor, render, fireEvent, renderHook, act } from "@testing-library/react-native";
import { useCampaignOrchestrator } from "@/controllers/orchestrators/campaignOrchestrator";
import ExploreScreen from '@/app/(fan)/explore';
import { useBookingOrchestrator } from "@/controllers/orchestrators/bookingOrchestrator";

//mock modules
jest.mock('@/controllers/orchestrators/campaignOrchestrator');

// Mock fetch API for HTTP requests
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Mock Expo modules
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient'
}));

jest.mock('expo-video', () => ({
  useVideoPlayer: jest.fn(),
  VideoView: 'VideoView'
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: 'SafeAreaView'
}));

jest.mock('@expo/vector-icons/MaterialIcons', () => 'MaterialIcons');

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: { Images: 'Images', Videos: 'Videos' }
}));

describe("User Booking Experience", () => {

  const mockUserId = 'user123';
  const mockCampaignId = 'campaign456';
  const mockBookingId = 'booking789';

  //LOCAL ARRANGE
  //mock campaigns
  const mockCampaigns = [
    {
        _id: 'campaign1',
        eventName: 'Summer Music Festival',
        date: '2024-07-15',
        time: '7:00 PM',
        artist: 'Artist One',
        genreTags: ['Pop', 'Electronic'],
        location: 'Central Park',
        brief: 'Amazing summer festival',
        image: 'https://example.com/image1.jpg',
        numberOfCreators: '5',
        contentDeliveryDeadline: '2024-07-20'
    },
    {
        _id: 'campaign2',
        eventName: 'Jazz Night',
        date: '2024-08-10',
        time: '8:30 PM',
        artist: 'Jazz Ensemble',
        genreTags: ['Jazz'],
        location: 'Blue Note',
        brief: 'Intimate jazz performance',
        image: 'https://example.com/image2.jpg',
        numberOfCreators: '3',
        contentDeliveryDeadline: '2024-08-15'
    }
  ];

  const mockFetchCampaigns = jest.fn();

  //mock campaign orchestrator 
  (useCampaignOrchestrator as jest.Mock).mockReturnValue({
    campaigns: mockCampaigns,
    isLoading: false,
    fetchCampaigns: mockFetchCampaigns
  })

  beforeEach(() => {
      jest.clearAllMocks();
      mockFetch.mockClear();
  })

  it('should fetch all campaigns', async () => {
    //ARRANGE - mock successful fetch
    mockFetchCampaigns.mockResolvedValue({
      success: true,
      message: "Campaigns loaded successfully",
      data: mockCampaigns
    });

    //ACT
    const { result } = renderHook(() => useCampaignOrchestrator());

    const response = await result.current.fetchCampaigns();

    //ASSERT
    expect(mockFetchCampaigns).toHaveBeenCalled();
    expect(response.success).toBe(true);
    expect(response.message).toBe("Campaigns loaded successfully");
  });

  it('should display all campaigns on explore page', async () => {
    //ACT - render explore screen
    const { getByText } = render(<ExploreScreen />);

    // Assert - Check campaigns are displayed
    await waitFor(() => {
      expect(getByText('Summer Music Festival')).toBeTruthy();
      expect(getByText('Jazz Night')).toBeTruthy();
      expect(getByText('Central Park')).toBeTruthy();
      expect(getByText('Blue Note')).toBeTruthy();
      expect(getByText('Pop')).toBeTruthy();
      expect(getByText('Electronic')).toBeTruthy();
      expect(getByText('Jazz')).toBeTruthy();
    });

    expect(useCampaignOrchestrator).toHaveBeenCalled();
  });

  it('should render both BottomModals when clicking on eventscards with campaign details', async () => {
    //ACT - rnder explore and click on EventCard
    const { getByText } = render(<ExploreScreen />);
    const eventCard = getByText('Summer Music Festival');
    fireEvent.press(eventCard);

    //ASSERT
    await waitFor(() => {
      // Only title is visible on both modals currently
      expect(getByText('Amazing summer festival')).toBeTruthy();
    });
  });

  it('should successfully create a booking', async () => {
    //ARRANGE
    // Mock fetch response for successful booking creation
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        booking: {
          _id: mockBookingId,
          userID: mockUserId,
          campaignID: mockCampaignId
        }
      })
    } as Response);

    //ACT 
    const { result } = renderHook(() => useBookingOrchestrator(mockUserId));
    let bookingResult: any;
    await act(async () => {
        bookingResult = await result.current.confirmBooking(mockUserId, 'campaign1');
    });

    //ASSERT
    expect(mockFetch).toHaveBeenCalledWith(
      `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/bookings/create`,
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userID: mockUserId, campaignID: 'campaign1' })
      })
    );
    expect(bookingResult.success).toBe(true);
    expect(bookingResult.message).toBe("Booking confirmed");
  });

  it('should handle booking creation validation errors', async () => {
    //ARRANGE
    // Mock fetch response for validation failure
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({
        success: false,
        error: 'Campaign not found'
      })
    } as Response);

    //ACT 
    const { result } = renderHook(() => useBookingOrchestrator(mockUserId));
    let bookingResult: any;
    await act(async () => {
        bookingResult = await result.current.confirmBooking(mockUserId, 'invalidCampaign');
    });

    //ASSERT
    expect(mockFetch).toHaveBeenCalledWith(
      `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/bookings/create`,
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userID: mockUserId, campaignID: 'invalidCampaign' })
      })
    );
    expect(bookingResult.success).toBe(false);
    expect(bookingResult.message).toBe('Campaign not found');
  });

  it('should fetch and display users current bookings', async () => {
    //ARRANGE
    const mockBookingsResponse = {
      success: true,
      bookings: [
        {
          _id: 'booking123',
          userID: mockUserId,
          campaignID: mockCampaigns[0]
        },
        {
          _id: 'booking456',
          userID: mockUserId,
          campaignID: mockCampaigns[1]
        }
      ]
    };

    // Mock fetch response for fetching user bookings
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockBookingsResponse)
    } as Response);

    //ACT
    const { result } = renderHook(() => useBookingOrchestrator(mockUserId));
    
    await waitFor(() => {
        expect(result.current.isFetching).toBe(false);
    });

    //ASSERT
    // HTTP request verification
    expect(mockFetch).toHaveBeenCalledWith(
      `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/bookings/user/${mockUserId}`
    );
    
    // Data transformation verification
    expect(result.current.confirmedBookings).toEqual({
      'campaign1': mockCampaigns[0],
      'campaign2': mockCampaigns[1]
    });
    expect(result.current.bookingIds).toEqual({
      'campaign1': 'booking123',
      'campaign2': 'booking456'
    });
    
    // Specific booking details
    expect(result.current.confirmedBookings['campaign1'].eventName).toBe('Summer Music Festival');
    expect(result.current.confirmedBookings['campaign2'].eventName).toBe('Jazz Night');
    
    // Count verification
    expect(Object.keys(result.current.confirmedBookings)).toHaveLength(2);
    expect(Object.keys(result.current.bookingIds)).toHaveLength(2);
    
    // Loading state
    expect(result.current.isFetching).toBe(false);
  });

  it('should handle network errors when fetching bookings', async () => {
    //ARRANGE
    // Mock fetch to throw network error
    mockFetch.mockRejectedValue(new Error('Network error'));

    //ACT
    const { result } = renderHook(() => useBookingOrchestrator(mockUserId));
    
    await waitFor(() => {
        expect(result.current.isFetching).toBe(false);
    });

    //ASSERT
    expect(mockFetch).toHaveBeenCalledWith(
      `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/bookings/user/${mockUserId}`
    );
    
    // Should have empty bookings on error
    expect(result.current.confirmedBookings).toEqual({});
    expect(result.current.bookingIds).toEqual({});
    expect(result.current.isFetching).toBe(false);
  });
});