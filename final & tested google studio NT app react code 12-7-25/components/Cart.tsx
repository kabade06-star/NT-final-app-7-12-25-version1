
import React, { useState, useEffect } from 'react';
import { Cart, CartItem, User, Product } from '../types';
import { GST_RATE } from '../constants';
import { Minus, Plus, CreditCard, ShoppingBag, ArrowRight, User as UserIcon, MapPin, Mail, Phone, Building, Trash } from 'lucide-react';

interface CartProps {
    cart: Cart;
    onUpdateQty: (productId: number, qty: number) => void;
    onRemove: (productId: number) => void;
    onCheckout: () => void;
    isFranchise: boolean;
}

const currencyFormatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 });

// Helper to calculate price based on product type
const calculateItemPrice = (product: Product, isFranchise: boolean) => {
    if (product.priceType === 'unit') {
        return isFranchise ? (product.unitRateFranchise || 0) : (product.unitRateSelling || 0);
    } else if (product.priceType === 'percentage') {
        // NEW STANDARD: stored in unitRate... or sellingPrice as the percentage value (e.g. 10)
        // We return Rate/100 so that (Rate/100 * Value) works later
        const percentVal = isFranchise ? product.franchisePrice : product.sellingPrice;
        return percentVal / 100;
    } else {
        return isFranchise ? product.franchisePrice : product.sellingPrice;
    }
};

export const CartView: React.FC<CartProps> = ({ cart, onUpdateQty, onRemove, onCheckout, isFranchise }) => {
    const items = Object.values(cart) as CartItem[];
    
    const total = items.reduce((acc, item) => {
        const priceFactor = calculateItemPrice(item.product, isFranchise);
        // For percentage: priceFactor is 0.06, quantity is 500000. Result 30000.
        // For fixed/unit: priceFactor is 500, quantity is 2. Result 1000.
        return acc + (priceFactor * item.quantity);
    }, 0);

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center h-[50vh]">
                <div className="bg-gray-100 p-6 rounded-full mb-4">
                    <ShoppingBag size={48} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">Your cart is empty</h3>
                <p className="text-gray-500 max-w-xs">Looks like you haven't added anything to your cart yet.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-gray-50 sm:bg-white">
            <div className="p-4 bg-white sticky top-0 z-10 border-b shadow-sm">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <ShoppingBag className="text-primary"/> Shopping Cart <span className="text-sm font-normal text-gray-500">({items.length} items)</span>
                </h2>
            </div>
            
            <div className="flex-grow overflow-y-auto p-4 space-y-4 pb-24">
                {items.map((item) => {
                    const priceFactor = calculateItemPrice(item.product, isFranchise);
                    const itemTotal = priceFactor * item.quantity;
                    const isPercentage = item.product.priceType === 'percentage';

                    return (
                        <div key={item.product.id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex gap-4">
                            <img src={item.product.image} alt={item.product.name} className="w-20 h-20 rounded-lg object-cover bg-gray-100" />
                            <div className="flex-grow flex flex-col justify-between">
                                <div>
                                    <h3 className="font-bold text-gray-800 text-sm line-clamp-2 leading-tight mb-1">{item.product.name}</h3>
                                    <p className="text-xs text-gray-500 mb-1">
                                        {isPercentage 
                                            ? `${(priceFactor * 100).toFixed(2)}% of Value`
                                            : `${currencyFormatter.format(priceFactor)} ${item.product.priceType === 'unit' ? `/${item.product.unitLabel}` : ''}`
                                        }
                                    </p>
                                </div>
                                <div className="flex justify-between items-end">
                                    <p className="font-bold text-primary">
                                        {currencyFormatter.format(itemTotal)}
                                    </p>
                                    
                                    {isPercentage ? (
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] text-gray-400 uppercase">Base Value</span>
                                            <div className="font-mono text-sm bg-gray-50 px-2 py-1 rounded border">
                                                {currencyFormatter.format(item.quantity)}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1 border border-gray-200">
                                            <button onClick={() => onUpdateQty(item.product.id, Math.max(1, item.quantity - 1))} className="p-1 hover:bg-white rounded shadow-sm transition"><Minus size={14}/></button>
                                            <span className="w-4 text-center text-sm font-bold">{item.quantity}</span>
                                            <button onClick={() => onUpdateQty(item.product.id, item.quantity + 1)} className="p-1 hover:bg-white rounded shadow-sm transition"><Plus size={14}/></button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button onClick={() => onRemove(item.product.id)} className="text-gray-400 p-1 hover:text-red-500 self-start -mt-1 -mr-1"><Trash size={18}/></button>
                        </div>
                    );
                })}
            </div>

            <div className="p-4 bg-white border-t sticky bottom-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                <div className="flex justify-between items-end mb-4">
                    <span className="text-gray-500 text-sm">Total Amount</span>
                    <span className="text-2xl font-extrabold text-gray-900">{currencyFormatter.format(total)}</span>
                </div>
                <button onClick={onCheckout} className="w-full bg-primary text-white py-3.5 rounded-xl font-bold hover:bg-blue-900 transition shadow-lg flex items-center justify-center gap-2 active:scale-[0.98]">
                    Proceed to Checkout <ArrowRight size={18} />
                </button>
            </div>
        </div>
    );
};

interface CheckoutProps {
    cart: Cart;
    telecallers: Record<string, User>;
    partners: Record<string, User>;
    franchisees: Record<string, User>;
    isFranchise: boolean;
    onClose: () => void;
    onOrderPlaced: (order: any) => void;
    currentUser: User | null;
    userRole: string;
}

export const CheckoutModal: React.FC<CheckoutProps> = ({ 
    cart, telecallers, partners, franchisees, isFranchise, onClose, onOrderPlaced, currentUser, userRole 
}) => {
    const [formData, setFormData] = useState({
        name: '', phone: '', email: '', address: '',
        telecallerId: '', partnerId: '', franchiseId: ''
    });
    const [paymentMode, setPaymentMode] = useState<'upi' | 'gst'>('upi');

    // Auto-fill form based on logged-in user
    useEffect(() => {
        if (currentUser) {
            setFormData(prev => ({
                ...prev,
                telecallerId: userRole === 'telecaller' ? currentUser.id : prev.telecallerId,
                franchiseId: userRole === 'franchise' ? currentUser.id : prev.franchiseId,
                partnerId: userRole === 'partner' ? currentUser.id : prev.partnerId,
            }));
        }
    }, [currentUser, userRole]);

    const items = Object.values(cart) as CartItem[];
    const subtotal = items.reduce((acc, item) => {
        const priceFactor = calculateItemPrice(item.product, isFranchise);
        return acc + (priceFactor * item.quantity);
    }, 0);

    const gstAmount = paymentMode === 'gst' ? subtotal * GST_RATE : 0;
    const totalAmount = subtotal + gstAmount;

    const handlePay = () => {
        const upiLink = `upi://pay?pa=8073126541@ptaxis&pn=NirmaanTech&am=${totalAmount.toFixed(2)}&cu=INR`;
        
        // Open UPI link (will only work on supported devices/apps)
        window.location.href = upiLink;

        // Simulate order placement
        setTimeout(() => {
            const order = {
                orderId: Date.now(),
                date: new Date().toISOString().split('T')[0],
                status: 'Pending',
                items: items.map(i => ({ 
                    name: i.product.name, 
                    price: calculateItemPrice(i.product, isFranchise) * i.quantity, // Store calculated total for item
                    quantity: i.product.priceType === 'percentage' ? 1 : i.quantity, // For percentage, quantity concept is abstract, maybe 1 item of value X
                    sku: i.product.sku
                })),
                totalAmount,
                paymentType: paymentMode === 'gst' ? 'GST_INVOICE' : 'UPI_DIRECT',
                subtotal,
                clientDetails: { name: formData.name, phone: formData.phone, email: formData.email, address: formData.address },
                franchiseDetails: { id: formData.franchiseId || 'None', ...franchisees[formData.franchiseId] },
                telecallerDetails: { id: formData.telecallerId || 'None', ...telecallers[formData.telecallerId] },
                partnerDetails: { id: formData.partnerId || 'None', ...partners[formData.partnerId] },
                adminComments: 'Order placed via Portal'
            };
            onOrderPlaced(order);
        }, 1500);
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 sm:bg-white">
             <div className="p-4 bg-white sticky top-0 z-10 border-b shadow-sm flex items-center justify-between">
                <h2 className="text-xl font-bold">Checkout</h2>
                <div className="text-sm font-medium text-gray-500">{items.length} Items</div>
            </div>
            
            <div className="flex-grow overflow-y-auto p-4 space-y-6 pb-32">
                {/* Customer Details */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm uppercase tracking-wide border-b pb-2">
                        <UserIcon size={16}/> Customer Details
                    </h3>
                    <div className="space-y-3">
                        <input placeholder="Full Name *" className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="relative">
                                <Phone size={16} className="absolute top-3.5 left-3 text-gray-400" />
                                <input placeholder="Phone Number *" className="w-full pl-9 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required type="tel" />
                            </div>
                            <div className="relative">
                                <Mail size={16} className="absolute top-3.5 left-3 text-gray-400" />
                                <input placeholder="Email Address" className="w-full pl-9 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} type="email" />
                            </div>
                        </div>
                        <div className="relative">
                            <MapPin size={16} className="absolute top-3.5 left-3 text-gray-400" />
                            <textarea placeholder="Shipping Address *" className="w-full pl-9 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none" rows={3} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} required></textarea>
                        </div>
                    </div>
                </div>

                {/* Staff Attribution */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm uppercase tracking-wide border-b pb-2">
                        <Building size={16}/> Staff Attribution <span className="text-xs text-gray-400 normal-case ml-auto">(Auto-filled for Staff)</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label className="text-xs font-bold text-gray-500 mb-1 block">Telecaller</label>
                            <select 
                                className={`w-full p-2.5 border border-gray-200 rounded-lg text-sm ${userRole === 'telecaller' ? 'bg-gray-100 text-gray-500' : 'bg-gray-50'}`} 
                                value={formData.telecallerId} 
                                onChange={e => setFormData({...formData, telecallerId: e.target.value})}
                                disabled={userRole === 'telecaller'}
                            >
                                <option value="">None</option>
                                {(Object.values(telecallers) as User[]).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 mb-1 block">Partner</label>
                            <select 
                                className={`w-full p-2.5 border border-gray-200 rounded-lg text-sm ${userRole === 'partner' ? 'bg-gray-100 text-gray-500' : 'bg-gray-50'}`} 
                                value={formData.partnerId} 
                                onChange={e => setFormData({...formData, partnerId: e.target.value})}
                                disabled={userRole === 'partner'}
                            >
                                <option value="">None</option>
                                {(Object.values(partners) as User[]).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 mb-1 block">Franchise</label>
                            <select 
                                className={`w-full p-2.5 border border-gray-200 rounded-lg text-sm ${userRole === 'franchise' ? 'bg-gray-100 text-gray-500' : 'bg-gray-50'}`} 
                                value={formData.franchiseId} 
                                onChange={e => setFormData({...formData, franchiseId: e.target.value})}
                                disabled={userRole === 'franchise'}
                            >
                                <option value="">None</option>
                                {(Object.values(franchisees) as User[]).map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Payment Options */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide">Payment Method</h3>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <label className={`flex-1 p-4 border-2 rounded-xl cursor-pointer flex items-center gap-3 transition-all ${paymentMode === 'upi' ? 'bg-blue-50 border-blue-500 shadow-md' : 'border-gray-100 hover:bg-gray-50'}`}>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMode === 'upi' ? 'border-blue-500' : 'border-gray-300'}`}>
                                {paymentMode === 'upi' && <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
                            </div>
                            <div>
                                <span className="font-bold text-gray-800 block">Direct UPI</span>
                                <span className="text-xs text-gray-500">No GST added</span>
                            </div>
                        </label>
                        <label className={`flex-1 p-4 border-2 rounded-xl cursor-pointer flex items-center gap-3 transition-all ${paymentMode === 'gst' ? 'bg-blue-50 border-blue-500 shadow-md' : 'border-gray-100 hover:bg-gray-50'}`}>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMode === 'gst' ? 'border-blue-500' : 'border-gray-300'}`}>
                                {paymentMode === 'gst' && <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
                            </div>
                             <div>
                                <span className="font-bold text-gray-800 block">GST Invoice</span>
                                <span className="text-xs text-gray-500">+18% GST added</span>
                            </div>
                        </label>
                    </div>
                </div>
            </div>

            {/* Sticky Footer */}
            <div className="p-4 bg-white border-t sticky bottom-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                <div className="space-y-1 mb-4">
                    <div className="flex justify-between text-gray-600 text-sm">
                        <span>Subtotal</span>
                        <span>{currencyFormatter.format(subtotal)}</span>
                    </div>
                    {paymentMode === 'gst' && (
                        <div className="flex justify-between text-red-500 text-sm">
                            <span>GST (18%)</span>
                            <span>{currencyFormatter.format(gstAmount)}</span>
                        </div>
                    )}
                    <div className="flex justify-between items-end pt-2 border-t mt-2">
                        <span className="font-bold text-gray-800">Total Payable</span>
                        <span className="text-2xl font-extrabold text-primary">{currencyFormatter.format(totalAmount)}</span>
                    </div>
                </div>

                <div className="bg-blue-50 p-2 rounded text-[10px] text-blue-800 text-center mb-3 border border-blue-100">
                    UPI ID: <strong>8073126541@ptaxis</strong> (Click Pay to open app)
                </div>

                <button onClick={handlePay} disabled={!formData.name || !formData.phone} className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition shadow-lg flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:text-gray-500 active:scale-[0.98]">
                    <CreditCard size={20} /> Pay Now
                </button>
            </div>
        </div>
    );
};
