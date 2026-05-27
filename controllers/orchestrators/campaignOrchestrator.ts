import { useState, useEffect } from "react";
import { Campaign } from "@/app/types";
import { CampaignService } from "../services/campaignServices";
import { Alert } from "react-native";
import { MediaService } from "../services/mediaServices";

export const useCampaignOrchestrator = (initialData?: { image?: string }) => {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [isFetchingCampaigns, setIsFetchingCampaigns] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const [isImageUploading, setIsImageUploading] = useState(false);

    const [image, setImage] = useState(initialData?.image);

    useEffect(() => {
        fetchCampaigns(); 
    }, []);

    // pull to refresh
    const onRefresh = async () => {
        setRefreshing(true);
        await fetchCampaigns();
        setRefreshing(false);
    };

    const fetchCampaigns = async () => {
        setIsFetchingCampaigns(true);
        try {
            const data = await CampaignService.fetchCampaigns();
            setCampaigns(data);
            return { 
                success: true, 
                message: "Campaigns loaded successfully", 
                data 
            };
        } catch (error: any) {
            return {
                success: false, 
                message: "Failed to load campaigns", 
                error: error.message 
            }
        } finally {
            setIsFetchingCampaigns(false);
        }
    };

    const fetchCampaignsByBusinessIdOrch = async (businessId: string) => {
        setIsFetchingCampaigns(true);
        try {
            const data = await CampaignService.fetchCampaignsByBusinessId(businessId);
            setCampaigns(data);
            return { success: true, message: "Campaigns loaded successfully", data: data };
        } catch (error: any) {
            return { success: false, message: "Failed to load campaigns", error: error.message };
        } finally {
            setIsFetchingCampaigns(false);
        }
    };

    const fetchCampaignById = async (id: string) => {
        try {
            const campaign = await CampaignService.fetchCampaignById(id);
            return { success: true, data: campaign, error: null };
        } catch (error: any) {
            return { success: false, data: null, error: error.message || "Failed to fetch campaign" };
        }
    };

    const updateCampaign = async (id: string, payload: Partial<Campaign>) => {
        try {
            const result = await CampaignService.updateCampaign(id, payload);
            return { success: true, data: result.data, error: null };
        } catch (error: any) {
            return { success: false, data: null, error: error.message || "Failed to update campaign" };
        }
    };

    const deleteCampaign = async (id: string) => {
        try {
            const result = await CampaignService.deleteCampaign(id);
            return { success: result.success, data: null, error: result.success ? null : "Failed to delete campaign" };
        } catch (error: any) {
            return { success: false, data: null, error: error.message || "Failed to delete campaign" };
        }
    };

    const pickImageOrch = async () => {
        try {
            setIsImageUploading(true);
            const result = await MediaService.pickImage();
            const cloudResult = await MediaService.uploadImageToCloudinary(result);
            if (cloudResult.success) {
                setImage(cloudResult.data?.url);
            }
            } catch (error) {
            console.error('Error uploading image:', error);
            Alert.alert('Error', 'Failed to upload image');
            } finally {
            setIsImageUploading(false);
            }
    }

    return {
        campaigns,
        isFetchingCampaigns,
        fetchCampaigns,
        fetchCampaignsByBusinessIdOrch,
        fetchCampaignById,
        updateCampaign,
        deleteCampaign,
        onRefresh,
        refreshing,
        pickImageOrch,
        isImageUploading,
        image,
        setImage,
    }
}