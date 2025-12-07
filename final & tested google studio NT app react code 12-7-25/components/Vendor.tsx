
import React, { useState, useEffect } from 'react';
import { Product, User } from '../types';
import { ModalWrapper, triggerAlert } from './UI';
import { Plus, Edit, Trash, Store, AlertCircle, Award } from 'lucide-react';
import { CITIES } from '../constants';

interface VendorDashboardProps {
    vendor: User;
    products: Product[];
    setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

export const VendorDashboard: React.FC<VendorDashboardProps> = ({ vendor, products, setProducts }) => {
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [formPriceType, setFormPriceType] = useState<'fixed' | 'unit' | 'percentage'>('fixed');

    useEffect(() => {
        if (showModal && editingProduct) {
            setFormPriceType(editingProduct.priceType || 'fixed');
        } else {
            setFormPriceType('fixed');
        }
    }, [showModal, editingProduct]);

    // Filter products owned by this vendor
    const myProducts = products.filter(p => p.vendorId === vendor.id);
    
    // Vendor Logic: Check limits
    const isBasicPlan = vendor.plan !== 'paid'; // default to basic if undefined
    const productLimit = 3;
    const canAddProduct = !isBasicPlan || myProducts.length < productLimit;

    const handleSaveProduct = (e: any) => {
        e.preventDefault();
        const priceType = e.target.priceType.value;
        const mrpVal = parseFloat(e.target.mrp.value);
        const sellingVal = parseFloat(e.target.price.value);
        const franchiseVal = parseFloat(e.target.franchisePrice.value);

        const data: Product = {
            id: editingProduct?.id || Date.now(),
            name: e.target.name.value,
            sku: e.target.sku.value || `V-${Date.now()}`,
            priceType: priceType,
            unitLabel: priceType === 'unit' ? e.target.unitLabel.value : undefined,
            category: e.target.category.value,
            city: e.target.city.value,
            
            // Map inputs to data structure
            mrp: priceType === 'unit' ? 0 : mrpVal,
            sellingPrice: priceType === 'unit' ? 0 : sellingVal,
            franchisePrice: priceType === 'unit' ? 0 : franchiseVal,
            
            unitRateMRP: priceType === 'unit' ? mrpVal : undefined,
            unitRateSelling: priceType === 'unit' ? sellingVal : undefined,
            unitRateFranchise: priceType === 'unit' ? franchiseVal : undefined,

            shortDescription: e.target.desc.value,
            image: e.target.image.value || "https://picsum.photos/400/250",
            galleryImages: [], reviews: [], videoLink: "", isVisible: true,
            vendorId: vendor.id // Force ownership
        };

        if (editingProduct) {
            setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...data } : p));
        } else {
            setProducts(prev => [...prev, data]);
        }
        setShowModal(false);
        triggerAlert("Product Saved", "success");
    };

    const handleDelete = (id: number) => {
        if(confirm("Are you sure you want to remove this product?")) {
            setProducts(prev => prev.filter(p => p.id !== id));
            triggerAlert("Product Removed", "success");
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 pb-24">
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 sm:p-6 rounded-r-xl mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-orange-900 flex items-center gap-2">
                        <Store /> Vendor Portal: {vendor.name}
                    </h2>
                    <p className="text-sm text-orange-700 mt-1 flex items-center gap-2">
                        {isBasicPlan ? (
                            <span className="bg-orange-200 text-orange-800 px-2 py-0.5 rounded text-xs font-bold uppercase">Basic Plan</span>
                        ) : (
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs font-bold uppercase flex items-center gap-1"><Award size={12}/> Premium Vendor</span>
                        )}
                        <span>Manage your store listing and products.</span>
                    </p>
                </div>
                
                <div className="w-full sm:w-auto">
                    {/* Progress Bar for Basic Plan */}
                    {isBasicPlan && (
                        <div className="mb-2 text-xs font-bold text-orange-800 flex justify-between">
                            <span>Uploads Used: {myProducts.length}/{productLimit}</span>
                            {!canAddProduct && <span className="text-red-600">Limit Reached</span>}
                        </div>
                    )}
                    {isBasicPlan && (
                        <div className="w-full h-2 bg-orange-200 rounded-full mb-3 overflow-hidden">
                            <div 
                                className={`h-full rounded-full transition-all ${!canAddProduct ? 'bg-red-500' : 'bg-orange-500'}`} 
                                style={{ width: `${Math.min((myProducts.length / productLimit) * 100, 100)}%` }}
                            ></div>
                        </div>
                    )}

                    <button 
                        onClick={() => { 
                            if (!canAddProduct) {
                                triggerAlert("Upgrade to Paid plan to upload more products.", "warning");
                                return;
                            }
                            setEditingProduct(null); 
                            setShowModal(true); 
                        }}
                        disabled={!canAddProduct}
                        className={`w-full sm:w-auto px-6 py-3 rounded-lg font-bold shadow-lg flex items-center justify-center gap-2 transition ${!canAddProduct ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-orange-600 text-white hover:bg-orange-700'}`}
                    >
                        <Plus size={18} /> Add Product
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow overflow-hidden">
                <div className="p-4 border-b bg-gray-50 font-bold text-gray-700 flex justify-between items-center">
                    <span>Your Products ({myProducts.length})</span>
                    {!canAddProduct && isBasicPlan && <span className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12}/> Limit Reached</span>}
                </div>
                {myProducts.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No products listed yet. Click "Add Product" to start selling.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 sm:p-6">
                        {myProducts.map(p => (
                            <div key={p.id} className="border rounded-xl overflow-hidden hover:shadow-md transition">
                                <img src={p.image} className="h-40 w-full object-cover" alt={p.name} />
                                <div className="p-4">
                                    <h3 className="font-bold text-lg mb-1 truncate">{p.name}</h3>
                                    <p className="text-sm text-gray-500 mb-2">{p.category} • {p.city}</p>
                                    <div className="flex justify-between items-center mb-4 text-sm">
                                        <div>
                                            <span className="text-gray-500 text-xs block">Selling</span>
                                            <span className="font-bold text-green-700">
                                                {p.priceType === 'percentage' ? `${p.sellingPrice}%` : `₹${p.priceType === 'unit' ? p.unitRateSelling : p.sellingPrice}`}
                                            </span>
                                        </div>
                                        <div className='text-right'>
                                            <span className="text-gray-500 text-xs block">Franchise</span>
                                            <span className="font-bold text-red-600">
                                                {p.priceType === 'percentage' ? `${p.franchisePrice}%` : `₹${p.priceType === 'unit' ? p.unitRateFranchise : p.franchisePrice}`}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => { setEditingProduct(p); setShowModal(true); }} className="flex-1 bg-blue-50 text-blue-700 py-2.5 rounded-lg font-bold hover:bg-blue-100 flex justify-center items-center gap-2 text-sm"><Edit size={16}/> Edit</button>
                                        <button onClick={() => handleDelete(p.id)} className="flex-1 bg-red-50 text-red-700 py-2.5 rounded-lg font-bold hover:bg-red-100 flex justify-center items-center gap-2 text-sm"><Trash size={16}/> Remove</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showModal && (
                <ModalWrapper onClose={() => setShowModal(false)}>
                    <form onSubmit={handleSaveProduct} className="p-4 sm:p-6 space-y-4">
                        <h3 className="text-xl font-bold text-gray-800">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                        
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Product Name</label>
                            <input name="name" defaultValue={editingProduct?.name} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" required />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">SKU (Opt)</label>
                                <input name="sku" defaultValue={editingProduct?.sku} className="w-full p-3 border rounded-lg" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Category</label>
                                <input name="category" defaultValue={editingProduct?.category} className="w-full p-3 border rounded-lg" required />
                            </div>
                        </div>

                        {/* Pricing Model */}
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <label className="text-xs font-bold text-gray-500 mb-2 block uppercase">Pricing Model</label>
                            <select 
                                name="priceType" 
                                value={formPriceType}
                                onChange={(e) => setFormPriceType(e.target.value as any)}
                                className="w-full p-2 border rounded-lg mb-3"
                            >
                                <option value="fixed">Fixed Price (₹)</option>
                                <option value="unit">Per Unit (₹/unit)</option>
                                <option value="percentage">Percentage Based (%)</option>
                            </select>

                            {formPriceType === 'unit' && (
                                <input name="unitLabel" defaultValue={editingProduct?.unitLabel} placeholder="Unit Name (e.g. sqft, kg)" className="w-full p-2 border rounded-lg mb-3 bg-white" required />
                            )}

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className='text-xs font-bold text-gray-500 mb-1 block'>{formPriceType === 'percentage' ? 'MRP %' : 'MRP (₹)'}</label>
                                    <input name="mrp" type="number" step="0.01" defaultValue={editingProduct?.priceType === 'unit' ? editingProduct.unitRateMRP : editingProduct?.mrp} className="w-full p-2 border rounded-lg bg-white" required />
                                </div>
                                <div>
                                    <label className='text-xs font-bold text-gray-500 mb-1 block'>{formPriceType === 'percentage' ? 'Selling %' : 'Selling (₹)'}</label>
                                    <input name="price" type="number" step="0.01" defaultValue={editingProduct?.priceType === 'unit' ? editingProduct.unitRateSelling : editingProduct?.sellingPrice} className="w-full p-2 border rounded-lg bg-white" required />
                                </div>
                                <div>
                                    <label className='text-xs font-bold text-gray-500 mb-1 block'>{formPriceType === 'percentage' ? 'Franchise %' : 'Franchise (₹)'}</label>
                                    <input name="franchisePrice" type="number" step="0.01" defaultValue={editingProduct?.priceType === 'unit' ? editingProduct.unitRateFranchise : editingProduct?.franchisePrice} className="w-full p-2 border rounded-lg bg-white" required />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Serviceable City</label>
                            <select name="city" defaultValue={editingProduct?.city || vendor.city} className="w-full p-3 border rounded-lg bg-white" required>
                                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Image URL</label>
                            <input name="image" defaultValue={editingProduct?.image} placeholder="https://..." className="w-full p-3 border rounded-lg" />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                            <textarea name="desc" defaultValue={editingProduct?.shortDescription} rows={3} className="w-full p-3 border rounded-lg"></textarea>
                        </div>

                        <button className="w-full bg-orange-600 text-white font-bold py-3.5 rounded-lg hover:bg-orange-700 shadow-lg mt-4">Save Product</button>
                    </form>
                </ModalWrapper>
            )}
        </div>
    );
};
