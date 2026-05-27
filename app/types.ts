    export interface Campaign {
    _id: string;
    eventName: string;
    date: string;
    time: string;
    artist: string;
    genreTags: string[] | string;
    location: string;
    brief: string;
    image: string;
    numberOfCreators: string;
    contentDeliveryDeadline: string;
    spotifyLink?: string;
    businessId: string;
    QRCode: string;
}

export interface User {
    _id: string;
    displayName: string;
    tiktokId: string;
    email?: string;
    fullName?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    avatarUrl?: string;
    genres?: string[];
    createdAt?: string;
    username?: string;
    tiktokAccessToken?: string;
    tiktokRefreshToken?: string;
    tiktokTokenExpiry?: string;
    tiktokRefreshTokenExpiry?: string;
    tiktokLink?: string;
  }

export interface Genre {
_id: string;
name: string;
};

export interface Video {
  _id: string;
  title: string;
  uri: string;
  uploadedBy: {
    _id: string;
    username: string;
    avatarUrl?: string;
    tiktokLink?: string;
  };
  campaignId: {
    _id: string;
    title: string;
    eventName?: string;
  };
  socialsRequest?: string;
  videoTikTokLink?: string;
  createdAt: string;
}