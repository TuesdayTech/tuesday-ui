/**
 * Listing — matches the wire format from the REST API (PascalCase).
 * Translated from TuesdayApp/RealEstate/Models/Listing/Listing.swift.
 */

export type ListingStatus =
  | "Active"
  | "ActiveUnderContract"
  | "Canceled"
  | "Closed"
  | "ComingSoon"
  | "Delete"
  | "Expired"
  | "Hold"
  | "Incomplete"
  | "Pending"
  | "Withdrawn";

export interface PlaylistInfo {
  playlistUID?: string;
  playlistTitle?: string;
}

export interface Listing {
  id: number;
  UID?: string;
  ListingId?: string;
  type?: string;
  PlaylistInfo?: PlaylistInfo;

  // Address
  UnparsedAddress?: string;
  UnitNumber?: string;
  StreetName?: string;
  PropertyType?: string;
  PropertySubType?: string;

  // Location
  CityUID?: string;
  City?: string;
  CityFollowed?: boolean;
  PostalCodeUID?: string;
  PostalCode?: string;
  PostalFollowed?: boolean;
  MLSAreaMajorUID?: string;
  MLSAreaMajor?: string;
  MLSAreaFollowed?: boolean;
  CountyUID?: string;
  CountyOrParish?: string;
  CountyFollowed?: boolean;
  StateOrProvince?: string;

  // Agents
  ListAgentUID?: string;
  CoListAgentUID?: string;
  BuyerAgentUID?: string;
  CoBuyerAgentUID?: string;
  ListAgentFullName?: string;
  CoListAgentFullName?: string;
  BuyerAgentFullName?: string;
  CoBuyerAgentFullName?: string;
  ListAgentMedia?: string;
  CoListAgentMedia?: string;
  BuyerAgentMedia?: string;
  CoBuyerAgentMedia?: string;
  ListAgentFollowed?: boolean;
  CoListAgentFollowed?: boolean;
  BuyerAgentFollowed?: boolean;
  CoBuyerAgentFollowed?: boolean;
  ListAgentIsUser?: boolean;
  CoListAgentIsUser?: boolean;
  BuyerAgentIsUser?: boolean;
  CoBuyerAgentIsUser?: boolean;
  ListAgentVerified?: boolean;
  CoListAgentVerified?: boolean;
  BuyerAgentVerified?: boolean;
  CoBuyerAgentVerified?: boolean;

  // Offices
  ListOfficeUID?: string;
  CoListOfficeUID?: string;
  BuyerOfficeUID?: string;
  CoBuyerOfficeUID?: string;
  ListAgentOfficeName?: string;
  CoListAgentOfficeName?: string;
  BuyerAgentOfficeName?: string;
  CoBuyerAgentOfficeName?: string;

  // Timestamps
  MajorChangeTimestamp?: string;
  MajorChangeType?: string;
  OriginalEntryTimestamp?: string;

  // Media
  PreferredPhoto?: string;
  Photos?: string[];
  Videos?: string[];
  VirtualTour?: string;
  Links?: string[];
  Documents?: string[];

  // Status & Price
  StandardStatus?: ListingStatus;
  AssociationFee?: string;
  CurrentPrice?: number;
  PricePerSquareFoot?: number;
  RoundedPrice?: string;
  PriceChangeAmount?: string;
  VolumePrice?: number;

  // Property Details
  DaysOnMarket?: number;
  YearBuilt?: number;
  LivingArea?: number;
  LotSizeSquareFeet?: number;
  LotSizeAcres?: number;
  BedroomsTotal?: number;
  BathroomsTotalInteger?: number;
  BathroomsDetail?: string;
  BuildingAreaTotal?: number;

  // Descriptions
  PublicRemarks?: string;
  PrivateRemarks?: string;
  ClosedRecap?: string;
  Brief?: string;

  // Social
  LikesCount?: number;
  CommentsCount?: number;
  isLiked?: boolean;
  isViewed?: boolean;
  userHasCommented?: boolean;

  // Coordinates
  Latitude?: string;
  Longitude?: string;

  // Misc
  Advertisement?: boolean;
}
