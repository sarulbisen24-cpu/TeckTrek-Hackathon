import { useApp, totalStats, userBookings } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';
import { computeAvailability } from '@/data/parkingData';
import { SlotGrid } from '@/components/SlotGrid';
import NagpurMap from '@/components/NagpurMap';
import {
  Search, MapPin, Building2, Car, CircleParking, Clock, Calendar,
  TrendingUp, Activity, ArrowRight, History, Navigation
} from 'lucide-react';
import { classNames, formatTime } from '@/utils/helpers';

export default function Dashboard() {
  const { parkings, bookings, currentUser } = useApp();
  const navigate = useNavigate();
  const stats = totalStats(parkings);
  const myBookings = userBookings(bookings, currentUser).filter((b) => b.status !== 'cancelled').slice(0, 4);

  // Live slot preview from first parking
  const previewParking = parkings[0];
  const previewSlots = previewParking?.slots.slice(0, 10) ?? [];

  const statCards = [
    { label: 'Parking Areas', value: stats.parkingAreas, icon: Building2, color: 'bg-blue-500' },
    { label: 'Total Spaces', value: stats.totalSpaces, icon: CircleParking, color: 'bg-indigo-500' },
    { label: 'Available Now', value: stats.available, icon: Car, color: 'bg-green-500' },
    { label: 'Occupied', value: stats.occupied, icon: TrendingUp, color: 'bg-red-500' },
    { label: 'Reserved', value: stats.reserved, icon: Clock, color: 'bg-yellow-500' },
  ];

  const quickActions = [
    { label: 'Search Parking', icon: Search, path: '/search', color: 'bg-blue-500' },
    { label: 'Find Nearby', icon: Navigation, path: '/nearby', color: 'bg-green-500' },
    { label: 'My Bookings', icon: Calendar, path: '/bookings', color: 'bg-purple-500' },
    { label: 'History', icon: History, path: '/bookings', color: 'bg-gray-600' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20" />
        <div className="absolute right-10 bottom-0 w-40 h-40 bg-white/5 rounded-full -mb-16" />
        <div className="relative">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Find. Book. Park. Go.</h1>
          <p className="text-blue-100 text-lg mb-5">Where do you want to park?</p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/search')}
              className="inline-flex items-center gap-2 bg-white text-blue-600 font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-all shadow-sm"
            >
              <Search className="w-4 h-4" /> Search Parking
            </button>
            <button
              onClick={() => navigate('/nearby')}
              className="inline-flex items-center gap-2 bg-blue-500/40 hover:bg-blue-500/60 text-white font-semibold px-5 py-2.5 rounded-xl transition-all border border-white/20"
            >
              <Navigation className="w-4 h-4" /> Find Nearby
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className={classNames('w-10 h-10 rounded-lg flex items-center justify-center mb-3', s.color)}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {quickActions.map((a) => {
            const Icon = a.icon;
            return (
              <button
                key={a.label}
                onClick={() => navigate(a.path)}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all text-left group"
              >
                <div className={classNames('w-10 h-10 rounded-lg flex items-center justify-center mb-3', a.color)}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-gray-700">{a.label}</span>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Parking overview + Map */}
      <div className="grid lg:grid-cols-2 gap-5">
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-3">Parking Overview — Nagpur</h2>
          <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
            {parkings.slice(0, 6).map((p) => {
              const a = computeAvailability(p);
              return (
                <button
                  key={p.id}
                  onClick={() => navigate(`/parking/${p.id}`)}
                  className="w-full bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all text-left"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-sm text-gray-800">{p.name}</h3>
                        <p className="text-xs text-gray-400">{p.address}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-yellow-600 flex-shrink-0">⭐ {p.rating}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="bg-gray-50 rounded-lg py-1.5">
                      <p className="font-bold text-gray-700">{p.totalSpaces}</p>
                      <p className="text-gray-400">Total</p>
                    </div>
                    <div className="bg-green-50 rounded-lg py-1.5">
                      <p className="font-bold text-green-600">{a.available}</p>
                      <p className="text-gray-400">Free</p>
                    </div>
                    <div className="bg-red-50 rounded-lg py-1.5">
                      <p className="font-bold text-red-600">{a.occupied}</p>
                      <p className="text-gray-400">Occ</p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg py-1.5">
                      <p className="font-bold text-yellow-600">{a.reserved}</p>
                      <p className="text-gray-400">Res</p>
                    </div>
                  </div>
                  <div className="mt-2.5 flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${a.occupancyPct}%` }} />
                    </div>
                    <span className="text-xs font-medium text-gray-500">{a.occupancyPct}%</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-3">Live Map — Nagpur</h2>
          <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
            <NagpurMap parkings={parkings} height="380px" zoom={12} onMarkerClick={(id) => navigate(`/parking/${id}`)} onNavigate={(pid) => { const p = parkings.find((x) => x.id === pid); if (p) window.open(`https://www.openstreetmap.org/directions?from=&to=${p.lat}%2C${p.lng}`, '_blank'); }} />
          </div>
        </div>
      </div>

      {/* Recent bookings + Live slot preview */}
      <div className="grid lg:grid-cols-2 gap-5">
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-3">Recent Bookings</h2>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            {myBookings.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No bookings yet. Search and book your first slot!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myBookings.map((b) => (
                  <div key={b.id} className="flex items-center justify-between border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                    <div>
                      <p className="font-semibold text-sm text-gray-800">{b.parkingName}</p>
                      <p className="text-xs text-gray-400">Slot {b.slot} · {b.date} at {b.startTime}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-blue-600">₹{b.amount}</p>
                      <span className={classNames(
                        'text-xs px-2 py-0.5 rounded-full font-medium',
                        b.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                        b.status === 'completed' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      )}>
                        {b.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            Live Slot Preview
            <Activity className="w-4 h-4 text-green-500" />
          </h2>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-400 mb-3">{previewParking?.name} — Live slots</p>
            <SlotGrid slots={previewSlots} compact />
            <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
              <p className="text-xs text-blue-600 font-medium">Prototype Mode — Parking availability is simulated.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent activity footer */}
      {bookings.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-sm text-gray-800 mb-3">All Bookings ({bookings.length})</h3>
          <div className="space-y-2">
            {bookings.slice(0, 5).map((b) => (
              <div key={b.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{b.parkingName} — Slot {b.slot}</span>
                <span className="text-gray-400 text-xs">{formatTime(b.createdAt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
