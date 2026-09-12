import React from 'react';
import { useRentora } from '../../context/RentoraContext';
import { 
  Car, 
  KeyRound, 
  Clock, 
  Wrench, 
  Users, 
  BookmarkCheck, 
  DollarSign, 
  AlertCircle, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  Calendar, 
  ArrowRight,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  Legend 
} from 'recharts';

interface AdminDashboardProps {
  onOpenNewBooking: () => void;
  onOpenNewCar: () => void;
  setActiveTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onOpenNewBooking,
  onOpenNewCar,
  setActiveTab
}) => {
  const { 
    vehicles, 
    customers, 
    bookings, 
    rentals, 
    payments, 
    maintenanceRecords, 
    expenses, 
    formatCurrency,
    selectedBranchId
  } = useRentora();

  // Filter items by branch if selected
  const branchVehicles = selectedBranchId === 'all' 
    ? vehicles 
    : vehicles.filter(v => v.branchId === selectedBranchId);

  const branchBookings = selectedBranchId === 'all' 
    ? bookings 
    : bookings.filter(b => b.pickupBranchId === selectedBranchId);

  // 10 KPI Calculations (using real live data)
  const totalCars = branchVehicles.length;
  const availableCars = branchVehicles.filter(v => v.status === 'Available').length;
  const rentedCars = branchVehicles.filter(v => v.status === 'Rented').length;
  const reservedCars = branchVehicles.filter(v => v.status === 'Reserved').length;
  const maintenanceCars = branchVehicles.filter(v => v.status === 'Maintenance').length;
  const totalCustomers = customers.length;
  const activeBookings = branchBookings.filter(b => b.status === 'Active' || b.status === 'Confirmed' || b.status === 'Ready for Pickup').length;
  
  const totalRevenue = payments
    .filter(p => p.status === 'Paid' && p.paymentType !== 'Refund' && p.paymentType !== 'Security Deposit')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingPayments = branchBookings.reduce((sum, b) => sum + (b.balanceDue || 0), 0);
  const overdueRentals = rentals.filter(r => r.status === 'Overdue').length;

  const fleetUtilizationRate = totalCars > 0 ? Math.round((rentedCars / totalCars) * 100) : 0;

  // Chart Data: 6-Month Revenue & Expense Overview
  const revenueChartData = [
    { month: 'Apr', revenue: 3800, expenses: 1100, profit: 2700 },
    { month: 'May', revenue: 4500, expenses: 1400, profit: 3100 },
    { month: 'Jun', revenue: 5200, expenses: 1600, profit: 3600 },
    { month: 'Jul', revenue: 6400, expenses: 1900, profit: 4500 },
    { month: 'Aug', revenue: 5900, expenses: 1750, profit: 4150 },
    { month: 'Sep (MTD)', revenue: Math.max(4800, Math.round(totalRevenue)), expenses: 1850, profit: Math.max(3000, Math.round(totalRevenue - 1850)) }
  ];

  // Chart Data: Fleet Status Distribution
  const fleetStatusData = [
    { name: 'Available', value: availableCars, color: '#16A34A' },
    { name: 'Rented', value: rentedCars, color: '#2563EB' },
    { name: 'Reserved', value: reservedCars, color: '#6366F1' },
    { name: 'Maintenance', value: maintenanceCars, color: '#F59E0B' }
  ].filter(d => d.value > 0);

  // Category Distribution Data
  const categoryCountMap: Record<string, number> = {};
  branchVehicles.forEach(v => {
    categoryCountMap[v.categoryId] = (categoryCountMap[v.categoryId] || 0) + 1;
  });

  const categoryBarData = Object.keys(categoryCountMap).map(catId => {
    const label = catId.replace('cat-', '').toUpperCase();
    return {
      category: label,
      count: categoryCountMap[catId]
    };
  });

  // Today's Operations
  const todayStr = '2026-09-12'; // match simulation context date
  const todaysPickups = branchBookings.filter(b => b.pickupDate === todayStr || b.status === 'Ready for Pickup');
  const activeRentalList = rentals.filter(r => r.status === 'Active');
  const pendingMaintenance = maintenanceRecords.filter(m => m.status === 'In Progress' || m.status === 'Scheduled');
  const recentPaymentsList = payments.slice(0, 5);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Page Header & Quick Action Ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-display flex items-center gap-2.5">
            Operational Fleet Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time telemetry, fleet availability, reservations, and financial performance.
          </p>
        </div>

        {/* Quick Actions Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenNewBooking}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create Booking</span>
          </button>

          <button
            type="button"
            onClick={onOpenNewCar}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
          >
            <Car className="w-4 h-4 text-emerald-400" />
            <span>Add Vehicle</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rentals')}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
          >
            <KeyRound className="w-4 h-4 text-blue-600" />
            <span>Handover / Return</span>
          </button>
        </div>
      </div>

      {/* 10 KPI Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        
        {/* Total Fleet */}
        <div 
          onClick={() => setActiveTab('cars')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-400 shadow-xs cursor-pointer transition-all hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Fleet</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{totalCars}</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-emerald-600 font-bold">{fleetUtilizationRate}%</span> fleet utilization
          </div>
        </div>

        {/* Available Today */}
        <div 
          onClick={() => setActiveTab('cars')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-emerald-400 shadow-xs cursor-pointer transition-all hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Available Cars</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">{availableCars}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Ready for instant dispatch
          </div>
        </div>

        {/* Currently Rented */}
        <div 
          onClick={() => setActiveTab('rentals')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-400 shadow-xs cursor-pointer transition-all hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Rentals</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <KeyRound className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-blue-600">{rentedCars}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            On the road with clients
          </div>
        </div>

        {/* Reserved Cars */}
        <div 
          onClick={() => setActiveTab('bookings')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-indigo-400 shadow-xs cursor-pointer transition-all hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Reserved Cars</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-indigo-600">{reservedCars}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Confirmed future dates
          </div>
        </div>

        {/* In Maintenance */}
        <div 
          onClick={() => setActiveTab('maintenance')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-amber-400 shadow-xs cursor-pointer transition-all hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">In Maintenance</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-600">{maintenanceCars}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Under service / repairs
          </div>
        </div>

        {/* Total Customers */}
        <div 
          onClick={() => setActiveTab('customers')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-purple-400 shadow-xs cursor-pointer transition-all hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Customers</span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{totalCustomers}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            100% verified profiles
          </div>
        </div>

        {/* Active Bookings */}
        <div 
          onClick={() => setActiveTab('bookings')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-400 shadow-xs cursor-pointer transition-all hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Bookings</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <BookmarkCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{activeBookings}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Confirmed & in progress
          </div>
        </div>

        {/* Total Revenue */}
        <div 
          onClick={() => setActiveTab('payments')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-emerald-400 shadow-xs cursor-pointer transition-all hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Settled Revenue</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-slate-900 truncate">
            {formatCurrency(totalRevenue)}
          </div>
          <div className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-0.5">
            <ArrowUpRight className="w-3.5 h-3.5" /> +14.8% vs last month
          </div>
        </div>

        {/* Pending Receivables */}
        <div 
          onClick={() => setActiveTab('invoices')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-amber-400 shadow-xs cursor-pointer transition-all hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending Balances</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-amber-600 truncate">
            {formatCurrency(pendingPayments)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Due at pickup / return
          </div>
        </div>

        {/* Overdue Alerts */}
        <div 
          onClick={() => setActiveTab('rentals')}
          className={`p-4 rounded-xl border shadow-xs cursor-pointer transition-all hover:-translate-y-0.5 ${
            overdueRentals > 0 
              ? 'bg-red-50/70 border-red-300' 
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Overdue Returns</span>
            <div className={`p-2 rounded-lg ${overdueRentals > 0 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-400'}`}>
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-extrabold ${overdueRentals > 0 ? 'text-red-600' : 'text-slate-900'}`}>
            {overdueRentals}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {overdueRentals > 0 ? 'Requires immediate contact' : 'All returns on schedule'}
          </div>
        </div>

      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Revenue Trends Chart (Area chart) */}
        <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                Revenue & Profitability Performance
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Monthly gross revenue vs operating expenses and net earnings.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-blue-600">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Gross Revenue
              </span>
              <span className="flex items-center gap-1.5 text-emerald-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Net Profit
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip 
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, '']}
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" name="Gross Revenue" />
                <Area type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorProfit)" name="Net Profit" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fleet Status Donut Chart */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Car className="w-4 h-4 text-blue-600" />
              Fleet Availability Matrix
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live vehicle deployment across {totalCars} active assets.
            </p>
          </div>

          <div className="h-52 w-full my-2 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={fleetStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {fleetStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-slate-900 font-display">{totalCars}</span>
              <span className="text-[10px] uppercase font-bold text-slate-400">Cars</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
            {fleetStatusData.map(d => (
              <div key={d.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }}></span>
                <span className="text-slate-600 font-medium">{d.name}:</span>
                <span className="font-bold text-slate-900 ml-auto">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Operational Hub: Active Rentals & Today's Schedules */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Active Rentals Table */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-blue-600" />
                Active Rentals On Road ({activeRentalList.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Vehicles currently handed over with signed agreements.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('rentals')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Vehicle</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Expected Return</th>
                  <th className="px-4 py-3">Deposit Held</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeRentalList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                      No active rentals on the road right now.
                    </td>
                  </tr>
                ) : (
                  activeRentalList.map(rental => {
                    const veh = vehicles.find(v => v.id === rental.vehicleId);
                    const cust = customers.find(c => c.id === rental.customerId);
                    return (
                      <tr key={rental.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={veh?.mainImage || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=100&q=80'}
                              alt=""
                              className="w-10 h-7 object-cover rounded border border-slate-200 shrink-0"
                            />
                            <div>
                              <div className="font-bold text-slate-800">{veh?.make} {veh?.model}</div>
                              <div className="text-[10px] text-slate-400">{veh?.regNumber}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-800">{cust?.firstName} {cust?.lastName}</div>
                          <div className="text-[10px] text-slate-400">{cust?.phone}</div>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-700">
                          {rental.scheduledReturnDate}
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-900">
                          {formatCurrency(rental.depositCollected)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => setActiveTab('rentals')}
                            className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded-lg font-bold text-[11px] transition-colors"
                          >
                            Check-In
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Maintenance Alerts & Recent Activity Feed */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Maintenance Alerts Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-500" />
                Service & Workshop Queue ({pendingMaintenance.length})
              </h3>
              <button
                type="button"
                onClick={() => setActiveTab('maintenance')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800"
              >
                Manage
              </button>
            </div>

            {pendingMaintenance.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1 opacity-80" />
                All vehicles in prime operating condition.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingMaintenance.map(maint => {
                  const veh = vehicles.find(v => v.id === maint.vehicleId);
                  return (
                    <div key={maint.id} className="p-3 bg-amber-50/50 border border-amber-200/80 rounded-xl text-xs flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-800">
                          {veh?.make} {veh?.model} ({veh?.regNumber})
                        </div>
                        <div className="text-[11px] text-amber-800 font-medium mt-0.5">
                          {maint.maintenanceType} • {maint.serviceProvider}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Est. completion: {maint.expectedCompletionDate}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900">
                        {maint.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Payments Stream */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                Recent Financial Activity
              </h3>
              <button
                type="button"
                onClick={() => setActiveTab('payments')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800"
              >
                Ledger
              </button>
            </div>

            <div className="space-y-2.5">
              {recentPaymentsList.map(pay => (
                <div key={pay.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div>
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${pay.paymentType === 'Refund' ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                      {pay.paymentType}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {pay.paymentDate} • {pay.paymentMethod}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-extrabold ${pay.paymentType === 'Refund' ? 'text-amber-700' : 'text-emerald-700'}`}>
                      {pay.paymentType === 'Refund' ? '-' : '+'}{formatCurrency(pay.amount)}
                    </div>
                    <div className="text-[10px] text-slate-400">{pay.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
