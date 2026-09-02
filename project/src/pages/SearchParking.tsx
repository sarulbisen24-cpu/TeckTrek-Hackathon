import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';
import { computeAvailability, haversineKm } from '@/data/parkingData';
import NagpurMap from '@/components/NagpurMap';
import { StatusBadge, OccupancyBar } from '@/components/SlotGrid';
import {
  Search, MapPin, Star, Clock, Navigation, List, Map as MapIcon,
  Filter, ArrowRight, IndianRupee, Crosshair, AlertCircle
} from 'lucide-react';
import { classNames } from '@/utils/helpers';

type SortFilter = 'nearest' | 'available' | 'price' | 'open';
type ViewMode = 'list' | 'map';

export default function SearchParking() {
  const { parkings } = useApp();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortFilter>('nearest');
  const [view, setView] = useState<ViewMode>('list');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'granted' | 'denied'>('idle');
  const [navMessage, setNavMessage] = useState('');

  const handleUseLocation = () => {
    if (!navigator.geolocation) { setLocationStatus('denied'); return; }
    setLocationStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => { setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocationStatus('granted'); },
      () => { setLocationStatus('denied'); }
    );
  };

  const navigateTo = (p: { lat: number; lng: number }) => {
    if (userLocation) {
      window.open(`https://www.openstreetmap.org/directions?from=${userLocation.lat},${userLocation.lng}&to=${p.lat}%2C${p.lng}`, '_blank');
    } else {
      setNavMessage('Please allow location access to use navigation.');
      setTimeout(() => setNavMessage(''), 4000);
    }
  };

  const filtered = useMemo(() => {
    let result = parkings.filter((p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.address.toLowerCase().includes(query.toLowerCase())
    );
    const withAvail = result.map((p) => {
      const a = computeAvailability(p);
      const realDistance = userLocation ? haversineKm(userLocation.lat, userLocation.lng, p.lat, p.lng) : p.distance;
      return { p, a, realDistance };
    });
    switch (sort) {
      case 'nearest':
        withAvail.sort((x, y) => x.realDistance - y.realDistance);
        break;
      case 'available':
        withAvail.sort((x, y) => y.a.available - x.a.available);
        break;
      case 'price':
        withAvail.sort((x, y) => x.p.pricePerHour - y.p.pricePerHour);
        break;
      case 'open':
        withAvail.sort((x, y) => (y.p.openHours === '24 Hours' ? 1 : 0) - (x.p.openHours === '24 Hours' ? 1 : 0));
        break;
    }
    return withAvail;
  }, [parkings, query, sort, userLocation]);

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <h1 className="text-2xl font-bold text-gray-800">Search Parking</h1>

      {/* Search bar + location button */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search parking or location..."
            className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm"
          />
        </div>
        <button
          onClick={handleUseLocation}
          disabled={locationStatus === 'loading'}
          className={classNames(
            'flex items-center gap-2 px-4 py-3.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap shadow-sm',
            locationStatus === 'granted' ? 'bg-green-50 text-green-700 border border-green-200' :
            locationStatus === 'denied' ? 'bg-red-50 text-red-600 border border-red-200' :
            'bg-blue-600 text-white hover:bg-blue-700'
          )}
        >
          <Crosshair className="w-4 h-4" />
          {locationStatus === 'loading' ? 'Locating...' : locationStatus === 'granted' ? 'Location Active' : 'My Location'}
        </button>
      </div>

      {/* Location status messages */}
      {locationStatus === 'denied' && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-blue-700">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          Location permission is required to find nearby parking. Showing default distances instead.
        </div>
      )}
      {locationStatus === 'granted' && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-green-700">
          <Crosshair className="w-4 h-4 flex-shrink-0" />
          Your location is active. Distances are calculated from your real position. Nearest parking shown first.
        </div>
      )}
      {navMessage && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-yellow-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {navMessage}
        </div>
      )}

      {/* Filters + view toggle */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="w-4 h-4 text-gray-400" />
        {(['nearest', 'available', 'price', 'open'] as SortFilter[]).map((f) => (
          <button
            key={f}
            onClick={() => setSort(f)}
            className={classNames(
              'px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all',
              sort === f ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
            )}
          >
            {f === 'nearest' ? 'Nearest' : f === 'available' ? 'Most Available' : f === 'price' ? 'Lowest Price' : 'Open Now'}
          </button>
        ))}

        <div className="ml-auto flex gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setView('list')}
            className={classNames(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
              view === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'
            )}
          >
            <List className="w-4 h-4" /> List
          </button>
          <button
            onClick={() => setView('map')}
            className={classNames(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
              view === 'map' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'
            )}
          >
            <MapIcon className="w-4 h-4" /> Map
          </button>
        </div>
      </div>

      {/* Content */}
      {view === 'list' ? (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map(({ p, a, realDistance }) => (
            <div key={p.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-gray-800">{p.name}</h3>
                  <p className="text-sm text-gray-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5" /> {p.address}
                  </p>
                </div>
                <StatusBadge status={a.mapStatus} />
              </div>

              <div className="grid grid-cols-3 gap-3 my-3 text-sm">
                <div>
                  <p className="text-gray-400 text-xs">Available</p>
                  <p className="font-bold text-green-600">{a.available}<span className="text-gray-400 font-normal">/{p.totalSpaces}</span></p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Distance</p>
                  <p className="font-bold text-gray-700">{realDistance} km</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Rating</p>
                  <p className="font-bold text-gray-700 flex items-center gap-0.5"><Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />{p.rating}</p>
                </div>
              </div>

              <div className="mb-3">
                <OccupancyBar available={a.available} total={p.totalSpaces} />
                <p className="text-xs text-gray-400 mt-1">{a.occupancyPct}% occupied</p>
              </div>

              <div className="flex items-center justify-between text-sm mb-4">
                <span className="flex items-center gap-1 text-gray-600">
                  <IndianRupee className="w-3.5 h-3.5" />{p.pricePerHour}/hour
                </span>
                <span className="flex items-center gap-1 text-gray-500">
                  <Clock className="w-3.5 h-3.5" />{p.openHours}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/parking/${p.id}`)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-1.5"
                >
                  View Parking <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigateTo(p)}
                  className="px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl text-sm transition-all flex items-center gap-1.5"
                >
                  <Navigation className="w-4 h-4" /> Navigate
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-400">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No parking found matching your search.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
          <NagpurMap parkings={parkings} height="550px" zoom={13} showUserLocation={locationStatus === 'granted'} center={userLocation ?? undefined} onMarkerClick={(id) => navigate(`/parking/${id}`)} onNavigate={(pid) => { const p = parkings.find((x) => x.id === pid); if (p) navigateTo(p); }} />
        </div>
      )}
    </div>
  );
}
