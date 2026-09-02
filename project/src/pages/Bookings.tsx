import { useState } from 'react';
import { useApp, userBookings } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';
import type { BookingStatus } from '@/types';
import { Calendar, CheckCircle2, XCircle, Clock, MapPin, Car, IndianRupee, X, QrCode } from 'lucide-react';
import { classNames, formatTime } from '@/utils/helpers';
import { QRCodeSVG } from 'qrcode.react';

const tabs: { key: BookingStatus; label: string }[] = [
  { key: 'confirmed', label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

export default function Bookings() {
  const { bookings, cancelBooking, currentUser } = useApp();
  const myBookings = userBookings(bookings, currentUser);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<BookingStatus>('confirmed');
  const [qrBooking, setQrBooking] = useState<string | null>(null);

  const filtered = myBookings.filter((b) => b.status === activeTab);
  const qrBookingData = myBookings.find((b) => b.id === qrBooking);

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <h1 className="text-2xl font-bold text-gray-800">My Bookings</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={classNames(
              'px-5 py-2 rounded-lg font-semibold text-sm transition-all',
              activeTab === t.key ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {t.label} ({myBookings.filter((b) => b.status === t.key).length})
          </button>
        ))}
      </div>

      {/* Bookings */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-400">No {activeTab} bookings.</p>
          {activeTab === 'confirmed' && (
            <button onClick={() => navigate('/search')} className="mt-4 text-blue-600 font-semibold text-sm">Find parking to book →</button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => (
            <div key={b.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-800 truncate">{b.parkingName}</h3>
                    <span className={classNames(
                      'text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0',
                      b.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                      b.status === 'completed' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    )}>
                      {b.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-500 mt-2">
                    <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Slot {b.slot}</span>
                    <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {b.date}</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {b.startTime}</span>
                    <span className="flex items-center gap-1.5"><Car className="w-3.5 h-3.5" /> {b.vehicleNumber}</span>
                  </div>
                  <p className="text-xs text-gray-300 mt-2">Booked on {formatTime(b.createdAt)}</p>
                </div>

                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className="text-lg font-bold text-blue-600 flex items-center"><IndianRupee className="w-4 h-4" />{b.amount}</span>
                  <div className="flex gap-2">
                    {b.status === 'confirmed' && (
                      <>
                        <button
                          onClick={() => setQrBooking(b.id)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-3 py-2 rounded-lg transition-all flex items-center gap-1"
                        >
                          <QrCode className="w-3.5 h-3.5" /> QR
                        </button>
                        <button
                          onClick={() => cancelBooking(b.id)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold px-3 py-2 rounded-lg transition-all flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Cancel
                        </button>
                      </>
                    )}
                    {b.status === 'completed' && (
                      <span className="flex items-center gap-1 text-green-600 text-xs font-medium"><CheckCircle2 className="w-4 h-4" /> Completed</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR modal */}
      {qrBookingData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setQrBooking(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-xs w-full p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setQrBooking(null)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
            <h2 className="font-bold text-gray-800 mb-1">SmartPark</h2>
            <p className="text-sm text-gray-400 mb-4">{qrBookingData.parkingName}</p>
            <div className="bg-white p-3 border-2 border-gray-200 rounded-xl inline-block">
              <QRCodeSVG value={`SmartPark|${qrBookingData.id}|${qrBookingData.slot}|${qrBookingData.date}|${qrBookingData.startTime}|${qrBookingData.duration}h`} size={160} />
            </div>
            <div className="mt-4 text-sm space-y-1">
              <p><span className="text-gray-400">Slot:</span> <span className="font-bold text-gray-700">{qrBookingData.slot}</span></p>
              <p><span className="text-gray-400">Date:</span> <span className="font-medium text-gray-700">{qrBookingData.date} at {qrBookingData.startTime}</span></p>
              <p><span className="text-gray-400">Vehicle:</span> <span className="font-medium text-gray-700">{qrBookingData.vehicleNumber}</span></p>
            </div>
            <p className="text-xs text-gray-400 mt-3 flex items-center justify-center gap-1"><QrCode className="w-3.5 h-3.5" /> Show QR at Entry</p>
          </div>
        </div>
      )}
    </div>
  );
}
