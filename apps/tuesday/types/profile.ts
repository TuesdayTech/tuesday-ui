/**
 * Profile — matches the wire format from the REST API (PascalCase).
 * Translated from TuesdayApp/RealEstate/Models/Profile/Profile.swift.
 */

export interface SocialMedia {
  instagram?: string;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  tiktok?: string;
  youtube?: string;
  website?: string;
}

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
  MemberSocialMedia?: SocialMedia;
  isFollowing?: boolean;
  roundedVolume?: string;
  roundedAverageSalesPrice?: string;
  transactionCount?: number;
  totalTxns?: number;
  startDate?: string;
  registered?: boolean;
  subscriptionUID?: string;
}
