import request from 'supertest';
import express from 'express';
import authRoutes from '../../../backend/src/routes/authRoutes';

//mock modules
jest.mock('@/controllers/services/loginServices');
jest.mock('@/store/authStore');

jest.mock('jsonwebtoken', () => ({
    sign: jest.fn().mockReturnValue('mock-jwt-token')
}));


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
            findOne: jest.fn()
        }
    )
}));

jest.mock('axios');

// Create minimal test app
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.TIKTOK_CLIENT_KEY = 'test-client-key'; 
    process.env.TIKTOK_CLIENT_SECRET = 'test-client-secret';
    process.env.REDIRECT_URI = 'http://localhost:3000/callback';
    process.env.FRONTEND_URL = 'http://localhost:3000';
});

describe('User Login Experience', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    })

    it('should redirect to callback URI with correct OAuth parameters', async () => {
        //ARRANGE
        const code_verifier = 'test-code-verifier-123';
        const csrfState = 'test-csrf-state-456';

        //ACT - Call start endpoint
        const response = await request(app)
        .get('/api/auth/oauth/start')
        .query({ 
            code_verifier: code_verifier,
            csrfState: csrfState 
        });

        //ASSERT 
        //check redirect URL
        expect(response.status).toBe(302);
        expect(response.headers.location).toBeDefined(); 

        const redirectUrl = new URL(response.headers.location);

        // Verify TikTok OAuth URL
        expect(redirectUrl.hostname).toBe('www.tiktok.com');
        expect(redirectUrl.pathname).toBe('/v2/auth/authorize/');

        // Verify OAuth parameters
        expect(redirectUrl.searchParams.get('client_key')).toBe(process.env.TIKTOK_CLIENT_KEY);
        expect(redirectUrl.searchParams.get('scope')).toBe('user.info.basic,video.publish,video.upload,user.info.profile,user.info.stats');
        expect(redirectUrl.searchParams.get('response_type')).toBe('code');
        expect(redirectUrl.searchParams.get('redirect_uri')).toBe(process.env.REDIRECT_URI);
        expect(redirectUrl.searchParams.get('state')).toBe(csrfState);
        expect(redirectUrl.searchParams.get('code_challenge')).toBeTruthy();
        expect(redirectUrl.searchParams.get('code_challenge_method')).toBe('S256');
    });

    it('should redirect to frontend with code and state', async () => {
        //ARRANGE
        const authCode = 'auth-code-from-tiktok-123';
        const stateParam = 'csrf-state-456';

        //ACT - callback endpoint
        const response = await request(app)
        .get('/api/auth/oauth/callback')
        .query({
            code: authCode,
            state: stateParam
        });

        //ASSERT
        // Check redirect status
        expect(response.status).toBe(302);
        expect(response.headers.location).toBeDefined();

        // Parse the redirect URL
        const redirectUrl = new URL(response.headers.location);
        
        // Verify frontend redirect
        expect(redirectUrl.hostname).toBe('localhost'); // Adjust based on your FRONTEND_URL
        expect(redirectUrl.pathname).toBe('/--/tiktok-callback');
        
        // Verify parameters are preserved
        expect(redirectUrl.searchParams.get('code')).toBe(authCode);
        expect(redirectUrl.searchParams.get('state')).toBe(stateParam);
    });

    it('should exchange tiktok auth code for session token', async () => {
        //ARRANGE
        const axios = require('axios');
        const User = require('../../../backend/src/models/User').default;

        User.findOne.mockResolvedValue(null); // New user
        
        const requestBody = {
            code: 'auth-code-123',
            code_verifier: 'code-verifier-xyz'
        };

        //mock tiktok token exchange response
        const mockTokenResponse = {
            data: {
                access_token: 'tiktok-access-token',
                refresh_token: 'tiktok-refresh-token',
                expires_in: 86400,
                open_id: 'tiktok-user-123',
                refresh_expires_in: 31536000
            }
        };

        //mock tiktok user info response
        const mockUserInfoResponse = {
            data: {
                data: {
                    user: {
                        display_name: 'Test User',
                        avatar_url: 'https://example.com/avatar.jpg'
                    }
                }
            }
        }

        //mock user database operations
        const mockUser = {
            _id: 'user-id-123',
            tiktokId: 'tiktok-user-123',
            displayName: 'Test User',
            avatarUrl: 'https://example.com/avatar.jpg',
            save: jest.fn().mockResolvedValue(true)
        };

        // Setup mocks
        axios.post.mockResolvedValueOnce(mockTokenResponse);
        axios.get.mockResolvedValueOnce(mockUserInfoResponse);
        

        //ACT - Call exchange endpoint
        const response = await request(app)
            .post('/api/auth/oauth/exchange')
            .send(requestBody);

        //ASSERT
        expect(response.status).toBe(200);
        expect(response.body.token).toBeDefined(); // JWT token
        expect(response.body.user).toBeDefined();
        expect(response.body.user._id).toBe('user-id-123');
        expect(response.body.user.displayName).toBe('Test User');
        expect(response.body.tiktokTokenExpiry).toBeDefined();

        // Verify API calls were made
        expect(axios.post).toHaveBeenCalledWith(
            'https://open.tiktokapis.com/v2/oauth/token/',
            expect.any(String),
            expect.objectContaining({
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            })
        );

        expect(axios.get).toHaveBeenCalledWith(
            'https://open.tiktokapis.com/v2/user/info/',
            expect.objectContaining({
                headers: { 'Authorization': 'Bearer tiktok-access-token' }
            })
        );
    });

    it('should return 400 when required parameters are missing from exchange endpoint', async () => {
        //test missing code parameter
        const responseNoCode = await request(app)
        .post('/api/auth/oauth/exchange')
        .send({
            code_verifier: 'test-code-verifier'
        });

        expect(responseNoCode.status).toBe(400);
        expect(responseNoCode.body.message).toBe('Missing code or code_verifier');

        // Test missing code_verifier parameter
        const responseNoCodeVerifier = await request(app)
        .post('/api/auth/oauth/exchange')
        .send({
            code: 'test-auth-code'
        });

        expect(responseNoCodeVerifier.status).toBe(400);
        expect(responseNoCodeVerifier.body.message).toBe('Missing code or code_verifier');

        // Test missing both parameters
        const responseNoBoth = await request(app)
            .post('/api/auth/oauth/exchange')
            .send({});

        expect(responseNoBoth.status).toBe(400);
        expect(responseNoBoth.body.message).toBe('Missing code or code_verifier');

        // Test with empty strings
        const responseEmptyStrings = await request(app)
            .post('/api/auth/oauth/exchange')
            .send({
                code: '',
                code_verifier: ''
            });

        expect(responseEmptyStrings.status).toBe(400);
        expect(responseEmptyStrings.body.message).toBe('Missing code or code_verifier');
    });
});