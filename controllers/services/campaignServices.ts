import { Campaign } from '@/app/types'
import { campaignsAPI } from '../api/campaignsAPI';

export class CampaignService {

  static async fetchCampaigns() : Promise<Campaign[]> {
    const response = await campaignsAPI.fetchCampaignsAPI();
    
    try {
        return this.validateCampaignsData(response.data);
    } catch (validationError) {
        console.error('Campaign data validation failed:', validationError);
        throw new Error('Invalid campaign data received from server');
    }
  }

  static async fetchCampaignById(id: string): Promise<Campaign> {
    const res = await campaignsAPI.fetchCampaignByIdAPI(id);
    return res.data.campaign;
  }

  static async updateCampaign(id: string, payload: Partial<Campaign>): Promise<{ success: boolean, data: Campaign | null, error: string | null }> {
    return await campaignsAPI.updateCampaignAPI(id, payload);
  }

  static async deleteCampaign(id: string): Promise<{ success: boolean }> {
    return await campaignsAPI.deleteCampaignAPI(id);
  }

  static validateCampaignsData(data: any): Campaign[] {
    if (!data || typeof data !== 'object') {
        throw new Error('Invalid data format');
      }
      
      if (!data.campaigns) {
        throw new Error('No campaigns property in response');
      }
      
      if (!Array.isArray(data.campaigns)) {
        throw new Error('Campaigns is not an array');
      }
      
      return data.campaigns;
  }
  
  static async fetchCampaignsByBusinessId(businessId: string): Promise<Campaign[]> {
    const response = await campaignsAPI.fetchCampaignsByBusinessIdAPI(businessId);
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch campaigns by business ID');
    }
    return response.data;
  }
}