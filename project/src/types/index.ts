export type SlotStatus = 'available' | 'occupied' | 'reserved';

export interface ParkingSlot {
  id: string;
  sensorId: string;
  slot: string;
  status: SlotStatus;
  lastUpdated: string;
}

export interface ParkingLocation {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  distance: number;
  rating: number;
  totalSpaces: number;
  pricePerHour: number;
  openHours: string;
  slots: ParkingSlot[];
}

export type BookingStatus = 'confirmed' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  userId: string;
  parkingId: string;
  parkingName: string;
  slotId: string;
  slot: string;
  vehicleNumber: string;
  date: string;
  startTime: string;
  duration: number;
  amount: number;
  status: BookingStatus;
  createdAt: string;
}

export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
  vehicles: string[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'booking' | 'info' | 'reminder';
}
