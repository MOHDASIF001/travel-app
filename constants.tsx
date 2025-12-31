
import { Branding, ItineraryData, Hotel } from './types';

export const DEFAULT_BRANDING: Branding = {
  logoUrl: '',
  primaryColor: '#D31A1A',
  secondaryColor: '#300000',
  accentColor: '#fbbf24',
  headingColor: '#FFFFFF',
  subHeadingColor: '#000000',
  textColor: '#111111',
  iconColor: '#D31A1A',

  // Specific controls for high-fidelity PDF
  exploreTextColor: '#FFD700',
  destinationTextColor: '#FFFFFF',
  bannerBgColor: '#4a0404',
  bannerTextColor: '#FFFFFF',
  bannerBorderColor: '#FFD700',
  highlightTextColor: '#D31A1A',
  badgeBgColor: '#D31A1A',
  badgeTextColor: '#FFFFFF',

  companyName: 'Deenxconsultancy',
  address: 'New Delhi, India',
  officeLocations: ['Srinagar', 'Delhi', 'Dubai'],
  phone: '+91 9667266672',
  whatsapp: '+91 9667266672',
  helpline: '+91 9667266672',
  website: 'www.deenxconsultancy.com',
  locations: ['Srinagar', 'Pahalgam', 'Gulmarg', 'Sonmarg', 'Delhi', 'Dubai'],
  packageCategories: ['Silver', 'Gold', 'Platinum', 'Premium Luxury'],
  // Default master policies
  terms: [
    'Package is subject to availability at the time of booking',
    '50% advance payment required to process the booking',
    'Balance payment to be cleared 15 days before arrival'
  ],
  cancellationPolicy: [
    'Cancellation before 30 days: 10% of total cost',
    'Cancellation before 15 days: 50% of total cost',
    'Cancellation within 7 days: No refund'
  ],
  savedDayTemplates: [
    { id: '1', title: 'Arrival & Local Sightseeing', description: 'Upon arrival at the Airport, meet our representative and drive to hotel. Rest and later visit Mughal Gardens, Nishat and Shalimar. Enjoy a Shikara ride in the evening.', distance: '15 km', travelTime: '45 mins' },
    { id: '2', title: 'Srinagar to Gulmarg Excursion', description: 'After breakfast, drive to Gulmarg. Enjoy the Gondola ride and the scenic beauty of the Meadow of Flowers. Return to Srinagar in the evening.', distance: '52 km', travelTime: '2 hours' }
  ],
  savedOverviews: [
    { title: 'Kashmir Welcome', content: 'Rightly called as the "Paradise on Earth" Kashmir bestows its visitors the view of pristine beauty of serene lakes, chinar trees, magnificent valleys and friendly people.' }
  ],
  defaultCoverImage: 'https://images.unsplash.com/photo-1598305371124-42ad188d59ee?w=800',
  masterCoverImages: [
    'https://images.unsplash.com/photo-1598305371124-42ad188d59ee?w=800',
    'https://images.unsplash.com/photo-1566833925203-820508b58435?w=800',
    'https://images.unsplash.com/photo-1621252179027-94459d278660?w=800',
    'https://images.unsplash.com/photo-1596417600803-34e00501166a?w=800'
  ],
  roomTypes: ['Standard Room', 'Deluxe Room', 'Super Deluxe', 'Premium Room', 'Luxury Suite', 'Family Room'],
  defaultInclusions: [
    'Traditional Welcome Drink on Arrival',
    'Accommodation on Double Sharing',
    'Daily Breakfast & Dinner in Hotel/Houseboat',
    'All Sightseeing as per Itinerary',
    'Private Car for all Transfers (Etios/Innova)',
    '1 Hour Shikara Ride in Dal Lake',
    'Toll taxes, Parking, and Driver Allowance',
    'GST and all applicable taxes'
  ],
  defaultExclusions: [
    'Airfare / Train fare',
    'Lunch and Personal Expenses',
    'Entry Tickets to Mughal Gardens',
    'Gondola Ride Tickets in Gulmarg',
    'Pony Rides in Pahalgam/Gulmarg',
    'Medical Insurrence'
  ],
  defaultSupplementCosts: [
    'Innova/Xylo Upgrade: 1,500/- per day',
    'Kashmiri Wazwan Meal: 800/- per person'
  ]
};

export const MASTER_HOTELS: Hotel[] = [
  {
    id: 'h1',
    name: 'Hotel Grand Reyan',
    location: 'Hyderpora Srinagar | 5 km from Airport',
    stars: 3,
    category: 'Srinagar',
    amenities: ['Welcome Drink', 'Daily Breakfast & Dinner', 'Wi-Fi', 'Daily Housekeeping', '24-hour Room Service', 'Mineral Water', 'Electric/Woollen Blanket'],
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400'
    ]
  },
  {
    id: 'p1',
    name: 'Hotel Indus Resort',
    location: 'Rafting point, Pahalgam',
    stars: 4,
    category: 'Pahalgam',
    amenities: ['Welcome Drink', 'Daily Breakfast & Dinner', 'Wi-Fi', 'Daily Housekeeping', 'Refrigerator', 'Mineral Water', '24-hour Room Service', 'Bonfire'],
    images: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
      'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=400',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'
    ]
  },
  {
    id: 'hb1',
    name: 'Houseboat London',
    location: 'Ghat via Grand Mumtal Dal Lake',
    stars: 5,
    category: 'Houseboat',
    amenities: ['Welcome Drink', 'Daily Breakfast & Dinner', 'Wi-Fi', 'Refrigerator', 'Mineral Water', 'Bathtub', 'Barbeque'],
    images: [
      'https://images.unsplash.com/photo-1559599141-3816a0b3f1e3?w=800',
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=400',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400'
    ]
  }
];

export const MOCK_ITINERARY: ItineraryData = {
  id: '1',
  clientName: 'Valued Traveler',
  packageName: 'MAGNIFICENT KASHMIR TOUR',
  duration: '4N/5D',
  packageType: 'Premium package',
  overview: 'Rightly called as the "Paradise on Earth" Kashmir bestows its visitors the view of pristine beauty of serene lakes, chinar trees, magnificent valleys and friendly people. This tour package has been specifically designed to offer you a feel of being in heaven with comfortable accommodation and sightseeing of the valley. Your journey will embark from Srinagar and will be followed by different tours as per your package.',
  coverImages: [
    'https://images.unsplash.com/photo-1598305371124-42ad188d59ee?w=800'
  ],
  days: [
    {
      id: 'd1',
      title: 'Arrival at Srinagar Airport & Local Sightseeing',
      date: '2025-12-23',
      description: 'Upon arrival at the Srinagar Airport, you will meet our representative and we will drive you to your hotel. After some rest, we will drive you for Srinagar Local sightseeings. Enjoy the sightseeings of the famous Mughal Gardens; Cheshma Shahi "Royal Spring", Shalimar Garden "Garden of Love", Nishat Garden "Garden of Pleasure" and the Shankaracharya Temple. Also enjoy 1 hr Shikara ride in Dal Lake.',
      distance: '12 km',
      travelTime: '30 mins'
    },
    {
      id: 'd2',
      title: 'Srinagar - Gulmarg - Srinagar',
      date: '2025-12-24',
      description: 'After breakfast, we drive to Gulmarg "Meadow of Flowers", located 2730 Mts above sea level. Gulmarg has one of the best Ski slopes in the world and the highest golf course of the world with 18 holes. One can also have the Gondola ride (cable car) from Gulmarg to Khalinmarg.',
      distance: '50 km',
      travelTime: '1.5 hours'
    },
    {
      id: 'd3',
      title: 'Srinagar - Pahalgam Sightseeing',
      date: '2025-12-25',
      description: 'Today we head towards Pahalgam "The Valley of Shepherds". Enroute see saffron fields and Awantipura ruins. In Pahalgam, enjoy the nature and walk around the banks of River Lidder. One can visit Betaab Valley, Chandanwari and Aru Valley by local union taxi.',
      distance: '95 km',
      travelTime: '2.5 hours'
    },
    {
      id: 'd4',
      title: 'Pahalgam - Sonmarg - Houseboat Stay',
      date: '2025-12-26',
      description: 'After breakfast, drive to Sonmarg "Meadow of Gold". It is the gateway to Ladakh. Here you can enjoy a pony ride to Thajiwas Glacier where snow remains round the year. In the evening, return to Srinagar for a luxury Houseboat stay.',
      distance: '180 km',
      travelTime: '4 hours'
    }
  ],
  selectedHotels: [
    { ...MASTER_HOTELS[0], isSelected: true },
    { ...MASTER_HOTELS[1], isSelected: true },
    { ...MASTER_HOTELS[2], isSelected: true }
  ],
  pricing: {
    totalPax: 2,
    adults: 2,
    children: 0,
    rooms: 1,
    extraBeds: 0,
    extraBedPrice: '0/-',
    cnbCount: 0,
    cnbPrice: '0/-',
    perAdultPrice: '18,500/-',
    perChildPrice: '0/-',
    totalCost: '37,000/-',
    roomType: 'Deluxe Room',
    nightBreakup: [
      { destination: 'Srinagar', nights: 2 },
      { destination: 'Pahalgam', nights: 1 },
      { destination: 'Houseboat', nights: 1 }
    ]
  },
  inclusions: [
    'Traditional Welcome Drink on Arrival',
    'Accommodation on Double Sharing',
    'Daily Breakfast & Dinner in Hotel/Houseboat',
    'All Sightseeing as per Itinerary',
    'Private Car for all Transfers (Etios/Innova)',
    '1 Hour Shikara Ride in Dal Lake',
    'Toll taxes, Parking, and Driver Allowance'
  ],
  exclusions: [
    'Airfare / Train fare',
    'Lunch and Snacks',
    'Entry Tickets to Mughal Gardens',
    'Gondola Ride Tickets in Gulmarg',
    'Pony Rides & Local Union Taxi in Pahalgam',
    'Anything not mentioned in Inclusions'
  ],
  supplementCosts: [
    'Innova Upgrade: 1,500/- per day extra',
    'Gala Dinner (Mandatory for Dec 24/31): 3,500/- per person'
  ],
  terms: [
    'Package is subject to availability at the time of booking',
    '50% advance payment required to process the booking',
    'Balance payment to be cleared 15 days before arrival',
    'Rates are valid for the specified dates only'
  ],
  cancellationPolicy: [
    'Cancellation before 30 days: 10% of total cost',
    'Cancellation before 15 days: 50% of total cost',
    'Cancellation within 7 days: No refund',
    'Postponement is subject to hotel policy and availability'
  ]
};
