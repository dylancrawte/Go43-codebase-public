import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { ColorValue } from "react-native";

export type MetricsData = {
  videos: number;
  views: number;
  likes: number;
  shares: number;
  comments: number;
  
};

export type MetricsDataCompact = {
  views: number;
  likes: number;
  shares: number;
  comments: number;
};

type Props = {
  metrics: MetricsData | MetricsDataCompact;
  compact?: boolean;
  gradientColors?: ColorValue[];
};

// Helper function to determine if metrics is the full variant
function isFullMetrics(metrics: MetricsData | MetricsDataCompact): metrics is MetricsData {
  return 'videos' in metrics;
}

export default function MetricsBar({ metrics, compact = false, gradientColors }: Props) {
  const defaultColors: ColorValue[] = ["#FF66C4", "#FF83CF"];
  const colors = gradientColors || defaultColors;
  
  const isFull = isFullMetrics(metrics);
  
  return (
    <LinearGradient
      colors={colors as any}
      start={{ x: 0.7, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={compact ? styles.compactMetricsBar : styles.metricsBar}
    >
      {isFull ? (
        // Full MetricsData variant: videos, likes, shares, comments, views
        <>
          <Metric icon="videocam-outline" value={metrics.videos} compact={compact} />
          <Separator compact={compact} />
          <Metric icon="eye-outline" value={metrics.views} compact={compact} />
          <Separator compact={compact} />
          <Metric icon="heart-outline" value={metrics.likes} compact={compact} />
          <Separator compact={compact} />
          <Metric icon="share-outline" value={metrics.shares} compact={compact} />
          <Separator compact={compact} />
          <Metric icon="chatbubble-outline" value={metrics.comments} compact={compact} />
          
        </>
      ) : (
        // Compact MetricsDataCompact variant: views, likes, shares, comments
        <>
          <Metric icon="eye-outline" value={metrics.views} compact={compact} />
          <Separator compact={compact} />
          <Metric icon="heart-outline" value={metrics.likes} compact={compact} />
          <Separator compact={compact} />
          <Metric icon="share-outline" value={metrics.shares} compact={compact} />
          <Separator compact={compact} />
          <Metric icon="chatbubble-outline" value={metrics.comments} compact={compact} />
        </>
      )}
    </LinearGradient>
  );
}

function Metric({ icon, value, compact = false }: { icon: string; value: number; compact?: boolean }) {
  return (
    <View style={compact ? styles.compactMetricBlock : styles.metricBlock}>
      <Ionicons name={icon as any} size={compact ? 14 : 20} color="#FFFFFF" />
      <Text style={compact ? styles.compactMetricValue : styles.metricValue}>{formatK(value)}</Text>
    </View>
  );
}

function Separator({ compact = false }: { compact?: boolean }) {
  return <View style={compact ? styles.compactSeparator : styles.separator} />;
}

function formatK(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return `${n}`;
}

const styles = StyleSheet.create({
  metricsBar: {
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginTop: 12,
  },
  metricBlock: {
    alignItems: "center",
    minWidth: 0,
    flex: 1,
    gap: 2,
  },
  separator: {
    width: 1,
    height: 18,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginHorizontal: 6,
  },
  metricValue: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  // Compact styles
  compactMetricsBar: {
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginTop: 8,
  },
  compactMetricBlock: {
    alignItems: "center",
    minWidth: 0,
    flex: 1,
    gap: 1,
  },
  compactSeparator: {
    width: 1,
    height: 12,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginHorizontal: 4,
  },
  compactMetricValue: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
});
