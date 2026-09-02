import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { computeAvailability } from '@/data/parkingData';
import { SlotGrid } from '@/components/SlotGrid';
import NagpurMap from '@/components/NagpurMap';
import type { ParkingSlot, Booking } from '@/types';
import { ArrowLeft, MapPin, Star, Clock, IndianRupee, Car, CircleParking, CheckCircle2, QrCode, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function ParkingDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { parkings, createBooking } = useApp();
  const parking = parkings.find((p) => p.id === id);

  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState(1);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [error, setError] = useState('');

  if (!parking) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <p className="text-gray-400 mb-4">Parking not found.</p>
        <button onClick={() => navigate('/search')} className="text-blue-600 font-semibold">Back to Search</button>
      </div>
    );
  }

  const avail = computeAvailability(parking);

  const handleConfirm = () => {
    if (!selectedSlot) { setError('Please select a slot.'); return; }
    if (!vehicleNumber.trim()) { setError('Please enter your vehicle number.'); return; }
    if (!date) { setError('Please select a date.'); return; }
    if (!time) { setError('Please select a start time.'); return; }
    if (duration < 1) { setError('Duration must be at least 1 hour.'); return; }
    if (selectedSlot.status !== 'available') { setError('This slot is no longer available. Please select another.'); return; }
    setError('');
    const booking = createBooking(parking.id, selectedSlot.id, date, time, vehicleNumber, duration);
    if (booking) setConfirmedBooking(booking);
    else setError('Booking failed. Please try again.');
  };

  const infoCards = [
    { label: 'Total Spaces', value: parking.totalSpaces, icon: CircleParking, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Available', value: avail.available, icon: Car, color: 'text-green-600 bg-green-50' },
    { label: 'Occupied', value: avail.occupied, icon: Car, color: 'text-red-600 bg-red-50' },
    { label: 'Reserved', value: avail.reserved, icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <button onClick={() => navigate('/search')} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors text-sm font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to Search
      </button>

      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-2xl font-bold mb-1">{parking.name}</h1>
        <p className="text-blue-100 flex items-center gap-1.5 text-sm"><MapPin className="w-4 h-4" /> {parking.address}</p>
        <div className="flex flex-wrap gap-4 mt-3 text-sm">
          <span className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-300 fill-yellow-300" /> {parking.rating}</span>
          <span className="flex items-center gap-1"><IndianRupee className="w-4 h-4" /> {parking.pricePerHour}/hour</span>
          <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {parking.openHours}</span>
          <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {parking.distance} km away</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {infoCards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${c.color}`}><Icon className="w-5 h-5" /></div>
              <p className="text-xl font-bold text-gray-800">{c.value}</p>
              <p className="text-xs text-gray-400">{c.label}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-800 mb-2 px-1">Location Map</h2>
        <NagpurMap parkings={[parking]} height="280px" zoom={15} center={{ lat: parking.lat, lng: parking.lng }}
          onMarkerClick={(pid) => navigate(`/parking/${pid}`)}
          onNavigate={(pid) => { const p = parkings.find((x) => x.id === pid); if (p) window.open(`https://www.openstreetmap.org/directions?from=&to=${p.lat}%2C${p.lng}`, '_blank'); }} />
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h2 className="font-bold text-lg text-gray-800 mb-1">Parking Slots</h2>
        <p className="text-sm text-gray-400 mb-4">Click an available (green) slot to book it. Red and yellow slots cannot be booked.</p>
        <SlotGrid slots={parking.slots} selectedSlotId={selectedSlot?.id} onSlotClick={(s) => { setSelectedSlot(s); setError(''); }} />
      </div>

      {selectedSlot && !confirmedBooking && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-blue-200">
          <h2 className="font-bold text-lg text-gray-800 mb-4">Booking Details</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Selected Parking</label>
              <div className="bg-gray-50 text-gray-700 font-medium px-4 py-2.5 rounded-xl">{parking.name}</div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Selected Slot</label>
              <div className="bg-blue-50 text-blue-700 font-bold px-4 py-2.5 rounded-xl text-center">{selectedSlot.slot}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Vehicle Number</label>
              <input type="text" value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} placeholder="MH-31 AB 1234" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Time</label>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Duration (hours)</label>
              <select value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all">
                {[1, 2, 3, 4, 6, 8, 12, 24].map((h) => <option key={h} value={h}>{h} hour{h > 1 ? 's' : ''}</option>)}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
            <div>
              <p className="text-sm text-gray-400">Amount Payable ({duration}h × ₹{parking.pricePerHour})</p>
              <p className="text-2xl font-bold text-gray-800">₹{parking.pricePerHour * duration}</p>
            </div>
            <button onClick={handleConfirm} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-sm flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" /> Confirm Booking
            </button>
          </div>
          {error && <div className="mt-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2.5">{error}</div>}
        </div>
      )}

      {confirmedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center relative">
            <button onClick={() => { setConfirmedBooking(null); setSelectedSlot(null); setVehicleNumber(''); setDate(''); setTime(''); setDuration(1); }} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3"><CheckCircle2 className="w-8 h-8 text-green-600" /></div>
            <h2 className="text-xl font-bold text-gray-800">SmartPark</h2>
            <p className="text-green-600 font-semibold mb-4">Booking Confirmed ✓</p>
            <div className="bg-gray-50 rounded-xl p-4 text-left text-sm space-y-1.5 mb-4">
              <div className="flex justify-between"><span className="text-gray-400">Parking:</span><span className="font-medium text-gray-700">{confirmedBooking.parkingName}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Slot:</span><span className="font-medium text-gray-700">{confirmedBooking.slot}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Vehicle:</span><span className="font-medium text-gray-700">{confirmedBooking.vehicleNumber}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Date:</span><span className="font-medium text-gray-700">{confirmedBooking.date}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Time:</span><span className="font-medium text-gray-700">{confirmedBooking.startTime}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Duration:</span><span className="font-medium text-gray-700">{confirmedBooking.duration} hour(s)</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Amount:</span><span className="font-medium text-gray-700">₹{confirmedBooking.amount}</span></div>
            </div>
            <div className="flex flex-col items-center mb-4">
              <div className="bg-white p-3 border-2 border-gray-200 rounded-xl"><QRCodeSVG value={`SmartPark|${confirmedBooking.id}|${confirmedBooking.parkingName}|${confirmedBooking.slot}|${confirmedBooking.date}|${confirmedBooking.startTime}|${confirmedBooking.duration}h`} size={140} /></div>
              <p className="text-xs text-gray-400 mt-2 flex items-center gap-1"><QrCode className="w-3.5 h-3.5" /> Show QR at Entry</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setConfirmedBooking(null); setSelectedSlot(null); }} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl transition-all">Back to Parking</button>
              <button onClick={() => { setConfirmedBooking(null); setSelectedSlot(null); navigate('/bookings'); }} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition-all">View My Booking</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
