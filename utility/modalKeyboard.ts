import { useAnimatedKeyboard, KeyboardState } from 'react-native-reanimated';
import { useSharedValue, useDerivedValue, useAnimatedStyle, withTiming, Easing, interpolate } from 'react-native-reanimated';

export const useModalKeyboard = () => {
  const kb = useAnimatedKeyboard();
  const sessionMax = useSharedValue(0);
  const smoothedHeight = useSharedValue(0);

  useDerivedValue(() => {
    const h = kb.height.value;
    
    // Smooth the height changes to prevent shuddering while typing
    smoothedHeight.value = withTiming(h, {
      duration: 150,
      easing: Easing.out(Easing.cubic)
    });

    if (kb.state.value === KeyboardState.OPENING || kb.state.value === KeyboardState.OPEN) {
      sessionMax.value = Math.max(sessionMax.value, h);
    } else if (
      kb.state.value === KeyboardState.CLOSING ||
      kb.state.value === KeyboardState.CLOSED ||
      h === 0
    ) {
      sessionMax.value = 0;
    }
    return null;
  });

  const sheetStyle = useAnimatedStyle(() => {
    const isOpeningOrOpen =
      kb.state.value === KeyboardState.OPENING || kb.state.value === KeyboardState.OPEN;

    // Use smoothed height to prevent shuddering
    const target = Math.max(0, sessionMax.value || smoothedHeight.value);
    const ty = -target;

    // Apply consistent timing for smoother animations
    return {
      transform: [
        { 
          translateY: withTiming(ty, { 
            duration: 300, 
            easing: Easing.out(Easing.cubic) 
          }) 
        }
      ],
    };
  });

  return {
    sheetStyle,
  };
};