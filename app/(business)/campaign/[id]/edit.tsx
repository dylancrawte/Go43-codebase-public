import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Alert, ActivityIndicator } from "react-native";
import CampaignForm, { CampaignFormData } from "@/components/CampaignForm";
import { useCampaignOrchestrator } from "@/controllers/orchestrators/campaignOrchestrator";

export default function EditCampaignScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { fetchCampaignById, updateCampaign, deleteCampaign } = useCampaignOrchestrator();
  const [initialData, setInitialData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load campaign data
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const result = await fetchCampaignById(String(id));
        if (!mounted) return;
        
        if (result.success && result.data) {
          const c = result.data;
          setInitialData({
            eventName: c.eventName || '',
            brief: c.brief || '',
            image: c.image || '',
            date: c.date || '',
            time: c.time || '',
            artist: c.artist || '',
            genreTags: Array.isArray(c.genreTags)
              ? c.genreTags
              : typeof c.genreTags === 'string'
              ? c.genreTags.split(',').map(t => t.trim()).filter(Boolean)
              : [],
            location: c.location || '',
            numberOfCreators: c.numberOfCreators || '',
            spotifyLink: c.spotifyLink || '',
            contentDeliveryDeadline: c.contentDeliveryDeadline || '',
          });
        }
      } catch (error) {
        console.error('Failed to load campaign:', error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => { mounted = false };
  }, [id, fetchCampaignById]);

  const handleSave = async (formData: CampaignFormData) => {
    try {
      setIsSaving(true);
      const result = await updateCampaign(String(id), formData as any);
      if (result.success) {
        router.back();
      } else {
        Alert.alert('Error', result.error || 'Failed to save campaign');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Cancel campaign?',
      'This will permanently delete the campaign.',
      [
        { text: 'Keep', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeleting(true);
              const result = await deleteCampaign(String(id));
              if (result.success) {
                router.back();
              } else {
                Alert.alert('Error', result.error || 'Failed to delete campaign');
                setIsDeleting(false);
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete campaign');
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <LinearGradient
        colors={["#373737", "#112D2F"]}
        locations={[0.4, 1]}
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      >
        <ActivityIndicator color="#fff" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#373737", "#112D2F"]}
      locations={[0.4, 1]}
      style={{ flex: 1 }}
    >
      <CampaignForm
        mode="edit"
        initialData={initialData}
        onSave={handleSave}
        onDelete={handleDelete}
        isSaving={isSaving}
        isDeleting={isDeleting}
        onBack={async () => { router.back(); }}
      />
    </LinearGradient>
  );
}
