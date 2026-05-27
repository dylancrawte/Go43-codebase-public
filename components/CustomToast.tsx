import React, { createContext, useContext, useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const showToast = (message: string, type: ToastType = 'info', duration: number = 3000) => {
    const id = Date.now().toString();
    const newToast: ToastMessage = { id, message, type, duration };

    setToasts(prev => [...prev, newToast]);

    // Animate in
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto hide after duration
    setTimeout(() => {
      hideToast(id);
    }, duration);
  };

  const hideToast = (id?: string) => {
    if (id) {
      // Hide specific toast
      setToasts(prev => prev.filter(toast => toast.id !== id));
    } else {
      // Hide all toasts
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setToasts([]);
      });
    }
  };

  const getToastConfig = (type: ToastType) => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: '#4CAF50',
          icon: 'checkmark-circle' as const,
          gradientColors: ['#4CAF50', '#45a049'],
        };
      case 'error':
        return {
          backgroundColor: '#F44336',
          icon: 'close-circle' as const,
          gradientColors: ['#F44336', '#d32f2f'],
        };
      case 'warning':
        return {
          backgroundColor: '#FF9800',
          icon: 'warning' as const,
          gradientColors: ['#FF9800', '#f57c00'],
        };
      case 'info':
      default:
        return {
          backgroundColor: '#FF66C4',
          icon: 'information-circle' as const,
          gradientColors: ['#FF66C4', '#e91e63'],
        };
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {toasts.map((toast, index) => {
        const config = getToastConfig(toast.type);
        return (
          <Animated.View
            key={toast.id}
            style={[
              styles.toastContainer,
              {
                transform: [{ translateY: slideAnim }],
                opacity: fadeAnim,
                top: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 50,
                zIndex: 1000 + index,
              },
            ]}
          >
            <LinearGradient
              colors={config.gradientColors as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.toast}
            >
              <View style={styles.toastContent}>
                <Ionicons 
                  name={config.icon} 
                  size={24} 
                  color="#fff" 
                  style={styles.icon}
                />
                <Text style={styles.message} numberOfLines={2}>
                  {toast.message}
                </Text>
                <TouchableOpacity
                  onPress={() => hideToast(toast.id)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </Animated.View>
        );
      })}
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  toast: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  icon: {
    marginRight: 12,
  },
  message: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Aileron',
    fontWeight: '600',
    lineHeight: 20,
  },
  closeButton: {
    marginLeft: 12,
    padding: 4,
  },
});

// Convenience function for backward compatibility
export const showToast = (message: string, type: ToastType = 'info', duration?: number) => {
  // This will be set by the provider
  if (global.showToastFunction) {
    global.showToastFunction(message, type, duration);
  }
};

// Global reference for the showToast function
declare global {
  var showToastFunction: ((message: string, type?: ToastType, duration?: number) => void) | undefined;
}
