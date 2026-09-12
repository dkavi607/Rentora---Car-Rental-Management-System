import React, { useState } from 'react';
import { useRentora } from '../../context/RentoraContext';
import { VehicleCategory } from '../../types';
import { Layers, Plus, Edit, Users, Briefcase, Car, DollarSign, Check, X } from 'lucide-react';

export const CarCategories: React.FC = () => {
  const { categories, vehicles, formatCurrency } = useRentora();

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-display flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-blue-600" />
            Vehicle Fleet Categories ({categories.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Classification tiers, capacity standards, and default baseline rates for car segments.
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map(cat => {
          const matchingCars = vehicles.filter(v => v.categoryId === cat.id);
          const availableCount = matchingCars.filter(v => v.status === 'Available').length;

          return (
            <div
              key={cat.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-mono font-bold border border-blue-200">
                    {cat.name.substring(0, 3).toUpperCase()}
                  </span>
                  <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                    <Car className="w-4 h-4 text-slate-400" />
                    <span>{matchingCars.length} Cars in Fleet</span>
                  </div>
                </div>

                <h3 className="text-lg font-black text-slate-900 mb-1">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  {cat.description}
                </p>

                {/* Capacity & Default Rates */}
                <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Passengers</span>
                      <span className="font-bold text-slate-800">{cat.passengerCapacity} Seats</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Luggage</span>
                      <span className="font-bold text-slate-800">{cat.luggageCapacity} Bags</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Base Daily Rate</span>
                      <span className="font-bold text-blue-600">{formatCurrency(cat.defaultDailyRate)}/day</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Available Now</span>
                      <span className="font-bold text-emerald-600">{availableCount} Units</span>
                    </div>
                  </div>
                </div>

                {/* Example Models */}
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Fleet Models in this Category:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {matchingCars.length === 0 ? (
                      <span className="text-xs text-slate-400 italic">No vehicles registered yet</span>
                    ) : (
                      matchingCars.map(car => (
                        <span
                          key={car.id}
                          className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-[11px] font-medium"
                        >
                          {car.make} {car.model}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  Weekly Rate: <strong className="text-slate-800">{formatCurrency(cat.defaultWeeklyRate)}/day</strong>
                </span>
                <span className="text-slate-500">
                  Monthly: <strong className="text-slate-800">{formatCurrency(cat.defaultMonthlyRate)}/day</strong>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
