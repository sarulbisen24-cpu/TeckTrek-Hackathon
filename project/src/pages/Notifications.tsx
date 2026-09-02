import { useApp } from '@/context/AppContext';
import { Bell, Check, Trash2, Calendar, Info, Clock, AlertCircle } from 'lucide-react';
import { classNames, timeAgo } from '@/utils/helpers';

const typeIcons = {
  booking: { icon: Calendar, color: 'bg-blue-100 text-blue-600' },
  info: { icon: Info, color: 'bg-gray-100 text-gray-600' },
  reminder: { icon: Clock, color: 'bg-yellow-100 text-yellow-600' },
};

export default function Notifications() {
  const { notifications, markNotificationRead, clearNotifications } = useApp();

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
        {notifications.length > 0 && (
          <button onClick={clearNotifications} className="text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-1.5">
            <Trash2 className="w-4 h-4" /> Clear All
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
          <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-400">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const config = typeIcons[n.type] || typeIcons.info;
            const Icon = config.icon;
            return (
              <div
                key={n.id}
                className={classNames(
                  'bg-white rounded-xl p-4 shadow-sm border transition-all flex items-start gap-3',
                  n.read ? 'border-gray-100' : 'border-blue-200 bg-blue-50/30'
                )}
              >
                <div className={classNames('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', config.color)}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-gray-800">{n.title}</p>
                    {!n.read && <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
                  <p className="text-xs text-gray-300 mt-1">{timeAgo(n.time)}</p>
                </div>
                {!n.read && (
                  <button onClick={() => markNotificationRead(n.id)} className="text-gray-300 hover:text-blue-500 flex-shrink-0 mt-1">
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Sample notification types info */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="w-4 h-4 text-blue-600" />
          <p className="text-sm font-semibold text-blue-700">Notification Types</p>
        </div>
        <ul className="text-xs text-blue-600 space-y-1 ml-6 list-disc">
          <li>Booking confirmed</li>
          <li>Your parking slot is reserved</li>
          <li>Parking availability changed</li>
          <li>Your booking starts in 30 minutes</li>
        </ul>
      </div>
    </div>
  );
}
