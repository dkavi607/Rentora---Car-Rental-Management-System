import React, { useState } from 'react';
import { useRentora } from '../../context/RentoraContext';
import { DollarSign, Percent, Plus, Tag, Check, Clock, Calendar, Sparkles } from 'lucide-react';

export const PricingPlansView: React.FC = () => {
  const { categories, formatCurrency, settings } = useRentora();

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-display flex items-center gap-2.5">
            <DollarSign className="w-6 h-6 text-blue-600" />
            Pricing Rules & Rate Management Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure tiered duration discounts, seasonal weekend multipliers, and category base rates.
          </p>
        </div>
      </div>

      {/* Tiered Duration Discounts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
            <Clock className="w-4 h-4" /> 1 to 6 Days (Daily Tier)
          </div>
          <div className="text-2xl font-black text-slate-900">Standard Base Rate</div>
          <p className="text-xs text-slate-500">Full standard daily category rates apply without duration reduction.</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
            <Calendar className="w-4 h-4" /> 7 to 29 Days (Weekly Tier)
          </div>
          <div className="text-2xl font-black text-emerald-700">10% Automated Discount</div>
          <p className="text-xs text-slate-500">Applied automatically to daily rates for medium-term reservations.</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-purple-600 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" /> 30+ Days (Monthly Tier)
          </div>
          <div className="text-2xl font-black text-purple-700">20% Automated Discount</div>
          <p className="text-xs text-slate-500">Corporate & long-term monthly rentals receive maximum tiered pricing benefits.</p>
        </div>
      </div>

      {/* Category Base Rates Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 font-bold text-slate-900 flex justify-between items-center">
          <span>Fleet Category Rate Sheet</span>
          <span className="text-xs font-normal text-slate-500">Currency: {settings.tax.currencyFormat}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Standard Daily Rate</th>
                <th className="px-4 py-3">Weekly Tier (10% off)</th>
                <th className="px-4 py-3">Monthly Tier (20% off)</th>
                <th className="px-4 py-3">Refundable Security Deposit</th>
                <th className="px-4 py-3">Mileage Allowance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map(cat => (
                <tr key={cat.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-bold text-slate-900">{cat.name}</td>
                  <td className="px-4 py-3 font-bold text-blue-600">{formatCurrency(cat.defaultDailyRate)}/day</td>
                  <td className="px-4 py-3 font-semibold text-emerald-700">{formatCurrency(cat.defaultDailyRate * 0.9)}/day</td>
                  <td className="px-4 py-3 font-semibold text-purple-700">{formatCurrency(cat.defaultDailyRate * 0.8)}/day</td>
                  <td className="px-4 py-3 font-bold text-slate-800">{formatCurrency(cat.defaultDailyRate * 5)}</td>
                  <td className="px-4 py-3 text-slate-600">200 km / day included</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
