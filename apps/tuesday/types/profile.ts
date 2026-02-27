/**
 * Profile — matches the wire format from the REST API (PascalCase).
 * Translated from TuesdayApp/RealEstate/Models/Profile/Profile.swift.
 */

export interface Profile {
  id?: number;
  UID?: string;
  MemberFullName?: string;
  MemberFirstName?: string;
  MemberLastName?: string;
  OfficeName?: string;
  MemberMlsId?: string;
  MemberMobilePhone?: number;
  MemberEmail?: string;
  MemberType?: string;
  MemberStatus?: string;
  proUID?: string;
  gender?: string;
  ageRange?: string;
  OfficeUID?: string;
  volume?: number;
  MemberBio?: string;
  following?: number;
  followers?: number;
  Media?: string;
  MemberSocialMedia?: string[];
  isFollowing?: boolean;
  roundedVolume?: string;
  roundedAverageSalesPrice?: string;
  transactionCount?: number;
  totalTxns?: number;
  startDate?: number;
  registered?: boolean;
  subscriptionUID?: string;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
  isUser?: boolean;
  deviceToken?: string;
  DefaultFollows?: (string | null)[];
}

/** Computed helpers derived from Profile fields. */
export function isVerified(profile: Profile): boolean {
  return !!profile.subscriptionUID;
}

export interface Office {
  id: number;
  UID?: string;
  originatingSystemID?: number;
  officeKey?: string;
  officeName?: string;
  officePhone?: string;
  officeEmail?: string;
  officeAOR?: string;
  officeCity?: string;
  officePostalCode?: string;
  officeStateOrProvince?: string;
  officeStatus?: string;
  officeType?: string;
  officeBio?: string;
  Media?: string[];
  officeBrokerKey?: string;
  officeBrokerUID?: string;
  mainOfficeKey?: string;
  mainOfficeUID?: string;
  modificationTimestamp?: string;
  isFollowing?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FollowingResponse {
  id: number;
  followerUID?: string;
  followingUID?: Profile;
  areaUID?: { UID?: string; name?: string } | null;
  officeUID?: Office | null;
  playlistUID?: string;
  playlistTitle?: string;
  propertyType?: string[];
  priceMin?: string;
  priceMax?: string;
}

export interface FollowerResponse {
  id: number;
  followerUID?: Profile;
  followingUID?: string;
  areaUID?: { UID?: string; name?: string } | null;
  officeUID?: Office | null;
  playlistUID?: string;
  playlistTitle?: string;
  propertyType?: string[];
  priceMin?: string;
  priceMax?: string;
}

export interface UploadAvatarResponse {
  message: string;
  file?: string;
}

export interface ProfileAnalytics {
  averageSalesPrice: string;
  averageDaysOnMarket: number;
  totalSalesVolume: string;
  startingYear: number;
  buyerSidePercentage: string;
  sellerSidePercentage: string;
  salesVolumeByYear: { year: number; volume: string }[];
  topPropertyTypes: { propertyType: string; count: number; volume: string }[];
  topPostalCodes: AnalyticsTopArea[];
  topCities: AnalyticsTopArea[];
}

export interface AnalyticsTopArea {
  city?: string;
  postalCode?: string;
  buyerVolume: string;
  buyerTransactions: number;
  sellerVolume: string;
  sellerTransactions: number;
}

export type ProfileSortOrder = "recent" | "oldest" | "highest" | "lowest";
