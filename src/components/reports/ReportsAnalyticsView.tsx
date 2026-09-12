import React, { useState } from 'react';
import { useRentora } from '../../context/RentoraContext';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Car, 
  Download, 
  Calendar, 
  PieChart as PieIcon, 
  Layers, 
  ArrowUpRight,
  ShieldCheck,
  Building
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';

export const ReportsAnalyticsView: React.FC = () => {
  const { vehicles, bookings, rentals, invoices, payments, maintenanceRecords, categories, branches, formatCurrency } = useRentora();

  const [dateRange, setDateRange] = useState('This Month (Sep 2026)');

  // Revenue analytics computation
  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalMaintenanceCost = maintenanceRecords.reduce((sum, m) => sum + m.cost, 0);
  const netProfit = totalRevenue - totalMaintenanceCost;
  const avgRentalValue = bookings.length > 0 ? totalRevenue / bookings.length : 0;

  // Category distribution
  const categoryData = categories.map(cat => {
    const count = vehicles.filter(v => v.categoryId === cat.id).length;
    return { name: cat.name, count, value: count };
  });

  const COLORS = ['#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#10B981', '#F59E0B'];

  // Monthly Revenue Trend
  const monthlyRevenueData = [
    { month: 'Apr', revenue: 4200, expenses: 650, profit: 3550 },
    { month: 'May', revenue: 5800, expenses: 800, profit: 5000 },
    { month: 'Jun', revenue: 7200, expenses: 920, profit: 6280 },
    { month: 'Jul', revenue: 8900, expenses: 1100, profit: 7800 },
    { month: 'Aug', revenue: 11200, expenses: 1450, profit: 9750 },
    { month: 'Sep (MTD)', revenue: totalRevenue, expenses: totalMaintenanceCost, profit: netProfit },
  ];

  // Revenue by Vehicle
  const vehiclePerformance = vehicles.map(v => {
    const vehBookings = bookings.filter(b => b.vehicleId === v.id);
    const revenue = vehBookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const rentalDays = vehBookings.reduce((sum, b) => sum + b.durationDays, 0);
    return {
      id: v.id,
      name: `${v.make} ${v.model}`,
      reg: v.regNumber,
      revenue,
      rentalDays,
      utilization: Math.min(100, Math.round((rentalDays / 30) * 100))
    };
  }).sort((a, b) => b.revenue - a.revenue);

  const handleExportCSV = () => {
    const headers = ['Vehicle,Plate,Rental Days,Utilization %,Revenue ($)'];
    const rows = vehiclePerformance.map(v => `"${v.name}","${v.reg}",${v.rentalDays},${v.utilization}%,${v.revenue}`);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rentora_fleet_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-display flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            Executive Business Intelligence & Financial Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Fleet utilization rates, gross margins, vehicle ROI rankings, and cash-flow reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={dateRange}
            onChange={e => setDateRange(e.target.value)}
            className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
          >
            <option>This Month (Sep 2026)</option>
            <option>Last 3 Months (Q3 2026)</option>
            <option>Year to Date (2026)</option>
          </select>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Top High-Level Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Gross Revenue</span>
          <div className="text-2xl font-black text-slate-900">{formatCurrency(totalRevenue)}</div>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> +24% vs last period
          </span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Net Fleet Operating Profit</span>
          <div className="text-2xl font-black text-emerald-700">{formatCurrency(netProfit)}</div>
          <span className="text-[11px] text-slate-500">Margin: {Math.round((netProfit / (totalRevenue || 1)) * 100)}%</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Average Booking Value</span>
          <div className="text-2xl font-black text-blue-700">{formatCurrency(avgRentalValue)}</div>
          <span className="text-[11px] text-slate-500">Across {bookings.length} reservations</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Fleet Maintenance Expenses</span>
          <div className="text-2xl font-black text-amber-700">{formatCurrency(totalMaintenanceCost)}</div>
          <span className="text-[11px] text-slate-500">{maintenanceRecords.length} service logs</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Monthly Revenue vs Expenses Trend (2 Columns) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Monthly Revenue & Profit Progression</h3>
              <p className="text-xs text-slate-500">Income vs workshop maintenance expenses</p>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">2026 Fiscal</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  formatter={(val: any) => formatCurrency(Number(val))}
                  contentStyle={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: '12px', fontSize: '11px', border: 'none' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="revenue" name="Gross Revenue" fill="#2563EB" radius={[6, 6, 0, 0]} />
                <Bar dataKey="profit" name="Net Profit" fill="#10B981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#F59E0B" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fleet Composition Breakdown (1 Column) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Fleet Category Allocation</h3>
            <p className="text-xs text-slate-500">Distribution of {vehicles.length} vehicles</p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: '8px', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Vehicle ROI Performance Ranking */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 font-bold text-slate-900 flex justify-between items-center">
          <span>Individual Vehicle ROI & Utilization Rankings</span>
          <span className="text-xs font-normal text-slate-500">Sorted by Total Generated Revenue</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">License Plate</th>
                <th className="px-4 py-3">Days Rented</th>
                <th className="px-4 py-3">Monthly Utilization</th>
                <th className="px-4 py-3 text-right">Revenue Generated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vehiclePerformance.map((v, idx) => (
                <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-bold text-slate-400">#{idx + 1}</td>
                  <td className="px-4 py-3 font-bold text-slate-900">{v.name}</td>
                  <td className="px-4 py-3 font-mono text-slate-600">{v.reg}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{v.rentalDays} Days</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full"
                          style={{ width: `${v.utilization}%` }}
                        />
                      </div>
                      <span className="font-bold text-[10px] text-slate-700">{v.utilization}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-black text-emerald-700 text-sm">
                    {formatCurrency(v.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
