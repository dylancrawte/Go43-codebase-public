import { WebView } from 'react-native-webview';
import { useLocalSearchParams } from 'expo-router';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';

export default function PrivacyPolicyScreen() {
  const { url } = useLocalSearchParams();
  const router = useRouter();

  const handleBack = () => {
    router.replace("/?showLogin=true");
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => handleBack()} 
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>
      <WebView source={{ uri: url as string }} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
});