export interface Place {
  /** City, or the country itself when no city is given. */
  name: string;
  country: string;
  lat: number;
  lon: number;
  /** Where I live now, or have lived. Everything else is a visit. */
  kind?: 'home' | 'lived';
}

export const places: Place[] = [
  { name: 'New York', country: 'United States', lat: 40.71, lon: -74.01, kind: 'home' },
  { name: 'San Francisco', country: 'United States', lat: 37.77, lon: -122.42, kind: 'lived' },
  { name: 'Toronto', country: 'Canada', lat: 43.65, lon: -79.38 },
  { name: 'Montreal', country: 'Canada', lat: 45.5, lon: -73.57 },
  { name: 'Puerto Vallarta', country: 'Mexico', lat: 20.65, lon: -105.23 },
  { name: 'Cancún', country: 'Mexico', lat: 21.16, lon: -86.85 },
  { name: 'Mexico City', country: 'Mexico', lat: 19.43, lon: -99.13 },
  { name: 'Puerto Rico', country: 'Puerto Rico', lat: 18.47, lon: -66.11 },
  { name: 'Barbados', country: 'Barbados', lat: 13.1, lon: -59.61 },
  { name: 'Jamaica', country: 'Jamaica', lat: 18.11, lon: -77.3 },
  { name: 'Colombia', country: 'Colombia', lat: 4.71, lon: -74.07 },
  { name: 'Hong Kong', country: 'Hong Kong', lat: 22.32, lon: 114.17, kind: 'lived' },
  { name: 'Japan', country: 'Japan', lat: 35.68, lon: 139.69 },
  { name: 'Taiwan', country: 'Taiwan', lat: 25.03, lon: 121.56 },
  { name: 'London', country: 'United Kingdom', lat: 51.51, lon: -0.13 },
  { name: 'Paris', country: 'France', lat: 48.86, lon: 2.35 },
  { name: 'Spain', country: 'Spain', lat: 40.42, lon: -3.7 },
  { name: 'Marrakech', country: 'Morocco', lat: 31.63, lon: -7.99 },
  { name: 'Dublin', country: 'Ireland', lat: 53.35, lon: -6.26 },
  { name: 'Copenhagen', country: 'Denmark', lat: 55.68, lon: 12.57 },
  { name: 'Abu Dhabi', country: 'United Arab Emirates', lat: 24.45, lon: 54.38 },
  { name: 'Thailand', country: 'Thailand', lat: 13.76, lon: 100.5 },
];
