import React, { useState } from 'react';
import { Vehicle } from '../../types';
import { useRentora } from '../../context/RentoraContext';
import { 
  X, 
  Car, 
  Fuel, 
  Gauge, 
  Users, 
  Shield, 
  Calendar, 
  DollarSign, 
  MapPin, 
  Wrench, 
  FileText, 
  Check, 
  Clock, 
  KeyRound,
  Edit,
  ExternalLink
} from 'lucide-react';
import { DamageInspector } from '../rentals/DamageInspector';

interface CarDetailModalProps {
  vehicle: Vehicle;
  onClose: () => void;
  onEdit: () => void;
  onBook: () => void;
}

export const CarDetailModal: React.FC<CarDetailModalProps> = ({
  vehicle,
  onClose,
  onEdit,
  onBook
}) => {
  const { categories, branches, maintenanceRecords, rentals, formatCurrency } = useRentora();
  const [activeTab, setActiveTab] = useState<'overview' | 'pricing' | 'damages' | 'history' | 'documents'>('overview');
  const [selectedGalleryImg, setSelectedGalleryImg] = useState<string>(vehicle.mainImage);

  const category = categories.find(c => c.id === vehicle.categoryId);
  const branch = branches.find(b => b.id === vehicle.branchId);
  const vehicleMaintenance = maintenanceRecords.filter(m => m.vehicleId === vehicle.id);
  const vehicleRentals = rentals.filter(r => r.vehicleId === vehicle.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">
        
        {/* Modal Top Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600 text-white">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight font-display">
                  {vehicle.make} {vehicle.model} ({vehicle.year})
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  {vehicle.status}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Reg: <span className="font-mono text-slate-200 font-bold">{vehicle.regNumber}</span> • VIN: <span className="font-mono text-slate-300">{vehicle.vin}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onEdit}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Tabs Bar */}
        <div className="flex bg-slate-50 border-b border-slate-200 px-5 pt-2 gap-2 text-xs font-bold overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview & Specs' },
            { id: 'pricing', label: 'Tiered Pricing' },
            { id: 'damages', label: `Damages (${vehicle.damages.length})` },
            { id: 'history', label: `Service History (${vehicleMaintenance.length})` },
            { id: 'documents', label: `Documents (${vehicle.documents.length})` }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-2.5 px-3 border-b-2 transition-all capitalize whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Image Gallery */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 aspect-[16/10] bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                  <img
                    src={selectedGalleryImg}
                    alt={vehicle.model}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Gallery Views
                  </div>
                  <div className="grid grid-cols-3 md:grid-cols-1 gap-2">
                    {[vehicle.mainImage, ...vehicle.galleryImages].map((img, i) => (
                      <div
                        key={i}
                        onClick={() => setSelectedGalleryImg(img)}
                        className={`aspect-[16/10] rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                          selectedGalleryImg === img ? 'border-blue-600 scale-[1.02]' : 'border-slate-200 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Category</span>
                  <span className="font-extrabold text-slate-800 text-sm mt-0.5 block">{category?.name || 'Standard'}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Base Branch</span>
                  <span className="font-extrabold text-slate-800 text-sm mt-0.5 block">{branch?.name || 'Main Hub'}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Transmission</span>
                  <span className="font-extrabold text-slate-800 text-sm mt-0.5 block">{vehicle.transmission}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Fuel & Engine</span>
                  <span className="font-extrabold text-slate-800 text-sm mt-0.5 block">{vehicle.fuelType} • {vehicle.engineCapacity}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Odometer</span>
                  <span className="font-extrabold text-slate-800 text-sm mt-0.5 block">{vehicle.mileage.toLocaleString()} km</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Capacity</span>
                  <span className="font-extrabold text-slate-800 text-sm mt-0.5 block">{vehicle.seats} Seats • {vehicle.doors} Doors</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Color</span>
                  <span className="font-extrabold text-slate-800 text-sm mt-0.5 block">{vehicle.color}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Next Service At</span>
                  <span className="font-extrabold text-blue-600 text-sm mt-0.5 block">{vehicle.nextServiceDueKm.toLocaleString()} km</span>
                </div>
              </div>

              {/* Feature Tags */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-800 mb-2.5">Included Vehicle Equipment & Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {vehicle.features.map((feat, i) => (
                    <span key={i} className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 font-semibold flex items-center gap-1.5 shadow-2xs">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      {feat}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: TIERED PRICING */}
          {activeTab === 'pricing' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-center">
                  <span className="text-xs font-bold text-blue-800 uppercase tracking-wider block mb-1">Daily Rate</span>
                  <span className="text-2xl font-black text-blue-900 font-display">{formatCurrency(vehicle.dailyRate)}</span>
                  <span className="text-slate-500 text-[11px] block mt-1">1 - 6 rental days</span>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-center">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block mb-1">Weekly Rate (Tier 1)</span>
                  <span className="text-2xl font-black text-emerald-900 font-display">{formatCurrency(vehicle.weeklyRate)}</span>
                  <span className="text-slate-500 text-[11px] block mt-1">Per day (7 - 29 days)</span>
                </div>

                <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 text-center">
                  <span className="text-xs font-bold text-purple-800 uppercase tracking-wider block mb-1">Monthly Rate (Tier 2)</span>
                  <span className="text-2xl font-black text-purple-900 font-display">{formatCurrency(vehicle.monthlyRate)}</span>
                  <span className="text-slate-500 text-[11px] block mt-1">Per day (30+ days)</span>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-800 mb-2">Additional Fee & Compliance Rates</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-slate-500">Security Deposit:</span>
                    <div className="font-bold text-slate-800">{formatCurrency(vehicle.securityDeposit)} (Refundable)</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Free Daily Allowance:</span>
                    <div className="font-bold text-slate-800">{vehicle.mileageLimitPerDay} km / day</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Excess Mileage Fee:</span>
                    <div className="font-bold text-slate-800">{formatCurrency(vehicle.extraMileageCharge)} / extra km</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Late Return Hourly Rate:</span>
                    <div className="font-bold text-slate-800">{formatCurrency(vehicle.lateReturnHourlyRate)} / hour</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DAMAGE INSPECTOR */}
          {activeTab === 'damages' && (
            <DamageInspector
              damages={vehicle.damages}
              onChange={() => {}}
              readOnly={true}
              title={`Vehicle Condition Log (${vehicle.damages.length} Points)`}
            />
          )}

          {/* TAB 4: SERVICE HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-800">Maintenance & Repair Log</h4>
              {vehicleMaintenance.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  No maintenance records logged for this vehicle yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {vehicleMaintenance.map(rec => (
                    <div key={rec.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900">{rec.maintenanceType}</div>
                        <div className="text-slate-500 text-[11px]">{rec.serviceProvider} • {rec.startDate} to {rec.actualCompletionDate || rec.expectedCompletionDate || 'Ongoing'}</div>
                        <div className="text-slate-600 mt-1">{rec.description}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-extrabold text-slate-900">{formatCurrency(rec.cost)}</div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                          {rec.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: COMPLIANCE DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-800">Compliance & Legal Documentation</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {vehicle.documents.map(doc => (
                  <div key={doc.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800">{doc.documentType}</div>
                      <div className="text-[11px] text-slate-500">Doc No: {doc.documentNumber}</div>
                      <div className="text-[10px] text-slate-400">Expires: {doc.expiryDate}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {doc.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Current Daily Rate: <strong className="text-slate-900 text-sm">{formatCurrency(vehicle.dailyRate)}</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              Close
            </button>
            {vehicle.status === 'Available' && (
              <button
                type="button"
                onClick={onBook}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
              >
                Create Booking for this Vehicle
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
