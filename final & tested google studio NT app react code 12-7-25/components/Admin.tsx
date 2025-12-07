
import React, { useState, useEffect } from 'react';
import { User, Lead, Product, CentralScript } from '../types';
import { ModalWrapper, triggerAlert } from './UI';
import { Trash, Edit, Plus, Users, ShoppingBag, FileText, Phone, Award } from 'lucide-react';
import { CITIES } from '../constants';

interface AdminDashboardProps {
    users: {
        telecallers: Record<string, User>,
        franchisees: Record<string, User>,
        partners: Record<string, User>,
        vendors: Record<string, User>
    };
    leads: Lead[];
    products: Product[];
    scripts: CentralScript[];
    setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
    setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
    setScripts: React.Dispatch<React.SetStateAction<CentralScript[]>>;
    setUsers: (type: string, data: Record<string, User>) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
    users, leads, products, scripts, setLeads, setProducts, setScripts, setUsers 
}) => {
    const [activeTab, setActiveTab] = useState('leads');
    const [editingItem, setEditingItem] = useState<any>(null);
    const [modalType, setModalType] = useState<string | null>(null);
    const [selectedUserType, setSelectedUserType] = useState('telecaller');
    
    // Product Form State
    const [formPriceType, setFormPriceType] = useState<'fixed' | 'unit' | 'percentage'>('fixed');

    useEffect(() => {
        if (modalType === 'product' && editingItem) {
            setFormPriceType(editingItem.priceType || 'fixed');
        } else {
            setFormPriceType('fixed');
        }
    }, [modalType, editingItem]);

    // --- LEADS MANAGEMENT ---
    const handleDeleteLead = (id: number) => {
        if(confirm("Delete this lead?")) {
            setLeads(prev => prev.filter(l => l.leadId !== id));
            triggerAlert("Lead Deleted", "success");
        }
    };

    const handleSaveLead = (e: any) => {
        e.preventDefault();
        const data = {
            leadId: editingItem?.leadId || Date.now(),
            customerName: e.target.name.value,
            customerPhone: e.target.phone.value,
            productRequirement: e.target.req.value,
            currentStatus: e.target.status.value,
            assignedScriptId: e.target.scriptId.value ? parseInt(e.target.scriptId.value) : undefined,
            source: 'Admin Entry',
            telecallerId: null, assignedFranchiseId: null, assignedPartnerId: null,
            contactHistory: editingItem?.contactHistory || []
        };

        if (editingItem) {
            setLeads(prev => prev.map(l => l.leadId === editingItem.leadId ? { ...l, ...data } : l));
        } else {
            setLeads(prev => [...prev, data as Lead]);
        }
        setModalType(null);
        triggerAlert("Lead Saved", "success");
    };

    // --- PRODUCT MANAGEMENT ---
    const handleDeleteProduct = (id: number) => {
        if(confirm("Delete this product?")) {
            setProducts(prev => prev.filter(p => p.id !== id));
            triggerAlert("Product Deleted", "success");
        }
    };

    const handleSaveProduct = (e: any) => {
        e.preventDefault();
        const priceType = e.target.priceType.value;
        
        // Helper to get value based on price type (store in specific fields or general fields)
        // For simplicity: 
        // Fixed: stored in sellingPrice/franchisePrice
        // Percentage: stored in sellingPrice/franchisePrice (as raw %)
        // Unit: stored in unitRateSelling/unitRateFranchise
        
        const mrpVal = parseFloat(e.target.mrp.value);
        const sellingVal = parseFloat(e.target.price.value);
        const franchiseVal = parseFloat(e.target.franchisePrice.value);

        const data: Product = {
            id: editingItem?.id || Date.now(),
            name: e.target.name.value,
            sku: e.target.sku.value,
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
            vendorId: 'System'
        };

        if (editingItem) {
            setProducts(prev => prev.map(p => p.id === editingItem.id ? { ...p, ...data } : p));
        } else {
            setProducts(prev => [...prev, data]);
        }
        setModalType(null);
        triggerAlert("Product Saved", "success");
    };

    // --- SCRIPT MANAGEMENT ---
    const handleSaveScript = (e: any) => {
        e.preventDefault();
        const data: CentralScript = {
            id: editingItem?.id || Date.now(),
            category: e.target.category.value,
            mainScript: e.target.script.value,
            subScripts: [],
            assignedRoles: ['T1']
        };
        if(editingItem) setScripts(prev => prev.map(s => s.id === editingItem.id ? data : s));
        else setScripts(prev => [...prev, data]);
        setModalType(null);
        triggerAlert("Script Saved", "success");
    };

    const handleDeleteScript = (id: number) => {
        if(confirm("Delete this script?")) {
            setScripts(prev => prev.filter(s => s.id !== id));
            triggerAlert("Script Deleted", "success");
        }
    };

    // --- USER MANAGEMENT ---
    const handleSaveUser = (e: any) => {
        e.preventDefault();
        const type = e.target.type.value; // telecaller, franchise, partner, vendor
        const id = e.target.id.value;
        const data: User = {
            id: id,
            name: e.target.name.value,
            password: e.target.password.value,
            role: type,
            city: e.target.city?.value,
            phone: e.target.phone?.value,
            plan: (type === 'vendor' || type === 'franchise') ? e.target.plan?.value : undefined,
            registrationDate: editingItem?.registrationDate || new Date().toISOString().split('T')[0]
        };
        
        const typeKey = type === 'telecaller' ? 'telecallers' : type === 'franchise' ? 'franchisees' : type === 'partner' ? 'partners' : 'vendors';
        const currentCollection = users[typeKey as keyof typeof users];
        
        setUsers(typeKey, { ...currentCollection, [id]: data });
        setModalType(null);
        triggerAlert("User Saved", "success");
    };

    const handleDeleteUser = (typeKey: string, id: string) => {
        if(!confirm(`Delete User ${id}?`)) return;
        
        const currentCollection = { ...users[typeKey as keyof typeof users] };
        delete currentCollection[id];
        
        setUsers(typeKey, currentCollection);
        triggerAlert("User Deleted", "success");
    };

    return (
        <div className="container mx-auto px-4 py-8 pb-20">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">Admin Dashboard</h2>
            
            <div className="flex gap-2 sm:gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                <button onClick={() => setActiveTab('leads')} className={`px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-bold flex items-center gap-2 whitespace-nowrap text-sm sm:text-base ${activeTab === 'leads' ? 'bg-primary text-white' : 'bg-white text-gray-600'}`}><Phone size={16}/> Leads</button>
                <button onClick={() => setActiveTab('products')} className={`px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-bold flex items-center gap-2 whitespace-nowrap text-sm sm:text-base ${activeTab === 'products' ? 'bg-primary text-white' : 'bg-white text-gray-600'}`}><ShoppingBag size={16}/> Products</button>
                <button onClick={() => setActiveTab('users')} className={`px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-bold flex items-center gap-2 whitespace-nowrap text-sm sm:text-base ${activeTab === 'users' ? 'bg-primary text-white' : 'bg-white text-gray-600'}`}><Users size={16}/> Users</button>
                <button onClick={() => setActiveTab('scripts')} className={`px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-bold flex items-center gap-2 whitespace-nowrap text-sm sm:text-base ${activeTab === 'scripts' ? 'bg-primary text-white' : 'bg-white text-gray-600'}`}><FileText size={16}/> Scripts</button>
            </div>

            {/* LEADS TAB */}
            {activeTab === 'leads' && (
                <div className="bg-white rounded-xl shadow p-4 sm:p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg sm:text-xl font-bold">Manage Leads</h3>
                        <button onClick={() => { setEditingItem(null); setModalType('lead'); }} className="bg-green-600 text-white px-3 py-2 rounded-lg flex items-center gap-1 text-sm font-bold"><Plus size={16}/> Add</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[600px]">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="p-3">ID</th>
                                    <th className="p-3">Customer</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leads.map(lead => (
                                    <tr key={lead.leadId} className="border-b hover:bg-gray-50">
                                        <td className="p-3">{lead.leadId}</td>
                                        <td className="p-3"><span className="font-bold">{lead.customerName}</span><br/><span className="text-xs text-gray-500">{lead.customerPhone}</span></td>
                                        <td className="p-3"><span className="bg-gray-100 text-xs px-2 py-1 rounded">{lead.currentStatus}</span></td>
                                        <td className="p-3 flex gap-2">
                                            <button onClick={() => { setEditingItem(lead); setModalType('lead'); }} className="text-blue-600 p-1 hover:bg-blue-50 rounded"><Edit size={16}/></button>
                                            <button onClick={() => handleDeleteLead(lead.leadId)} className="text-red-600 p-1 hover:bg-red-50 rounded"><Trash size={16}/></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* PRODUCTS TAB */}
            {activeTab === 'products' && (
                <div className="bg-white rounded-xl shadow p-4 sm:p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg sm:text-xl font-bold">Manage Products</h3>
                        <button onClick={() => { setEditingItem(null); setModalType('product'); }} className="bg-green-600 text-white px-3 py-2 rounded-lg flex items-center gap-1 text-sm font-bold"><Plus size={16}/> Add</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {products.map(p => (
                            <div key={p.id} className="border rounded-lg p-4 relative bg-gray-50">
                                <h4 className="font-bold text-gray-800 pr-16 truncate">{p.name}</h4>
                                <p className="text-xs text-gray-500 mb-2">SKU: {p.sku} | Type: <span className="uppercase font-bold">{p.priceType}</span></p>
                                <div className="text-sm space-y-1">
                                    <p>MRP: <span className="text-gray-600">{p.priceType === 'percentage' ? `${p.mrp}%` : `₹${p.priceType === 'unit' ? p.unitRateMRP : p.mrp}`}</span></p>
                                    <p>Selling: <span className="font-bold">{p.priceType === 'percentage' ? `${p.sellingPrice}%` : `₹${p.priceType === 'unit' ? p.unitRateSelling : p.sellingPrice}`}</span></p>
                                    <p className="text-red-600 font-medium">Franchise: {p.priceType === 'percentage' ? `${p.franchisePrice}%` : `₹${p.priceType === 'unit' ? p.unitRateFranchise : p.franchisePrice}`}</p>
                                    <p className="text-xs text-gray-400">Vendor: {p.vendorId || 'System'}</p>
                                </div>
                                <div className="absolute top-2 right-2 flex gap-1">
                                    <button onClick={() => { setEditingItem(p); setModalType('product'); }} className="text-blue-600 bg-white p-1.5 rounded border hover:bg-blue-50"><Edit size={14}/></button>
                                    <button onClick={() => handleDeleteProduct(p.id)} className="text-red-600 bg-white p-1.5 rounded border hover:bg-red-50"><Trash size={14}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* USERS TAB */}
            {activeTab === 'users' && (
                <div className="bg-white rounded-xl shadow p-4 sm:p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg sm:text-xl font-bold">Manage Users</h3>
                        <button onClick={() => { setEditingItem(null); setModalType('user'); }} className="bg-green-600 text-white px-3 py-2 rounded-lg flex items-center gap-1 text-sm font-bold"><Plus size={16}/> Add</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Object.entries(users).map(([type, userMap]) => (
                            <div key={type} className="border rounded-lg p-4">
                                <h4 className="font-bold uppercase text-gray-600 mb-3 border-b pb-2 text-sm tracking-wide">{type}</h4>
                                <ul className="space-y-2">
                                    {Object.values(userMap).map(u => (
                                        <li key={u.id} className="flex justify-between items-center bg-gray-50 p-2 rounded hover:bg-gray-100">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-sm flex items-center gap-2">
                                                    {u.name}
                                                    {(u.role === 'vendor' || u.role === 'franchise') && (
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${u.plan === 'paid' ? 'bg-amber-100 text-amber-700' : 'bg-gray-200 text-gray-600'}`}>
                                                            {u.plan || 'basic'}
                                                        </span>
                                                    )}
                                                </span>
                                                <span className="text-xs text-gray-500 font-mono">{u.id}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => { setEditingItem({...u, type: type.slice(0, -1)}); setSelectedUserType(type === 'vendors' ? 'vendor' : type === 'franchisees' ? 'franchise' : type.slice(0, -1)); setModalType('user'); }} className="text-blue-500 text-xs font-bold bg-blue-50 px-2 py-1 rounded"><Edit size={14}/></button>
                                                <button onClick={() => handleDeleteUser(type, u.id)} className="text-red-500 text-xs font-bold bg-red-50 px-2 py-1 rounded"><Trash size={14}/></button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* SCRIPTS TAB */}
            {activeTab === 'scripts' && (
                <div className="bg-white rounded-xl shadow p-4 sm:p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg sm:text-xl font-bold">Calling Scripts</h3>
                        <button onClick={() => { setEditingItem(null); setModalType('script'); }} className="bg-green-600 text-white px-3 py-2 rounded-lg flex items-center gap-1 text-sm font-bold"><Plus size={16}/> New</button>
                    </div>
                    <div className="space-y-4">
                        {scripts.map(s => (
                            <div key={s.id} className="border p-4 rounded-lg bg-gray-50 relative">
                                <div className="flex justify-between items-start mb-2 pr-16">
                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold uppercase">{s.category}</span>
                                </div>
                                <p className="text-gray-700 italic text-sm">"{s.mainScript}"</p>
                                <div className="absolute top-2 right-2 flex gap-1">
                                    <button onClick={() => { setEditingItem(s); setModalType('script'); }} className="text-blue-600 bg-white p-1.5 rounded border hover:bg-blue-50"><Edit size={14}/></button>
                                    <button onClick={() => handleDeleteScript(s.id)} className="text-red-600 bg-white p-1.5 rounded border hover:bg-red-50"><Trash size={14}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* MODALS */}
            {modalType === 'lead' && (
                <ModalWrapper onClose={() => setModalType(null)}>
                    <form onSubmit={handleSaveLead} className="p-4 sm:p-6 space-y-4">
                        <h3 className="text-xl font-bold">{editingItem ? 'Edit' : 'Add'} Lead</h3>
                        <input name="name" defaultValue={editingItem?.customerName} placeholder="Customer Name" className="w-full p-3 border rounded-lg" required />
                        <input name="phone" defaultValue={editingItem?.customerPhone} placeholder="Phone" className="w-full p-3 border rounded-lg" required />
                        <input name="req" defaultValue={editingItem?.productRequirement} placeholder="Requirement (e.g. Loans)" className="w-full p-3 border rounded-lg" required />
                        
                        <div>
                            <label className="text-xs font-bold text-gray-500 mb-1 block">Assign Specific Script (Optional)</label>
                            <select name="scriptId" defaultValue={editingItem?.assignedScriptId || ''} className="w-full p-3 border rounded-lg bg-white">
                                <option value="">Auto-Detect by Category</option>
                                {scripts.map(s => (
                                    <option key={s.id} value={s.id}>{s.category} - {s.mainScript.substring(0, 30)}...</option>
                                ))}
                            </select>
                        </div>

                        <select name="status" defaultValue={editingItem?.currentStatus || 'Pending'} className="w-full p-3 border rounded-lg bg-white">
                            <option value="Pending">Pending</option>
                            <option value="Interested">Interested</option>
                            <option value="Contacted">Contacted</option>
                        </select>
                        <button className="w-full bg-primary text-white py-3 rounded-lg font-bold shadow-md">Save Lead</button>
                    </form>
                </ModalWrapper>
            )}

            {modalType === 'product' && (
                <ModalWrapper onClose={() => setModalType(null)}>
                    <form onSubmit={handleSaveProduct} className="p-4 sm:p-6 space-y-4">
                        <h3 className="text-xl font-bold">{editingItem ? 'Edit' : 'Add'} Product</h3>
                        <input name="name" defaultValue={editingItem?.name} placeholder="Product Name" className="w-full p-3 border rounded-lg" required />
                        <div className="flex gap-3">
                            <input name="sku" defaultValue={editingItem?.sku} placeholder="SKU" className="w-1/2 p-3 border rounded-lg" required />
                            <input name="category" defaultValue={editingItem?.category} placeholder="Category" className="w-1/2 p-3 border rounded-lg" required />
                        </div>
                        <div className="flex gap-2">
                            <select name="city" defaultValue={editingItem?.city || 'All Karnataka'} className="w-full p-3 border rounded-lg bg-white" required>
                                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
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
                                <input name="unitLabel" defaultValue={editingItem?.unitLabel} placeholder="Unit Name (e.g. sqft, kg)" className="w-full p-2 border rounded-lg mb-3 bg-white" required />
                            )}

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className='text-xs font-bold text-gray-500 mb-1 block'>{formPriceType === 'percentage' ? 'MRP %' : 'MRP (₹)'}</label>
                                    <input name="mrp" type="number" step="0.01" defaultValue={editingItem?.priceType === 'unit' ? editingItem.unitRateMRP : editingItem?.mrp} className="w-full p-2 border rounded-lg bg-white" required />
                                </div>
                                <div>
                                    <label className='text-xs font-bold text-gray-500 mb-1 block'>{formPriceType === 'percentage' ? 'Selling %' : 'Selling (₹)'}</label>
                                    <input name="price" type="number" step="0.01" defaultValue={editingItem?.priceType === 'unit' ? editingItem.unitRateSelling : editingItem?.sellingPrice} className="w-full p-2 border rounded-lg bg-white" required />
                                </div>
                                <div>
                                    <label className='text-xs font-bold text-gray-500 mb-1 block'>{formPriceType === 'percentage' ? 'Franchise %' : 'Franchise (₹)'}</label>
                                    <input name="franchisePrice" type="number" step="0.01" defaultValue={editingItem?.priceType === 'unit' ? editingItem.unitRateFranchise : editingItem?.franchisePrice} className="w-full p-2 border rounded-lg bg-white" required />
                                </div>
                            </div>
                        </div>

                        <input name="image" defaultValue={editingItem?.image} placeholder="Image URL" className="w-full p-3 border rounded-lg" />
                        <textarea name="desc" defaultValue={editingItem?.shortDescription} placeholder="Description" className="w-full p-3 border rounded-lg h-24"></textarea>
                        <button className="w-full bg-primary text-white py-3 rounded-lg font-bold shadow-md">Save Product</button>
                    </form>
                </ModalWrapper>
            )}

            {modalType === 'script' && (
                <ModalWrapper onClose={() => setModalType(null)}>
                    <form onSubmit={handleSaveScript} className="p-4 sm:p-6 space-y-4">
                        <h3 className="text-xl font-bold">{editingItem ? 'Edit' : 'Add'} Script</h3>
                        <input name="category" defaultValue={editingItem?.category} placeholder="Category" className="w-full p-3 border rounded-lg" required />
                        <textarea name="script" defaultValue={editingItem?.mainScript} placeholder="Script Content..." className="w-full p-3 border rounded-lg h-32" required></textarea>
                        <button className="w-full bg-primary text-white py-3 rounded-lg font-bold shadow-md">Save Script</button>
                    </form>
                </ModalWrapper>
            )}

            {modalType === 'user' && (
                <ModalWrapper onClose={() => setModalType(null)}>
                    <form onSubmit={handleSaveUser} className="p-4 sm:p-6 space-y-4">
                        <h3 className="text-xl font-bold">{editingItem ? 'Edit' : 'Add'} User</h3>
                        <select 
                            name="type" 
                            value={selectedUserType} 
                            onChange={(e) => setSelectedUserType(e.target.value)}
                            disabled={!!editingItem} 
                            className="w-full p-3 border rounded-lg bg-white"
                        >
                            <option value="telecaller">Telecaller</option>
                            <option value="franchise">Franchise</option>
                            <option value="partner">Partner</option>
                            <option value="vendor">Vendor</option>
                        </select>
                        <input name="name" defaultValue={editingItem?.name} placeholder="Name" className="w-full p-3 border rounded-lg" required />
                        <input name="id" defaultValue={editingItem?.id} placeholder="ID (Unique)" disabled={!!editingItem} className="w-full p-3 border rounded-lg" required />
                        <input name="password" defaultValue={editingItem?.password} placeholder="Password" className="w-full p-3 border rounded-lg" required />
                        <div className="flex gap-2">
                             <input name="city" defaultValue={editingItem?.city} placeholder="City (Optional)" className="w-1/2 p-3 border rounded-lg" />
                             <input name="phone" defaultValue={editingItem?.phone} placeholder="Phone (Optional)" className="w-1/2 p-3 border rounded-lg" />
                        </div>
                        
                        {(selectedUserType === 'vendor' || selectedUserType === 'franchise') && (
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-1 block">Subscription Plan</label>
                                <select name="plan" defaultValue={editingItem?.plan || 'basic'} className="w-full p-3 border rounded-lg bg-white">
                                    <option value="basic">Basic (Limited/30 Days)</option>
                                    <option value="paid">Paid (Unlimited)</option>
                                </select>
                            </div>
                        )}

                        <button className="w-full bg-primary text-white py-3 rounded-lg font-bold shadow-md">Save User</button>
                    </form>
                </ModalWrapper>
            )}
        </div>
    );
};
