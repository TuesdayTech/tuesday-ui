export type NotificationType =
  | "follow"
  | "like"
  | "share"
  | "all"
  | "playlistInvitation"
  | "playlistAccepted"
  | "playlistDeclined"
  | "playlist"
  | "playlistListing";

export interface NotificationListing {
  listingUID?: string;
  listingAddressTitle?: string;
  listingHeroPhoto?: string;
}

export interface Notification {
  id: number;
  UID?: string;
  profileUID?: string;
  listingUID?: string;
  followerUID?: string;
  areaUID?: string;
  playlistUID?: string;
  type?: NotificationType;
  title?: string;
  body?: string;
  avatar?: string;
  displayName?: string;
  isFollowing?: boolean;
  isDeleted?: boolean;
  isViewed?: boolean;
  link?: string;
  createdAt?: string;
  updatedAt?: string;
  listingAddressTitle?: string;
  listingHeroPhoto?: string;
  listingsInfo?: NotificationListing[];
}
