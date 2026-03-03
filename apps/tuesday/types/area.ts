export interface Area {
  id: number;
  UID?: string;
  AreaType?: string;
  AreaName?: string;
  AreaState?: string;
  AreaBio?: string;
  AreaAvatar?: string;
  ListingsCount?: number;
  averagePrice?: string;
  averageDOM?: number;
  isFollowing?: boolean;
  propertyType?: string[];
  priceMin?: string;
  priceMax?: string;
  transactionCount?: number;
}
