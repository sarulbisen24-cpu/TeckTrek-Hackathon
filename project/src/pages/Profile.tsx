import { useState } from 'react';
import { useApp, userBookings } from '@/context/AppContext';
import { User as UserIcon, Mail, Phone, Car, Edit2, Check, X, Plus, Calendar } from 'lucide-react';
import { classNames, formatTime } from '@/utils/helpers';

export default function Profile() {
  const { currentUser, updateProfile, bookings } = useApp();
  const myBookings = userBookings(bookings, currentUser).slice(0, 8);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(currentUser?.name ?? '');
  const [phone, setPhone] = useState(currentUser?.phone ?? '');
  const [vehicles, setVehicles] = useState<string[]>(currentUser?.vehicles ?? []);
  const [newVehicle, setNewVehicle] = useState('');

  if (!currentUser) return null;

  const handleSave = () => {
    updateProfile({ name, phone, vehicles });
    setEditing(false);
  };

  const addVehicle = () => {
    if (newVehicle.trim()) {
      setVehicles([...vehicles, newVehicle.trim()]);
      setNewVehicle('');
    }
  };

  const removeVehicle = (idx: number) => {
    setVehicles(vehicles.filter((_, i) => i !== idx));
  };

  // myBookings already set above

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <h1 className="text-2xl font-bold text-gray-800">Profile</h1>

      {/* Profile card */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <UserIcon className="w-10 h-10 text-blue-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-800">{currentUser.name}</h2>
            <p className="text-sm text-gray-400 capitalize">{currentUser.role} account</p>
          </div>
          {!editing ? (
            <button onClick={() => setEditing(true)} className="bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium px-4 py-2 rounded-xl text-sm transition-all flex items-center gap-1.5">
              <Edit2 className="w-4 h-4" /> Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-xl text-sm transition-all flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Save
              </button>
              <button onClick={() => { setEditing(false); setName(currentUser.name); setPhone(currentUser.phone); setVehicles(currentUser.vehicles); }} className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium px-4 py-2 rounded-xl text-sm transition-all flex items-center gap-1.5">
                <X className="w-4 h-4" /> Cancel
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
            {editing ? (
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
            ) : (
              <p className="flex items-center gap-2 text-gray-700"><UserIcon className="w-4 h-4 text-gray-400" /> {currentUser.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <p className="flex items-center gap-2 text-gray-700"><Mail className="w-4 h-4 text-gray-400" /> {currentUser.email}</p>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
            {editing ? (
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Add phone number" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
            ) : (
              <p className="flex items-center gap-2 text-gray-700"><Phone className="w-4 h-4 text-gray-400" /> {currentUser.phone || 'Not set'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Saved Vehicles */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Car className="w-5 h-5 text-blue-600" /> Saved Vehicles</h2>
        <div className="space-y-2">
          {vehicles.length === 0 && !editing && <p className="text-sm text-gray-400">No vehicles saved.</p>}
          {vehicles.map((v, idx) => (
            <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5">
              <span className="flex items-center gap-2 text-gray-700 text-sm font-medium"><Car className="w-4 h-4 text-blue-500" /> {v}</span>
              {editing && (
                <button onClick={() => removeVehicle(idx)} className="text-red-500 hover:text-red-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          {editing && (
            <div className="flex gap-2 mt-3">
              <input
                value={newVehicle}
                onChange={(e) => setNewVehicle(e.target.value)}
                placeholder="Add vehicle number (e.g. MH-31 AB 1234)"
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                onKeyDown={(e) => e.key === 'Enter' && addVehicle()}
              />
              <button onClick={addVehicle} className="bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-all flex items-center gap-1">
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Booking history */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Calendar className="w-5 h-5 text-blue-600" /> Booking History</h2>
        {myBookings.length === 0 ? (
          <p className="text-sm text-gray-400">No bookings yet.</p>
        ) : (
          <div className="space-y-2">
            {myBookings.map((b) => (
              <div key={b.id} className="flex items-center justify-between border-b border-gray-100 last:border-0 pb-2.5 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-gray-700">{b.parkingName} — Slot {b.slot}</p>
                  <p className="text-xs text-gray-400">{b.date} at {b.startTime} · {b.vehicleNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-blue-600">₹{b.amount}</p>
                  <span className={classNames(
                    'text-xs px-2 py-0.5 rounded-full font-medium',
                    b.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                    b.status === 'completed' ? 'bg-green-100 text-green-700' :
                    'bg-red-100 text-red-700'
                  )}>{b.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
