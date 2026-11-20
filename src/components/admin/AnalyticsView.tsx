import React, { useState, useMemo } from 'react';
import type { Order, CafeInfo } from '../../types';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Award, 
  CheckCircle2, 
  Clock, 
  FileSpreadsheet,
  Calendar,
  Search,
  Receipt,
  Utensils,
  ArrowRight
} from 'lucide-react';

interface AnalyticsViewProps {
  orders: Order[];
  cafe: CafeInfo;
}

type FilterPeriod = 'today' | 'yesterday' | 'tomorrow' | 'week' | 'month' | 'custom' | 'all';

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ orders, cafe }) => {
  const [period, setPeriod] = useState<FilterPeriod>('today');
  
  // Format local YYYY-MM-DD
  const formatLocalDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = formatLocalDate(new Date());
  const [customStart, setCustomStart] = useState<string>(todayStr);
  const [customEnd, setCustomEnd] = useState<string>(todayStr);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Calculate Date Boundaries
  const dateRange = useMemo(() => {
    const now = new Date();
    
    if (period === 'today') {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      return { start, end, label: `Today (${now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })})` };
    }

    if (period === 'yesterday') {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      const start = new Date(y.getFullYear(), y.getMonth(), y.getDate(), 0, 0, 0, 0);
      const end = new Date(y.getFullYear(), y.getMonth(), y.getDate(), 23, 59, 59, 999);
      return { start, end, label: `Yesterday (${y.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })})` };
    }

    if (period === 'tomorrow') {
      const t = new Date(now);
      t.setDate(t.getDate() + 1);
      const start = new Date(t.getFullYear(), t.getMonth(), t.getDate(), 0, 0, 0, 0);
      const end = new Date(t.getFullYear(), t.getMonth(), t.getDate(), 23, 59, 59, 999);
      return { start, end, label: `Tomorrow (${t.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })})` };
    }

    if (period === 'week') {
      const w = new Date(now);
      w.setDate(w.getDate() - 6);
      const start = new Date(w.getFullYear(), w.getMonth(), w.getDate(), 0, 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      return { 
        start, 
        end, 
        label: `Last 7 Days (${w.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - ${now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })})` 
      };
    }

    if (period === 'month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      return { 
        start, 
        end, 
        label: `This Month (${now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })})` 
      };
    }

    if (period === 'custom') {
      const startParts = customStart.split('-').map(Number);
      const endParts = customEnd.split('-').map(Number);
      const start = new Date(startParts[0], startParts[1] - 1, startParts[2], 0, 0, 0, 0);
      const end = new Date(endParts[0], endParts[1] - 1, endParts[2], 23, 59, 59, 999);
      return { 
        start, 
        end, 
        label: `${customStart} to ${customEnd}` 
      };
    }

    return { start: null, end: null, label: 'All Time (Complete History)' };
  }, [period, customStart, customEnd]);

  // Filter Orders matching date range
  const filteredOrders = useMemo(() => {
    if (!dateRange.start || !dateRange.end) return orders;

    const startMs = dateRange.start.getTime();
    const endMs = dateRange.end.getTime();

    return orders.filter((order) => {
      const orderMs = new Date(order.createdAt).getTime();
      return orderMs >= startMs && orderMs <= endMs;
    });
  }, [orders, dateRange]);

  // Orders matching text search within the filtered period
  const searchedOrders = useMemo(() => {
    if (!searchQuery.trim()) return filteredOrders;
    const q = searchQuery.toLowerCase().trim();
    return filteredOrders.filter((o) =>
      o.id.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerPhone.includes(q) ||
      (o.paymentId && o.paymentId.toLowerCase().includes(q)) ||
      o.items.some((i) => i.name.toLowerCase().includes(q))
    );
  }, [filteredOrders, searchQuery]);

  // KPI Calculations
  const completedOrders = filteredOrders.filter((o) => o.orderStatus === 'completed');
  const totalRevenue = filteredOrders
    .filter((o) => o.orderStatus !== 'cancelled')
    .reduce((acc, curr) => acc + curr.total, 0);

  const averageOrderValue = filteredOrders.length > 0 ? Math.round(totalRevenue / filteredOrders.length) : 0;

  // Best selling items ranking in this period
  const itemCounts: Record<string, { name: string; count: number; revenue: number; isVeg: boolean }> = {};
  filteredOrders
    .filter((o) => o.orderStatus !== 'cancelled')
    .forEach((order) => {
      order.items.forEach((item) => {
        if (!itemCounts[item.name]) {
          itemCounts[item.name] = { name: item.name, count: 0, revenue: 0, isVeg: item.isVeg };
        }
        itemCounts[item.name].count += item.quantity;
        itemCounts[item.name].revenue += item.price * item.quantity;
      });
    });

  const topItems = Object.values(itemCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Status breakdown in this period
  const statusCounts = {
    received: filteredOrders.filter((o) => o.orderStatus === 'received').length,
    preparing: filteredOrders.filter((o) => o.orderStatus === 'preparing').length,
    ready: filteredOrders.filter((o) => o.orderStatus === 'ready').length,
    completed: completedOrders.length,
    cancelled: filteredOrders.filter((o) => o.orderStatus === 'cancelled').length,
  };

  // Export Filtered Orders to CSV
  const handleExportCSV = () => {
    const headers = [
      'Order ID',
      'Date',
      'Time',
      'Order Type',
      'Customer Name',
      'Customer Phone',
      'Items',
      'Subtotal',
      'Tax',
      'Total (INR)',
      'Payment Ref',
      'Status'
    ];

    const rows = filteredOrders.map((o) => [
      o.id,
      new Date(o.createdAt).toLocaleDateString(),
      new Date(o.createdAt).toLocaleTimeString(),
      o.diningOption === 'parcel' || String(o.tableNumber).toLowerCase().includes('parcel')
        ? 'Parcel (Takeaway)'
        : (o.tableNumber ? String(o.tableNumber) : 'Eat Now (Dine-in)'),
      `"${o.customerName}"`,
      `'${o.customerPhone}`,
      `"${o.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}"`,
      o.subtotal,
      o.tax,
      o.total,
      o.paymentId || 'N/A',
      o.orderStatus.toUpperCase(),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanPeriod = period === 'custom' ? `${customStart}_to_${customEnd}` : period;
    link.setAttribute('download', `cafeqr_orders_${cleanPeriod}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Export */}
      <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span>Sales & Revenue Analytics</span>
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Real-time financial revenue, date filters, and order audit reports for {cafe.name}.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-all active:scale-[0.98] cursor-pointer"
          title="Export currently filtered orders to CSV"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Export {filteredOrders.length} Orders to Excel/CSV</span>
        </button>
      </div>

      {/* Date Filter Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-700" />
            <span className="text-xs font-extrabold text-stone-900 uppercase tracking-wider">
              Filter by Date:
            </span>
          </div>

          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full w-fit">
            📅 Active Range: {dateRange.label}
          </span>
        </div>

        {/* Quick Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
          {[
            { id: 'today', label: 'Today' },
            { id: 'yesterday', label: 'Yesterday' },
            { id: 'tomorrow', label: 'Tomorrow' },
            { id: 'week', label: 'Last 7 Days' },
            { id: 'month', label: 'This Month' },
            { id: 'custom', label: 'Custom Range 📅' },
            { id: 'all', label: 'All Time' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setPeriod(tab.id as FilterPeriod)}
              className={`py-2 px-3.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                period === tab.id
                  ? 'bg-stone-900 text-white shadow-xs scale-[1.02]'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80 hover:text-stone-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Custom Date Range Picker (Visible when "custom" is selected) */}
        {period === 'custom' && (
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex flex-wrap items-center gap-4 animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-stone-600">From Date:</label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="py-1.5 px-3 bg-white rounded-xl border border-stone-300 text-xs font-bold text-stone-800 outline-none focus:border-amber-600 shadow-2xs"
              />
            </div>

            <ArrowRight className="w-4 h-4 text-stone-400 hidden sm:block" />

            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-stone-600">To Date:</label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="py-1.5 px-3 bg-white rounded-xl border border-stone-300 text-xs font-bold text-stone-800 outline-none focus:border-amber-600 shadow-2xs"
              />
            </div>

            <span className="text-[11px] text-stone-400">
              *Dates are filtered inclusive of both start and end days
            </span>
          </div>
        )}
      </div>

      {/* KPI Stats Cards for Selected Date Range */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Period Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-stone-900">₹{totalRevenue.toLocaleString()}</p>
          <p className="text-[10px] text-emerald-700 font-semibold">From {filteredOrders.length} orders in range</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Orders Count</span>
            <ShoppingBag className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-stone-900">{filteredOrders.length}</p>
          <p className="text-[10px] text-stone-500 font-semibold">{completedOrders.length} fulfilled & served</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Avg Order Value</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-stone-900">₹{averageOrderValue}</p>
          <p className="text-[10px] text-stone-500 font-semibold">Per order average</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active in Kitchen</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-900">
            {statusCounts.received + statusCounts.preparing}
          </p>
          <p className="text-[10px] text-stone-500 font-semibold">
            {statusCounts.ready} ready to be served
          </p>
        </div>
      </div>

      {/* Two Columns: Top Selling Dishes & Pipeline Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Selling Dishes for Selected Date Range */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-stone-900 text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-600" />
              <span>Top-Selling Menu Items ({period === 'all' ? 'All Time' : 'This Period'})</span>
            </h4>
            <span className="text-[11px] text-stone-400 font-medium">By units sold</span>
          </div>

          {topItems.length === 0 ? (
            <div className="text-center py-8 text-stone-400 space-y-1 border border-dashed border-stone-200 rounded-2xl">
              <Utensils className="w-6 h-6 mx-auto text-stone-300" />
              <p className="text-xs font-bold text-stone-600">No dishes sold in this date range</p>
              <p className="text-[11px] text-stone-400">Try selecting a wider date range above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topItems.map((item, idx) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-100"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 font-black text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-bold text-stone-900 text-xs sm:text-sm">{item.name}</p>
                      <p className="text-[11px] text-stone-400 font-medium">
                        {item.count} order{item.count === 1 ? '' : 's'} placed
                      </p>
                    </div>
                  </div>

                  <span className="font-mono font-bold text-stone-800 text-xs">
                    ₹{item.revenue.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Status Breakdown for Selected Date Range */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <h4 className="font-extrabold text-stone-900 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Order Pipeline Breakdown ({filteredOrders.length} Total)</span>
          </h4>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-100">
              <span className="font-semibold text-stone-700">Orders Received (Pending)</span>
              <span className="font-bold px-2 py-0.5 rounded-md bg-stone-200 text-stone-800">
                {statusCounts.received}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50 border border-amber-100">
              <span className="font-semibold text-amber-900">Preparing in Kitchen</span>
              <span className="font-bold px-2 py-0.5 rounded-md bg-amber-200 text-amber-950">
                {statusCounts.preparing}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50 border border-blue-100">
              <span className="font-semibold text-blue-900">Ready to Serve at Counter</span>
              <span className="font-bold px-2 py-0.5 rounded-md bg-blue-200 text-blue-950">
                {statusCounts.ready}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
              <span className="font-semibold text-emerald-900">Completed & Paid</span>
              <span className="font-bold px-2 py-0.5 rounded-md bg-emerald-200 text-emerald-950">
                {statusCounts.completed}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-red-50 border border-red-100">
              <span className="font-semibold text-red-900">Cancelled / Rejected</span>
              <span className="font-bold px-2 py-0.5 rounded-md bg-red-200 text-red-950">
                {statusCounts.cancelled}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Audit List in this Selected Period */}
      <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-extrabold text-stone-900 text-sm flex items-center gap-2">
              <Receipt className="w-4 h-4 text-stone-700" />
              <span>Orders in Selected Period ({searchedOrders.length})</span>
            </h4>
            <p className="text-xs text-stone-400 mt-0.5">
              Detailed list of all customer orders within {dateRange.label}
            </p>
          </div>

          {/* Quick Search in Period */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ID, customer, item..."
              className="w-full pl-9 pr-3 py-1.5 bg-stone-50 rounded-xl border border-stone-200 text-xs font-medium text-stone-800 placeholder-stone-400 outline-none focus:border-amber-600 focus:bg-white transition-all"
            />
          </div>
        </div>

        {searchedOrders.length === 0 ? (
          <div className="text-center py-10 text-stone-400 space-y-1 border border-dashed border-stone-200 rounded-2xl">
            <ShoppingBag className="w-7 h-7 mx-auto text-stone-300" />
            <p className="text-xs font-bold text-stone-600">No orders found for this period</p>
            <p className="text-[11px] text-stone-400">Try choosing a different date range or clearing your search.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 font-bold uppercase text-[10px] tracking-wider border-y border-stone-200">
                <tr>
                  <th className="py-2.5 px-3">Order ID</th>
                  <th className="py-2.5 px-3">Date & Time</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Dining</th>
                  <th className="py-2.5 px-3">Items</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {searchedOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-amber-900">
                      {ord.id}
                    </td>
                    <td className="py-2.5 px-3 text-stone-500 whitespace-nowrap">
                      {new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • {new Date(ord.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-stone-800">
                      <div>{ord.customerName}</div>
                      <div className="text-[10px] text-stone-400 font-mono">{ord.customerPhone}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ord.diningOption === 'parcel' || String(ord.tableNumber).toLowerCase().includes('parcel')
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-emerald-100 text-emerald-900'
                      }`}>
                        {ord.diningOption === 'parcel' || String(ord.tableNumber).toLowerCase().includes('parcel')
                          ? '🛍️ Parcel'
                          : `🍽️ Table ${ord.tableNumber || 1}`}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-stone-600 max-w-xs truncate">
                      {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ord.orderStatus === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.orderStatus === 'ready'
                          ? 'bg-blue-100 text-blue-800'
                          : ord.orderStatus === 'preparing'
                          ? 'bg-amber-100 text-amber-800'
                          : ord.orderStatus === 'cancelled'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-stone-200 text-stone-800'
                      }`}>
                        {ord.orderStatus.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-black text-stone-900">
                      ₹{ord.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
