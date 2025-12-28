
export interface Branding {
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  headingColor: string;
  subHeadingColor: string;
  textColor: string;
  iconColor: string;
  // Specific controls
  exploreTextColor: string;
  destinationTextColor: string;
  bannerBgColor: string;
  bannerTextColor: string;
  bannerBorderColor: string;
  highlightTextColor: string;
  badgeBgColor: string;
  badgeTextColor: string;

  companyName: string;
  officeLocations: string[];
  phone: string;
  whatsapp: string;
  helpline: string;
  website: string;
  locations: string[];
  packageCategories: string[];
  // Global policies added here
  terms: string[];
  cancellationPolicy: string[];
  // New field for Day Templates
  savedDayTemplates: { id: string; title: string; description: string; distance?: string; travelTime?: string }[];
  // New fields for Package Overview
  savedOverviews: { title: string; content: string }[];
  overviewTitleColor?: string;
  overviewTextColor?: string;
}

export interface DayPlan {
  id: string;
  title: string;
  description: string;
  date?: string;
  distance?: string;
  travelTime?: string;
}

export interface Hotel {
  id: string;
  name: string;
  location: string;
  stars: number;
  amenities: string[];
  images: string[];
  category: string;
}

export interface ItineraryHotel extends Hotel {
  isSelected: boolean;
}

export interface ItineraryData {
  id: string;
  clientName: string;
  packageName: string;
  destinations: string;
  duration: string;
  packageType: string;
  travelDates: string;
  overview: string;
  coverImages: string[];
  days: DayPlan[];
  selectedHotels: ItineraryHotel[];
  pricing: {
    totalPax: number;
    adults: number;
    children: number;
    rooms: number;
    extraBeds: number;
    extraBedPrice: string;
    cnbCount: number;
    cnbPrice: string;
    perAdultPrice: string;
    perChildPrice: string;
    totalCost: string;
    nightBreakup: { destination: string; nights: number }[];
  };
  inclusions: string[];
  exclusions: string[];
  supplementCosts: string[];
  terms: string[];
  cancellationPolicy: string[];
}
