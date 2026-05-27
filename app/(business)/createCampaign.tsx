import { LinearGradient } from "expo-linear-gradient";
import { useCampaignStore } from "@/store/campaignStore";
import { useBusinessAuthStore } from "@/store/businessAuthStore";
import { useRouter } from "expo-router";
import CampaignForm, { CampaignFormData } from "@/components/CampaignForm";
import { useState } from "react";

export default function CreateCampaign() {
  const router = useRouter();
  const { createCampaign } = useCampaignStore();
  const token = useBusinessAuthStore((state) => state.token);
  const businessId = useBusinessAuthStore((state) => state.business._id);
  const [isCreating, setIsCreating] = useState(false);

  const handleSave = async (formData: CampaignFormData) => {
    if (isCreating) return;
    setIsCreating(true);
    
    try {
      const campaignData = {
        ...formData,
        businessId: businessId,
      };

      const result = await createCampaign(campaignData, token);

      if (result.success) {
        router.navigate("./businessHomepage");
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error("Error creating campaign:", error);
      alert("Failed to create campaign. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleBack = () => {
    router.navigate("./businessHomepage");
  };

  return (
    <LinearGradient
      colors={["#373737", "#2D1022"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 0.5 }}
      style={{ flex: 1 }}
    >
      <CampaignForm
        mode="create"
        onSave={handleSave}
        isSaving={isCreating}
        onBack={handleBack}
      />
    </LinearGradient>
  );
}
