import { useState } from 'react';
import { useApp, totalStats } from '@/context/AppContext';
import { computeAvailability } from '@/data/parkingData';
import type { ParkingSlot } from '@/types';
import {
  Building2, CircleParking, Car, Clock, TrendingUp, Activity, Users, IndianRupee,
  Radio, LogIn, LogOut, Cpu, Zap
} from 'lucide-react';
import { classNames, timeAgo } from '@/utils/helpers';

export default function AdminDashboard() {
  const { parkings, bookings, users, simulateEntry, simulateExit, currentUser } = useApp();
  const [selectedParkingId, setSelectedParkingId] = useState(parkings[0]?.id ?? '');
  const stats = totalStats(parkings);
  const allUsers = [...users];
  // Count demo users if they've logged in
  if (currentUser && !allUsers.some((u) => u.id === currentUser.id)) allUsers.push(currentUser);
  const revenue = bookings.filter((b) => b.status !== 'cancelled').reduce((sum, b) => sum + b.amount, 0);
  const occupancyRate = stats.totalSpaces > 0 ? Math.round(((stats.occupied + stats.reserved) / stats.totalSpaces) * 100) : 0;

  const selectedParking = parkings.find((p) => p.id === selectedParkingId) ?? parkings[0];

  const statCards = [
    { label: 'Parking Areas', value: stats.parkingAreas, icon: Building2, color: 'bg-blue-500' },
    { label: 'Total Spaces', value: stats.totalSpaces, icon: CircleParking, color: 'bg-indigo-500' },
    { label: 'Available', value: stats.available, icon: Car, color: 'bg-green-500' },
    { label: 'Occupied', value: stats.occupied, icon: TrendingUp, color: 'bg-red-500' },
    { label: 'Reserved', value: stats.reserved, icon: Clock, color: 'bg-yellow-500' },
    { label: 'Bookings', value: bookings.length, icon: Activity, color: 'bg-purple-500' },
    { label: 'Users', value: allUsers.length, icon: Users, color: 'bg-cyan-500' },
    { label: 'Revenue', value: `₹${revenue}`, icon: IndianRupee, color: 'bg-emerald-500' },
  ];

  const handleEntry = (slot: ParkingSlot) => {
    if (slot.status === 'available' || slot.status === 'reserved') {
      simulateEntry(selectedParking.id, slot.id);
    }
  };

  const handleExit = (slot: ParkingSlot) => {
    if (slot.status === 'occupied') {
      simulateExit(selectedParking.id, slot.id);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <span className="bg-gray-800 text-white text-xs font-bold px-2.5 py-1 rounded-full">ADMIN</span>
      </div>

      {/* Admin stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className={classNames('w-9 h-9 rounded-lg flex items-center justify-center mb-2', c.color)}>
                <Icon className="w-4.5 h-4.5 text-white" />
              </div>
              <p className="text-xl font-bold text-gray-800">{c.value}</p>
              <p className="text-xs text-gray-500">{c.label}</p>
            </div>
          );
        })}
      </div>

      {/* Parking availability cards */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h2 className="font-bold text-gray-800 mb-4">Parking Availability</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {parkings.map((p) => {
            const a = computeAvailability(p);
            return (
              <div key={p.id} className={classNames(
                'border rounded-xl p-3 transition-all',
                selectedParkingId === p.id ? 'border-blue-400 bg-blue-50 ring-1 ring-blue-200' : 'border-gray-200 hover:border-blue-200'
              )}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm text-gray-800 truncate">{p.name}</h3>
                  <span className={classNames(
                    'text-xs px-2 py-0.5 rounded-full font-medium',
                    a.mapStatus === 'available' ? 'bg-green-100 text-green-700' :
                    a.mapStatus === 'limited' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  )}>
                    {a.mapStatus}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
                  <div className="bg-gray-50 rounded py-1"><p className="font-bold text-gray-700">{p.totalSpaces}</p><p className="text-gray-400">Total</p></div>
                  <div className="bg-green-50 rounded py-1"><p className="font-bold text-green-600">{a.available}</p><p className="text-gray-400">Avail</p></div>
                  <div className="bg-red-50 rounded py-1"><p className="font-bold text-red-600">{a.occupied}</p><p className="text-gray-400">Occ</p></div>
                  <div className="bg-yellow-50 rounded py-1"><p className="font-bold text-yellow-600">{a.reserved}</p><p className="text-gray-400">Res</p></div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${a.occupancyPct}%` }} />
                  </div>
                  <span className="text-xs font-medium text-gray-500">{a.occupancyPct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Overall occupancy */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-gray-800">Overall Occupancy Rate</h2>
          <span className="text-2xl font-bold text-blue-600">{occupancyRate}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
          <div className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 transition-all" style={{ width: `${occupancyRate}%` }} />
        </div>
      </div>

      {/* Live Sensor Simulation */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-1">
          <Radio className="w-5 h-5 text-blue-600" />
          <h2 className="font-bold text-gray-800">Live Sensor Simulation</h2>
        </div>
        <p className="text-sm text-gray-400 mb-4">Prototype Mode — Sensor data is simulated.</p>

        {/* Parking selector */}
        <div className="flex flex-wrap gap-2 mb-4">
          {parkings.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedParkingId(p.id)}
              className={classNames(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                selectedParkingId === p.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {p.name}
            </button>
          ))}
        </div>

        {selectedParking && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-100">
                  <th className="pb-2 font-medium">Sensor ID</th>
                  <th className="pb-2 font-medium">Slot</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Last Updated</th>
                  <th className="pb-2 font-medium text-right">Simulate</th>
                </tr>
              </thead>
              <tbody>
                {selectedParking.slots.map((slot) => (
                  <tr key={slot.id} className="border-b border-gray-50">
                    <td className="py-2.5 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-gray-400" />
                      <span className="font-mono text-xs text-gray-600">{slot.sensorId}</span>
                    </td>
                    <td className="py-2.5 font-bold text-gray-700">{slot.slot}</td>
                    <td className="py-2.5">
                      <span className={classNames(
                        'inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full',
                        slot.status === 'available' ? 'bg-green-100 text-green-700' :
                        slot.status === 'occupied' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      )}>
                        <span className={classNames(
                          'w-2 h-2 rounded-full',
                          slot.status === 'available' ? 'bg-green-500' :
                          slot.status === 'occupied' ? 'bg-red-500' : 'bg-yellow-500'
                        )} />
                        {slot.status === 'available' ? 'AVAILABLE' : slot.status === 'occupied' ? 'OCCUPIED' : 'RESERVED'}
                      </span>
                    </td>
                    <td className="py-2.5 text-xs text-gray-400">{timeAgo(slot.lastUpdated)}</td>
                    <td className="py-2.5 text-right">
                      <div className="flex gap-1.5 justify-end">
                        <button
                          onClick={() => handleEntry(slot)}
                          disabled={slot.status === 'occupied'}
                          className={classNames(
                            'text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1',
                            slot.status === 'occupied' ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-red-50 text-red-600 hover:bg-red-100'
                          )}
                        >
                          <LogIn className="w-3.5 h-3.5" /> Entry
                        </button>
                        <button
                          onClick={() => handleExit(slot)}
                          disabled={slot.status !== 'occupied'}
                          className={classNames(
                            'text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1',
                            slot.status !== 'occupied' ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-green-50 text-green-600 hover:bg-green-100'
                          )}
                        >
                          <LogOut className="w-3.5 h-3.5" /> Exit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Quick simulate buttons */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => {
              const avail = selectedParking?.slots.find((s) => s.status === 'available');
              if (avail) simulateEntry(selectedParking.id, avail.id);
            }}
            className="bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold px-4 py-2 rounded-xl transition-all flex items-center gap-2"
          >
            <Zap className="w-4 h-4" /> Simulate Vehicle Entry
          </button>
          <button
            onClick={() => {
              const occ = selectedParking?.slots.find((s) => s.status === 'occupied');
              if (occ) simulateExit(selectedParking.id, occ.id);
            }}
            className="bg-green-50 hover:bg-green-100 text-green-600 text-sm font-semibold px-4 py-2 rounded-xl transition-all flex items-center gap-2"
          >
            <Zap className="w-4 h-4" /> Simulate Vehicle Exit
          </button>
        </div>

        <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
          <p className="text-xs text-blue-600 font-medium">In the future, these simulated sensor events can be replaced by real ultrasonic/IR sensor data.</p>
        </div>
      </div>

      {/* Recent bookings */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h2 className="font-bold text-gray-800 mb-4">Recent Bookings</h2>
        {bookings.length === 0 ? (
          <p className="text-sm text-gray-400">No bookings yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-100">
                  <th className="pb-2 font-medium">Parking</th>
                  <th className="pb-2 font-medium">Slot</th>
                  <th className="pb-2 font-medium">Vehicle</th>
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium">Amount</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0, 10).map((b) => (
                  <tr key={b.id} className="border-b border-gray-50">
                    <td className="py-2.5 text-gray-700">{b.parkingName}</td>
                    <td className="py-2.5 font-bold text-gray-700">{b.slot}</td>
                    <td className="py-2.5 text-gray-600">{b.vehicleNumber}</td>
                    <td className="py-2.5 text-gray-500 text-xs">{b.date} {b.startTime}</td>
                    <td className="py-2.5 font-bold text-blue-600">₹{b.amount}</td>
                    <td className="py-2.5">
                      <span className={classNames(
                        'text-xs px-2 py-0.5 rounded-full font-medium',
                        b.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                        b.status === 'completed' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      )}>{b.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Users list */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h2 className="font-bold text-gray-800 mb-4">Registered Users</h2>
        {allUsers.length === 0 ? (
          <p className="text-sm text-gray-400">No users registered.</p>
        ) : (
          <div className="space-y-2">
            {allUsers.map((u) => (
              <div key={u.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">{u.name.charAt(0).toUpperCase()}</div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{u.name}</p>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </div>
                </div>
                <span className={classNames('text-xs px-2 py-0.5 rounded-full font-medium', u.role === 'admin' ? 'bg-gray-800 text-white' : 'bg-blue-100 text-blue-700')}>{u.role}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
