import { MetricsData, MetricsDataCompact } from "@/components/MetricsBar";

// Hardcoded metrics for consistent display (20K-100K views range)
const HARDCODED_VIDEO_METRICS: MetricsDataCompact[] = [
  { views: 23450, likes: 892, shares: 156, comments: 78 },
  { views: 67890, likes: 2156, shares: 423, comments: 189 },
  { views: 45670, likes: 1456, shares: 234, comments: 112 },
  { views: 89120, likes: 3124, shares: 567, comments: 234 },
  { views: 34560, likes: 1234, shares: 189, comments: 89 },
  { views: 56780, likes: 1890, shares: 345, comments: 156 },
  { views: 78910, likes: 2567, shares: 456, comments: 201 },
  { views: 12340, likes: 456, shares: 78, comments: 34 },
  { views: 98760, likes: 3456, shares: 678, comments: 289 },
  { views: 43210, likes: 1567, shares: 234, comments: 123 },
];

let currentIndex = 0;

// Generate consistent metrics for individual videos using a seed
export const generateVideoMetrics = (seed?: string): MetricsDataCompact => {
  if (seed) {
    // Use seed to get consistent metrics for the same video
    const hash = seed.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const index = Math.abs(hash) % HARDCODED_VIDEO_METRICS.length;
    return HARDCODED_VIDEO_METRICS[index];
  }
  
  // Fallback to sequential for backward compatibility
  const metrics = HARDCODED_VIDEO_METRICS[currentIndex % HARDCODED_VIDEO_METRICS.length];
  currentIndex++;
  return metrics;
};

// Generate campaign-level metrics by aggregating user metrics
export const generateCampaignMetrics = (confirmedBookings: any[], userVideos: Map<string, any[]>, videoMetrics: Map<string, MetricsDataCompact[]>): MetricsData => {
  let totalVideos = 0;
  let totalViews = 0;
  let totalLikes = 0;
  let totalShares = 0;
  let totalComments = 0;

  // Sum up all user metrics
  confirmedBookings.forEach(booking => {
    const userId = booking.userID?._id;
    if (userId) {
      const videos = userVideos.get(userId) || [];
      const metrics = videoMetrics.get(userId) || [];
      
      totalVideos += videos.length;
      
      // Sum up metrics for this user
      metrics.forEach(metric => {
        totalViews += metric.views;
        totalLikes += metric.likes;
        totalShares += metric.shares;
        totalComments += metric.comments;
      });
    }
  });

  return {
    videos: totalVideos,
    views: totalViews,
    likes: totalLikes,
    shares: totalShares,
    comments: totalComments,
  };
};
