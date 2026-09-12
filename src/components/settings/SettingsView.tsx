import React, { useState } from 'react';
import { useRentora } from '../../context/RentoraContext';
import { SystemSettings, Branch } from '../../types';
import { 
  Settings, 
  Building, 
  DollarSign, 
  Percent, 
  ShieldCheck, 
  Save, 
  RotateCcw, 
  MapPin, 
  Phone, 
  Mail,
  Check,
  Clock,
  Bell
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, branches, resetToDemoData } = useRentora();

  // Local form state
  const [formData, setFormData] = useState<SystemSettings>(settings);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleResetData = () => {
    if (window.confirm('Are you sure you want to reset all data back to the clean demonstration seed state?')) {
      resetToDemoData();
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-display flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-blue-600" />
            Enterprise System Configuration & Branches
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Global tax parameters, currencies, legal company details, rental policies, and location hubs.
          </p>
        </div>

        {isSaved && (
          <div className="px-4 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl font-bold text-xs flex items-center gap-1.5 animate-in fade-in">
            <Check className="w-4 h-4" /> Changes saved successfully!
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        
        {/* Company Identity */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">
            <Building className="w-4 h-4 text-blue-600" />
            <span>Company Profile & Legal Details</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Company Trade Name *</label>
              <input
                type="text"
                required
                value={formData.company.name}
                onChange={e => setFormData({ ...formData, company: { ...formData.company, name: e.target.value } })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Company Tagline / Slogan</label>
              <input
                type="text"
                value={formData.company.tagline}
                onChange={e => setFormData({ ...formData, company: { ...formData.company, tagline: e.target.value } })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Tax Registration / VAT ID *</label>
              <input
                type="text"
                required
                value={formData.company.taxId}
                onChange={e => setFormData({ ...formData, company: { ...formData.company, taxId: e.target.value } })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Official Support Hotline</label>
              <input
                type="text"
                value={formData.company.phone}
                onChange={e => setFormData({ ...formData, company: { ...formData.company, phone: e.target.value } })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Business Billing Email</label>
              <input
                type="email"
                value={formData.company.email}
                onChange={e => setFormData({ ...formData, company: { ...formData.company, email: e.target.value } })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Official Website</label>
              <input
                type="text"
                value={formData.company.website}
                onChange={e => setFormData({ ...formData, company: { ...formData.company, website: e.target.value } })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">Headquarters Address (For Legal Invoices)</label>
              <input
                type="text"
                value={formData.company.address}
                onChange={e => setFormData({ ...formData, company: { ...formData.company, address: e.target.value } })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Currency & Tax Parameters */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Financial & Tax Parameters</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">System Currency Format</label>
              <select
                value={formData.tax.currencyFormat}
                onChange={e => setFormData({ 
                  ...formData, 
                  tax: { 
                    ...formData.tax, 
                    currencyFormat: e.target.value as any,
                    currency: e.target.value,
                    currencySymbol: e.target.value === 'USD' ? '$' : e.target.value === 'EUR' ? '€' : e.target.value === 'GBP' ? '£' : 'Rs'
                  } 
                })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-none"
              >
                <option value="USD">USD ($ - US Dollar)</option>
                <option value="LKR">LKR (Rs - Sri Lankan Rupee)</option>
                <option value="EUR">EUR (€ - Euro)</option>
                <option value="GBP">GBP (£ - British Pound)</option>
                <option value="CAD">CAD (C$ - Canadian Dollar)</option>
                <option value="AUD">AUD (A$ - Australian Dollar)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Currency Symbol</label>
              <input
                type="text"
                value={formData.tax.currencySymbol}
                onChange={e => setFormData({ ...formData, tax: { ...formData.tax, currencySymbol: e.target.value } })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Government Tax Rate (VAT %)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.tax.taxRate}
                onChange={e => setFormData({ ...formData, tax: { ...formData.tax, taxRate: Number(e.target.value) } })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Rental Rules & Policies */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Rental Rules & Operational Constraints</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Minimum Driver Age</label>
              <input
                type="number"
                min="18"
                max="30"
                value={formData.rentalRules.minDriverAge}
                onChange={e => setFormData({ ...formData, rentalRules: { ...formData.rentalRules, minDriverAge: Number(e.target.value) } })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Late Return Fee ($/Hour)</label>
              <input
                type="number"
                min="0"
                value={formData.rentalRules.lateReturnFeePerHour}
                onChange={e => setFormData({ ...formData, rentalRules: { ...formData.rentalRules, lateReturnFeePerHour: Number(e.target.value) } })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Grace Period (Minutes)</label>
              <input
                type="number"
                min="0"
                value={formData.rentalRules.lateReturnGracePeriodMinutes}
                onChange={e => setFormData({ ...formData, rentalRules: { ...formData.rentalRules, lateReturnGracePeriodMinutes: Number(e.target.value) } })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Branches Overview */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">
            <MapPin className="w-4 h-4 text-purple-600" />
            <span>Active Branch Station Locations ({branches.length})</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {branches.map(b => (
              <div key={b.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="font-bold text-slate-900 text-sm">{b.name}</div>
                <div className="text-slate-500 text-[11px]">{b.address}, {b.city}</div>
                <div className="text-[10px] text-slate-400 font-mono mt-1">{b.phone}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={handleResetData}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl font-bold transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Demo Seed Data</span>
          </button>

          <button
            type="submit"
            className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-blue-500/20"
          >
            <Save className="w-4 h-4" />
            <span>Save Enterprise Configuration</span>
          </button>
        </div>

      </form>
    </div>
  );
};
