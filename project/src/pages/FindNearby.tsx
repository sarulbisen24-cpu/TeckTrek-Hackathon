import { useState, useEffect, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';
import { computeAvailability, haversineKm } from '@/data/parkingData';
import NagpurMap from '@/components/NagpurMap';
import { Navigation, MapPin, Crosshair, IndianRupee, Car, ArrowRight } from 'lucide-react';
import { classNames } from '@/utils/helpers';

export default function FindNearby() {
  const { parkings } = useApp();
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'granted' | 'denied'>('idle');

  useEffect(() => {
    if (!navigator.geolocation) { setLocationStatus('denied'); return; }
    setLocationStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => { setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocationStatus('granted'); },
      () => { setLocationStatus('denied'); }
    );
  }, []);

  const sorted = useMemo(() => {
    return parkings.map((p) => {
      const realDistance = userLocation ? haversineKm(userLocation.lat, userLocation.lng, p.lat, p.lng) : p.distance;
      return { p, realDistance };
    }).sort((a, b) => a.realDistance - b.realDistance);
  }, [parkings, userLocation]);

  const mapCenter = userLocation || { lat: 21.1463, lng: 79.0849 };

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <h1 className="text-2xl font-bold text-gray-800">Nearby Parking</h1>

      <div className={classNames(
        'rounded-xl p-4 flex items-center gap-3 text-sm',
        locationStatus === 'granted' ? 'bg-green-50 border border-green-200' :
        locationStatus === 'denied' ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 border border-gray-200'
      )}>
        <Crosshair className={classNames('w-5 h-5', locationStatus === 'granted' ? 'text-green-600' : locationStatus === 'denied' ? 'text-blue-600' : 'text-gray-400')} />
        <div>
          {locationStatus === 'loading' && <p className="text-gray-500">Detecting your location...</p>}
          {locationStatus === 'granted' && <p className="text-green-700 font-medium">Your location is active. Distances calculated from your real position.</p>}
          {locationStatus === 'denied' && <p className="text-blue-700 font-medium">Demo Location: Nagpur, Maharashtra</p>}
          {locationStatus === 'idle' && <p className="text-gray-500">Waiting for location access...</p>}
        </div>
      </div>

      <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
        <NagpurMap parkings={parkings} height="350px" zoom={13} center={mapCenter} showUserLocation={locationStatus === 'granted'}
          onMarkerClick={(id) => navigate(`/parking/${id}`)}
          onNavigate={(pid) => { const p = parkings.find((x) => x.id === pid); if (p) window.open(`https://www.openstreetmap.org/directions?from=${userLocation ? userLocation.lat + ',' + userLocation.lng : ''}&to=${p.lat}%2C${p.lng}`, '_blank'); }} />
      </div>

      <div className="space-y-3">
        {sorted.map(({ p, realDistance }, idx) => {
          const a = computeAvailability(p);
          return (
            <div key={p.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">{idx + 1}</div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-800 truncate">{p.name}</h3>
                    <p className="text-sm text-gray-400 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {realDistance} km away</p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="flex items-center gap-1 text-green-600 font-medium"><Car className="w-4 h-4" /> {a.available} spaces available</span>
                      <span className="flex items-center gap-1 text-gray-600"><IndianRupee className="w-3.5 h-3.5" /> {p.pricePerHour}/hour</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button onClick={() => navigate(`/parking/${p.id}`)} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5">View <ArrowRight className="w-3.5 h-3.5" /></button>
                  <button onClick={() => window.open(`https://www.openstreetmap.org/directions?from=${userLocation ? userLocation.lat + ',' + userLocation.lng : ''}&to=${p.lat}%2C${p.lng}`, '_blank')} className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5"><Navigation className="w-3.5 h-3.5" /> Navigate</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
