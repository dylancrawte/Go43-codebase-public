import { Alert } from 'react-native';

export const showValidationError = (errors: string[]) => {
  Alert.alert('Validation Failed', `Validation failed: ${errors.join(', ')}`);
}

export const showUploadResults = (successCount: number, failCount: number) => {
  if (successCount > 0 && failCount === 0) {
    Alert.alert('Success', `All ${successCount} videos uploaded successfully!`);
  } else if (successCount > 0 && failCount > 0) {
    Alert.alert('Partial Success', `${successCount} videos uploaded, ${failCount} failed.`);
  } else {
    Alert.alert('Upload Failed', 'All uploads failed. Please try again.');
  }
}; 