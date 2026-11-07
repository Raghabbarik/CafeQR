import React from 'react';
import type { Order, CafeInfo } from '../../types';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Award, 
  CheckCircle2, 
  Clock, 
  FileSpreadsheet
} from 'lucide-react';

interface AnalyticsViewProps {
  orders: Order[];
  cafe: CafeInfo;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ orders, cafe }) => {
  // Calculations
  const completedOrders = orders.filter((o) => o.orderStatus === 'completed');
  const totalRevenue = orders
    .filter((o) => o.orderStatus !== 'cancelled')
    .reduce((acc, curr) => acc + curr.total, 0);

  const averageOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;

  // Best selling items ranking
  const itemCounts: Record<string, { name: string; count: number; revenue: number; isVeg: boolean }> = {};
  orders
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

  // Status breakdown
  const statusCounts = {
    received: orders.filter((o) => o.orderStatus === 'received').length,
    preparing: orders.filter((o) => o.orderStatus === 'preparing').length,
    ready: orders.filter((o) => o.orderStatus === 'ready').length,
    completed: completedOrders.length,
    cancelled: orders.filter((o) => o.orderStatus === 'cancelled').length,
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Order ID', 'Date', 'Time', 'Table', 'Customer Name', 'Customer Phone', 'Items', 'Subtotal', 'Tax', 'Total (INR)', 'Payment Ref', 'Status'];
    const rows = orders.map((o) => [
      o.id,
      new Date(o.createdAt).toLocaleDateString(),
      new Date(o.createdAt).toLocaleTimeString(),
      `Table #${o.tableNumber}`,
      `"${o.customerName}"`,
      `'${o.customerPhone}`,
      `"${o.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}"`,
      o.subtotal,
      o.tax,
      o.total,
      o.paymentId,
      o.orderStatus.toUpperCase(),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `cafeqr_orders_report_${new Date().toISOString().slice(0, 10)}.csv`);
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
            <span>Cafe Sales & Performance Analytics</span>
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Real-time revenue, order statistics, and popular dishes for {cafe.name}.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-all active:scale-[0.98] cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Export Orders to Excel/CSV</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-stone-900">₹{totalRevenue.toLocaleString()}</p>
          <p className="text-[10px] text-emerald-700 font-semibold">From {orders.length} orders placed</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-stone-900">{orders.length}</p>
          <p className="text-[10px] text-stone-500 font-semibold">{completedOrders.length} fulfilled & served</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Avg Order Value</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-stone-900">₹{averageOrderValue}</p>
          <p className="text-[10px] text-stone-500 font-semibold">Per guest table tab</p>
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

      {/* Two Columns: Top Selling Dishes & Live Pipeline Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Selling Dishes */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-stone-900 text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-600" />
              <span>Top-Selling Menu Items</span>
            </h4>
            <span className="text-[11px] text-stone-400 font-medium">By units sold</span>
          </div>

          {topItems.length === 0 ? (
            <p className="text-xs text-stone-400 py-6 text-center">No sales data yet</p>
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
                        {item.count} orders placed
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

        {/* Order Status Breakdown */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <h4 className="font-extrabold text-stone-900 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Order Pipeline Breakdown</span>
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
    </div>
  );
};
