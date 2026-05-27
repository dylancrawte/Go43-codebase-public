import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useState, useEffect } from "react";
import { useLocalSearchParams } from "expo-router";
import BottomModalLoginFan from "../components/BottomModalLoginFan";
import BottomModalLoginBusiness from "@/components/BottomModalLoginBusiness";
import * as Notifications from 'expo-notifications';
import { useAppInitOrchestrator } from "@/controllers/orchestrators/appInitOrchestrator";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function Index() {
  const { showLogin } = useLocalSearchParams();
  const { registerForPushNotificationsAsync } = useAppInitOrchestrator();
  
  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  useEffect(() => {
    if (showLogin === 'true') {
      setIsLoginModalVisible(true);
    }
  }, [showLogin]);

  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
  const [isBusinessModalVisible, setIsBusinessModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/BackgroundImage1.png")}
        style={styles.image}
        blurRadius={0.5}
      />
      <LinearGradient
        colors={["rgba(0,0,0,0.15)", "rgba(0,0,0,0.6)"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.gradient}
      ></LinearGradient>
      
      <View style={styles.welcomeContainer}>
        <Image
          source={require("../assets/images/GO43-LOGO.jpeg")}
          style={styles.logoImage}
        ></Image>
        <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.pinkButton}
          onPress={() => setIsLoginModalVisible(true)}
        >
         
          <Text style={styles.buttonText}>I'm a fan</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => setIsBusinessModalVisible(true)}>
          <Text style={styles.buttonText}>I'm a business</Text>
        </TouchableOpacity>
        
        <BottomModalLoginFan
          isVisible={isLoginModalVisible}
          onClose={() => setIsLoginModalVisible(false)}
        />
        <BottomModalLoginBusiness
          isVisible={isBusinessModalVisible}
          onClose={() => setIsBusinessModalVisible(false)}
          setIsVisible={setIsBusinessModalVisible}
        />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    position: "absolute",
  },
  logoImage: {
    width: 120,
    height: 120,
    resizeMode: "contain",
    marginBottom: 20,
    borderRadius: 8,
  },
  buttonContainer: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 20,
  },
  gradient: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    opacity: 0.8,
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 200,
    alignContent: "center",
  },
  text: {
    color: "#fafafa",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    textShadowColor: "rgba(111, 56, 56, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  button: {
    backgroundColor: "rgba(238, 238, 238, 0.2)",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.3)",
    marginBottom: 50,
    width: 200,
    justifyContent: "center",
  },
  pinkButton: {
    backgroundColor: "#FF66C4",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 25,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
    marginBottom: 16,
    width: 200,
    justifyContent: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontFamily: "AileronBold",
  },
});
