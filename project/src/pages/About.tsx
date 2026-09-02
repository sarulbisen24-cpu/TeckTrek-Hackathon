import { Car, Search, Activity, CalendarCheck, Navigation, QrCode, Cpu, Info } from 'lucide-react';

const features = [
  { icon: Search, title: 'Parking Search', desc: 'Find parking areas across Nagpur with live availability and pricing.' },
  { icon: Activity, title: 'Live Parking Availability', desc: 'See real-time slot status — available, occupied, or reserved.' },
  { icon: CalendarCheck, title: 'Slot Reservation', desc: 'Reserve parking slots in advance with instant confirmation.' },
  { icon: Navigation, title: 'Nearby Parking', desc: 'Discover parking near your location sorted by distance.' },
  { icon: QrCode, title: 'Digital Booking', desc: 'Get QR-code booking confirmations for contactless entry.' },
  { icon: Cpu, title: 'Simulated Smart Sensors', desc: 'Admin sensor simulation for vehicle entry and exit events.' },
];

export default function About() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white shadow-lg text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-white/5" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="relative">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl backdrop-blur-sm mb-4">
            <Car className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">SmartPark</h1>
          <p className="text-blue-100 text-lg">Smart Parking Management System</p>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-bold text-gray-800 mb-3">About SmartPark</h2>
        <p className="text-gray-600 leading-relaxed">
          SmartPark is a smart parking management platform that helps users find nearby parking, check parking availability,
          reserve parking slots and navigate to their selected parking area. Built as a college hackathon prototype,
          it demonstrates a complete smart city parking solution with live maps, real-time slot management, and
          simulated IoT sensor integration.
        </p>
      </div>

      {/* Features */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-3">Features</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-800 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tech highlights */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-bold text-gray-800 mb-3">Technology</h2>
        <div className="grid sm:grid-cols-2 gap-3 text-sm text-gray-600">
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500" /> Interactive OpenStreetMap (Leaflet)</div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500" /> Real Nagpur, Maharashtra coordinates</div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500" /> QR code booking confirmations</div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500" /> Simulated IoT sensor system</div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500" /> Role-based authentication</div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500" /> Responsive blue/white UI</div>
        </div>
      </div>

      {/* Prototype notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-blue-700 text-sm">Prototype Mode</p>
          <p className="text-blue-600 text-sm mt-0.5">Parking availability and sensor data are simulated. The map uses real OpenStreetMap data for Nagpur, Maharashtra.</p>
        </div>
      </div>
    </div>
  );
}
