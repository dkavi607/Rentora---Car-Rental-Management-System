import React, { useState } from 'react';
import { useRentora } from '../../context/RentoraContext';
import { Vehicle, VehicleStatus } from '../../types';
import { 
  Car, 
  Search, 
  Filter, 
  Grid, 
  List, 
  Plus, 
  Fuel, 
  Gauge, 
  Users, 
  Calendar, 
  Eye, 
  Edit, 
  Trash2, 
  Wrench, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Sparkles,
  MapPin,
  FileText
} from 'lucide-react';
import { CarDetailModal } from './CarDetailModal';
import { AddCarModal } from './AddCarModal';

interface CarListProps {
  onOpenNewBookingWithCar?: (vehicleId: string) => void;
}

export const CarList: React.FC<CarListProps> = ({ onOpenNewBookingWithCar }) => {
  const { 
    vehicles, 
    categories, 
    branches, 
    deleteVehicle, 
    updateVehicle, 
    formatCurrency, 
    selectedBranchId 
  } = useRentora();

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedTransmission, setSelectedTransmission] = useState<string>('all');
  const [selectedFuel, setSelectedFuel] = useState<string>('all');

  // Modals
  const [viewingVehicle, setViewingVehicle] = useState<Vehicle | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Filter vehicles
  const filteredVehicles = vehicles.filter(v => {
    if (selectedBranchId !== 'all' && v.branchId !== selectedBranchId) return false;
    if (selectedCategory !== 'all' && v.categoryId !== selectedCategory) return false;
    if (selectedStatus !== 'all' && v.status !== selectedStatus) return false;
    if (selectedTransmission !== 'all' && v.transmission !== selectedTransmission) return false;
    if (selectedFuel !== 'all' && v.fuelType !== selectedFuel) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchMake = v.make.toLowerCase().includes(q);
      const matchModel = v.model.toLowerCase().includes(q);
      const matchReg = v.regNumber.toLowerCase().includes(q);
      const matchId = v.vehicleId.toLowerCase().includes(q);
      const matchVin = v.vin.toLowerCase().includes(q);
      return matchMake || matchModel || matchReg || matchId || matchVin;
    }
    return true;
  });

  const getStatusBadge = (status: VehicleStatus) => {
    switch (status) {
      case 'Available':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Rented':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Reserved':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Maintenance':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Unavailable':
      case 'Inactive':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-display flex items-center gap-2.5">
            <Car className="w-6 h-6 text-blue-600" />
            Fleet & Vehicle Inventory ({filteredVehicles.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your fleet specifications, rates, current statuses, and availability.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Vehicle</span>
        </button>
      </div>

      {/* Search & Filter Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          
          {/* Search bar */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search make, model, reg plate, VIN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Reserved">Reserved</option>
              <option value="Rented">Rented</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Unavailable">Unavailable</option>
            </select>
          </div>

          {/* Fuel Filter */}
          <div>
            <select
              value={selectedFuel}
              onChange={(e) => setSelectedFuel(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="all">All Fuel Types</option>
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Electric">Electric</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                viewMode === 'grid' 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs' 
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                viewMode === 'table' 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs' 
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredVehicles.length === 0 ? (
            <div className="col-span-full bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
              <Car className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              No vehicles found matching the selected filters.
            </div>
          ) : (
            filteredVehicles.map(veh => {
              const cat = categories.find(c => c.id === veh.categoryId);
              const branch = branches.find(b => b.id === veh.branchId);

              return (
                <div
                  key={veh.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <div>
                    {/* Vehicle Image Banner */}
                    <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                      <img
                        src={veh.mainImage}
                        alt={`${veh.make} ${veh.model}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      
                      {/* Status Badge */}
                      <span className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-full border text-[11px] font-extrabold uppercase tracking-wide backdrop-blur-md shadow-xs ${getStatusBadge(veh.status)}`}>
                        {veh.status}
                      </span>

                      {/* Branch Badge */}
                      <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-slate-900/80 text-white text-[10px] font-bold backdrop-blur-md flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-blue-400" />
                        {branch?.city || 'Hub'}
                      </span>

                      {/* Daily Rate Tag */}
                      <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-slate-900/90 text-white backdrop-blur-md font-bold text-xs">
                        <span className="text-blue-400 font-extrabold text-sm">{formatCurrency(veh.dailyRate)}</span>
                        <span className="text-[10px] text-slate-300 font-normal"> / day</span>
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="p-4 space-y-3">
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                          {cat?.name || 'Standard'}
                        </div>
                        <h3 className="font-extrabold text-base text-slate-900 truncate">
                          {veh.make} {veh.model}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                          <span>{veh.year}</span>
                          <span>•</span>
                          <span className="font-mono text-slate-700 font-semibold">{veh.regNumber}</span>
                        </div>
                      </div>

                      {/* Key Specs Pills */}
                      <div className="grid grid-cols-3 gap-1.5 py-2 border-y border-slate-100 text-[11px] text-slate-600">
                        <div className="flex items-center gap-1">
                          <Fuel className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate">{veh.fuelType}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Gauge className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate">{veh.transmission}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>{veh.seats} Seats</span>
                        </div>
                      </div>

                      {/* Odometer & Deposit */}
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Odometer: <strong className="text-slate-800">{veh.mileage.toLocaleString()} km</strong></span>
                        <span>Deposit: <strong className="text-slate-800">{formatCurrency(veh.securityDeposit)}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-4 pt-0 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setViewingVehicle(veh)}
                      className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>Details</span>
                    </button>

                    {veh.status === 'Available' && onOpenNewBookingWithCar && (
                      <button
                        type="button"
                        onClick={() => onOpenNewBookingWithCar(veh.id)}
                        className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <span>Book</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setEditingVehicle(veh)}
                      className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-blue-600 rounded-xl border border-slate-200 transition-colors"
                      title="Edit vehicle"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              );
            })
          )}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Vehicle</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Registration / VIN</th>
                  <th className="px-4 py-3">Specs</th>
                  <th className="px-4 py-3">Daily Rate</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVehicles.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                      No vehicles found.
                    </td>
                  </tr>
                ) : (
                  filteredVehicles.map(veh => {
                    const cat = categories.find(c => c.id === veh.categoryId);
                    const branch = branches.find(b => b.id === veh.branchId);

                    return (
                      <tr key={veh.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={veh.mainImage}
                              alt=""
                              className="w-12 h-8 object-cover rounded-lg border border-slate-200 shrink-0"
                            />
                            <div>
                              <div className="font-bold text-slate-900">{veh.make} {veh.model}</div>
                              <div className="text-[10px] text-slate-400">{veh.year} • {veh.color}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-700">
                          {cat?.name || 'Standard'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-mono font-bold text-slate-800">{veh.regNumber}</div>
                          <div className="text-[10px] font-mono text-slate-400">{veh.vin}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          <div>{veh.fuelType} • {veh.transmission}</div>
                          <div className="text-[10px] text-slate-400">{veh.seats} Seats • {veh.mileage.toLocaleString()} km</div>
                        </td>
                        <td className="px-4 py-3 font-extrabold text-slate-900">
                          {formatCurrency(veh.dailyRate)} <span className="text-[10px] font-normal text-slate-400">/day</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wide ${getStatusBadge(veh.status)}`}>
                            {veh.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600 font-medium">
                          {branch?.name || 'Central'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setViewingVehicle(veh)}
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingVehicle(veh)}
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg"
                              title="Edit Vehicle"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Car Detail Modal */}
      {viewingVehicle && (
        <CarDetailModal
          vehicle={viewingVehicle}
          onClose={() => setViewingVehicle(null)}
          onEdit={() => {
            setEditingVehicle(viewingVehicle);
            setViewingVehicle(null);
          }}
          onBook={() => {
            if (onOpenNewBookingWithCar) {
              onOpenNewBookingWithCar(viewingVehicle.id);
              setViewingVehicle(null);
            }
          }}
        />
      )}

      {/* Add / Edit Car Modal */}
      {(isAddModalOpen || editingVehicle) && (
        <AddCarModal
          vehicleToEdit={editingVehicle || undefined}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingVehicle(null);
          }}
        />
      )}

    </div>
  );
};
