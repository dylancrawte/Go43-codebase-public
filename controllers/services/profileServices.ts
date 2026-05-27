import { User } from "@/app/types";
export class ProfileService {
    private static readonly PROFILE_API_ENDPOINT = `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/users/profile`

    static updateProfileData = async (profileData: Partial<User>): Promise<User> => {
        const response = await fetch(this.PROFILE_API_ENDPOINT, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(profileData),
        });
    
        if (!response.ok) {
          throw new Error("Failed to update profile")
        }
        
        const responseText = await response.text();
        try {
          return JSON.parse(responseText) as User;
        } catch {
          return profileData as User;
        }
    };

    static createUpdatedUserObject = (user: any, updates: any) => {
        return {
          ...user,
          fullName: updates.fullName,
          email: updates.email,
          phoneNumber: updates.phoneNumber,
          genres: updates.genres,
          tiktokLink: updates.tiktokLink,
        }
    }
}
