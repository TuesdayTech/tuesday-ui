export interface PlaylistClient {
  id: number;
  UID?: string;
  agentUID?: string;
  MLS?: string;
  name?: string;
  surname?: string;
  company?: string;
  dateOfBirth?: string;
  phone?: string;
  email?: string;
  type?: string;
  summary?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  avatar?: string;
  status?: string;
  isPublic?: boolean;
  isDeleted?: boolean;
  socialMedia?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PlaylistAgent {
  UID: string;
  status: "pending" | "accepted" | "declined";
}

export interface PlaylistProfile {
  UID: string;
  ProfileName?: string;
  ProfileMedia?: string;
  ProfileOfficeName?: string;
  AgentName?: string;
  AgentMedia?: string;
  AgentOfficeName?: string;
  status?: "pending" | "accepted" | "declined";
}

export interface TypeWithValues {
  type: string;
  values: string[];
}

export interface TagWithValues {
  type: string;
  values: string[];
}

export interface GeoJSONCRS {
  type: string;
  properties: Record<string, string>;
}

export interface GeoJSON {
  crs?: GeoJSONCRS;
  type: string;
  coordinates: number[][][][];
}

export interface Playlist {
  id: number;
  UID: string;
  profileUID?: string;
  title?: string;
  summary?: string;
  type?: string;
  levels?: string[];
  nextQuestionAI?: string;
  agentUIDs?: PlaylistAgent[];
  clientUIDs?: string[];
  clientName?: string;
  isPublic?: boolean;
  isDeleted?: boolean;
  isFollowing?: boolean;
  cityUIDs?: string[];
  postalCodeUIDs?: string[];
  countyUIDs?: string[];
  boundaries?: GeoJSON;
  address?: string;
  addressDistance?: number;
  propertyTypesWithSubTypes?: TypeWithValues[];
  standardStatuses?: string[];
  tags?: TagWithValues[];
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  minBathrooms?: number;
  maxBathrooms?: number;
  minYearBuilt?: number;
  maxYearBuilt?: number;
  minLivingArea?: number;
  maxLivingArea?: number;
  minLotSizeAcres?: number;
  maxLotSizeAcres?: number;
  listingsCount?: number;
  activeListingsCount?: number;
  averagePrice?: string;
  averageDOM?: number;
  statsSummary?: string;
  updatedAt?: string;
  createdAt?: string;
  agents?: PlaylistProfile[];
  clients?: PlaylistClient[];
  profile?: PlaylistProfile;
  /** API returns listing image URLs under "listings" key */
  listings?: string[];
}
