import { useState, useCallback, useEffect } from "react";
import { User } from "@/app/types";
import { ProfileService } from "../services/profileServices";
import { showToast } from "@/components/CustomToast";
import { useAuthStore } from "@/store/authStore";

export const useProfileOrchestrator = (user: User | null) => {
    const [isUpdating, setIsUpdating] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phoneNumber: ""
    });
    const [confirmedBookings, setConfirmedBookings] = useState([]);
    const [isLoadingBookings, setIsLoadingBookings] = useState(false);

    const { deleteAccount } = useAuthStore();

    const updateProfile = async (profileData: any, user: User | null) => {
        setIsUpdating(true);

        try {
            await ProfileService.updateProfileData(profileData);

            const updatedUser = ProfileService.createUpdatedUserObject(user, profileData);

            return {
                success: true,
                message: "Profile Updated Successfully",
                updatedUser
            };
        } catch (error: any) {
            return {
                success: false,
                message: "Failed to update profile",
                error: error.message
            };
        } finally {
            setIsUpdating(false);
        }
    }

    const initializeProfile = useCallback(() => {
        if (user) {
            setFormData({
                fullName: user.fullName || "",
                email: user.email || "",
                phoneNumber: user.phoneNumber || ""
            });
        }
    }, [user]);

    const fetchConfirmedBookingsOrch = async (userId: string) => {
        setIsLoadingBookings(true);
    try {
      // Fetch raw bookings data directly from the API
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/bookings/user/${userId}`);
      if (response.ok) {
        const data = await response.json();
        // Filter for confirmed bookings only and ensure campaignID exists
        const confirmed = data.bookings.filter((booking: any) => 
          booking.status === 'confirmed' && 
          booking.campaignID && 
          booking.campaignID._id
        );
        setConfirmedBookings(confirmed);
      } else {
        console.error('Failed to fetch bookings:', response.status);
        setConfirmedBookings([]);
      }
    } catch (error) {
      console.error('Error fetching confirmed bookings:', error);
      setConfirmedBookings([]);
    } finally {
      setIsLoadingBookings(false);
    }
    }

    const confirmDeleteAccountOrch = async () => {
        try {
          const result = await deleteAccount();
          
          if (result.success) {
            showToast("Account deleted successfully", "success");
            return { success: true, message: "Account deleted successfully", error: null };
          } else {
            showToast(`Failed to delete account: ${result.error}`, "error");
            return { success: false, error: result.error };
          }
        } catch (error) {
          console.error("Error deleting account:", error);
          showToast("An unexpected error occurred while deleting your account", "error");
          return { success: false, error: "An unexpected error occurred while deleting your account" };
        }
      }

    useEffect(() => {
        initializeProfile();
    }, [initializeProfile]);

    return {
        //hooks
        isUpdating,
        formData,
        setFormData,
        confirmedBookings,
        isLoadingBookings,
        //orchestator functions
        updateProfile,
        fetchConfirmedBookingsOrch,
        confirmDeleteAccountOrch,
        
    }
}