export type GeoLocationOption = {
  id: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
};

// Initial curated list of major cities with coordinates
// You can extend this list as needed.
export const GEO_LOCATIONS: GeoLocationOption[] = [
  // Delhi
  { id: "delhi", city: "New Delhi", state: "Delhi", country: "India", latitude: 28.6139, longitude: 77.209 },

  // Maharashtra
  { id: "mumbai", city: "Mumbai", state: "Maharashtra", country: "India", latitude: 19.076, longitude: 72.8777 },
  { id: "pune", city: "Pune", state: "Maharashtra", country: "India", latitude: 18.5204, longitude: 73.8567 },
  { id: "nagpur", city: "Nagpur", state: "Maharashtra", country: "India", latitude: 21.1458, longitude: 79.0882 },
  { id: "nashik", city: "Nashik", state: "Maharashtra", country: "India", latitude: 19.9975, longitude: 73.7898 },

  // Karnataka
  { id: "bengaluru", city: "Bengaluru", state: "Karnataka", country: "India", latitude: 12.9716, longitude: 77.5946 },
  { id: "mysuru", city: "Mysuru", state: "Karnataka", country: "India", latitude: 12.2958, longitude: 76.6394 },
  { id: "hubballi", city: "Hubballi", state: "Karnataka", country: "India", latitude: 15.3647, longitude: 75.1239 },

  // Telangana
  { id: "hyderabad", city: "Hyderabad", state: "Telangana", country: "India", latitude: 17.385, longitude: 78.4867 },
  { id: "warangal", city: "Warangal", state: "Telangana", country: "India", latitude: 17.9689, longitude: 79.5941 },

  // Tamil Nadu
  { id: "chennai", city: "Chennai", state: "Tamil Nadu", country: "India", latitude: 13.0827, longitude: 80.2707 },
  { id: "coimbatore", city: "Coimbatore", state: "Tamil Nadu", country: "India", latitude: 11.0168, longitude: 76.9558 },
  { id: "madurai", city: "Madurai", state: "Tamil Nadu", country: "India", latitude: 9.9252, longitude: 78.1198 },

  // Gujarat
  { id: "ahmedabad", city: "Ahmedabad", state: "Gujarat", country: "India", latitude: 23.0225, longitude: 72.5714 },
  { id: "surat", city: "Surat", state: "Gujarat", country: "India", latitude: 21.1702, longitude: 72.8311 },
  { id: "vadodara", city: "Vadodara", state: "Gujarat", country: "India", latitude: 22.3072, longitude: 73.1812 },
  { id: "rajkot", city: "Rajkot", state: "Gujarat", country: "India", latitude: 22.3039, longitude: 70.8022 },

  // Uttar Pradesh
  { id: "lucknow", city: "Lucknow", state: "Uttar Pradesh", country: "India", latitude: 26.8467, longitude: 80.9462 },
  { id: "kanpur", city: "Kanpur", state: "Uttar Pradesh", country: "India", latitude: 26.4499, longitude: 80.3319 },
  { id: "varanasi", city: "Varanasi", state: "Uttar Pradesh", country: "India", latitude: 25.3176, longitude: 82.9739 },
  { id: "agra", city: "Agra", state: "Uttar Pradesh", country: "India", latitude: 27.1767, longitude: 78.0081 },

  // Rajasthan
  { id: "jaipur", city: "Jaipur", state: "Rajasthan", country: "India", latitude: 26.9124, longitude: 75.7873 },
  { id: "udaipur", city: "Udaipur", state: "Rajasthan", country: "India", latitude: 24.5854, longitude: 73.7125 },
  { id: "jodhpur", city: "Jodhpur", state: "Rajasthan", country: "India", latitude: 26.2389, longitude: 73.0243 },

  // West Bengal
  { id: "kolkata", city: "Kolkata", state: "West Bengal", country: "India", latitude: 22.5726, longitude: 88.3639 },
  { id: "asansol", city: "Asansol", state: "West Bengal", country: "India", latitude: 23.685, longitude: 86.9938 },

  // Madhya Pradesh
  { id: "bhopal", city: "Bhopal", state: "Madhya Pradesh", country: "India", latitude: 23.2599, longitude: 77.4126 },
  { id: "indore", city: "Indore", state: "Madhya Pradesh", country: "India", latitude: 22.7196, longitude: 75.8577 },
  { id: "gwalior", city: "Gwalior", state: "Madhya Pradesh", country: "India", latitude: 26.2183, longitude: 78.1828 },

  // Bihar
  { id: "patna", city: "Patna", state: "Bihar", country: "India", latitude: 25.5941, longitude: 85.1376 },
  { id: "gaya", city: "Gaya", state: "Bihar", country: "India", latitude: 24.7955, longitude: 85.0077 },

  // Odisha
  { id: "bhubaneswar", city: "Bhubaneswar", state: "Odisha", country: "India", latitude: 20.2961, longitude: 85.8245 },
  { id: "cuttack", city: "Cuttack", state: "Odisha", country: "India", latitude: 20.4625, longitude: 85.8828 },

  // Punjab
  { id: "ludhiana", city: "Ludhiana", state: "Punjab", country: "India", latitude: 30.901, longitude: 75.8573 },
  { id: "amritsar", city: "Amritsar", state: "Punjab", country: "India", latitude: 31.634, longitude: 74.8723 },

  // Haryana
  { id: "gurugram", city: "Gurugram", state: "Haryana", country: "India", latitude: 28.4595, longitude: 77.0266 },
  { id: "faridabad", city: "Faridabad", state: "Haryana", country: "India", latitude: 28.4089, longitude: 77.3178 },

  // Kerala
  { id: "kochi", city: "Kochi", state: "Kerala", country: "India", latitude: 9.9312, longitude: 76.2673 },
  { id: "thiruvananthapuram", city: "Thiruvananthapuram", state: "Kerala", country: "India", latitude: 8.5241, longitude: 76.9366 },

  // Andhra Pradesh
  { id: "visakhapatnam", city: "Visakhapatnam", state: "Andhra Pradesh", country: "India", latitude: 17.6868, longitude: 83.2185 },
  { id: "vijayawada", city: "Vijayawada", state: "Andhra Pradesh", country: "India", latitude: 16.5062, longitude: 80.648 },

  // Jharkhand
  { id: "ranchi", city: "Ranchi", state: "Jharkhand", country: "India", latitude: 23.3441, longitude: 85.3096 },
  { id: "jamshedpur", city: "Jamshedpur", state: "Jharkhand", country: "India", latitude: 22.8046, longitude: 86.2029 },

  // Chhattisgarh
  { id: "raipur", city: "Raipur", state: "Chhattisgarh", country: "India", latitude: 21.2514, longitude: 81.6296 },

  // Uttarakhand
  { id: "dehradun", city: "Dehradun", state: "Uttarakhand", country: "India", latitude: 30.3165, longitude: 78.0322 },
  { id: "haridwar", city: "Haridwar", state: "Uttarakhand", country: "India", latitude: 29.9457, longitude: 78.1642 },

  // Himachal Pradesh
  { id: "shimla", city: "Shimla", state: "Himachal Pradesh", country: "India", latitude: 31.1048, longitude: 77.1734 },

  // Assam
  { id: "guwahati", city: "Guwahati", state: "Assam", country: "India", latitude: 26.1445, longitude: 91.7362 },

  // Jammu & Kashmir (UT)
  { id: "srinagar", city: "Srinagar", state: "Jammu and Kashmir", country: "India", latitude: 34.0837, longitude: 74.7973 },
];

export function findGeoLocationByCity(city: string | undefined | null): GeoLocationOption | undefined {
  if (!city) return undefined;
  const normalized = city.trim().toLowerCase();
  return GEO_LOCATIONS.find(
    (loc) =>
      loc.id === normalized ||
      loc.city.toLowerCase() === normalized ||
      `${loc.city}, ${loc.state}`.toLowerCase() === normalized
  );
}
