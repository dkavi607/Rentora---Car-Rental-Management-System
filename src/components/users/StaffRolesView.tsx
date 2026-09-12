import React, { useState } from 'react';
import { useRentora } from '../../context/RentoraContext';
import { User, UserRole } from '../../types';
import { 
  ShieldCheck, 
  UserPlus, 
  Users, 
  Mail, 
  Key, 
  Check, 
  X, 
  Edit, 
  Trash2,
  Lock,
  Building
} from 'lucide-react';

export const StaffRolesView: React.FC = () => {
  const { users, currentRole, branches } = useRentora();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');

  const filteredUsers = users.filter(u => {
    if (selectedRole !== 'all' && u.role !== selectedRole) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q);
    }
    return true;
  });

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'Super Admin':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Admin':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Rental Manager':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Accountant':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Maintenance Manager':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const rolePermissionsMatrix = [
    { module: 'Fleet & Vehicle Registry', super: true, admin: true, manager: true, staff: true, accountant: false, maint: true },
    { module: 'Booking Engine & Handover', super: true, admin: true, manager: true, staff: true, accountant: false, maint: false },
    { module: 'Invoicing, Billing & Refunds', super: true, admin: true, manager: false, staff: false, accountant: true, maint: false },
    { module: 'Workshop & Maintenance Logs', super: true, admin: true, manager: false, staff: false, accountant: false, maint: true },
    { module: 'Business Intelligence & Reports', super: true, admin: true, manager: true, staff: false, accountant: true, maint: false },
    { module: 'Enterprise System Configuration', super: true, admin: true, manager: false, staff: false, accountant: false, maint: false },
  ];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-display flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
            Staff Users & Role-Based Access Control (RBAC)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage system operators, dispatchers, accountants, and granular module permissions.
          </p>
        </div>
      </div>

      {/* Staff User Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 font-bold text-slate-900 flex justify-between items-center text-xs">
          <span>Active Staff Operators ({filteredUsers.length})</span>
          <span className="text-slate-500 font-normal">Switch active role anytime from top navigation</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Staff Profile</th>
                <th className="px-4 py-3">Email Address</th>
                <th className="px-4 py-3">Assigned Role</th>
                <th className="px-4 py-3">Assigned Branch Hub</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map(user => {
                const branch = branches.find(b => b.id === user.branchId);

                return (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80'}
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        <div className="font-bold text-slate-900">{user.name}</div>
                      </div>
                    </td>

                    <td className="px-4 py-3 font-medium text-slate-700">
                      {user.email}
                    </td>

                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wide ${getRoleBadge(user.role)}`}>
                        {user.role}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-slate-700 font-medium">
                      {branch?.name || 'Central Colombo Hub'}
                    </td>

                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Active
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* RBAC Permission Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 font-bold text-slate-900 text-xs">
          Granular Permission Matrix by Role
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200 text-[10px]">
              <tr>
                <th className="px-4 py-3">System Module</th>
                <th className="px-4 py-3 text-center">Super Admin</th>
                <th className="px-4 py-3 text-center">Admin</th>
                <th className="px-4 py-3 text-center">Rental Mgr</th>
                <th className="px-4 py-3 text-center">Staff</th>
                <th className="px-4 py-3 text-center">Accountant</th>
                <th className="px-4 py-3 text-center">Maint Mgr</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rolePermissionsMatrix.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-bold text-slate-800">{item.module}</td>
                  <td className="px-4 py-3 text-center text-emerald-600 font-bold">{item.super ? '✓' : '—'}</td>
                  <td className="px-4 py-3 text-center text-emerald-600 font-bold">{item.admin ? '✓' : '—'}</td>
                  <td className="px-4 py-3 text-center font-bold">{item.manager ? <span className="text-emerald-600">✓</span> : <span className="text-slate-300">—</span>}</td>
                  <td className="px-4 py-3 text-center font-bold">{item.staff ? <span className="text-emerald-600">✓</span> : <span className="text-slate-300">—</span>}</td>
                  <td className="px-4 py-3 text-center font-bold">{item.accountant ? <span className="text-emerald-600">✓</span> : <span className="text-slate-300">—</span>}</td>
                  <td className="px-4 py-3 text-center font-bold">{item.maint ? <span className="text-emerald-600">✓</span> : <span className="text-slate-300">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
