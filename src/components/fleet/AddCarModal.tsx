import React, { useState } from 'react';
import { Vehicle, VehicleDocument, VehicleStatus } from '../../types';
import { useRentora } from '../../context/RentoraContext';
import { 
  X, 
  Car, 
  Plus, 
  Fuel, 
  Gauge, 
  Users, 
  DollarSign, 
  MapPin, 
  Check, 
  Image as ImageIcon,
  FileText
} from 'lucide-react';

interface AddCarModalProps {
  vehicleToEdit?: Vehicle;
  onClose: () => void;
}

export const AddCarModal: React.FC<AddCarModalProps> = ({
  vehicleToEdit,
  onClose
}) => {
  const { categories, branches, addVehicle, updateVehicle } = useRentora();

  const isEditing = !!vehicleToEdit;

  // Form State
  const [make, setMake] = useState(vehicleToEdit?.make || '');
  const [model, setModel] = useState(vehicleToEdit?.model || '');
  const [year, setYear] = useState(vehicleToEdit?.year || 2024);
  const [color, setColor] = useState(vehicleToEdit?.color || 'Pearl White');
  const [regNumber, setRegNumber] = useState(vehicleToEdit?.regNumber || '');
  const [vin, setVin] = useState(vehicleToEdit?.vin || '');
  const [engineNumber, setEngineNumber] = useState(vehicleToEdit?.engineNumber || `ENG-${Math.floor(100000 + Math.random() * 900000)}`);
  const [categoryId, setCategoryId] = useState(vehicleToEdit?.categoryId || categories[0]?.id || 'cat-sedan');
  const [branchId, setBranchId] = useState(vehicleToEdit?.branchId || branches[0]?.id || 'br-1');
  const [status, setStatus] = useState<VehicleStatus>(vehicleToEdit?.status || 'Available');

  // Specs
  const [fuelType, setFuelType] = useState<Vehicle['fuelType']>(vehicleToEdit?.fuelType || 'Petrol');
  const [transmission, setTransmission] = useState<Vehicle['transmission']>(vehicleToEdit?.transmission || 'Automatic');
  const [engineCapacity, setEngineCapacity] = useState(vehicleToEdit?.engineCapacity || '2.0L 4-Cyl');
  const [seats, setSeats] = useState(vehicleToEdit?.seats || 5);
  const [doors, setDoors] = useState(vehicleToEdit?.doors || 4);
  const [mileage, setMileage] = useState(vehicleToEdit?.mileage || 15000);

  // Pricing
  const [dailyRate, setDailyRate] = useState(vehicleToEdit?.dailyRate || 65);
  const [weeklyRate, setWeeklyRate] = useState(vehicleToEdit?.weeklyRate || 55);
  const [monthlyRate, setMonthlyRate] = useState(vehicleToEdit?.monthlyRate || 45);
  const [securityDeposit, setSecurityDeposit] = useState(vehicleToEdit?.securityDeposit || 400);
  const [extraKmRate, setExtraKmRate] = useState(vehicleToEdit?.extraKmRate || 0.35);
  const [extraHourRate, setExtraHourRate] = useState(vehicleToEdit?.extraHourRate || 10);
  const [lateReturnRate, setLateReturnRate] = useState(vehicleToEdit?.lateReturnRate || 15);

  // Features
  const [features, setFeatures] = useState({
    airConditioning: vehicleToEdit?.features?.airConditioning ?? true,
    gps: vehicleToEdit?.features?.gps ?? true,
    bluetooth: vehicleToEdit?.features?.bluetooth ?? true,
    usb: vehicleToEdit?.features?.usb ?? true,
    childSeat: vehicleToEdit?.features?.childSeat ?? false,
    backupCamera: vehicleToEdit?.features?.backupCamera ?? true,
    cruiseControl: vehicleToEdit?.features?.cruiseControl ?? true,
    sunroof: vehicleToEdit?.features?.sunroof ?? false
  });

  // Photos
  const [mainImage, setMainImage] = useState(
    vehicleToEdit?.mainImage || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'
  );

  const [activeTab, setActiveTab] = useState<'info' | 'specs' | 'pricing' | 'features'>('info');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!make.trim() || !model.trim() || !regNumber.trim() || !vin.trim()) {
      alert('Please fill in make, model, registration plate, and VIN.');
      return;
    }

    const vehicleData: Omit<Vehicle, 'id' | 'vehicleId'> = {
      make: make.trim(),
      model: model.trim(),
      year: Number(year),
      color: color.trim(),
      regNumber: regNumber.trim().toUpperCase(),
      vin: vin.trim().toUpperCase(),
      engineNumber: engineNumber.trim().toUpperCase(),
      categoryId,
      branchId,
      status,
      transmission,
      fuelType,
      engineCapacity,
      seats: Number(seats),
      doors: Number(doors),
      mileage: Number(mileage),
      dailyRate: Number(dailyRate),
      weeklyRate: Number(weeklyRate),
      monthlyRate: Number(monthlyRate),
      securityDeposit: Number(securityDeposit),
      extraKmRate: Number(extraKmRate),
      extraHourRate: Number(extraHourRate),
      lateReturnRate: Number(lateReturnRate),
      features,
      mainImage,
      images: vehicleToEdit?.images || [
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80'
      ],
      documents: vehicleToEdit?.documents || [
        {
          id: `doc-${Date.now()}-1`,
          name: 'Registration Certificate',
          type: 'Registration',
          documentNumber: `REG-${regNumber.replace(/[^a-zA-Z0-9]/g, '')}`,
          issueDate: '2024-01-10',
          expiryDate: '2027-06-30',
          status: 'Valid'
        },
        {
          id: `doc-${Date.now()}-2`,
          name: 'Commercial Insurance Policy',
          type: 'Insurance',
          documentNumber: `INS-POL-${Math.floor(100000 + Math.random() * 900000)}`,
          issueDate: '2025-04-15',
          expiryDate: '2027-04-15',
          status: 'Valid'
        }
      ],
      purchaseDate: vehicleToEdit?.purchaseDate || '2024-01-15',
      maintenanceIntervalKm: vehicleToEdit?.maintenanceIntervalKm || 5000,
      lastServiceMileage: vehicleToEdit?.lastServiceMileage || mileage - 2000,
      nextServiceDate: vehicleToEdit?.nextServiceDate || '2026-12-15',
      notes: vehicleToEdit?.notes || 'Registered in active fleet.'
    };

    if (isEditing && vehicleToEdit) {
      updateVehicle(vehicleToEdit.id, vehicleData);
    } else {
      addVehicle(vehicleData);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600 text-white">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight font-display">
                {isEditing ? `Edit Vehicle: ${vehicleToEdit.make} ${vehicleToEdit.model}` : 'Register New Fleet Vehicle'}
              </h2>
              <p className="text-xs text-slate-400">
                Enter technical specifications, rates, and branch location.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-slate-50 border-b border-slate-200 px-5 pt-2 gap-2 text-xs font-bold overflow-x-auto">
          {[
            { id: 'info', label: 'General & Registration' },
            { id: 'specs', label: 'Powertrain & Specs' },
            { id: 'pricing', label: 'Tiered Pricing & Rates' },
            { id: 'features', label: 'Amenities & Equipment' }
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden text-xs">
          <div className="p-6 overflow-y-auto space-y-4 flex-1">
            
            {/* TAB 1: INFO */}
            {activeTab === 'info' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Make / Brand *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Toyota, BMW, Tesla"
                      value={make}
                      onChange={e => setMake(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Model *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Camry, 3 Series, Model Y"
                      value={model}
                      onChange={e => setModel(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Manufacturing Year *</label>
                    <input
                      type="number"
                      required
                      min={2000}
                      max={2030}
                      value={year}
                      onChange={e => setYear(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">License Plate (Reg #) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CAB-8821"
                      value={regNumber}
                      onChange={e => setRegNumber(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono uppercase focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">VIN (Chassis #) *</label>
                    <input
                      type="text"
                      required
                      placeholder="17-character VIN"
                      value={vin}
                      onChange={e => setVin(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono uppercase focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Engine Number</label>
                    <input
                      type="text"
                      value={engineNumber}
                      onChange={e => setEngineNumber(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono uppercase focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Category Segment</label>
                    <select
                      value={categoryId}
                      onChange={e => setCategoryId(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Assigned Station / Branch</label>
                    <select
                      value={branchId}
                      onChange={e => setBranchId(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                    >
                      {branches.map(b => (
                        <option key={b.id} value={b.id}>{b.name} ({b.city})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Current Status</label>
                    <select
                      value={status}
                      onChange={e => setStatus(e.target.value as any)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold"
                    >
                      <option value="Available">Available for Rent</option>
                      <option value="Reserved">Reserved</option>
                      <option value="Rented">Currently Rented</option>
                      <option value="Maintenance">Under Maintenance</option>
                      <option value="Unavailable">Unavailable</option>
                      <option value="Inactive">Inactive / Decommissioned</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Main Image URL</label>
                  <input
                    type="url"
                    value={mainImage}
                    onChange={e => setMainImage(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: SPECS */}
            {activeTab === 'specs' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Fuel Type</label>
                    <select
                      value={fuelType}
                      onChange={e => setFuelType(e.target.value as any)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                    >
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Electric">Electric</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Transmission</label>
                    <select
                      value={transmission}
                      onChange={e => setTransmission(e.target.value as any)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                    >
                      <option value="Automatic">Automatic</option>
                      <option value="Manual">Manual</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Engine Capacity / Motor</label>
                    <input
                      type="text"
                      value={engineCapacity}
                      onChange={e => setEngineCapacity(e.target.value)}
                      placeholder="e.g. 1.8L Turbo or 150 kW"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Seating Capacity</label>
                    <input
                      type="number"
                      min={2}
                      max={15}
                      value={seats}
                      onChange={e => setSeats(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Doors</label>
                    <input
                      type="number"
                      min={2}
                      max={6}
                      value={doors}
                      onChange={e => setDoors(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Current Odometer (km)</label>
                    <input
                      type="number"
                      min={0}
                      value={mileage}
                      onChange={e => setMileage(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: PRICING */}
            {activeTab === 'pricing' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Daily Base Rate ($/day) *</label>
                    <input
                      type="number"
                      required
                      min={10}
                      value={dailyRate}
                      onChange={e => setDailyRate(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Weekly Tier ($/day)</label>
                    <input
                      type="number"
                      min={10}
                      value={weeklyRate}
                      onChange={e => setWeeklyRate(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Monthly Tier ($/day)</label>
                    <input
                      type="number"
                      min={10}
                      value={monthlyRate}
                      onChange={e => setMonthlyRate(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Security Deposit ($)</label>
                    <input
                      type="number"
                      min={0}
                      value={securityDeposit}
                      onChange={e => setSecurityDeposit(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Extra Km Rate ($/km)</label>
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      value={extraKmRate}
                      onChange={e => setExtraKmRate(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Late Return Hourly Rate ($/hr)</label>
                    <input
                      type="number"
                      min={0}
                      value={lateReturnRate}
                      onChange={e => setLateReturnRate(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: FEATURES */}
            {activeTab === 'features' && (
              <div className="space-y-4">
                <p className="text-slate-500">Toggle the features and options present in this vehicle:</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.entries(features).map(([key, val]) => (
                    <label
                      key={key}
                      className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between capitalize ${
                        val ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold' : 'border-slate-200 bg-white text-slate-600'
                      }`}
                    >
                      <span>{key.replace(/([A-Z])/g, ' $1')}</span>
                      <input
                        type="checkbox"
                        checked={val}
                        onChange={e => setFeatures({ ...features, [key]: e.target.checked })}
                        className="rounded text-blue-600"
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm shadow-blue-500/20"
            >
              {isEditing ? 'Update Vehicle' : 'Register Vehicle to Fleet'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
