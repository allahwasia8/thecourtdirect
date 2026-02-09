export interface Court {
  id: string;
  name: string;
  city: string;
  state: string;
  address: string;
  zip: string;
  phone: string;
  types: string[];
  building: string;
  headquarters?: boolean;
  website?: string;
  hours?: string;
  description?: string;
  mapsUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  imageToShare?: string;
  litigantsInfoUrl?: string;
}
