import React, { useState } from 'react';
import type { Order, OrderStatus, StaffAlert } from '../../types';
import { 
  Clock, 
  ChefHat, 
  CheckCircle2, 
  XCircle, 
  Phone, 
  User, 
  Bell, 
  Check,
  ChevronDown,
  ChevronUp,
  Search,
  MessageSquare,
  Copy,
  CreditCard,
  Utensils
} from 'lucide-react';

interface LiveKDSViewProps {
  orders: Order[];
  alerts: StaffAlert[];
  onDismissAlert: (id: string) => void;
  onUpdateStatus: (id: string, status: OrderStatus) => void;
}

export const LiveKDSView: React.FC<LiveKDSViewProps> = ({
  orders,
  alerts,
  onDismissAlert,
  onUpdateStatus,
}) => {
  const [filter, setFilter] = useState<'active' | 'all' | 'received' | 'preparing' | 'ready' | 'completed'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const getFilteredOrders = () => {
    let list = orders;
    switch (filter) {
      case 'active':
        list = orders.filter(o => o.orderStatus !== 'completed' && o.orderStatus !== 'cancelled');
        break;
      case 'received':
        list = orders.filter(o => o.orderStatus === 'received');
        break;
      case 'preparing':
        list = orders.filter(o => o.orderStatus === 'preparing');
        break;
      case 'ready':
        list = orders.filter(o => o.orderStatus === 'ready');
        break;
      case 'completed':
        list = orders.filter(o => o.orderStatus === 'completed');
        break;
      case 'all':
      default:
        list = orders;
        break;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        o =>
          o.id.toLowerCase().includes(q) ||
          (o.diningOption && o.diningOption.toLowerCase().includes(q)) ||
          (o.tableNumber && o.tableNumber.toLowerCase().includes(q)) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerPhone.includes(q) ||
          (o.notes && o.notes.toLowerCase().includes(q))
      );
    }

    return list;
  };

  const filteredOrders = getFilteredOrders();

  const getElapsedInfo = (isoDate: string) => {
    const diffMs = Date.now() - new Date(isoDate).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    let text = 'Just now';
    if (diffMins === 1) text = '1m ago';
    else if (diffMins < 60) text = `${diffMins}m ago`;
    else text = `${Math.floor(diffMins / 60)}h ${diffMins % 60}m ago`;

    const isUrgent = diffMins >= 10;
    const isWarning = diffMins >= 5 && diffMins < 10;

    return { text, diffMins, isUrgent, isWarning };
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const statusConfig: Record<OrderStatus, { label: string; badgeClass: string; nextStatus?: OrderStatus; nextLabel?: string; nextIcon?: any }> = {
    received: {
      label: 'New Order',
      badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
      nextStatus: 'preparing',
      nextLabel: 'Start Preparing',
      nextIcon: ChefHat,
    },
    preparing: {
      label: 'In Kitchen (Preparing)',
      badgeClass: 'bg-blue-100 text-blue-900 border-blue-300',
      nextStatus: 'ready',
      nextLabel: 'Mark Ready / Complete',
      nextIcon: Bell,
    },
    ready: {
      label: 'Ready to Serve',
      badgeClass: 'bg-purple-100 text-purple-900 border-purple-300',
      nextStatus: 'completed',
      nextLabel: 'Mark Delivered',
      nextIcon: CheckCircle2,
    },
    completed: {
      label: 'Delivered & Completed',
      badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    },
    cancelled: {
      label: 'Cancelled',
      badgeClass: 'bg-stone-100 text-stone-500 border-stone-300',
    },
  };

  return (
    <div className="space-y-5">
      
      {/* Real-time Waiter Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="p-4 rounded-2xl bg-amber-500 text-amber-950 font-bold flex items-center justify-between shadow-lg animate-bounce"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-600 text-white rounded-xl">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm">
                    <span className="bg-stone-900 text-white px-2 py-0.5 rounded-md mr-2 font-mono">
                      Table #{alert.tableNumber}
                    </span>
                    Requested: <span className="underline">{alert.type}</span>
                  </p>
                  <p className="text-[11px] text-amber-900/80 font-normal mt-0.5">
                    {new Date(alert.time).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onDismissAlert(alert.id)}
                className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Acknowledge
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white rounded-3xl p-4 border border-stone-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pb-1 sm:pb-0">
            {[
              { id: 'active', label: 'Active Live', count: orders.filter(o => o.orderStatus !== 'completed' && o.orderStatus !== 'cancelled').length },
              { id: 'received', label: 'Received', count: orders.filter(o => o.orderStatus === 'received').length },
              { id: 'preparing', label: 'Preparing', count: orders.filter(o => o.orderStatus === 'preparing').length },
              { id: 'ready', label: 'Ready / Complete', count: orders.filter(o => o.orderStatus === 'ready').length },
              { id: 'completed', label: 'Delivered', count: orders.filter(o => o.orderStatus === 'completed').length },
              { id: 'all', label: 'All Orders', count: orders.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  filter === tab.id
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200/70'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  filter === tab.id ? 'bg-amber-500 text-stone-950 font-black' : 'bg-stone-200 text-stone-700'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search order ID, parcel, customer..."
              className="w-full pl-8 pr-3 py-1.5 bg-stone-100 rounded-xl text-xs text-stone-800 placeholder-stone-400 outline-none border border-transparent focus:border-stone-300 focus:bg-white transition-all"
            />
          </div>

        </div>

        {/* Info hint */}
        <div className="flex items-center justify-between text-[11px] text-stone-400 font-medium pt-1 border-t border-stone-100">
          <span>💡 Click any line below to expand the complete order details, item breakdown, and customer message.</span>
          <span>Showing {filteredOrders.length} order{filteredOrders.length === 1 ? '' : 's'}</span>
        </div>
      </div>

      {/* Orders List: Compact One-Line Expandable System */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 text-stone-400 space-y-3">
          <Utensils className="w-12 h-12 stroke-1 mx-auto text-stone-300" />
          <h3 className="font-bold text-stone-700 text-base">No orders in this view</h3>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            When customers place orders online (Eat Now or Parcel), they will show up here instantly with audio chimes.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredOrders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const elapsed = getElapsedInfo(order.createdAt);
            const status = statusConfig[order.orderStatus] || statusConfig.received;
            const totalItemsQty = order.items.reduce((acc, i) => acc + i.quantity, 0);
            const isParcel = order.diningOption === 'parcel' || String(order.tableNumber).toLowerCase().includes('parcel') || String(order.tableNumber).toLowerCase().includes('takeaway');

            // Preview of item names
            const itemsSummary = order.items.map(i => `${i.quantity}x ${i.name}`).join(', ');

            return (
              <div
                key={order.id}
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-2xs ${
                  isExpanded
                    ? 'border-amber-500 ring-2 ring-amber-100 shadow-md'
                    : order.orderStatus === 'received'
                    ? 'border-amber-300 hover:border-amber-400 bg-amber-50/20'
                    : order.orderStatus === 'preparing'
                    ? 'border-blue-200 hover:border-blue-300'
                    : order.orderStatus === 'ready'
                    ? 'border-purple-200 hover:border-purple-300'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                
                {/* ---------------- ONE-LINE ROW (Clickable to view total details) ---------------- */}
                <div
                  onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                  className="px-4 py-3.5 flex flex-wrap md:flex-nowrap items-center justify-between gap-3 cursor-pointer hover:bg-stone-50/80 transition-colors"
                >
                  
                  {/* Left: Parcel / Eat Now & Order ID & Elapsed */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className={`font-black text-xs px-2.5 py-1 rounded-xl shadow-xs flex items-center gap-1 text-white ${
                      isParcel ? 'bg-emerald-600' : 'bg-amber-700'
                    }`}>
                      <span>{isParcel ? '🛍️' : '🍽️'}</span>
                      <span>{isParcel ? 'PARCEL' : 'EAT NOW'}</span>
                    </span>
                    <span className="font-mono text-xs font-bold text-stone-600">
                      {order.id}
                    </span>
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-stone-400">
                      <Clock className="w-3 h-3" />
                      <span className={elapsed.isUrgent ? 'text-red-600 font-bold animate-pulse' : ''}>
                        {elapsed.text}
                      </span>
                    </div>
                  </div>

                  {/* Middle: Customer Name, Items Preview & Customer Message Pill */}
                  <div className="flex-1 min-w-0 flex items-center gap-2.5 overflow-hidden">
                    <div className="flex items-center gap-1 text-xs font-bold text-stone-800 shrink-0">
                      <User className="w-3.5 h-3.5 text-stone-400" />
                      <span>{order.customerName}</span>
                    </div>

                    <span className="text-stone-300 hidden sm:inline">•</span>

                    {/* Items Summary line */}
                    <div className="text-xs text-stone-600 truncate max-w-xs md:max-w-sm hidden sm:block">
                      <span className="font-medium text-stone-800 font-mono">[{totalItemsQty} items]</span> {itemsSummary}
                    </div>

                    {/* Special Customer Message Pill if present */}
                    {order.notes && (
                      <div className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 animate-pulse">
                        <MessageSquare className="w-3 h-3 text-amber-700" />
                        <span className="truncate max-w-[140px]">Note: "{order.notes}"</span>
                      </div>
                    )}
                  </div>

                  {/* Right: Price, Status & Quick Action Buttons */}
                  <div className="flex items-center gap-2.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    
                    {/* Total Price & Payment Status */}
                    <div className="text-right leading-tight">
                      <div className="font-black text-sm text-stone-900">
                        ₹{order.total}
                      </div>
                      <div className="text-[10px] text-emerald-700 font-bold uppercase font-mono">
                        PAID
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border ${status.badgeClass} whitespace-nowrap`}>
                      {status.label}
                    </span>

                    {/* Quick Fast-Action Status Button right on the line */}
                    {status.nextStatus && (
                      <button
                        type="button"
                        onClick={() => onUpdateStatus(order.id, status.nextStatus!)}
                        className="py-1.5 px-3 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                        title={status.nextLabel}
                      >
                        {status.nextIcon && <status.nextIcon className="w-3.5 h-3.5 text-amber-400" />}
                        <span className="hidden lg:inline">{status.nextLabel}</span>
                      </button>
                    )}

                    {/* Expand Chevron */}
                    <button
                      type="button"
                      onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                      className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200 transition-colors"
                      title={isExpanded ? 'Collapse' : 'Expand full details'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                  </div>

                </div>

                {/* ---------------- EXPANDED TOTAL DETAILS SECTION ---------------- */}
                {isExpanded && (
                  <div className="border-t border-stone-200 p-5 bg-stone-50/70 space-y-5 animate-in slide-in-from-top-2 duration-200">
                    
                    {/* Top Details Grid: Order Type, Order ID, Payment ID, Customer, Date */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                      
                      {/* Dining Option: Parcel vs Eat Now */}
                      <div className={`p-3 rounded-2xl border ${
                        isParcel ? 'bg-emerald-50 border-emerald-300' : 'bg-amber-50 border-amber-300'
                      }`}>
                        <p className={`text-[10px] font-black uppercase tracking-wider mb-1 ${
                          isParcel ? 'text-emerald-700' : 'text-amber-700'
                        }`}>
                          Dining Preference
                        </p>
                        <p className={`text-xs font-black flex items-center gap-1.5 ${
                          isParcel ? 'text-emerald-950' : 'text-amber-950'
                        }`}>
                          <span>{isParcel ? '🛍️' : '🍽️'}</span>
                          <span>{isParcel ? 'PARCEL (Takeaway)' : 'EAT NOW (Dine-In)'}</span>
                        </p>
                      </div>
                      
                      {/* Order ID */}
                      <div className="p-3 bg-white rounded-2xl border border-stone-200">
                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-wider mb-1">
                          Order ID
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-stone-800">
                            {order.id}
                          </span>
                          <button
                            onClick={() => copyToClipboard(order.id, `order_${order.id}`)}
                            className="p-1 text-stone-400 hover:text-stone-700 rounded cursor-pointer"
                            title="Copy Order ID"
                          >
                            {copiedId === `order_${order.id}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Razorpay Payment ID */}
                      <div className="p-3 bg-white rounded-2xl border border-stone-200">
                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <CreditCard className="w-3 h-3 text-blue-600" />
                          <span>Razorpay Payment ID</span>
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-emerald-700 truncate max-w-[140px]">
                            {order.paymentId}
                          </span>
                          <button
                            onClick={() => copyToClipboard(order.paymentId, `pay_${order.id}`)}
                            className="p-1 text-stone-400 hover:text-stone-700 rounded cursor-pointer"
                            title="Copy Payment ID"
                          >
                            {copiedId === `pay_${order.id}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Customer Details */}
                      <div className="p-3 bg-white rounded-2xl border border-stone-200">
                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-wider mb-1">
                          Guest & Phone
                        </p>
                        <p className="text-xs font-bold text-stone-900 truncate">
                          {order.customerName}
                        </p>
                        <a
                          href={`tel:${order.customerPhone}`}
                          className="font-mono text-[11px] text-amber-800 hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <Phone className="w-3 h-3" />
                          <span>+91 {order.customerPhone}</span>
                        </a>
                      </div>

                      {/* Order Timestamp */}
                      <div className="p-3 bg-white rounded-2xl border border-stone-200">
                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-wider mb-1">
                          Placed At
                        </p>
                        <p className="text-xs font-semibold text-stone-800">
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </p>
                        <p className="text-[10px] text-stone-400">
                          {new Date(order.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>

                    </div>

                    {/* Customer Message / Special Instructions Box (Prominent) */}
                    <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-900">
                        <MessageSquare className="w-4 h-4 text-amber-700" />
                        <span>Customer Instructions / Kitchen Message:</span>
                      </div>
                      {order.notes ? (
                        <p className="text-sm font-bold text-stone-900 pl-6 leading-relaxed bg-white/70 p-2.5 rounded-xl border border-amber-200">
                          "{order.notes}"
                        </p>
                      ) : (
                        <p className="text-xs text-stone-500 italic pl-6">
                          No special cooking instructions provided by customer.
                        </p>
                      )}
                    </div>

                    {/* Itemized Order Breakdown Table */}
                    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
                      <div className="px-4 py-2.5 bg-stone-100 border-b border-stone-200 text-[11px] font-black uppercase tracking-wider text-stone-500 flex justify-between">
                        <span>Items Ordered ({totalItemsQty})</span>
                        <span>Amount (₹)</span>
                      </div>

                      <div className="divide-y divide-stone-100">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="p-3.5 flex items-center justify-between text-xs hover:bg-stone-50/50">
                            <div className="flex items-center gap-3">
                              {/* Veg / Non-Veg dot */}
                              <span
                                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                  item.isVeg ? 'bg-emerald-600' : 'bg-red-600'
                                }`}
                                title={item.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                              />
                              <div>
                                <p className="font-bold text-stone-900 text-sm">
                                  {item.quantity}x {item.name}
                                </p>
                                <p className="text-[11px] text-stone-400">
                                  ₹{item.price} each
                                </p>
                              </div>
                            </div>

                            <span className="font-mono font-extrabold text-sm text-stone-900">
                              ₹{item.price * item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Total Price Calculation Summary */}
                      <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="text-xs text-stone-500 space-y-0.5">
                          <div>Subtotal: <span className="font-semibold text-stone-800">₹{order.subtotal}</span></div>
                          <div>GST / Taxes ({order.taxRate}%): <span className="font-semibold text-stone-800">₹{order.tax}</span></div>
                        </div>

                        <div className="flex items-baseline gap-2">
                          <span className="text-xs font-bold text-stone-500 uppercase">Total Paid:</span>
                          <span className="text-xl font-black text-emerald-800 font-mono">
                            ₹{order.total}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Transition Control Buttons */}
                    <div className="p-4 bg-white rounded-2xl border border-stone-200 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold text-stone-700">Update Order Progress:</p>
                        <p className="text-[11px] text-stone-400">Updates the customer's digital bill and table tracker in real-time</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* Step 1: Preparing */}
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(order.id, 'preparing')}
                          disabled={order.orderStatus === 'preparing'}
                          className={`py-2 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            order.orderStatus === 'preparing'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-stone-100 hover:bg-blue-50 hover:text-blue-700 text-stone-700'
                          }`}
                        >
                          <ChefHat className="w-3.5 h-3.5" />
                          <span>1. Preparing 👨‍🍳</span>
                        </button>

                        {/* Step 2: Ready */}
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(order.id, 'ready')}
                          disabled={order.orderStatus === 'ready'}
                          className={`py-2 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            order.orderStatus === 'ready'
                              ? 'bg-purple-600 text-white shadow-xs'
                              : 'bg-stone-100 hover:bg-purple-50 hover:text-purple-700 text-stone-700'
                          }`}
                        >
                          <Bell className="w-3.5 h-3.5" />
                          <span>2. Ready / Complete 🔔</span>
                        </button>

                        {/* Step 3: Delivered */}
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(order.id, 'completed')}
                          disabled={order.orderStatus === 'completed'}
                          className={`py-2 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            order.orderStatus === 'completed'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-stone-100 hover:bg-emerald-50 hover:text-emerald-700 text-stone-700'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>3. Delivered ✅</span>
                        </button>

                        {/* Cancel Button */}
                        {order.orderStatus !== 'completed' && order.orderStatus !== 'cancelled' && (
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to cancel Order #${order.id}?`)) {
                                onUpdateStatus(order.id, 'cancelled');
                              }
                            }}
                            className="py-2 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-colors cursor-pointer"
                            title="Cancel Order"
                          >
                            <XCircle className="w-3.5 h-3.5 inline mr-1" />
                            <span>Cancel</span>
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};