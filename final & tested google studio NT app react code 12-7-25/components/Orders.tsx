
import React, { useMemo } from 'react';
import { Order, User, Product } from '../types';
import { StatusBadge } from './UI';
import { Package, User as UserIcon, Calendar, DollarSign, MapPin, Phone, Building, Briefcase } from 'lucide-react';

interface OrdersModalProps {
    orders: Order[];
    currentUser: User | null;
    userRole: string;
    products: Product[]; // Needed to identify vendor items
}

const currencyFormatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 });

export const OrdersModal: React.FC<OrdersModalProps> = ({ orders, currentUser, userRole, products }) => {
    
    const filteredOrders = useMemo(() => {
        if (!currentUser) return [];
        if (userRole === 'admin') return orders;

        return orders.filter(order => {
            if (userRole === 'franchise') return order.franchiseDetails.id === currentUser.id;
            if (userRole === 'partner') return order.partnerDetails.id === currentUser.id;
            if (userRole === 'telecaller') return order.telecallerDetails.id === currentUser.id;
            
            if (userRole === 'vendor') {
                // Find SKUs owned by this vendor
                const vendorSkus = products.filter(p => p.vendorId === currentUser.id).map(p => p.sku);
                // Check if order contains any of these SKUs
                return order.items.some(item => vendorSkus.includes(item.sku));
            }
            return false;
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Newest first
    }, [orders, currentUser, userRole, products]);

    // Helper to check if a specific item belongs to the logged-in vendor
    const isMyItem = (sku: string) => {
        if (userRole !== 'vendor') return true;
        const product = products.find(p => p.sku === sku);
        return product?.vendorId === currentUser?.id;
    };

    if (filteredOrders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="bg-gray-100 p-6 rounded-full mb-4">
                    <Package size={48} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-700">No Orders Found</h3>
                <p className="text-gray-500">
                    {userRole === 'vendor' ? "No orders have been placed for your products yet." : "You haven't been assigned to any orders yet."}
                </p>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-full">
            <div className="p-4 bg-white sticky top-0 z-10 border-b shadow-sm">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Briefcase className="text-primary"/> 
                    {userRole === 'vendor' ? 'My Store Orders' : 'Order History'}
                    <span className="text-sm font-normal text-gray-500 ml-auto">({filteredOrders.length})</span>
                </h2>
            </div>

            <div className="p-4 space-y-4 pb-20">
                {filteredOrders.map(order => (
                    <div key={order.orderId} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {/* Order Header */}
                        <div className="bg-gray-50 p-3 border-b flex justify-between items-start">
                            <div>
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Order #{order.orderId}</span>
                                <div className="flex items-center gap-1 text-gray-700 text-sm font-medium mt-0.5">
                                    <Calendar size={14} className="text-gray-400"/> {order.date}
                                </div>
                            </div>
                            <div className="text-right">
                                <StatusBadge status={order.status} />
                                <div className="text-xs text-gray-500 mt-1">{order.paymentType.replace('_', ' ')}</div>
                            </div>
                        </div>

                        {/* Client Info */}
                        <div className="p-4 border-b border-dashed">
                            <div className="flex items-start gap-3">
                                <div className="bg-blue-50 p-2 rounded-full text-blue-600">
                                    <UserIcon size={18} />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">{order.clientDetails.name}</p>
                                    <p className="text-sm text-gray-500 flex items-center gap-1"><Phone size={12}/> {order.clientDetails.phone}</p>
                                    <p className="text-xs text-gray-400 mt-1 flex items-start gap-1">
                                        <MapPin size={12} className="mt-0.5 flex-shrink-0"/> {order.clientDetails.address}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="p-4 bg-gray-50/50">
                            <p className="text-xs font-bold text-gray-500 uppercase mb-2">Items</p>
                            <div className="space-y-2">
                                {order.items.map((item, idx) => {
                                    const isMine = isMyItem(item.sku);
                                    return (
                                        <div key={idx} className={`flex justify-between items-center text-sm p-2 rounded ${isMine ? 'bg-white shadow-sm border border-gray-100' : 'opacity-50 grayscale'}`}>
                                            <div>
                                                <span className={`font-medium ${isMine ? 'text-gray-900' : 'text-gray-500'}`}>
                                                    {item.quantity}x {item.name}
                                                </span>
                                                <span className="block text-[10px] text-gray-400">{item.sku}</span>
                                            </div>
                                            <span className="font-mono text-gray-600">{currencyFormatter.format(item.price * item.quantity)}</span>
                                        </div>
                                    );
                                })}
                            </div>
                            
                            {userRole === 'vendor' && (
                                <p className="text-[10px] text-orange-600 mt-2 italic">* Items dimmed are from other vendors in the same order.</p>
                            )}

                            <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200">
                                <span className="font-bold text-gray-600 text-sm">Total Order Value</span>
                                <span className="font-bold text-lg text-primary">{currencyFormatter.format(order.totalAmount)}</span>
                            </div>
                        </div>

                        {/* Staff Attribution Footer */}
                        <div className="bg-gray-100 p-2 text-[10px] text-gray-500 flex flex-wrap gap-2 justify-between">
                            {order.franchiseDetails.id !== 'None' && (
                                <span className="flex items-center gap-1"><Building size={10}/> Fr: {order.franchiseDetails.name}</span>
                            )}
                            {order.partnerDetails.id !== 'None' && (
                                <span className="flex items-center gap-1"><Briefcase size={10}/> Pt: {order.partnerDetails.name}</span>
                            )}
                            {order.telecallerDetails.id !== 'None' && (
                                <span className="flex items-center gap-1"><Phone size={10}/> TC: {order.telecallerDetails.name}</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
