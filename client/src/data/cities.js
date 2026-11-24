// Curated list of popular Indian and international cities
// Users can always type any custom city if not listed.

export const POPULAR_CITIES = [
  // Delhi NCR & North India
  'Delhi, India',
  'New Delhi, India',
  'Gurugram (Gurgaon), Haryana',
  'Noida, Uttar Pradesh',
  'Greater Noida, Uttar Pradesh',
  'Faridabad, Haryana',
  'Ghaziabad, Uttar Pradesh',
  'Chandigarh, India',
  'Mohali, Punjab',
  'Panchkula, Haryana',
  'Jaipur, Rajasthan',
  'Jodhpur, Rajasthan',
  'Udaipur, Rajasthan',
  'Kota, Rajasthan',
  'Dehradun, Uttarakhand',
  'Shimla, Himachal Pradesh',
  'Lucknow, Uttar Pradesh',
  'Kanpur, Uttar Pradesh',
  'Varanasi, Uttar Pradesh',
  'Prayagraj (Allahabad), Uttar Pradesh',
  'Agra, Uttar Pradesh',
  'Amritsar, Punjab',
  'Ludhiana, Punjab',
  'Jalandhar, Punjab',
  'Sonipat, Haryana',
  'Rohtak, Haryana',
  'Panipat, Haryana',
  'Jammu, Jammu & Kashmir',
  'Srinagar, Jammu & Kashmir',

  // South India
  'Bengaluru (Bangalore), Karnataka',
  'Manipal, Karnataka',
  'Udupi, Karnataka',
  'Mangaluru (Mangalore), Karnataka',
  'Mysuru (Mysore), Karnataka',
  'Hubballi-Dharwad, Karnataka',
  'Hyderabad, Telangana',
  'Warangal, Telangana',
  'Chennai (Madras), Tamil Nadu',
  'Coimbatore, Tamil Nadu',
  'Madurai, Tamil Nadu',
  'Tiruchirappalli (Trichy), Tamil Nadu',
  'Salem, Tamil Nadu',
  'Vellore, Tamil Nadu',
  'Kochi (Cochin), Kerala',
  'Thiruvananthapuram (Trivandrum), Kerala',
  'Kozhikode (Calicut), Kerala',
  'Thrissur, Kerala',
  'Visakhapatnam (Vizag), Andhra Pradesh',
  'Vijayawada, Andhra Pradesh',
  'Guntur, Andhra Pradesh',
  'Tirupati, Andhra Pradesh',
  'Puducherry (Pondicherry), India',

  // West & Central India
  'Mumbai (Bombay), Maharashtra',
  'Navi Mumbai, Maharashtra',
  'Thane, Maharashtra',
  'Pune, Maharashtra',
  'Nagpur, Maharashtra',
  'Nashik, Maharashtra',
  'Aurangabad (Chhatrapati Sambhajinagar), Maharashtra',
  'Panaji, Goa',
  'Margao, Goa',
  'Ahmedabad, Gujarat',
  'Surat, Gujarat',
  'Vadodara (Baroda), Gujarat',
  'Rajkot, Gujarat',
  'Indore, Madhya Pradesh',
  'Bhopal, Madhya Pradesh',
  'Gwalior, Madhya Pradesh',
  'Jabalpur, Madhya Pradesh',
  'Raipur, Chhattisgarh',

  // East & North East India
  'Kolkata (Calcutta), West Bengal',
  'Howrah, West Bengal',
  'Bhubaneswar, Odisha',
  'Cuttack, Odisha',
  'Rourkela, Odisha',
  'Patna, Bihar',
  'Gaya, Bihar',
  'Ranchi, Jharkhand',
  'Jamshedpur, Jharkhand',
  'Guwahati, Assam',
  'Shillong, Meghalaya',
  'Gangtok, Sikkim',
  'Agartala, Tripura',
  'Imphal, Manipur',
  'Aizawl, Mizoram',
  'Kohima, Nagaland',
  'Itanagar, Arunachal Pradesh',

  // Major International Cities
  'New York City, USA',
  'San Francisco / Bay Area, USA',
  'Los Angeles, USA',
  'Seattle, USA',
  'Boston, USA',
  'Chicago, USA',
  'Austin, USA',
  'Toronto, Canada',
  'Vancouver, Canada',
  'London, United Kingdom',
  'Manchester, United Kingdom',
  'Edinburgh, United Kingdom',
  'Dublin, Ireland',
  'Berlin, Germany',
  'Munich, Germany',
  'Paris, France',
  'Amsterdam, Netherlands',
  'Singapore',
  'Dubai, United Arab Emirates',
  'Abu Dhabi, United Arab Emirates',
  'Doha, Qatar',
  'Sydney, Australia',
  'Melbourne, Australia',
  'Tokyo, Japan',
  'Hong Kong',
];

/**
 * Filter city suggestions based on query text
 * @param {string} query
 * @param {number} limit
 * @returns {string[]}
 */
export function getCitySuggestions(query = '', limit = 8) {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return [];

  const searchTerms = cleanQuery.split(/\s+/).filter(Boolean);

  const matched = POPULAR_CITIES.filter((city) => {
    const lower = city.toLowerCase();
    return searchTerms.every((term) => lower.includes(term));
  });

  matched.sort((a, b) => {
    const aLower = a.toLowerCase();
    const bLower = b.toLowerCase();
    const aStarts = aLower.startsWith(cleanQuery);
    const bStarts = bLower.startsWith(cleanQuery);
    if (aStarts && !bStarts) return -1;
    if (!aStarts && bStarts) return 1;
    return a.localeCompare(b);
  });

  return matched.slice(0, limit);
}
