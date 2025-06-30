// Australian Wedding Locations Data
export const australianWeddingLocations = [
  // Major Cities
  { name: 'Sydney, NSW', type: 'city', region: 'New South Wales' },
  { name: 'Melbourne, VIC', type: 'city', region: 'Victoria' },
  { name: 'Brisbane, QLD', type: 'city', region: 'Queensland' },
  { name: 'Perth, WA', type: 'city', region: 'Western Australia' },
  { name: 'Adelaide, SA', type: 'city', region: 'South Australia' },
  { name: 'Gold Coast, QLD', type: 'city', region: 'Queensland' },
  { name: 'Newcastle, NSW', type: 'city', region: 'New South Wales' },
  { name: 'Canberra, ACT', type: 'city', region: 'Australian Capital Territory' },
  { name: 'Sunshine Coast, QLD', type: 'city', region: 'Queensland' },
  { name: 'Wollongong, NSW', type: 'city', region: 'New South Wales' },
  
  // Popular Wedding Regions
  { name: 'Hunter Valley, NSW', type: 'region', region: 'New South Wales' },
  { name: 'Yarra Valley, VIC', type: 'region', region: 'Victoria' },
  { name: 'Barossa Valley, SA', type: 'region', region: 'South Australia' },
  { name: 'Margaret River, WA', type: 'region', region: 'Western Australia' },
  { name: 'Mornington Peninsula, VIC', type: 'region', region: 'Victoria' },
  { name: 'Blue Mountains, NSW', type: 'region', region: 'New South Wales' },
  { name: 'Grampians, VIC', type: 'region', region: 'Victoria' },
  { name: 'Adelaide Hills, SA', type: 'region', region: 'South Australia' },
  { name: 'Dandenong Ranges, VIC', type: 'region', region: 'Victoria' },
  { name: 'Southern Highlands, NSW', type: 'region', region: 'New South Wales' },
  
  // Beach/Coastal Locations
  { name: 'Byron Bay, NSW', type: 'beach', region: 'New South Wales' },
  { name: 'Noosa, QLD', type: 'beach', region: 'Queensland' },
  { name: 'Mooloolaba, QLD', type: 'beach', region: 'Queensland' },
  { name: 'Port Douglas, QLD', type: 'beach', region: 'Queensland' },
  { name: 'Broome, WA', type: 'beach', region: 'Western Australia' },
  { name: 'Great Ocean Road, VIC', type: 'beach', region: 'Victoria' },
  { name: 'Jervis Bay, NSW', type: 'beach', region: 'New South Wales' },
  { name: 'Kangaroo Island, SA', type: 'beach', region: 'South Australia' },
  { name: 'Rottnest Island, WA', type: 'beach', region: 'Western Australia' },
  
  // Mountain/Country Locations
  { name: 'Mount Tamborine, QLD', type: 'mountain', region: 'Queensland' },
  { name: 'Leura, NSW', type: 'mountain', region: 'New South Wales' },
  { name: 'Daylesford, VIC', type: 'mountain', region: 'Victoria' },
  { name: 'Hahndorf, SA', type: 'mountain', region: 'South Australia' },
  { name: 'Maleny, QLD', type: 'mountain', region: 'Queensland' },
  { name: 'Orange, NSW', type: 'mountain', region: 'New South Wales' },
  { name: 'Bright, VIC', type: 'mountain', region: 'Victoria' },
  
  // Wine Regions
  { name: 'Clare Valley, SA', type: 'wine', region: 'South Australia' },
  { name: 'McLaren Vale, SA', type: 'wine', region: 'South Australia' },
  { name: 'Rutherglen, VIC', type: 'wine', region: 'Victoria' },
  { name: 'Mudgee, NSW', type: 'wine', region: 'New South Wales' },
  { name: 'Swan Valley, WA', type: 'wine', region: 'Western Australia' },
];

// Search function
export const searchLocations = (query, limit = 5) => {
  if (!query || query.length < 2) return [];
  
  const searchTerm = query.toLowerCase();
  
  return australianWeddingLocations
    .filter(location => 
      location.name.toLowerCase().includes(searchTerm) ||
      location.region.toLowerCase().includes(searchTerm) ||
      location.type.toLowerCase().includes(searchTerm)
    )
    .slice(0, limit)
    .sort((a, b) => {
      // Prioritize exact matches at the beginning
      const aStartsWith = a.name.toLowerCase().startsWith(searchTerm);
      const bStartsWith = b.name.toLowerCase().startsWith(searchTerm);
      
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      
      // Then prioritize by type (cities first, then regions, etc.)
      const typeOrder = { 'city': 0, 'region': 1, 'beach': 2, 'wine': 3, 'mountain': 4 };
      return (typeOrder[a.type] || 5) - (typeOrder[b.type] || 5);
    });
};

// Get location icon based on type
export const getLocationIcon = (type) => {
  switch (type) {
    case 'city': return '🏙️';
    case 'region': return '🌄';
    case 'beach': return '🏖️';
    case 'wine': return '🍷';
    case 'mountain': return '⛰️';
    default: return '📍';
  }
};