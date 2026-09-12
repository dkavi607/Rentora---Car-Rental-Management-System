import React, { useState } from 'react';
import { useRentora } from '../../context/RentoraContext';
import { PromoCode } from '../../types';
import { Tag, Plus, Check, X, Calendar, Percent, DollarSign } from 'lucide-react';

export const PromoCodesView: React.FC = () => {
  const { promoCodes, formatCurrency } = useRentora();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-display flex items-center gap-2.5">
            <Tag className="w-6 h-6 text-blue-600" />
            Promo Coupons & Promotional Campaigns ({promoCodes.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Active discount codes, percentage vouchers, and minimum duration conditions.
          </p>
        </div>
      </div>

      {/* Grid of Promo Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {promoCodes.map(promo => {
          const isActive = promo.status === 'Active';

          return (
            <div
              key={promo.id}
              className={`p-5 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                isActive
                  ? 'bg-white border-blue-200 shadow-xs'
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 font-mono font-black text-sm tracking-wider">
                    {promo.code}
                  </span>
                  <span className={`text-xs font-bold flex items-center gap-1 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {isActive ? <><Check className="w-4 h-4" /> Active</> : 'Expired'}
                  </span>
                </div>

                <div className="text-2xl font-black text-slate-900 mb-1">
                  {promo.discountType === 'percentage' ? `${promo.value}% OFF` : `${formatCurrency(promo.value)} OFF`}
                </div>

                <div className="space-y-1 text-xs text-slate-500">
                  <div>Min Duration: <strong>{promo.minDays} Days</strong></div>
                  <div>Valid Until: <strong>{promo.validUntil}</strong></div>
                  <div>Redeemed: <strong>{promo.usageCount} times</strong></div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Auto-validates in Booking Wizard</span>
                <span className="font-bold uppercase text-slate-700">{promo.discountType}</span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
