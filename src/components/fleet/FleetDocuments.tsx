import React, { useState } from 'react';
import { useRentora } from '../../context/RentoraContext';
import { FolderCheck, Search, Filter, ShieldAlert, CheckCircle2, Clock, AlertTriangle, FileText } from 'lucide-react';

export const FleetDocuments: React.FC = () => {
  const { vehicles } = useRentora();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Flatten all vehicle documents
  const allDocs = vehicles.flatMap(v => 
    v.documents.map(d => ({
      ...d,
      vehicleId: v.id,
      vehicleName: `${v.make} ${v.model}`,
      regNumber: v.regNumber
    }))
  );

  const filteredDocs = allDocs.filter(doc => {
    if (filterType !== 'all' && doc.type !== filterType) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        doc.documentNumber.toLowerCase().includes(q) ||
        doc.vehicleName.toLowerCase().includes(q) ||
        doc.regNumber.toLowerCase().includes(q) ||
        doc.type.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h1 className="text-2xl font-black text-slate-900 font-display flex items-center gap-2.5">
          <FolderCheck className="w-6 h-6 text-blue-600" />
          Fleet Compliance & Document Registry ({allDocs.length})
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Monitor insurance policies, revenue licenses, and commercial roadworthiness renewals.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search document number, vehicle, plate..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="all">All Document Types</option>
          <option value="Registration">Registration Certificates</option>
          <option value="Insurance">Commercial Insurance</option>
          <option value="Revenue License">Revenue License</option>
          <option value="Inspection Certificate">Inspection Certificate</option>
        </select>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Document Type</th>
                <th className="px-4 py-3">Document Number</th>
                <th className="px-4 py-3">Expiration Date</th>
                <th className="px-4 py-3">Compliance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    No documents found.
                  </td>
                </tr>
              ) : (
                filteredDocs.map(doc => (
                  <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{doc.vehicleName}</div>
                      <div className="text-[10px] font-mono text-slate-400">{doc.regNumber}</div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span>{doc.type}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-800">
                      {doc.documentNumber}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700">
                      {doc.expiryDate}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3 h-3" />
                        {doc.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
