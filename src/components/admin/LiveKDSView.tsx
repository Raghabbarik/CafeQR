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
  AlertCircle,
  Check,
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

  const getFilteredOrders = () => {
    switch (filter) {
      case 'active':
        return orders.filter(o => o.orderStatus !== 'completed' && o.orderStatus !== 'cancelled');
      case 'received':
        return orders.filter(o => o.orderStatus === 'received');
      case 'preparing':
        return orders.filter(o => o.orderStatus === 'preparing');
      case 'ready':
        return orders.filter(o => o.orderStatus === 'ready');
      case 'completed':
        return orders.filter(o => o.orderStatus === 'completed');
      case 'all':
      default:
        return orders;
    }
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

  return (
    <div className="space-y-6">
      {/* Real-time Staff Alerts (Waiter calls) */}
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
                className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Acknowledge
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Filter Tabs Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar">
          {[
            { id: 'active', label: 'Active Live', count: orders.filter(o => o.orderStatus !== 'completed' && o.orderStatus !== 'cancelled').length },
            { id: 'received', label: 'Received', count: orders.filter(o => o.orderStatus === 'received').length },
            { id: 'preparing', label: 'In Kitchen', count: orders.filter(o => o.orderStatus === 'preparing').length },
            { id: 'ready', label: 'Ready', count: orders.filter(o => o.orderStatus === 'ready').length },
            { id: 'completed', label: 'Completed', count: orders.filter(o => o.orderStatus === 'completed').length },
            { id: 'all', label: 'All Orders', count: orders.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                filter === tab.id
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                filter === tab.id ? 'bg-amber-500 text-stone-900 font-extrabold' : 'bg-stone-200 text-stone-700'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="text-xs text-stone-400 font-medium">
          Showing {filteredOrders.length} order{filteredOrders.length === 1 ? '' : 's'}
        </div>
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 text-stone-400 space-y-3">
          <Utensils className="w-12 h-12 stroke-1 mx-auto text-stone-300" />
          <h3 className="font-bold text-stone-700 text-base">No orders in this view</h3>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            When customers place orders from their table QR codes, they will show up here instantly with audio chimes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((order) => {
            const isReceived = order.orderStatus === 'received';
            const isPreparing = order.orderStatus === 'preparing';
            const isReady = order.orderStatus === 'ready';
            const isCompleted = order.orderStatus === 'completed';

            return (
              <div
                key={order.id}
                className={`bg-white rounded-3xl border transition-all duration-200 shadow-xs flex flex-col justify-between overflow-hidden ${
                  isReceived
                    ? 'border-amber-400 ring-2 ring-amber-100 shadow-md'
                    : isPreparing
                    ? 'border-blue-400'
                    : isReady
                    ? 'border-emerald-400 ring-2 ring-emerald-100'
                    : 'border-stone-200 opacity-80'
                }`}
              >
                {/* Header: Table & Status & Timer */}
                <div className={`p-4 border-b flex items-center justify-between ${
                  isReceived ? 'bg-amber-50/60 border-amber-200' :
                  isPreparing ? 'bg-blue-50/60 border-blue-200' :
                  isReady ? 'bg-emerald-50/60 border-emerald-200' :
                  'bg-stone-50 border-stone-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm bg-stone-900 text-white px-2.5 py-1 rounded-xl shadow-xs">
                      Table #{order.tableNumber}
                    </span>
                    <span className="font-mono text-xs font-bold text-stone-500">
                      {order.id}
                    </span>
                  </div>

                  {(() => {
                    const elapsed = getElapsedInfo(order.createdAt);
                    return (
                      <div className="flex items-center gap-1.5 text-xs font-semibold">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        {order.orderStatus !== 'completed' && order.orderStatus !== 'cancelled' ? (
                          <span
                            className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                              elapsed.isUrgent
                                ? 'bg-red-500 text-white animate-pulse'
                                : elapsed.isWarning
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-emerald-50 text-emerald-800'
                            }`}
                          >
                            {elapsed.isUrgent
                              ? `🔥 ${elapsed.text}`
                              : elapsed.isWarning
                              ? `⚠️ ${elapsed.text}`
                              : elapsed.text}
                          </span>
                        ) : (
                          <span className="text-stone-400 text-[11px]">{elapsed.text}</span>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Body: Guest details & Item list */}
                <div className="p-4 flex-1 space-y-3">
                  {/* Guest Info */}
                  <div className="flex items-center justify-between text-xs text-stone-600 pb-2 border-b border-stone-100">
                    <span className="font-semibold text-stone-800 flex items-center gap-1">
                      <User className="w-3 h-3 text-stone-400" />
                      {order.customerName}
                    </span>
                    <span className="font-mono text-stone-500 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-stone-400" />
                      {order.customerPhone}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-start justify-between text-xs">
                        <div className="flex items-center gap-2 max-w-[80%]">
                          {/* Veg/Non-Veg dot */}
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              item.isVeg ? 'bg-emerald-600' : 'bg-red-600'
                            }`}
                          />
                          <span className="font-bold text-stone-900 min-w-[20px]">
                            {item.quantity}x
                          </span>
                          <span className="text-stone-800 font-medium leading-snug">
                            {item.name}
                          </span>
                        </div>
                        <span className="text-stone-500 font-mono text-[11px]">
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Notes */}
                  {order.notes && (
                    <div className="p-2.5 bg-amber-50/80 rounded-xl border border-amber-200/80 text-[11px] text-amber-950 italic flex items-start gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                      <span>Note: "{order.notes}"</span>
                    </div>
                  )}

                  {/* Payment & Total */}
                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      PAID ₹{order.total}
                    </span>
                    <span className="font-mono text-[10px] text-stone-400">
                      Razorpay: {order.paymentId.substring(0, 12)}
                    </span>
                  </div>
                </div>

                {/* Footer: Order Status Controls */}
                <div className="p-3 bg-stone-50 border-t border-stone-200 flex items-center gap-2">
                  {isReceived && (
                    <>
                      <button
                        onClick={() => onUpdateStatus(order.id, 'preparing')}
                        className="flex-1 py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                      >
                        <ChefHat className="w-3.5 h-3.5" />
                        <span>Start Preparing</span>
                      </button>
                      <button
                        onClick={() => onUpdateStatus(order.id, 'cancelled')}
                        className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                        title="Cancel Order"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {isPreparing && (
                    <button
                      onClick={() => onUpdateStatus(order.id, 'ready')}
                      className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>Mark Ready to Serve</span>
                    </button>
                  )}

                  {isReady && (
                    <button
                      onClick={() => onUpdateStatus(order.id, 'completed')}
                      className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Complete & Served</span>
                    </button>
                  )}

                  {isCompleted && (
                    <div className="w-full py-1 text-center text-xs font-bold text-emerald-700 flex items-center justify-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Order Fulfilled</span>
                    </div>
                  )}

                  {order.orderStatus === 'cancelled' && (
                    <div className="w-full py-1 text-center text-xs font-bold text-red-600">
                      Cancelled
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
