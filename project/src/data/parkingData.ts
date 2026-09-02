import type { ParkingLocation, ParkingSlot, SlotStatus } from '@/types';

let globalSensorCounter = 0;

function makeSlots(prefix: string, count: number, startIdx = 1): ParkingSlot[] {
  const slots: ParkingSlot[] = [];
  for (let i = 0; i < count; i++) {
    const num = startIdx + i;
    globalSensorCounter++;
    // Mostly available so users can book; small portion occupied/reserved
    let status: SlotStatus = 'available';
    const roll = Math.random();
    if (roll > 0.82) status = 'occupied';
    else if (roll > 0.72) status = 'reserved';
    slots.push({
      id: `${prefix}-${num}`,
      sensorId: `S${String(globalSensorCounter).padStart(3, '0')}`,
      slot: `${prefix}${num}`,
      status,
      lastUpdated: new Date().toISOString(),
    });
  }
  return slots;
}

function buildSlots(): ParkingSlot[] {
  return [
    ...makeSlots('A', 5),
    ...makeSlots('B', 5),
    ...makeSlots('C', 5),
    ...makeSlots('D', 5),
  ];
}

function computeStatus(available: number, total: number): 'available' | 'limited' | 'full' {
  if (total === 0) return 'full';
  const pct = available / total;
  if (pct === 0) return 'full';
  if (pct < 0.25) return 'limited';
  return 'available';
}

export function computeAvailability(loc: ParkingLocation) {
  let available = 0;
  let occupied = 0;
  let reserved = 0;
  loc.slots.forEach((s) => {
    if (s.status === 'available') available++;
    else if (s.status === 'occupied') occupied++;
    else if (s.status === 'reserved') reserved++;
  });
  const totalSlots = loc.slots.length;
  const occupancyPct = totalSlots > 0 ? Math.round(((occupied + reserved) / totalSlots) * 100) : 0;
  const mapStatus = computeStatus(available, totalSlots);
  return { available, occupied, reserved, occupancyPct, mapStatus };
}

export const NAGPUR_CENTER = { lat: 21.1463, lng: 79.0849 };

interface RawLocation {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  distance: number;
  rating: number;
  pricePerHour: number;
  openHours: string;
}

const rawLocations: RawLocation[] = [
  { id: 'sitabuldi', name: 'Sitabuldi Main Market Parking', address: 'Sitabuldi Main Road, Sitabuldi, Nagpur', lat: 21.1520, lng: 79.0855, distance: 0.8, rating: 4.2, pricePerHour: 20, openHours: '8:00 AM - 10:00 PM' },
  { id: 'railway-station', name: 'Nagpur Railway Station Parking', address: 'Kingsway, Nagpur Junction, Nagpur', lat: 21.1463, lng: 79.0849, distance: 1.2, rating: 4.5, pricePerHour: 30, openHours: '24 Hours' },
  { id: 'civil-lines', name: 'Civil Lines Parking', address: 'Civil Lines, Nagpur', lat: 21.1645, lng: 79.0762, distance: 2.1, rating: 4.3, pricePerHour: 25, openHours: '7:00 AM - 11:00 PM' },
  { id: 'sadar', name: 'Sadar Bazar Parking', address: 'Sadar Bazar, Nagpur', lat: 21.1680, lng: 79.0905, distance: 2.8, rating: 4.1, pricePerHour: 20, openHours: '9:00 AM - 9:00 PM' },
  { id: 'dhantoli', name: 'Dhantoli Parking Plaza', address: 'Dhantoli, Nagpur', lat: 21.1380, lng: 79.0700, distance: 3.2, rating: 4.0, pricePerHour: 15, openHours: '8:00 AM - 10:00 PM' },
  { id: 'ajni', name: 'Ajni Railway Parking', address: 'Ajni, Nagpur', lat: 21.1380, lng: 79.0775, distance: 3.5, rating: 3.9, pricePerHour: 15, openHours: '24 Hours' },
  { id: 'mahal', name: 'Mahal Heritage Parking', address: 'Mahal, Old Nagpur', lat: 21.1535, lng: 79.1012, distance: 4.0, rating: 4.4, pricePerHour: 20, openHours: '8:00 AM - 9:00 PM' },
  { id: 'itwari', name: 'Itwari Market Parking', address: 'Itwari, Nagpur', lat: 21.1600, lng: 79.1050, distance: 4.5, rating: 3.8, pricePerHour: 18, openHours: '7:00 AM - 10:00 PM' },
  { id: 'somalwada', name: 'Somalwada Tech Park Parking', address: 'Somalwada, Nagpur', lat: 21.1180, lng: 79.0480, distance: 5.2, rating: 4.6, pricePerHour: 25, openHours: '6:00 AM - 11:00 PM' },
  { id: 'dharampeth', name: 'Dharampeth College Road Parking', address: 'Dharampeth, Nagpur', lat: 21.1450, lng: 79.0500, distance: 5.8, rating: 4.3, pricePerHour: 20, openHours: '8:00 AM - 10:00 PM' },
  { id: 'wardha-road', name: 'Wardha Road Parking', address: 'Wardha Road, Nagpur', lat: 21.1280, lng: 79.0600, distance: 6.1, rating: 4.0, pricePerHour: 18, openHours: '24 Hours' },
  { id: 'medical-square', name: 'Medical Square Parking', address: 'Medical Square, Central Nagpur', lat: 21.1490, lng: 79.0920, distance: 1.5, rating: 4.2, pricePerHour: 22, openHours: '7:00 AM - 11:00 PM' },
  { id: 'manish-nagar', name: 'Manish Nagar Parking', address: 'Manish Nagar, Nagpur', lat: 21.1030, lng: 79.0520, distance: 7.2, rating: 4.1, pricePerHour: 15, openHours: '8:00 AM - 10:00 PM' },
  { id: 'hingna-road', name: 'Hingna Road Parking', address: 'Hingna Road, Nagpur', lat: 21.1720, lng: 79.0350, distance: 8.0, rating: 3.8, pricePerHour: 12, openHours: '7:00 AM - 9:00 PM' },
  { id: 'mihan', name: 'MIHAN SEZ Parking', address: 'MIHAN, Nagpur', lat: 21.1070, lng: 79.0220, distance: 9.5, rating: 4.5, pricePerHour: 25, openHours: '24 Hours' },
  { id: 'futala', name: 'Futala Lake Parking', address: 'Futala Lake, Nagpur', lat: 21.1650, lng: 79.0520, distance: 6.5, rating: 4.7, pricePerHour: 20, openHours: '6:00 AM - 10:00 PM' },
  { id: 'airport', name: 'Dr. Babasaheb Ambedkar Airport Parking', address: 'Sonegaon, Nagpur Airport', lat: 21.0922, lng: 79.0478, distance: 8.5, rating: 4.3, pricePerHour: 35, openHours: '24 Hours' },
  { id: 'central-nagpur', name: 'Central Nagpur Parking Plaza', address: 'Zero Mile, Central Nagpur', lat: 21.1458, lng: 79.0882, distance: 1.0, rating: 4.4, pricePerHour: 25, openHours: '24 Hours' },
];

export function createInitialParkingLocations(): ParkingLocation[] {
  return rawLocations.map((r) => {
    const slots = buildSlots();
    globalSensorCounter = 0;
    return {
      ...r,
      totalSpaces: slots.length,
      slots,
    };
  });
}

export { computeStatus };

// Haversine distance in km between two coordinates
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}
