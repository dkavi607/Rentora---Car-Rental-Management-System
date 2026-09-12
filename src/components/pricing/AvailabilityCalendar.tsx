import React, { useState } from 'react';
import { useRentora } from '../../context/RentoraContext';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Car, 
  Wrench, 
  KeyRound, 
  CheckCircle2,
  Filter
} from 'lucide-react';

interface AvailabilityCalendarProps {
  onSelectSlot?: (vehicleId: string, date: string) => void;
}

export const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({ onSelectSlot }) => {
  const { vehicles, bookings, maintenanceRecords, categories, selectedBranchId } = useRentora();

  const [currentMonthIndex, setCurrentMonthIndex] = useState(0); // 0 = Sep 2026, 1 = Oct 2026
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Days in September 2026
  const daysInMonth = 30;
  const monthName = currentMonthIndex === 0 ? 'September 2026' : 'October 2026';
  const monthPrefix = currentMonthIndex === 0 ? '2026-09-' : '2026-10-';

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => {
    const dayNum = i + 1;
    const dayStr = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
    const fullDate = `${monthPrefix}${dayStr}`;
    const dateObj = new Date(fullDate);
    const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    return { dayNum, fullDate, dayOfWeek };
  });

  const filteredVehicles = vehicles.filter(v => {
    if (selectedBranchId !== 'all' && v.branchId !== selectedBranchId) return false;
    if (selectedCategory !== 'all' && v.categoryId !== selectedCategory) return false;
    return true;
  });

  // Check state of a vehicle on a specific date
  const getVehicleDateStatus = (vehicleId: string, dateStr: string) => {
    // Check maintenance
    const maint = maintenanceRecords.find(m => {
      if (m.vehicleId !== vehicleId) return false;
      const end = m.actualCompletionDate || m.expectedCompletionDate;
      return dateStr >= m.startDate && dateStr <= end;
    });
    if (maint) return { type: 'maintenance', label: 'Service', color: 'bg-amber-500 text-white' };

    // Check active booking
    const booking = bookings.find(b => {
      if (b.vehicleId !== vehicleId) return false;
      if (b.status === 'Cancelled' || b.status === 'Completed') return false;
      return dateStr >= b.pickupDate && dateStr <= b.returnDate;
    });
    if (booking) {
      return { 
        type: 'booked', 
        label: booking.status === 'Active' ? 'On Road' : 'Reserved', 
        color: booking.status === 'Active' ? 'bg-blue-600 text-white' : 'bg-indigo-500 text-white' 
      };
    }

    return { type: 'available', label: '', color: 'hover:bg-emerald-50' };
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-display flex items-center gap-2.5">
            <CalendarIcon className="w-6 h-6 text-blue-600" />
            Fleet Availability & Gantt Matrix
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time visual schedule of reservations, active rentals, and scheduled workshop services.
          </p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
            <button
              type="button"
              onClick={() => setCurrentMonthIndex(Math.max(0, currentMonthIndex - 1))}
              disabled={currentMonthIndex === 0}
              className="p-1.5 rounded-lg hover:bg-white text-slate-700 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold px-3 text-slate-800">{monthName}</span>
            <button
              type="button"
              onClick={() => setCurrentMonthIndex(Math.min(1, currentMonthIndex + 1))}
              disabled={currentMonthIndex === 1}
              className="p-1.5 rounded-lg hover:bg-white text-slate-700 disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
          >
            <option value="all">All Fleet Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Legend Ribbon */}
      <div className="flex flex-wrap items-center gap-4 bg-white p-3 rounded-xl border border-slate-200 text-xs font-semibold">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-xs bg-emerald-100 border border-emerald-300"></span> Available for Booking
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-xs bg-blue-600"></span> Active On-Road Rental
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-xs bg-indigo-500"></span> Confirmed Reservation
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-xs bg-amber-500"></span> Workshop / Maintenance
        </span>
      </div>

      {/* Matrix Gantt Timeline Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="sticky left-0 z-20 bg-slate-900 p-3 min-w-[200px] border-r border-slate-700">
                  Vehicle Specs
                </th>
                {daysArray.map(day => (
                  <th key={day.fullDate} className="p-2 text-center min-w-[34px] border-r border-slate-800 text-[10px] font-mono">
                    <div className="opacity-60">{day.dayOfWeek[0]}</div>
                    <div className="font-bold">{day.dayNum}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredVehicles.map(veh => {
                return (
                  <tr key={veh.id} className="hover:bg-slate-50/50">
                    
                    {/* Vehicle column sticky */}
                    <td className="sticky left-0 z-10 bg-white p-3 border-r border-slate-200 shadow-xs">
                      <div className="flex items-center gap-2">
                        <img
                          src={veh.mainImage}
                          alt=""
                          className="w-9 h-6 object-cover rounded border border-slate-200 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-900 text-[11px] truncate max-w-[130px]">
                            {veh.make} {veh.model}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400">{veh.regNumber}</div>
                        </div>
                      </div>
                    </td>

                    {/* 30 Day Cell Timeline */}
                    {daysArray.map(day => {
                      const status = getVehicleDateStatus(veh.id, day.fullDate);
                      return (
                        <td
                          key={day.fullDate}
                          onClick={() => {
                            if (status.type === 'available' && onSelectSlot) {
                              onSelectSlot(veh.id, day.fullDate);
                            }
                          }}
                          className={`p-1 text-center border-r border-slate-100 transition-colors cursor-pointer relative h-10 ${status.color}`}
                          title={`${veh.make} ${veh.model} on ${day.fullDate}: ${status.label || 'Available'}`}
                        >
                          {status.type !== 'available' && (
                            <div className="w-full h-full rounded flex items-center justify-center text-[9px] font-extrabold uppercase overflow-hidden truncate px-0.5">
                              {status.label[0]}
                            </div>
                          )}
                        </td>
                      );
                    })}

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
