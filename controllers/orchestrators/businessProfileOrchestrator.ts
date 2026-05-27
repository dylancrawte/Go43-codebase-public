import { useState, useCallback, useMemo } from "react";
import { useBusinessAuthStore } from "@/store/businessAuthStore";

export type BusinessFormData = {
  businessName: string;
  businessEmail: string;
  businessType: string;
  businessAddress: string;
  businessContactName: string;
  businessContactRole: string;
  businessContactNumber: string;
  password?: string;
  confirmPassword?: string;
};

export const useBusinessProfileOrchestrator = (initialBusiness?: any) => {
  const [form, setForm] = useState<BusinessFormData>({
    businessName: "",
    businessEmail: "",
    businessType: "",
    businessAddress: "",
    businessContactName: "",
    businessContactRole: "",
    businessContactNumber: "",
    password: "",
    confirmPassword: "",
  });

  const { businessSignUp, updateBusinessProfile, deleteBusinessAccount } = useBusinessAuthStore();

  // Initialize form from business data (for profile page)
  const initializeForm = useCallback((business: any) => {
    setForm({
      businessName: business?.businessName || "",
      businessEmail: business?.businessEmail || "",
      businessType: business?.businessType || "",
      businessAddress: business?.businessAddress || "",
      businessContactName: business?.businessContactName || "",
      businessContactRole: business?.businessContactRole || "",
      businessContactNumber: String(business?.businessContactNumber ?? ""),
      password: "",
      confirmPassword: "",
    });
  }, []);

  // Reset form to original business values (for profile cancel)
  const resetForm = useCallback((business: any) => {
    initializeForm(business);
  }, [initializeForm]);

  // Update single field
  const updateField = useCallback(<K extends keyof BusinessFormData>(
    field: K,
    value: BusinessFormData[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Validation for signup
  const validateSignUp = useCallback(() => {
    if (!form.password || form.password.length < 8) {
      return { valid: false, error: "Password must be at least 8 characters long." };
    }
    if (form.password !== form.confirmPassword) {
      return { valid: false, error: "Passwords do not match. Please try again." };
    }
    return { valid: true, error: null };
  }, [form.password, form.confirmPassword]);

  // Password validation state (for signup UI)
  const passwordErrors = useMemo(() => {
    const isPasswordTooShort = form.password ? form.password.length > 0 && form.password.length < 8 : false;
    const doPasswordsMatch = form.password && form.confirmPassword ? form.password === form.confirmPassword : true;
    const showPasswordMismatch = form.confirmPassword ? !doPasswordsMatch : false;

    return {
      isPasswordTooShort,
      doPasswordsMatch,
      showPasswordMismatch,
    };
  }, [form.password, form.confirmPassword]);

  // Sign up handler
  const handleSignUp = useCallback(async () => {
    const validation = validateSignUp();
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const result = await businessSignUp(
      form.businessName,
      form.businessEmail,
      form.password!,
      form.businessAddress,
      form.businessType,
      form.businessContactName,
      form.businessContactRole,
      form.businessContactNumber
    );

    return result;
  }, [form, validateSignUp, businessSignUp]);

  // Update profile handler (for profile page)
  const handleUpdateProfile = useCallback(async () => {
    const payload = {
      businessName: form.businessName,
      businessEmail: form.businessEmail,
      businessType: form.businessType,
      businessAddress: form.businessAddress,
      businessContactName: form.businessContactName,
      businessContactRole: form.businessContactRole,
      businessContactNumber: form.businessContactNumber,
    };

    const result = await updateBusinessProfile(payload);
    return result;
  }, [form, updateBusinessProfile]);

  // Delete account handler
  const handleDeleteAccount = useCallback(async () => {
    const result = await deleteBusinessAccount();
    return result;
  }, [deleteBusinessAccount]);

  return {
    form,
    setForm,
    updateField,
    initializeForm,
    resetForm,
    validateSignUp,
    passwordErrors,
    handleSignUp,
    handleUpdateProfile,
    handleDeleteAccount,
  };
};

