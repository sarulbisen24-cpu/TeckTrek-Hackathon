import { useApp, totalStats } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';
import { computeAvailability } from '@/data/parkingData';
import { Building2, CircleParking, Car, Clock, TrendingUp, Activity, ArrowRight, MapPin } from 'lucide-react';
import { classNames } from '@/utils/helpers';

export default function DashboardStats() {
  const { parkings, bookings } = useApp();
  const navigate = useNavigate();
  const stats = totalStats(parkings);
  const occupancyRate = stats.totalSpaces > 0 ? Math.round(((stats.occupied + stats.reserved) / stats.totalSpaces) * 100) : 0;

  const cards = [
    { label: 'Parking Areas', value: stats.parkingAreas, icon: Building2, color: 'bg-blue-500' },
    { label: 'Total Spaces', value: stats.totalSpaces, icon: CircleParking, color: 'bg-indigo-500' },
    { label: 'Available', value: stats.available, icon: Car, color: 'bg-green-500' },
    { label: 'Occupied', value: stats.occupied, icon: TrendingUp, color: 'bg-red-500' },
    { label: 'Reserved', value: stats.reserved, icon: Clock, color: 'bg-yellow-500' },
    { label: 'Bookings', value: bookings.length, icon: Activity, color: 'bg-purple-500' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className={classNames('w-10 h-10 rounded-lg flex items-center justify-center mb-3', c.color)}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-800">{c.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{c.label}</p>
            </div>
          );
        })}
      </div>

      {/* Occupancy overview */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h2 className="font-bold text-gray-800 mb-4">Overall Occupancy</h2>
        <div className="flex items-center gap-4">
          <div className="relative w-24 h-24 flex-shrink-0">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="10" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="#2563eb" strokeWidth="10" strokeDasharray={`${occupancyRate * 2.51} 251`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold text-gray-800">{occupancyRate}%</span>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-2">Across all {stats.parkingAreas} parking areas in Nagpur</p>
            <div className="flex gap-4 text-sm">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-500" /> {stats.available} Available</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-500" /> {stats.occupied} Occupied</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-yellow-500" /> {stats.reserved} Reserved</span>
            </div>
          </div>
        </div>
      </div>

      {/* Parking areas table */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 overflow-x-auto">
        <h2 className="font-bold text-gray-800 mb-4">Parking Area Breakdown</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-100">
              <th className="pb-3 font-medium">Parking Area</th>
              <th className="pb-3 font-medium text-center">Total</th>
              <th className="pb-3 font-medium text-center">Available</th>
              <th className="pb-3 font-medium text-center">Occupied</th>
              <th className="pb-3 font-medium text-center">Reserved</th>
              <th className="pb-3 font-medium text-center">Occupancy</th>
            </tr>
          </thead>
          <tbody>
            {parkings.map((p) => {
              const a = computeAvailability(p);
              return (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate(`/parking/${p.id}`)}>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-blue-500" />
                      <span className="font-medium text-gray-700">{p.name}</span>
                    </div>
                  </td>
                  <td className="text-center text-gray-600">{p.totalSpaces}</td>
                  <td className="text-center text-green-600 font-medium">{a.available}</td>
                  <td className="text-center text-red-600 font-medium">{a.occupied}</td>
                  <td className="text-center text-yellow-600 font-medium">{a.reserved}</td>
                  <td className="text-center">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${a.occupancyPct}%` }} />
                      </div>
                      <span className="text-xs text-gray-500">{a.occupancyPct}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="text-center">
        <button onClick={() => navigate('/search')} className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:gap-3 transition-all">
          Explore Parking Areas <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
