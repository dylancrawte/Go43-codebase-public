/** Public / forkable defaults — override via EXPO_PUBLIC_* in .env */
export const PUBLIC_LINKS = {
  privacyPolicyUrl:
    process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL ?? "https://example.com/privacy-policy",
  termsUrl: process.env.EXPO_PUBLIC_TERMS_URL ?? "https://example.com/terms",
  supportEmail: process.env.EXPO_PUBLIC_SUPPORT_EMAIL ?? "support@example.com",
};

export const getCloudinaryUploadEndpoint = () => {
  const cloudName =
    process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "YOUR_CLOUDINARY_CLOUD_NAME";
  return `https://api.cloudinary.com/v1_1/${cloudName}`;
};

export const getCloudinaryUploadPreset = () =>
  process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "YOUR_UPLOAD_PRESET";
