import React, { useState } from 'react';
import { useRentora } from '../../context/RentoraContext';
import { Invoice, Payment } from '../../types';
import { 
  Receipt, 
  Search, 
  DollarSign, 
  CreditCard, 
  FileText, 
  Printer, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Download
} from 'lucide-react';

export const InvoicesPaymentsView: React.FC = () => {
  const { invoices, payments, customers, formatCurrency, settings } = useRentora();

  const [activeTab, setActiveTab] = useState<'invoices' | 'payments'>('invoices');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Financial KPIs
  const totalBilled = invoices.reduce((sum, inv) => sum + (inv.subtotal + inv.taxAmount - inv.discountAmount), 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const totalOutstanding = invoices.reduce((sum, inv) => sum + inv.balanceDue, 0);
  const totalTax = invoices.reduce((sum, inv) => sum + inv.taxAmount, 0);

  // Filter invoices
  const filteredInvoices = invoices.filter(inv => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    const cust = customers.find(c => c.id === inv.customerId);
    const matchCust = cust ? `${cust.firstName} ${cust.lastName}`.toLowerCase().includes(q) : false;
    return inv.invoiceNumber.toLowerCase().includes(q) || matchCust;
  });

  // Filter payments
  const filteredPayments = payments.filter(p => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    const cust = customers.find(c => c.id === p.customerId);
    const matchCust = cust ? `${cust.firstName} ${cust.lastName}`.toLowerCase().includes(q) : false;
    return p.paymentRef.toLowerCase().includes(q) || p.referenceNumber.toLowerCase().includes(q) || matchCust || p.paymentMethod.toLowerCase().includes(q);
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-display flex items-center gap-2.5">
            <Receipt className="w-6 h-6 text-blue-600" />
            Financial Billing & Transactions Ledger
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Automated tax invoices, payment receipts, refundable deposit records, and accounts receivable.
          </p>
        </div>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Billed Invoices</span>
          <div className="text-2xl font-black text-slate-900">{formatCurrency(totalBilled)}</div>
          <span className="text-[11px] text-slate-500">{invoices.length} Invoices Issued</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Total Collections Paid</span>
          <div className="text-2xl font-black text-emerald-700">{formatCurrency(totalPaid)}</div>
          <span className="text-[11px] text-emerald-600 font-semibold">{payments.length} Processed Transactions</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Outstanding Receivables</span>
          <div className="text-2xl font-black text-amber-700">{formatCurrency(totalOutstanding)}</div>
          <span className="text-[11px] text-slate-500">Unsettled Balances</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">VAT & Taxes Provision</span>
          <div className="text-2xl font-black text-blue-700">{formatCurrency(totalTax)}</div>
          <span className="text-[11px] text-slate-500">Government Tax Accrual</span>
        </div>
      </div>

      {/* Switcher & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('invoices')}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'invoices' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Invoices ({invoices.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('payments')}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'payments' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Payment Transactions ({payments.length})
          </button>
        </div>

        <div className="w-full sm:w-80 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by invoice #, txn ID, customer..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* TAB 1: INVOICES TABLE */}
      {activeTab === 'invoices' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Invoice #</th>
                  <th className="px-4 py-3">Customer Client</th>
                  <th className="px-4 py-3">Issue Date / Due</th>
                  <th className="px-4 py-3">Subtotal</th>
                  <th className="px-4 py-3">Tax Amount</th>
                  <th className="px-4 py-3">Total Due</th>
                  <th className="px-4 py-3">Payment Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map(inv => {
                  const cust = customers.find(c => c.id === inv.customerId);
                  const grandTotal = inv.subtotal + inv.taxAmount - inv.discountAmount;

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">{inv.invoiceNumber}</td>
                      <td className="px-4 py-3 font-bold text-slate-800">{cust?.firstName} {cust?.lastName}</td>
                      <td className="px-4 py-3 text-slate-500">{inv.issueDate}</td>
                      <td className="px-4 py-3 text-slate-700">{formatCurrency(inv.subtotal)}</td>
                      <td className="px-4 py-3 text-slate-700">{formatCurrency(inv.taxAmount)}</td>
                      <td className="px-4 py-3 font-black text-slate-900">{formatCurrency(grandTotal)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedInvoice(inv)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-[11px] inline-flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-600" />
                          <span>View Invoice</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PAYMENTS TABLE */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Payment Ref</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Payment Method</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.map(p => {
                  const cust = customers.find(c => c.id === p.customerId);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">{p.paymentRef}</td>
                      <td className="px-4 py-3 font-bold text-slate-800">{cust?.firstName} {cust?.lastName}</td>
                      <td className="px-4 py-3 font-semibold text-slate-700">{p.paymentMethod}</td>
                      <td className="px-4 py-3 text-slate-600">{p.paymentType}</td>
                      <td className="px-4 py-3 text-slate-500">{p.paymentDate}</td>
                      <td className="px-4 py-3 font-black text-emerald-700">{formatCurrency(p.amount)}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Printable Invoice Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] text-xs">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between no-print">
              <span className="font-bold">Official Tax Invoice #{selectedInvoice.invoiceNumber}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-3 py-1 bg-blue-600 text-white font-bold rounded-lg flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-8 space-y-6 overflow-y-auto flex-1 printable-area">
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 font-display">{settings.business.companyName}</h2>
                  <p className="text-slate-500">{settings.business.address}</p>
                  <p className="text-slate-500">Tax ID: {settings.business.taxNumber}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-blue-600 font-mono">{selectedInvoice.invoiceNumber}</div>
                  <div className="text-slate-500">Date: {selectedInvoice.issueDate}</div>
                  <div className="font-bold text-slate-800">Status: {selectedInvoice.status}</div>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 font-bold">
                  <tr>
                    <th className="p-2.5">Item Description</th>
                    <th className="p-2.5 text-center">Qty</th>
                    <th className="p-2.5 text-right">Unit Price</th>
                    <th className="p-2.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedInvoice.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5 font-medium text-slate-800">{item.description}</td>
                      <td className="p-2.5 text-center font-bold">{item.quantity}</td>
                      <td className="p-2.5 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="p-2.5 text-right font-bold text-slate-900">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={3} className="p-2.5 text-right text-slate-500">Subtotal:</td>
                    <td className="p-2.5 text-right font-bold">{formatCurrency(selectedInvoice.subtotal)}</td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="p-2.5 text-right text-slate-500">VAT ({selectedInvoice.taxRate}%):</td>
                    <td className="p-2.5 text-right font-bold">{formatCurrency(selectedInvoice.taxAmount)}</td>
                  </tr>
                  <tr className="bg-blue-50/50 font-black text-sm text-slate-900">
                    <td colSpan={3} className="p-2.5 text-right">Total Invoice:</td>
                    <td className="p-2.5 text-right text-blue-700">{formatCurrency(selectedInvoice.subtotal + selectedInvoice.taxAmount - selectedInvoice.discountAmount)}</td>
                  </tr>
                  <tr className="text-emerald-700 font-bold">
                    <td colSpan={3} className="p-2.5 text-right">Amount Paid:</td>
                    <td className="p-2.5 text-right">{formatCurrency(selectedInvoice.paidAmount)}</td>
                  </tr>
                  <tr className="text-slate-700 font-bold">
                    <td colSpan={3} className="p-2.5 text-right">Balance Due:</td>
                    <td className="p-2.5 text-right">{formatCurrency(selectedInvoice.balanceDue)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
