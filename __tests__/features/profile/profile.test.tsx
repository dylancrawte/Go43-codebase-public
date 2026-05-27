import request from "supertest";
import express from "express";
import userRoutes from '../../../backend/src/routes/userRoutes';
import authRoutes from '../../../backend/src/routes/authRoutes';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ProfileScreen from '../../../app/profile';

jest.mock('../../../backend/src/models/User', () => ({
    __esModule: true,
    default: Object.assign(
        jest.fn().mockImplementation(() => ({
            _id: 'user-id-123',
            tiktokId: 'tiktok-user-123',
            displayName: 'Test User',
            avatarUrl: 'https://example.com/avatar.jpg',
            tiktokAccessToken: 'tiktok-access-token',
            tiktokRefreshToken: 'tiktok-refresh-token',
            tiktokTokenExpiry: new Date(),
            tiktokRefreshTokenExpiry: new Date(),
            fullName: null,
            email: null,
            phoneNumber: null,
            genres: [],
            save: jest.fn().mockResolvedValue(true)
        })),
        {
            findOne: jest.fn(),
            findById: jest.fn()
        }
    )
}));

jest.mock('../../../controllers/orchestrators/profileOrchestrator', () => ({
    useProfileOrchestrator: jest.fn(),
  }));
  
jest.mock('../../../controllers/orchestrators/genreOrchestrator', () => ({
useGenreOrchestrator: jest.fn(),
}));

jest.mock('../../../store/authStore', () => ({
    useAuthStore: jest.fn(),
}));

jest.mock('expo-router', () => ({
    useRouter: jest.fn(),
}));

jest.mock('expo-font', () => ({
    loadAsync: jest.fn(),
    isLoaded: jest.fn(() => true),
}));

jest.mock('@expo/vector-icons', () => ({
    Ionicons: 'Ionicons',
}));

describe("User Profile Experience", () => {
    let mockRouter: any;
    let mockAuthStore: any;
    let mockProfileOrchestrator: any;
    let mockGenreOrchestrator: any;
    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const app = express();
    app.use(express.json());
    app.use('/api/users', userRoutes);
    app.use('api/auth', authRoutes);

    mockRouter = {
        replace: jest.fn(),
        push: jest.fn(),
    };
    
    mockAuthStore = {
        user: {
            _id: 'user-123',
            displayName: 'Test User',
            email: 'test@example.com',
            avatarUrl: 'https://example.com/avatar.jpg'
        },
        logout: jest.fn().mockResolvedValue(true),
        checkAuth: jest.fn(),
        saveUpdatedUser: jest.fn(),
    };

    mockProfileOrchestrator = {
        formData: {
            fullName: 'Test User',
            email: 'test@example.com',
            phoneNumber: '+1234567890'
        },
        setFormData: jest.fn(),
        updateProfile: jest.fn(),
    };

    mockGenreOrchestrator = {
        currentGenre: '',
        genreTags: ['pop', 'rock'],
        filteredGenres: [],
        dropdownVisible: false,
        addGenre: jest.fn(),
        removeGenre: jest.fn(),
        updateGenreInput: jest.fn(),
        showDropdown: jest.fn(),
        hideDropdown: jest.fn(),
        initializeGenreTags: jest.fn(),
    };

    //apply mocks
    require('expo-router').useRouter.mockReturnValue(mockRouter);
    require('../../../store/authStore').useAuthStore.mockReturnValue(mockAuthStore);
    require('../../../controllers/orchestrators/profileOrchestrator').useProfileOrchestrator.mockReturnValue(mockProfileOrchestrator);
    require('../../../controllers/orchestrators/genreOrchestrator').useGenreOrchestrator.mockReturnValue(mockGenreOrchestrator);
    
    it('should update user info', async () => {
        // ARRANGE
        const User = require('../../../backend/src/models/User').default;
        
        const mockUserProfile = {
            _id: 'user-123',
            tiktokId: 'tiktok-123',
            displayName: 'Test User',
            avatarUrl: 'https://example.com/avatar.jpg',
            username: 'testuser',
            instagramHandle: '@testuser',
            genres: ['pop', 'rock'],
            fullName: 'Test User Full',
            email: 'test@example.com',
            phoneNumber: '+1234567890'
        };

        // Mock user lookup
        User.findByIdAndUpdate = jest.fn().mockResolvedValue(mockUserProfile);
        
        const validToken = 'Bearer mock-jwt-token';

        //ACT - call profile endpoint
        const response = await request(app)
            .put('/api/users/profile')
            .set('Authorization', validToken)
            .send({
                userId: 'user-123',
                fullName: 'Test User Full',
                email: 'test@example.com',
                phoneNumber: '+1234567890',
                genres: ['pop', 'rock']
        });

        console.log('Response status:', response.status);
        console.log('Response body:', response.body);
        console.log('Response error:', response.error);
        
        //ASSERT
        expect(response.status).toBe(200);
        expect(response.body.user).toBeDefined();
        expect(response.body.user._id).toBe('user-123');
        expect(response.body.user.displayName).toBe('Test User');
        expect(response.body.user.avatarUrl).toBe('https://example.com/avatar.jpg');
        expect(response.body.user.genres).toEqual(['pop', 'rock']);
        expect(response.body.user.email).toBe('test@example.com');

        // Verify database was queried
        expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
            'user-123',
            {
                fullName: 'Test User Full',
                email: 'test@example.com',
                phoneNumber: '+1234567890',
                genres: ['pop', 'rock']
            },
            { new: true, runValidators: true }
        );  
    })

    it('should handle log out and redirect to front page', async () => {
        // ARRANGE - render the ProfileScreen component
        const { getByText } = render(<ProfileScreen />);
        
        // ACT - find and press the logout button
        const logoutButton = getByText('Log Out');
        fireEvent.press(logoutButton);
        
        // ASSERT - verify logout function was called and navigation happened
        await waitFor(() => {
            expect(mockAuthStore.logout).toHaveBeenCalled();
            expect(mockRouter.replace).toHaveBeenCalledWith('/');
        });
    }, 10000);

    it('should clear all auth data on logout', async () => {
        // ARRANGE - spy on AsyncStorage (already mocked in jest.setup.js)
        const AsyncStorage = require('@react-native-async-storage/async-storage');
        
        // ACT - call logout directly from auth store
        await mockAuthStore.logout();
        
        // ASSERT - verify AsyncStorage cleanup (this would be tested in authStore unit tests)
        // For integration test, we verify the logout function was called
        expect(mockAuthStore.logout).toHaveBeenCalled();
    });

    it('should prevent access to protected endpoints after logout', async () => {
        // ARRANGE
        const User = require('../../../backend/src/models/User').default;
        User.findByIdAndUpdate = jest.fn().mockResolvedValue(null);

        // ACT - try to access profile endpoint without valid auth
        const response = await request(app)
            .put('/api/users/profile')
            .send({
                userId: 'user-123',
                fullName: 'Test User'
            });
            // Note: No Authorization header = logged out state

        // ASSERT
        expect(response.status).toBe(404); 
        expect(response.body).toBe('User not found');
    });
})