import { ActivityIndicator, ScrollView, View, Text, Image, StyleSheet, TouchableOpacity, RefreshControl } from "react-native";
import { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { mapCampaignForDisplay, useCampaignOrchestrator } from "@/controllers/orchestrators/campaignOrchestrator";
import CampaignMetricsCardWrapper from "@/components/CampaignMetricsCardWrapper";
import { useBusinessAuthStore } from "@/store/businessAuthStore";
import { router } from "expo-router";
import { Campaign } from "../types";
import { useLoginOrchestrator } from "@/controllers/orchestrators/loginOrchestrator";

export default function BusinessHomepage() {
    const { campaigns, isFetchingCampaigns, fetchCampaignsByBusinessIdOrch } = useCampaignOrchestrator();
    const { businessLogoutOrch } = useLoginOrchestrator();
    
    const business = useBusinessAuthStore((state) => state.business);

    const [settingsOpen, setSettingsOpen] = useState(false);

    useEffect(() => {
        if (business?._id) {
            fetchCampaignsByBusinessIdOrch(business._id);
        }
    }, [business?._id]);

    const existingPlaceholderCampaign = (campaigns || []).find((c: any) => c?.businessId === 'placeholder');

    const handleBusinessLogout = async () => {
        setSettingsOpen(false); 
        const result = await businessLogoutOrch();
        if (result.success) {
          router.replace("/");
        }
      };

    return (
        <LinearGradient
            colors={["#373737", "#2D1022"]}
            locations={[0.4, 0.8]}
            style={{ flex: 1 }}
        >  
            <ScrollView
                contentContainerStyle={{ padding: 20, paddingTop: 30, gap: 20 }}
                refreshControl={
                    <RefreshControl
                        refreshing={false}
                        progressViewOffset={100}
                        onRefresh={fetchCampaigns}
                        tintColor="#FF66C4"
                        colors={["#FF66C4"]}
                    />
                }
            >
                
                <View style={styles.settingsWrapper}>
                {settingsOpen && (
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => setSettingsOpen(false)}
                    style={styles.overlay}
                />
            )}
                    <TouchableOpacity
                        style={styles.settingsIconButton}
                        onPress={() => setSettingsOpen((v) => !v)}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="settings-outline" size={28} color="#EBEBEB" />
                    </TouchableOpacity>
                    {/* settings menu */}
                    {settingsOpen && (
                        <View style={styles.settingsMenu}>
                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={() => {
                                    setSettingsOpen(false);
                                    router.push("/businessProfile");
                                }}
                            >
                                <Ionicons name="person-circle-outline" size={18} color="#FFFFFF" />
                                <Text style={styles.menuItemText}>Edit Profile</Text>
                            </TouchableOpacity>
                            <View style={styles.menuDivider} />
                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={handleBusinessLogout}
                            >
                                <Ionicons name="log-out-outline" size={18} color="#FFFFFF" />
                                <Text style={styles.menuItemText}>Logout</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
                <View style={styles.logoContainer}>
                    <Image
                        source={require("@/assets/images/GO43-LOGO.jpeg")}
                        style={styles.logoImage}
                        resizeMode="cover"
                    />
                    <Text style={styles.logoText}>{business?.businessName || ""}</Text>
                </View>
            {isFetchingCampaigns ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', height: 200 }}>
                    <ActivityIndicator size="large" color="#FF66C4" />
                </View>
            ) : campaigns && campaigns.length > 0 ? (
                <View style={{ gap: 15 }}>
                    <View style={styles.pill}>
                        <Text style={styles.text}>📈 Your Campaigns</Text>
                    </View>
                    {campaigns.map((campaign: Campaign, index: number) => (
                        <TouchableOpacity
                            key={campaign?._id || index}
                            activeOpacity={0.85}
                            onPress={() =>
                                router.push({
                                    pathname: "/campaign/[id]",
                                    params: {
                                        id: String(campaign?._id || index),
                                        title: String(campaign?.eventName || "Campaign"),
                                    },
                                })
                            }
                        >
                            <CampaignMetricsCardWrapper
                                campaignData={mapCampaignForDisplay(campaign)}
                                campaignId={String(campaign?._id || index)}
                            />
                        </TouchableOpacity>
                    ))}
                </View>
            ) : (
                existingPlaceholderCampaign ? (
                    <View style={{ gap: 15 }}>
                        <View style={styles.pill}>
                            <Text style={styles.text}>📈 Your Campaigns</Text>
                        </View>
                        <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={() =>
                                router.push({
                                    pathname: "/campaign/[id]",
                                    params: {
                                        id: String(existingPlaceholderCampaign?._id || 'placeholder'),
                                        title: String(existingPlaceholderCampaign?.eventName || "Campaign"),
                                    },
                                })
                            }
                        >
                            <CampaignMetricsCardWrapper
                                campaignData={mapCampaignForDisplay(existingPlaceholderCampaign)}
                                campaignId={String(existingPlaceholderCampaign?._id || 'placeholder')}
                            />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', height: 200 }}>
                        <Text style={{ color: '#EBEBEB' }}>No campaigns for your business</Text>
                    </View>
                )
            )}
            </ScrollView>

            <LinearGradient
                colors={["#FF66C4", "#FF83CF" ]}
                start={{ x: 0.7, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.navBar}
            >

                <TouchableOpacity style={styles.navButton} onPress={() => router.push("/createCampaign")}>
                    <Text style={styles.navButtonText}>Create Campaign</Text>
                    <Ionicons name="add-circle-outline" size={20} color="#EBEBEB" />
                </TouchableOpacity>
            </LinearGradient>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    navBar: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        height: 70,
        paddingTop: 20,
        paddingHorizontal: 20,
        paddingBottom: 10,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
        borderWidth: 1,
        borderColor: "#EBEBEB",
    },
    navButton: {
        flexDirection: "row",
        height: 40,
        alignItems: "center",
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginBottom: 15,
    },
    navButtonText: {
        color: "#EBEBEB",
        fontSize: 15,
        fontWeight: "600",
    },
    logoContainer: {
        alignItems: "center",
        paddingBottom: 10,
    },
    logoImage: {
        width: 90,
        height: 90,
        borderRadius: 10,
    
    },
    logoText: {
        color: "#EBEBEB",
        fontSize: 20,
        fontWeight: "bold",
        marginTop: 20,
    },
    pill: {
        backgroundColor: "#666666",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
        marginBottom: 5,
        width: "45%",
        borderColor: "yellow",
        borderWidth: 1,
    },
    text: {
        color: "#EBEBEB",
        fontSize: 14,
        fontWeight: "500",
    },
    settingsWrapper: {
        alignSelf: "flex-end",
        position: "relative",
        zIndex: 20,
    },
    settingsIconButton: {
        padding: 8,
        borderRadius: 18,
        backgroundColor: "rgba(255,255,255,0.06)",
    },
    settingsMenu: {
        position: "absolute",
        top: 40,
        right: 0,
        backgroundColor: "#3D3D3D",
        borderColor: "#EBEBEB",
        borderWidth: 1,
        borderRadius: 12,
        paddingVertical: 6,
        paddingHorizontal: 8,
        width: 180,
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: 4,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingVertical: 8,
    },
    menuItemText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "600",
    },
    menuDivider: {
        height: 1,
        backgroundColor: "rgba(255,255,255,0.15)",
        marginVertical: 4,
    },
    overlay: {
        position: "absolute",
        top: -30, // Extend upward to cover the full screen
        left: -20, // Extend to cover padding
        right: -20,
        bottom: -50, // Extend downward
        zIndex: 15,
    },
});