import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { ParkingLocation, Booking, User, Notification, SlotStatus } from '@/types';
import { createInitialParkingLocations, computeAvailability } from '@/data/parkingData';

interface AuthSession {
  userId: string;
}

interface AppState {
  currentUser: User | null;
  users: User[];
  parkings: ParkingLocation[];
  bookings: Booking[];
  notifications: Notification[];
  signUp: (name: string, email: string, password: string) => { ok: boolean; error?: string };
  signIn: (email: string, password: string) => { ok: boolean; error?: string };
  demoUser: () => void;
  demoAdmin: () => void;
  logout: () => void;
  updateProfile: (data: Partial<Pick<User, 'name' | 'phone' | 'vehicles'>>) => void;
  createBooking: (parkingId: string, slotId: string, date: string, startTime: string, vehicleNumber: string, duration: number) => Booking | null;
  cancelBooking: (bookingId: string) => void;
  simulateEntry: (parkingId: string, slotId: string) => void;
  simulateExit: (parkingId: string, slotId: string) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
}

const AppContext = createContext<AppState | null>(null);

const LS_USERS = 'smartpark_users';
const LS_SESSION = 'smartpark_session';
const LS_PARKINGS = 'smartpark_parkings';
const LS_BOOKINGS = 'smartpark_bookings';
const LS_NOTIFICATIONS = 'smartpark_notifications';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch { /* ignore */ }
  return fallback;
}

function saveToStorage<T>(key: string, value: T): void {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(() => loadFromStorage<User[]>(LS_USERS, []));
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [parkings, setParkings] = useState<ParkingLocation[]>(() =>
    loadFromStorage<ParkingLocation[]>(LS_PARKINGS, createInitialParkingLocations())
  );
  const [bookings, setBookings] = useState<Booking[]>(() => loadFromStorage<Booking[]>(LS_BOOKINGS, []));
  const [notifications, setNotifications] = useState<Notification[]>(() =>
    loadFromStorage<Notification[]>(LS_NOTIFICATIONS, [])
  );

  // Restore session on mount
  useEffect(() => {
    const session = loadFromStorage<AuthSession | null>(LS_SESSION, null);
    if (session) {
      const allUsers = loadFromStorage<User[]>(LS_USERS, []);
      const u = allUsers.find((x) => x.id === session.userId);
      // Demo users are not in the users array — restore them by id
      if (u) { setCurrentUser(u); return; }
      if (session.userId === 'demo-user') {
        setCurrentUser({ id: 'demo-user', name: 'Demo User', email: 'demo@smartpark.in', password: 'demo', phone: '+91 98765 43210', role: 'user', vehicles: ['MH-31 AB 1234'] });
        return;
      }
      if (session.userId === 'demo-admin') {
        setCurrentUser({ id: 'demo-admin', name: 'Admin', email: 'admin@smartpark.in', password: 'admin', phone: '+91 90000 00000', role: 'admin', vehicles: ['MH-31 XY 9999'] });
        return;
      }
    }
  }, []);

  useEffect(() => saveToStorage(LS_USERS, users), [users]);
  useEffect(() => saveToStorage(LS_PARKINGS, parkings), [parkings]);
  useEffect(() => saveToStorage(LS_BOOKINGS, bookings), [bookings]);
  useEffect(() => saveToStorage(LS_NOTIFICATIONS, notifications), [notifications]);

  const persistSession = (userId: string | null) => {
    if (userId) saveToStorage(LS_SESSION, { userId } as AuthSession);
    else localStorage.removeItem(LS_SESSION);
  };

  const addNotification = (title: string, message: string, type: Notification['type'] = 'info') => {
    const n: Notification = {
      id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title, message, time: new Date().toISOString(), read: false, type,
    };
    setNotifications((prev) => [n, ...prev].slice(0, 50));
  };

  const signUp: AppState['signUp'] = (name, email, password) => {
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { ok: false, error: 'An account with this email already exists.' };
    }
    const newUser: User = { id: `u-${Date.now()}`, name, email, password, phone: '', role: 'user', vehicles: [] };
    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    persistSession(newUser.id);
    addNotification('Welcome to SmartPark', `Account created for ${name}.`, 'info');
    return { ok: true };
  };

  const signIn: AppState['signIn'] = (email, password) => {
    const u = users.find((x) => x.email.toLowerCase() === email.toLowerCase() && x.password === password);
    if (!u) return { ok: false, error: 'Invalid email or password.' };
    setCurrentUser(u);
    persistSession(u.id);
    addNotification('Login Successful', `Welcome back, ${u.name}.`, 'info');
    return { ok: true };
  };

  const demoUser = () => {
    const demo: User = { id: 'demo-user', name: 'Demo User', email: 'demo@smartpark.in', password: 'demo', phone: '+91 98765 43210', role: 'user', vehicles: ['MH-31 AB 1234'] };
    setCurrentUser(demo);
    persistSession(demo.id);
    addNotification('Demo Login', 'You are logged in as a demo user.', 'info');
  };

  const demoAdmin = () => {
    const demo: User = { id: 'demo-admin', name: 'Admin', email: 'admin@smartpark.in', password: 'admin', phone: '+91 90000 00000', role: 'admin', vehicles: ['MH-31 XY 9999'] };
    setCurrentUser(demo);
    persistSession(demo.id);
    addNotification('Demo Admin Login', 'You are logged in as a demo admin.', 'info');
  };

  const logout = () => { setCurrentUser(null); persistSession(null); };

  const updateProfile: AppState['updateProfile'] = (data) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...data };
    setCurrentUser(updated);
    setUsers((prev) => {
      const exists = prev.some((u) => u.id === currentUser.id);
      return exists ? prev.map((u) => (u.id === currentUser.id ? updated : u)) : [...prev, updated];
    });
  };

  const updateSlotStatus = (parkingId: string, slotId: string, status: SlotStatus) => {
    setParkings((prev) =>
      prev.map((p) =>
        p.id === parkingId
          ? { ...p, slots: p.slots.map((s) => (s.id === slotId ? { ...s, status, lastUpdated: new Date().toISOString() } : s)) }
          : p
      )
    );
  };

  const createBooking: AppState['createBooking'] = (parkingId, slotId, date, startTime, vehicleNumber, duration) => {
    if (!currentUser) return null;
    const parking = parkings.find((p) => p.id === parkingId);
    const slot = parking?.slots.find((s) => s.id === slotId);
    if (!parking || !slot) return null;
    if (slot.status !== 'available') return null;

    const booking: Booking = {
      id: `b-${Date.now()}`,
      userId: currentUser.id,
      parkingId, parkingName: parking.name, slotId, slot: slot.slot,
      vehicleNumber, date, startTime, duration,
      amount: parking.pricePerHour * duration,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };
    setBookings((prev) => [booking, ...prev]);
    updateSlotStatus(parkingId, slotId, 'reserved');
    addNotification('Booking Confirmed', `Slot ${slot.slot} reserved at ${parking.name} for ${duration} hour(s).`, 'booking');
    return booking;
  };

  const cancelBooking: AppState['cancelBooking'] = (bookingId) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;
    setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b)));
    updateSlotStatus(booking.parkingId, booking.slotId, 'available');
    addNotification('Booking Cancelled', `Slot ${booking.slot} at ${booking.parkingName} is now available.`, 'info');
  };

  const simulateEntry: AppState['simulateEntry'] = (parkingId, slotId) => {
    const parking = parkings.find((p) => p.id === parkingId);
    const slot = parking?.slots.find((s) => s.id === slotId);
    if (!slot) return;
    if (slot.status === 'available' || slot.status === 'reserved') {
      updateSlotStatus(parkingId, slotId, 'occupied');
      addNotification('Vehicle Entry Simulated', `Slot ${slot.slot} is now occupied.`, 'info');
    }
  };

  const simulateExit: AppState['simulateExit'] = (parkingId, slotId) => {
    const parking = parkings.find((p) => p.id === parkingId);
    const slot = parking?.slots.find((s) => s.id === slotId);
    if (!slot) return;
    if (slot.status === 'occupied') {
      updateSlotStatus(parkingId, slotId, 'available');
      addNotification('Vehicle Exit Simulated', `Slot ${slot.slot} is now available.`, 'info');
    }
  };

  const markNotificationRead = (id: string) => setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  const clearNotifications = () => setNotifications([]);

  // Sync current user when users array changes
  useEffect(() => {
    if (currentUser) {
      const fresh = users.find((u) => u.id === currentUser.id);
      if (fresh && JSON.stringify(fresh) !== JSON.stringify(currentUser)) setCurrentUser(fresh);
    }
  }, [users]); // eslint-disable-line react-hooks/exhaustive-deps

  const value: AppState = {
    currentUser, users, parkings, bookings, notifications,
    signUp, signIn, demoUser, demoAdmin, logout, updateProfile,
    createBooking, cancelBooking, simulateEntry, simulateExit,
    markNotificationRead, clearNotifications,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export { computeAvailability };

export function getAvailability(parking: ParkingLocation) {
  return computeAvailability(parking);
}

export function totalStats(parkings: ParkingLocation[]) {
  let totalSpaces = 0, available = 0, occupied = 0, reserved = 0;
  parkings.forEach((p) => {
    const a = computeAvailability(p);
    totalSpaces += p.totalSpaces;
    available += a.available;
    occupied += a.occupied;
    reserved += a.reserved;
  });
  return { totalSpaces, available, occupied, reserved, parkingAreas: parkings.length };
}

export function userBookings(bookings: Booking[], currentUser: User | null): Booking[] {
  if (!currentUser) return [];
  return bookings.filter((b) => b.userId === currentUser.id);
}
