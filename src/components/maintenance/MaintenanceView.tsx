import React, { useState } from 'react';
import { useRentora } from '../../context/RentoraContext';
import { MaintenanceRecord, MaintenanceType } from '../../types';
import { 
  Wrench, 
  Plus, 
  Search, 
  Car, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  DollarSign,
  FileText
} from 'lucide-react';

export const MaintenanceView: React.FC = () => {
  const { maintenanceRecords, vehicles, addMaintenanceRecord, completeMaintenanceRecord, formatCurrency } = useRentora();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Record State
  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id || '');
  const [maintenanceType, setMaintenanceType] = useState<MaintenanceType>('Routine Service');
  const [description, setDescription] = useState('');
  const [serviceProvider, setServiceProvider] = useState('Toyota Lanka Workshop');
  const [cost, setCost] = useState<number>(180);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedCompletionDate, setExpectedCompletionDate] = useState('2026-09-18');
  const [mileageAtService, setMileageAtService] = useState<number>(15000);

  const filteredRecords = maintenanceRecords.filter(m => {
    if (selectedStatus !== 'all' && m.status !== selectedStatus) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const veh = vehicles.find(v => v.id === m.vehicleId);
      const matchVeh = veh ? `${veh.make} ${veh.model} ${veh.regNumber}`.toLowerCase().includes(q) : false;
      return m.serviceProvider.toLowerCase().includes(q) || m.description.toLowerCase().includes(q) || matchVeh;
    }
    return true;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    addMaintenanceRecord({
      vehicleId,
      maintenanceType,
      description: description.trim(),
      serviceProvider: serviceProvider.trim(),
      cost,
      startDate,
      expectedCompletionDate,
      mileageAtService,
      status: 'In Progress'
    });

    setIsAddModalOpen(false);
    setDescription('');
  };

  const getStatusBadge = (status: MaintenanceRecord['status']) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'In Progress':
        return 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse';
      case 'Scheduled':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-display flex items-center gap-2.5">
            <Wrench className="w-6 h-6 text-blue-600" />
            Fleet Maintenance & Workshop Services ({filteredRecords.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Preventative maintenance schedules, oil changes, bodywork repairs, and garage expense tracking.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Service Ticket</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search service logs by workshop, description, car..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={e => setSelectedStatus(e.target.value)}
          className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
        >
          <option value="all">All Service Statuses</option>
          <option value="In Progress">In Progress</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Service Type & Details</th>
                <th className="px-4 py-3">Service Garage / Center</th>
                <th className="px-4 py-3">Schedule Dates</th>
                <th className="px-4 py-3">Cost</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map(m => {
                const veh = vehicles.find(v => v.id === m.vehicleId);

                return (
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={veh?.mainImage || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=80&q=80'}
                          alt=""
                          className="w-10 h-7 object-cover rounded border border-slate-200 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{veh?.make} {veh?.model}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{veh?.regNumber}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-800">{m.maintenanceType}</div>
                      <div className="text-[11px] text-slate-500 max-w-xs truncate">{m.description}</div>
                    </td>

                    <td className="px-4 py-3 font-medium text-slate-800">
                      {m.serviceProvider}
                    </td>

                    <td className="px-4 py-3 text-slate-600">
                      <div>{m.startDate} → {m.expectedCompletionDate}</div>
                      <div className="text-[10px] text-slate-400">At {m.mileageAtService.toLocaleString()} km</div>
                    </td>

                    <td className="px-4 py-3 font-black text-slate-900">
                      {formatCurrency(m.cost)}
                    </td>

                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wide ${getStatusBadge(m.status)}`}>
                        {m.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      {m.status !== 'Completed' ? (
                        <button
                          type="button"
                          onClick={() => completeMaintenanceRecord(m.id, m.cost, 'Completed inspection and maintenance checklist')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg transition-colors flex items-center gap-1 ml-auto"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Complete</span>
                        </button>
                      ) : (
                        <span className="text-[11px] font-bold text-emerald-600 flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Serviced
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-xs">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-black text-base font-display flex items-center gap-2">
                <Wrench className="w-5 h-5 text-blue-400" /> Dispatch Vehicle to Service Workshop
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-3.5">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Select Vehicle *</label>
                <select
                  value={vehicleId}
                  onChange={e => setVehicleId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold focus:outline-none"
                >
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.make} {v.model} ({v.regNumber}) - {v.status}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Service Type</label>
                  <select
                    value={maintenanceType}
                    onChange={e => setMaintenanceType(e.target.value as MaintenanceType)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold focus:outline-none"
                  >
                    <option value="Routine Service">Routine Service</option>
                    <option value="Oil Change">Oil Change</option>
                    <option value="Tire Replacement">Tire Replacement</option>
                    <option value="Brake Service">Brake Service</option>
                    <option value="Engine Repair">Engine Repair</option>
                    <option value="Accident Repair">Accident / Body Repair</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Estimated Cost ($)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={cost}
                    onChange={e => setCost(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Service Garage / Center *</label>
                <input
                  type="text"
                  required
                  value={serviceProvider}
                  onChange={e => setServiceProvider(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Service Task Description *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. 20,000 km full engine oil, spark plugs, fluid inspection..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Expected Completion</label>
                  <input
                    type="date"
                    value={expectedCompletionDate}
                    onChange={e => setExpectedCompletionDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold"
                >
                  Dispatch to Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
