import type { ParkingSlot, SlotStatus } from '@/types';
import { classNames } from '@/utils/helpers';
import { Car, CircleDot, Clock } from 'lucide-react';

interface SlotGridProps {
  slots: ParkingSlot[];
  selectedSlotId?: string;
  onSlotClick?: (slot: ParkingSlot) => void;
  compact?: boolean;
}

const statusColors: Record<SlotStatus, string> = {
  available: 'bg-green-500 hover:bg-green-600 text-white',
  occupied: 'bg-red-500 text-white cursor-not-allowed',
  reserved: 'bg-yellow-500 text-white cursor-not-allowed',
};

const statusLabels: Record<SlotStatus, string> = {
  available: 'Available',
  occupied: 'Occupied',
  reserved: 'Reserved',
};

export function SlotGrid({ slots, selectedSlotId, onSlotClick, compact = false }: SlotGridProps) {
  return (
    <div>
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-4 text-sm">
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded bg-green-500" /> Available
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded bg-red-500" /> Occupied
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded bg-yellow-500" /> Reserved
        </span>
      </div>

      {/* Entry indicator */}
      <div className="flex justify-center mb-3">
        <div className="flex flex-col items-center text-blue-600">
          <span className="text-xs font-semibold tracking-wider uppercase">Entry</span>
          <span className="text-2xl">↓</span>
        </div>
      </div>

      {/* Slots grid */}
      <div className={`grid gap-2.5 ${compact ? 'grid-cols-6 sm:grid-cols-8' : 'grid-cols-4 sm:grid-cols-6 md:grid-cols-8'}`}>
        {slots.map((slot) => {
          const isClickable = slot.status === 'available' && onSlotClick;
          const isSelected = slot.id === selectedSlotId;
          return (
            <button
              key={slot.id}
              disabled={!isClickable}
              onClick={() => isClickable && onSlotClick(slot)}
              className={classNames(
                'rounded-lg font-bold text-sm transition-all flex flex-col items-center justify-center',
                compact ? 'h-12' : 'h-16',
                statusColors[slot.status],
                isClickable && 'cursor-pointer hover:scale-105 shadow-sm',
                isSelected && 'ring-4 ring-blue-300 ring-offset-1 scale-105',
                isSelected && 'bg-blue-600 hover:bg-blue-600'
              )}
              title={statusLabels[slot.status]}
            >
              <span className="text-xs">{slot.slot}</span>
              {!compact && (
                <span className="mt-0.5">
                  {slot.status === 'occupied' && <Car className="w-3.5 h-3.5" />}
                  {slot.status === 'reserved' && <Clock className="w-3.5 h-3.5" />}
                  {slot.status === 'available' && <CircleDot className="w-3.5 h-3.5" />}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: 'available' | 'limited' | 'full' }) {
  const map = {
    available: { label: 'Available', cls: 'bg-green-100 text-green-700' },
    limited: { label: 'Limited', cls: 'bg-yellow-100 text-yellow-700' },
    full: { label: 'Full', cls: 'bg-red-100 text-red-700' },
  };
  const m = map[status];
  return <span className={classNames('px-2.5 py-0.5 rounded-full text-xs font-semibold', m.cls)}>{m.label}</span>;
}

export function OccupancyBar({ available, total }: { available: number; total: number }) {
  const pct = total > 0 ? ((total - available) / total) * 100 : 0;
  const color = pct < 50 ? 'bg-green-500' : pct < 80 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div className={classNames('h-2 rounded-full transition-all', color)} style={{ width: `${pct}%` }} />
    </div>
  );
}
