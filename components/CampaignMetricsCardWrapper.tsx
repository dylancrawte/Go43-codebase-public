import React, { useState, useEffect } from 'react';
import CampaignMetricsCard from '@/components/MetricsCardCampaign';
import { MetricsData } from '@/components/MetricsBar';
import { useBookingOrchestrator } from '@/controllers/orchestrators/bookingOrchestrator';

type CampaignMetricsCardWrapperProps = {
  campaignData: any;
  campaignId: string;
  onPress?: () => void;
};

export default function CampaignMetricsCardWrapper({ 
  campaignData, 
  campaignId, 
  onPress 
}: CampaignMetricsCardWrapperProps) {
  const [campaignMetrics, setCampaignMetrics] = useState<MetricsData>({
    videos: 0,
    views: 0,
    likes: 0,
    shares: 0,
    comments: 0,
  });

  const { 
    fetchConfirmedBookingsService,
    userVideos,
    videoMetrics,
    confirmedBookings
  } = useBookingOrchestrator();

  useEffect(() => {
    if (!campaignId) return;
    
    // Fetch confirmed bookings which will trigger video and metrics fetching
    fetchConfirmedBookingsService(campaignId);
  }, [campaignId]);

  useEffect(() => {
    // Filter confirmed bookings for this specific campaign
    const campaignBookings = confirmedBookings.filter(
      booking => booking.campaignID === campaignId
    );

    if (!campaignId || campaignBookings.length === 0) {
      setCampaignMetrics({
        videos: 0,
        views: 0,
        likes: 0,
        shares: 0,
        comments: 0,
      });
      return;
    }

    // Aggregate metrics from all users for this campaign
    const totalMetrics = campaignBookings.reduce((total, booking) => {
      const userId = booking.userID?._id;
      if (!userId) return total;

      // Get videos count for this user
      const userVideosList = userVideos.get(userId) || [];
      const videosCount = userVideosList.length;

      // Get metrics for this user's videos
      const userMetricsList = videoMetrics.get(userId) || [];
      const userTotalMetrics = userMetricsList.reduce((userTotal, metric) => ({
        views: userTotal.views + metric.views,
        likes: userTotal.likes + metric.likes,
        shares: userTotal.shares + metric.shares,
        comments: userTotal.comments + metric.comments,
      }), { views: 0, likes: 0, shares: 0, comments: 0 });

      return {
        videos: total.videos + videosCount,
        views: total.views + userTotalMetrics.views,
        likes: total.likes + userTotalMetrics.likes,
        shares: total.shares + userTotalMetrics.shares,
        comments: total.comments + userTotalMetrics.comments,
      };
    }, {
      videos: 0,
      views: 0,
      likes: 0,
      shares: 0,
      comments: 0,
    });

    setCampaignMetrics(totalMetrics);
  }, [confirmedBookings, userVideos, videoMetrics, campaignId]);

  return (
    <CampaignMetricsCard
      campaignData={campaignData}
      metrics={campaignMetrics}
    />
  );
}
