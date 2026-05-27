import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useBusinessAuthStore } from '@/store/businessAuthStore';

const REPORT_REASONS = [
  'Inappropriate content',
  'Spam or misleading',
  'Violence or harmful behavior',
  'Copyright violation',
  'Harassment or bullying',
  'Other'
]

export default function ReportScreen() {
  const router = useRouter();
  const { user, token } = useBusinessAuthStore();
  const { videoId, videoTitle, username } = useLocalSearchParams<{
    videoId: string;
    videoTitle: string;
    username: string;
  }>();

  const [selectedReason, setSelectedReason] = useState<string>('');
  const [details, setDetails] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitReport = async () => {
    if (!selectedReason) {
      Alert.alert('Error', 'Please select a reason for reporting');
      return;
    }
    setIsSubmitting(true);

    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/videos/${videoId}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          reason: selectedReason,
          details: details.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          'Report Submitted',
          'Thank you for your report. We will review it shortly.',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        throw new Error(data.message || 'Failed to submit report');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <LinearGradient
      colors={['#FAFAFA', '#D9D9D9']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientBackground}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </Pressable>
          <Text style={styles.headerTitle}>Report Video</Text>
          <View style={styles.headerSpacer} />
        </View>


        <ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardDismissMode='interactive' automaticallyAdjustKeyboardInsets>
          {/* Video Info */}
          <View style={styles.videoInfoCard}>
            <Text style={styles.videoInfoTitle}>Video Information</Text>
            <Text style={styles.videoTitle}>{videoTitle || 'Untitled Video'}</Text>
            <Text style={styles.username}>by {username}</Text>
          </View>

          {/* Report Reason */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reason for Report *</Text>
            <Text style={styles.sectionSubtitle}>Please select the most appropriate reason</Text>
            
            {REPORT_REASONS.map((reason) => (
              <Pressable
                key={reason}
                style={[
                  styles.reasonOption,
                  selectedReason === reason && styles.reasonOptionSelected,
                ]}
                onPress={() => setSelectedReason(reason)}
              >
                <View style={styles.reasonContent}>
                  <Text style={[
                    styles.reasonText,
                    selectedReason === reason && styles.reasonTextSelected,
                  ]}>
                    {reason}
                  </Text>
                  {selectedReason === reason && (
                    <Ionicons name="checkmark-circle" size={20} color="#FF66C4" />
                  )}
                </View>
              </Pressable>
            ))}
          </View>

          {/* Additional Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Details</Text>
            <Text style={styles.sectionSubtitle}>
              Please provide any additional context that will help us understand your report
            </Text>
        
            <TextInput
              style={styles.detailsInput}
              placeholder="Describe the issue in detail..."
              placeholderTextColor="#999"
              value={details}
              onChangeText={setDetails}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            
          </View>
          {/* Submit Button */}
        <View style={styles.submitContainer}>
          <Pressable
            style={[
              styles.submitButton,
              (!selectedReason || isSubmitting) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmitReport}
            disabled={!selectedReason || isSubmitting}
          >
            <Ionicons name="flag" size={20} color="#fff" />
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Text>
          </Pressable>
        </View>
        </ScrollView>

        
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  videoInfoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  videoInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  reasonOption: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  reasonOptionSelected: {
    borderColor: '#FF66C4',
    backgroundColor: '#FFF0F8',
  },
  reasonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reasonText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  reasonTextSelected: {
    color: '#FF66C4',
    fontWeight: '500',
  },
  detailsInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 16,
    color: '#333',
    minHeight: 100,
  },
  submitContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF66C4',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
