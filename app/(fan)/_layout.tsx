
import { Tabs, useRouter } from "expo-router";
import { Image, TouchableOpacity, StyleSheet, View } from "react-native";
import CustomTabBar from "../../components/CustomTabBar";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../store/authStore";
import { StatusBar } from "expo-status-bar";
import { HEADER_CONSTANTS } from "../../utility/layoutConstants";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Platform } from "react-native";

export default function TabsLayout() {
  const router = useRouter();
  const { user } = useAuthStore();

  const profilePress = () => {
    router.push("../../profile");
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <View style={{ flex: 1 }}>
      <StatusBar style="auto" />
    
    <Tabs
      tabBar={(props: any) => <CustomTabBar {...props} />}
      screenOptions={{
        headerTransparent: false,
        headerTitle: "",
        headerStyle: {
          backgroundColor: "#FAFAFA",
          height: HEADER_CONSTANTS.HEIGHT,
        },
        headerShadowVisible: false,

        headerLeft: () => (
        
            <Image
              source={require("../../assets/images/GO43-LOGO.jpeg")}
              style={{
                width: 60,
                height: 60,
                resizeMode: "contain",
                marginTop: 25,
                marginLeft: 21,
                borderRadius: 10,
              }}
            />
        ),

        headerRight: () => (
          <TouchableOpacity onPress={profilePress} style={{ marginRight: 12 }}>
            {user?.avatarUrl ? (
              <Image
                source={{ uri: user?.avatarUrl }}
                style={{
                  width: 65,
                  height: 65,
                  marginTop: Platform.OS === "ios" ? 15 : 25,
                  marginRight: 5,
                  borderRadius: 50,
                }}
              />
            ) : (
              <Ionicons
                name="person-circle-outline"
                size={80}
                color="#000000"
                style={{
                  marginTop: Platform.OS === "ios" ? 10 : 25,
                }}
              />
            )}
          </TouchableOpacity>
        ),
      }}
    >
       <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: "Bookings",
        }}
      />
    </Tabs>
    </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
});
