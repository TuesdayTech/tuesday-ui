/** Types for Listing Action Bar — share, schedule, comments, likes. */

// ─── Share ───────────────────────────────────────────────────────────

export type ShareType =
  | "SMS"
  | "Email"
  | "Facebook"
  | "XPost"
  | "IGstory"
  | "More";

export interface SocialNetworkOption {
  type: ShareType;
  label: string;
  iconName: string;
  circleColor: string;
}

export interface ShareLinkResponse {
  message: string; // The shareable URL
}

export interface AIShareChunk {
  type: "chunk";
  content: string;
}

// ─── Schedule ────────────────────────────────────────────────────────

export interface ScheduleShowingResponse {
  showing: boolean;
  URL: string;
}

// ─── Comments ────────────────────────────────────────────────────────

export interface CommentProfile {
  UID: string;
  MemberFullName: string;
  Media: string;
  isUser?: boolean;
  OfficeID: number;
  OfficeUID: string;
  OfficeName: string;
}

export interface Comment {
  id: number;
  listingUID: string;
  profileUID: string;
  profile: CommentProfile | null;
  body: string;
  replyID: number | null;
  status: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  listingUnparsedAddress: string | null;
  listingPreferredPhoto: string | null;
  officeID: number | null;
  officeUID: string | null;
  officeName: string | null;
}

export interface CreateCommentPayload {
  profileUID: string;
  listingUID: string;
  comment: string;
  status: string;
  taggedUsers: string[];
  replyID?: number;
}

export interface CommentTag {
  uid: string;
  priority: number;
  memberFullName: string;
  media: string;
  officeName: string;
  matchesSearch: number;
}

// ─── Likes ───────────────────────────────────────────────────────────

export interface LikeProfile {
  uid: string;
  displayName: string;
  avatar: string;
  officeName: string;
}

// ─── Action Bar State ────────────────────────────────────────────────

export interface ListingActionBarProps {
  listingUid: string;
  listing: {
    StandardStatus?: string;
    isLiked?: boolean;
    LikesCount?: number;
    CommentsCount?: number;
    CurrentPrice?: number;
    UnparsedAddress?: string;
    PreferredPhoto?: string;
    Photos?: string[];
    City?: string;
    BedroomsTotal?: number;
    BathroomsTotalInteger?: number;
    LivingArea?: number;
    PlaylistInfo?: { playlistUID?: string; playlistTitle?: string };
  };
  profileUid: string;
  isLoading: boolean;
}

/** Statuses where the Schedule button should be hidden. */
export const HIDDEN_SCHEDULE_STATUSES = [
  "Closed",
  "Expired",
  "Canceled",
  "Delete",
] as const;

/** Social network options in the selection sheet. */
export const SOCIAL_NETWORKS: SocialNetworkOption[] = [
  {
    type: "SMS",
    label: "Text this listing to my client",
    iconName: "ChatCircleDots",
    circleColor: "#53D769",
  },
  {
    type: "Email",
    label: "Email this listing to my client",
    iconName: "EnvelopeSimple",
    circleColor: "#0A84FF",
  },
  {
    type: "Facebook",
    label: "Create a Facebook post",
    iconName: "FacebookLogo",
    circleColor: "#1877F2",
  },
  {
    type: "XPost",
    label: "Create a X post",
    iconName: "XLogo",
    circleColor: "#000000",
  },
  {
    type: "IGstory",
    label: "Create an Instagram story",
    iconName: "InstagramLogo",
    circleColor: "#D62976",
  },
  {
    type: "More",
    label: "Share to...",
    iconName: "ShareNetwork",
    circleColor: "#8E8E93",
  },
];

/** Brand colors for each share type (used on send buttons). */
export const SHARE_TYPE_COLORS: Record<ShareType, string> = {
  SMS: "#53D769",
  Email: "#0A84FF",
  Facebook: "#1877F2",
  XPost: "#000000",
  IGstory: "#D62976",
  More: "#8E8E93",
};
