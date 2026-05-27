import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { TouchableOpacity, View, Text, Dimensions } from "react-native";
import { calculateTabBarPosition } from "../utility/layoutConstants";

interface CustomTabBarProps extends BottomTabBarProps {
  backgroundColor?: string;
  activeTabColor?: string;
  inactiveTextColor?: string;
  activeTextColor?: string;
  inline?: boolean;
  badges?: { [key: string]: number };
}

export default function CustomTabBar({
  state,
  descriptors,
  navigation,
  backgroundColor = "#FF66C4",
  activeTabColor = "#fff",
  inactiveTextColor = "#fff",
  activeTextColor = "#000",
  inline = false,
  badges = {},
}: CustomTabBarProps) {
  const screenHeight = Dimensions.get('window').height;
  const tabBarTop = calculateTabBarPosition(screenHeight);
  
  const containerStyle = inline ? {
    flexDirection: "row" as const,
    backgroundColor: backgroundColor,
    borderRadius: 40,
    padding: 4,
    height: 45,
  } : {
    flexDirection: "row" as const,
    backgroundColor: backgroundColor,
    position: "absolute" as const,
    top: tabBarTop,
    left: 20,
    right: 20,
    zIndex: 999,
    borderRadius: 40,
    padding: 4,
    justifyContent: "space-between" as const,
    height: 45,
  };
  
  return (
    <View style={containerStyle}>
      {state.routes.map((route, index) => {
        if (route.name === "events") return null; 

        const { options } = descriptors[route.key];
        const label = options.title || route.name;
        const isFocused = state.index === index;
        const badgeCount = badges[route.name] || 0;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={{
              flex: 1,
              backgroundColor: isFocused ? activeTabColor : "transparent",
              borderRadius: 40,
              paddingVertical: 10,
              alignItems: "center",
            }}
          >
            <View style={inline ? { flexDirection: 'row', alignItems: 'center', gap: 8 } : {}}>
              <Text
                style={{
                  color: isFocused ? activeTextColor : inactiveTextColor,
                  fontWeight: "bold",
                  fontFamily: "Aileron",
                }}
              >
                {label}
              </Text>
              {badgeCount > 0 && (
                <View style={{
                  backgroundColor: '#FFD700',
                  borderRadius: 10,
                  minWidth: 20,
                  height: 20,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginLeft: inline ? 8 : 0,
                }}>
                  <Text style={{
                    color: 'black',
                    fontSize: 12,
                    fontWeight: 'bold',
                  }}>
                    {badgeCount}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
