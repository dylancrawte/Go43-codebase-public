import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Dimensions } from "react-native";

export const HEADER_CONSTANTS = {
  HEIGHT: 130,
  SPACING_PERCENTAGE: 0.02, // 2% spacing
};

export const TAB_BAR_CONSTANTS = {
  HEIGHT: 50,
};

export const calculateTabBarPosition = (screenHeight: number) => {
  const spacing = screenHeight * HEADER_CONSTANTS.SPACING_PERCENTAGE;
  return HEADER_CONSTANTS.HEIGHT + spacing;
};

export const calculateTabBarBottom = (screenHeight: number) => {
  const tabBarTop = calculateTabBarPosition(screenHeight);
  return tabBarTop + TAB_BAR_CONSTANTS.HEIGHT;
};

// Custom hook for dynamic top offset calculation
export const useTopOffset = () => {
  const insets = useSafeAreaInsets();
  const screenHeight = Dimensions.get('window').height;
  const tabBarBottom = calculateTabBarBottom(screenHeight);
  
  return Math.max(0, tabBarBottom - insets.top) - 120;
};

// Static fallback - you'll need to adjust this based on your needs
export const topOffset = 60;