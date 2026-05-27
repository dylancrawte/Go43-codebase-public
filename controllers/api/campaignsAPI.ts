import { Campaign } from "@/app/types";

export class campaignsAPI {
    private static readonly CAMPAIGNS_API_ENDPOINT = `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/campaign`

    static async fetchCampaignsAPI() {
        try {
            const response = await fetch(`${this.CAMPAIGNS_API_ENDPOINT}`);
            
            if (!response.ok) {
                return {
                    success: false,
                    data: null,
                    error: `HTTP error! status: ${response.status}`
                };
            }
            
            const data = await response.json();
            return {
                success: true,
                data: data,
                error: null
            };
        } catch (error: any) {
            return {
                success: false,
                data: null,
                error: error.message
            };
        }
    }

    static async fetchCampaignByIdAPI(id: string) {
        try {
            const response = await fetch(`${this.CAMPAIGNS_API_ENDPOINT}/${id}`);

            if (!response.ok) {
                return {
                    success: false,
                    data: null,
                    error: `HTTP error! status: ${response.status}`
                };
            }
            
            const data = await response.json();
            return {
                success: true,
                data: data,
                error: null
            }
        } catch (error: any) {
            return {
                success: false,
                data: null,
                error: error.message
            };
        }
    }

    static async updateCampaignAPI(id: string, payload: Partial<Campaign>) {
        try {
            const response = await fetch(`${this.CAMPAIGNS_API_ENDPOINT}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                return {
                    success: false,
                    data: null,
                    error: `HTTP error! status: ${response.status}`
                };
            }

            const data = await response.json();
            return {
                success: true,
                data: data,
                error: null
            };
        } catch (error: any) {
            return {
                success: false,
                data: null,
                error: error.message
            };
        }
    }

    static async deleteCampaignAPI(id: string) {
        try {
            const response = await fetch(`${this.CAMPAIGNS_API_ENDPOINT}/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                return {
                    success: false,
                    data: null,
                    error: `HTTP error! status: ${response.status}`
                };
            }

            const data = await response.json();
            return {
                success: true,
                data: data,
                error: null
            };
        } catch (error: any) {
            return {
                success: false,
                data: null,
                error: error.message
            };
        }
    }

    static async fetchCampaignsByBusinessIdAPI(businessId: string) {
        try {
            const response = await fetch(`${this.CAMPAIGNS_API_ENDPOINT}/business/${businessId}`);
            if (!response.ok) {
                return {
                    success: false,
                    data: null,
                    error: `HTTP error! status: ${response.status}`
                };
            }
            const data = await response.json();
            return {
                success: true,
                data: data.campaigns,
                error: null
            };
        } catch (error: any) {
            return {
                success: false,
                data: null,
                error: error.message || 'Failed to fetch campaigns'
            };
        }
    }
}