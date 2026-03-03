/** Centralized query key factory — prevents typos, enables surgical invalidation. */
export const queryKeys = {
  // Feed
  feed: (profileUid: string) => ["feed", profileUid] as const,

  // Listings
  listing: (listingUid: string) => ["listing", listingUid] as const,
  likedListings: (profileUid: string) =>
    ["listings", "liked", profileUid] as const,

  // Likes
  likes: (listingUid: string) => ["likes", listingUid] as const,

  // Profile
  profile: (uid: string) => ["profile", uid] as const,
  followings: (uid: string) => ["profile", uid, "followings"] as const,
  followers: (uid: string) => ["profile", uid, "followers"] as const,
  analytics: (uid: string) => ["profile", uid, "analytics"] as const,
  profileListings: (uid: string, sort: string) =>
    ["profile", uid, "listings", sort] as const,
  office: (uid: string) => ["profile", uid, "office"] as const,

  // Search
  search: (query: string, filters?: Record<string, unknown>) =>
    ["search", query, filters] as const,
  searchArea: (query: string) => ["search", "area", query] as const,
  areaBoundaries: (uid: string) => ["search", "areaBoundaries", uid] as const,
  filtersOptions: (mls: string) => ["search", "filters", mls] as const,

  // Notifications
  notifications: (profileUid: string) =>
    ["notifications", profileUid] as const,
  unreadCount: (profileUid: string) =>
    ["notifications", profileUid, "unread"] as const,

  // Playlists
  playlists: (profileUid: string) => ["playlists", profileUid] as const,
  playlist: (uid: string) => ["playlist", uid] as const,
  playlistListings: (uid: string, sort?: string) =>
    ["playlist", uid, "listings", sort] as const,

  // Areas
  area: (uid: string) => ["area", uid] as const,
  areaListings: (uid: string, sort: string) =>
    ["area", uid, "listings", sort] as const,

  // Comments
  comments: (listingUid: string) => ["comments", listingUid] as const,
} as const;
