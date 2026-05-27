import axios, { AxiosError } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export class loginAPIs {
    private static readonly AUTH_ENDPOINT = `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/auth`;
    static async exchangeEndpoint(code: string | string[], code_verifier: string | null) {
        const response = await axios.post(
            `${this.AUTH_ENDPOINT}/oauth/exchange`,
            {
                code,
                code_verifier,
            }
        );
        return response;
    }

    static async refreshTokens() {
        const token = await AsyncStorage.getItem('token');
        
        if (!token) {
            throw new Error('No auth token found');
        }

        try {
            const response = await axios.post(
                `${this.AUTH_ENDPOINT}/refresh`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            return response;
        } catch (error) {
            // Only log if it's not a common 401 error
            if (error instanceof AxiosError) {
                console.log('Refresh API error:', error.response?.status, error.response?.data);
            }
            throw error;
        }
    }
}