import { LinearGradient } from "expo-linear-gradient";
import { ActivityIndicator, TouchableOpacity, View, Image, StyleSheet } from "react-native";

export default function LoadingScreen() {
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#FF66C4" style={styles.loadingIndicator} />
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingIndicator: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});