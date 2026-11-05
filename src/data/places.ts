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
  { name: 'Los Angeles', country: 'United States', lat: 34.05, lon: -118.24 },
  { name: 'Houston', country: 'United States', lat: 29.76, lon: -95.37 },
  { name: 'Dallas', country: 'United States', lat: 32.78, lon: -96.8 },
  { name: 'Orlando', country: 'United States', lat: 28.54, lon: -81.38 },
  { name: 'Las Vegas', country: 'United States', lat: 36.17, lon: -115.14 },
  { name: 'Portland', country: 'United States', lat: 45.52, lon: -122.68 },
  { name: 'San Diego', country: 'United States', lat: 32.72, lon: -117.16 },
  { name: 'Chicago', country: 'United States', lat: 41.88, lon: -87.63 },
  { name: 'Atlanta', country: 'United States', lat: 33.75, lon: -84.39 },
  { name: 'Charlotte', country: 'United States', lat: 35.23, lon: -80.84 },
  { name: 'Washington DC', country: 'United States', lat: 38.91, lon: -77.04 },
  { name: 'Boston', country: 'United States', lat: 42.36, lon: -71.06 },
  { name: 'Maui', country: 'United States', lat: 20.8, lon: -156.33 },
  { name: 'Toronto', country: 'Canada', lat: 43.65, lon: -79.38 },
  { name: 'Montreal', country: 'Canada', lat: 45.5, lon: -73.57 },
  { name: 'Puerto Vallarta', country: 'Mexico', lat: 20.65, lon: -105.23 },
  { name: 'Cancún', country: 'Mexico', lat: 21.16, lon: -86.85 },
  { name: 'Mexico City', country: 'Mexico', lat: 19.43, lon: -99.13 },
  { name: 'Puerto Rico', country: 'Puerto Rico', lat: 18.47, lon: -66.11 },
  { name: 'Barbados', country: 'Barbados', lat: 13.1, lon: -59.61 },
  { name: 'Jamaica', country: 'Jamaica', lat: 18.11, lon: -77.3 },
  { name: 'Cartagena', country: 'Colombia', lat: 10.39, lon: -75.51 },
  { name: 'Medellín', country: 'Colombia', lat: 6.24, lon: -75.58 },
  { name: 'Hong Kong', country: 'Hong Kong', lat: 22.32, lon: 114.17, kind: 'lived' },
  { name: 'Tokyo', country: 'Japan', lat: 35.68, lon: 139.69 },
  { name: 'Osaka', country: 'Japan', lat: 34.69, lon: 135.5 },
  { name: 'Kyoto', country: 'Japan', lat: 35.01, lon: 135.77 },
  { name: 'Taiwan', country: 'Taiwan', lat: 25.03, lon: 121.56 },
  { name: 'London', country: 'United Kingdom', lat: 51.51, lon: -0.13 },
  { name: 'Paris', country: 'France', lat: 48.86, lon: 2.35 },
  { name: 'Barcelona', country: 'Spain', lat: 41.39, lon: 2.17 },
  { name: 'Madrid', country: 'Spain', lat: 40.42, lon: -3.7 },
  { name: 'Marrakech', country: 'Morocco', lat: 31.63, lon: -7.99 },
  { name: 'Dublin', country: 'Ireland', lat: 53.35, lon: -6.26 },
  { name: 'Copenhagen', country: 'Denmark', lat: 55.68, lon: 12.57 },
  { name: 'Abu Dhabi', country: 'United Arab Emirates', lat: 24.45, lon: 54.38 },
  { name: 'Phuket', country: 'Thailand', lat: 7.88, lon: 98.39 },
  { name: 'Bangkok', country: 'Thailand', lat: 13.76, lon: 100.5 },
];
