
import React, { useState, useEffect, useMemo } from 'react';
import { 
    INITIAL_PRODUCTS_DATA, INITIAL_LEADS_DATA, INITIAL_ORDERS_DATA, 
    MOCK_TELECALLERS_INITIAL, MOCK_FRANCHISEES_INITIAL, MOCK_PARTNERS_INITIAL, MOCK_VENDORS_INITIAL,
    INITIAL_CENTRAL_SCRIPTS, CITIES, ADMIN_PASSWORD, FRANCHISE_PASSWORD 
} from './constants';
import { Product, Lead, Order, User, CentralScript, Cart, CartItem } from './types';
import { Header, ModalWrapper, AlertContainer, triggerAlert } from './components/UI';
import { ProductCard, ProductDetails } from './components/Products';
import { LeadTable, CallActionModal, LeadFormModal } from './components/Leads';
import { AdminDashboard } from './components/Admin';
import { VendorDashboard } from './components/Vendor';
import { CartView, CheckoutModal } from './components/Cart';
import { OrdersModal } from './components/Orders';
import { AuthModal } from './components/Auth';
import { Plus, Download, Clock, Phone, FileText, AlertTriangle, PhoneCall, Calendar, Award, Search, Filter, Tag, ArrowUpDown, MapPin } from 'lucide-react';

const currencyFormatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 });

const App: React.FC = () => {
    // --- STATE ---
    const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS_DATA);
    const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS_DATA);
    const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS_DATA);
    const [scripts, setScripts] = useState<CentralScript[]>(INITIAL_CENTRAL_SCRIPTS);
    const [cart, setCart] = useState<Cart>({});

    // Users State (Now managed in state for Admin CRUD)
    const [users, setUsers] = useState({
        telecallers: MOCK_TELECALLERS_INITIAL,
        franchisees: MOCK_FRANCHISEES_INITIAL,
        partners: MOCK_PARTNERS_INITIAL,
        vendors: MOCK_VENDORS_INITIAL
    });

    // Auth State
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [userRole, setUserRole] = useState<'admin' | 'telecaller' | 'franchise' | 'partner' | 'vendor' | 'guest'>('guest');
    const [isFranchiseView, setIsFranchiseView] = useState(false); // For price toggle only
    const [dashboardTab, setDashboardTab] = useState<'leads' | 'catalog'>('leads');

    // UI State
    const [modalView, setModalView] = useState<string | null>(null);
    const [selectedItem, setSelectedItem] = useState<any>(null); // Generic holder for modal data
    const [filters, setFilters] = useState({ search: '', category: 'All', city: 'All', maxPrice: 100000, sortBy: 'default' });

    // --- EFFECTS ---
    useEffect(() => {
        // Load persistent data here if implementing localStorage
    }, []);

    // --- COMPUTED ---
    const filteredProducts = useMemo(() => {
        let result = products.filter(p => {
            const matchSearch = p.name.toLowerCase().includes(filters.search.toLowerCase()) || p.sku.toLowerCase().includes(filters.search.toLowerCase());
            const matchCat = filters.category === 'All' || p.category === filters.category;
            const matchCity = filters.city === 'All' || p.city === filters.city || p.city === 'All Karnataka';
            
            // CORRECTED: Check both state flag AND user role to ensure franchise users see correct price filtering
            const showFranchisePrice = isFranchiseView || userRole === 'franchise';
            const price = showFranchisePrice ? p.franchisePrice : p.sellingPrice;
            
            const matchPrice = price <= filters.maxPrice;
            return matchSearch && matchCat && matchCity && matchPrice && (userRole === 'admin' || p.isVisible);
        });

        // Sorting Logic
        if (filters.sortBy === 'price-low-high') {
            result.sort((a, b) => {
                const priceA = (isFranchiseView || userRole === 'franchise') ? a.franchisePrice : a.sellingPrice;
                const priceB = (isFranchiseView || userRole === 'franchise') ? b.franchisePrice : b.sellingPrice;
                return priceA - priceB;
            });
        } else if (filters.sortBy === 'price-high-low') {
            result.sort((a, b) => {
                const priceA = (isFranchiseView || userRole === 'franchise') ? a.franchisePrice : a.sellingPrice;
                const priceB = (isFranchiseView || userRole === 'franchise') ? b.franchisePrice : b.sellingPrice;
                return priceB - priceA;
            });
        }

        return result;
    }, [products, filters, isFranchiseView, userRole]);

    const cartCount = Object.values(cart).reduce((a: number, b: CartItem) => a + b.quantity, 0);

    // --- HANDLERS ---
    
    // Auth
    const handleLogin = (role: string, id: string, pass: string) => {
        if (role === 'admin') {
            if (pass === ADMIN_PASSWORD) {
                setUserRole('admin');
                setCurrentUser({ id: 'ADMIN', name: 'Administrator' });
                setModalView(null);
                triggerAlert('Welcome Admin', 'success');
            } else triggerAlert('Invalid Admin Password', 'error');
        } else if (role === 'vendor') {
            const user = users.vendors[id];
            if (user && user.password === pass) {
                setUserRole('vendor');
                setCurrentUser(user);
                setModalView(null);
                triggerAlert(`Welcome ${user.name}`, 'success');
            } else triggerAlert('Invalid Vendor Credentials', 'error');
        } else if (role === 'telecaller') {
            const user = users.telecallers[id];
            if (user && user.password === pass) {
                setUserRole('telecaller');
                setCurrentUser(user);
                setModalView(null);
                triggerAlert(`Welcome ${user.name}`, 'success');
            } else triggerAlert('Invalid Credentials', 'error');
        } else if (role === 'franchise') {
            const user = users.franchisees[id];
            if (user && user.password === pass) {
                // FRANCHISE EXPIRY CHECK
                if (user.plan === 'basic') {
                    // Default to today if date missing (for legacy data compatibility)
                    const regDate = new Date(user.registrationDate || new Date().toISOString());
                    const today = new Date();
                    const diffTime = Math.abs(today.getTime() - regDate.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

                    if (diffDays > 30) {
                        setModalView('franchise-expired');
                        return; // Stop login
                    }
                }

                setUserRole('franchise');
                setCurrentUser(user);
                setIsFranchiseView(true); // Auto enable franchise prices
                setModalView(null);
                triggerAlert(`Welcome ${user.name}`, 'success');
            } else triggerAlert('Invalid Credentials', 'error');
        } else if (role === 'partner') {
             const user = users.partners[id];
             if (user && user.password === pass) {
                 setUserRole('partner');
                 setCurrentUser(user);
                 setModalView(null);
                 triggerAlert(`Welcome ${user.name}`, 'success');
             } else triggerAlert('Invalid Credentials', 'error');
        } else {
            // Generic Login fallback if role not specified (though AuthModal handles role)
            triggerAlert('Please select a role', 'info');
        }
    };

    const handleRegister = (user: User, typeKey: string) => {
        setUsers(prev => ({
            ...prev,
            [typeKey]: {
                ...prev[typeKey as keyof typeof prev],
                [user.id]: user
            }
        }));
        
        // Auto Login
        setUserRole(user.role as any);
        setCurrentUser(user);
        if (user.role === 'franchise') setIsFranchiseView(true);
        
        setModalView(null);
        triggerAlert(`Registration Successful! ID: ${user.id}`, 'success');
    };

    const handleLogout = () => {
        setUserRole('guest');
        setCurrentUser(null);
        setIsFranchiseView(false);
        setDashboardTab('leads');
        triggerAlert('Logged Out', 'info');
    };

    const handleGoHome = () => {
        setModalView(null);
        setSelectedItem(null);
        setFilters({ search: '', category: 'All', city: 'All', maxPrice: 100000, sortBy: 'default' });
        // Keeps user logged in, just resets UI views
    };

    const updateUserState = (typeKey: string, newData: Record<string, User>) => {
        setUsers(prev => ({ ...prev, [typeKey]: newData }));
    };

    // Cart
    const addToCart = (product: Product, qty: number = 1) => {
        setCart(prev => ({
            ...prev,
            [product.id]: { product, quantity: (prev[product.id]?.quantity || 0) + qty }
        }));
        triggerAlert('Added to Cart', 'success');
        setModalView(null);
    };

    const updateCartQty = (productId: number, qty: number) => {
        setCart(prev => ({
            ...prev,
            [productId]: { ...prev[productId], quantity: qty }
        }));
    };

    const removeFromCart = (productId: number) => {
        const newCart = { ...cart };
        delete newCart[productId];
        setCart(newCart);
    };

    const handleOrderPlaced = (order: Order) => {
        setOrders(prev => [...prev, order]);
        setCart({});
        setModalView(null);
        triggerAlert("Order Placed Successfully", "success");
    };

    // Leads
    const handleLeadLog = (status: string, comments: string, followUp: string, duration: number) => {
        if (!selectedItem) return;
        
        // NEW: Adjust duration to account for dialing overhead (20s)
        // Ensure effective talk time is at least 0 if call was very short/unconnected
        const effectiveDuration = Math.max(0, duration - 20);

        const newHistory = {
            status, 
            comments, 
            callTimeSeconds: effectiveDuration, 
            callDate: new Date().toISOString().split('T')[0],
            nextFollowupDate: followUp || null,
            loggedBy: currentUser?.id || 'System'
        };

        setLeads(prev => prev.map(l => l.leadId === selectedItem.leadId ? {
            ...l,
            currentStatus: status,
            contactHistory: [...l.contactHistory, newHistory]
        } : l));
        
        triggerAlert(`Call Logged. Effective Talk Time: ${effectiveDuration}s`, 'success');
        setModalView(null);
        setSelectedItem(null);
    };

    const handleUserAddLead = (data: any) => {
        const newLead: Lead = {
            leadId: Date.now(),
            customerName: data.customerName,
            customerPhone: data.customerPhone,
            productRequirement: data.productRequirement,
            source: `Manual (${currentUser?.name})`,
            currentStatus: data.currentStatus,
            contactHistory: [{
                status: data.currentStatus,
                comments: 'Lead added manually via dashboard.',
                callDate: new Date().toISOString().split('T')[0],
                callTimeSeconds: 0,
                nextFollowupDate: null,
                loggedBy: currentUser?.id || 'System'
            }],
            telecallerId: userRole === 'telecaller' ? currentUser?.id || null : null,
            assignedFranchiseId: userRole === 'franchise' ? currentUser?.id || null : null,
            assignedPartnerId: userRole === 'partner' ? currentUser?.id || null : null,
            assignedScriptId: data.assignedScriptId
        };
    
        setLeads(prev => [...prev, newLead]);
        setModalView(null);
        triggerAlert("Lead Added Successfully", "success");
    };

    const handleDownloadReport = (myLeads: Lead[], totalCalls: number, totalTalkTime: number) => {
        const reportWindow = window.open('', 'PRINT', 'height=600,width=800');
        if (!reportWindow) return;

        const date = new Date().toLocaleDateString();
        
        reportWindow.document.write(`
            <html>
                <head>
                    <title>Performance & Detailed History Report - ${currentUser?.name}</title>
                    <style>
                        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; background: #fff; }
                        .header { border-bottom: 3px solid #1e40af; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
                        h1 { color: #1e40af; margin: 0; font-size: 28px; letter-spacing: -0.5px; }
                        .meta { font-size: 14px; color: #666; margin-top: 5px; }
                        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px; }
                        .stat-box { background: #f8f9fa; padding: 25px; border-radius: 12px; text-align: center; border: 1px solid #e9ecef; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
                        .stat-val { font-size: 32px; font-weight: bold; color: #1e40af; margin-bottom: 8px; line-height: 1; }
                        .stat-label { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
                        
                        h2 { font-size: 20px; margin-bottom: 20px; color: #333; border-left: 5px solid #1e40af; padding-left: 15px; }
                        
                        .lead-section { margin-bottom: 35px; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; page-break-inside: avoid; box-shadow: 0 2px 5px rgba(0,0,0,0.03); }
                        .lead-header { background: #f1f5f9; padding: 12px 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
                        .lead-title { font-weight: bold; font-size: 16px; color: #1e293b; }
                        .lead-status { background: #fff; px: 10px; py: 4px; border-radius: 4px; font-size: 12px; font-weight: bold; color: #475569; padding: 4px 8px; border: 1px solid #cbd5e1; }
                        
                        .history-table { width: 100%; border-collapse: collapse; font-size: 13px; }
                        .history-table th { background: #fff; border-bottom: 2px solid #f1f5f9; text-align: left; padding: 10px 20px; color: #64748b; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
                        .history-table td { padding: 12px 20px; border-bottom: 1px solid #f1f5f9; vertical-align: top; color: #334155; line-height: 1.5; }
                        .history-table tr:last-child td { border-bottom: none; }
                        .history-table tr:nth-child(even) { background-color: #fafbfc; }
                        
                        .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 600; }
                        .badge-completed { background: #dcfce7; color: #166534; }
                        
                        .footer { margin-top: 60px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div>
                            <h1>Daily Activity Report</h1>
                            <div class="meta">Agent: <strong>${currentUser?.name}</strong> (ID: ${currentUser?.id})</div>
                        </div>
                        <div class="meta">Report Date: ${date}</div>
                    </div>

                    <div class="stats-grid">
                        <div class="stat-box">
                            <div class="stat-val">${totalCalls}</div>
                            <div class="stat-label">Total Interactions</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-val">${Math.floor(totalTalkTime / 60)}m ${totalTalkTime % 60}s</div>
                            <div class="stat-label">Total Effective Talk Time</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-val">${myLeads.length}</div>
                            <div class="stat-label">Active Leads Worked</div>
                        </div>
                    </div>

                    <h2>Detailed Call Logs & Follow-ups</h2>

                    ${myLeads.length > 0 ? myLeads.map(lead => `
                        <div class="lead-section">
                            <div class="lead-header">
                                <span class="lead-title">${lead.customerName} <span style="font-weight:normal; color:#64748b; font-size:14px;">(${lead.customerPhone})</span></span>
                                <span class="lead-status">${lead.currentStatus}</span>
                            </div>
                            <table class="history-table">
                                <thead>
                                    <tr>
                                        <th width="15%">Date</th>
                                        <th width="15%">Logged By</th>
                                        <th width="15%">Outcome</th>
                                        <th width="10%">Eff. Duration</th>
                                        <th width="45%">Comments / Notes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${lead.contactHistory.length > 0 ? lead.contactHistory.map(h => `
                                        <tr>
                                            <td>${h.callDate}</td>
                                            <td>${h.loggedBy}</td>
                                            <td><strong>${h.status}</strong></td>
                                            <td>${h.callTimeSeconds}s</td>
                                            <td>${h.comments}</td>
                                        </tr>
                                    `).join('') : '<tr><td colspan="5" style="text-align:center; color:#999; padding: 20px;">No history recorded yet.</td></tr>'}
                                </tbody>
                            </table>
                        </div>
                    `).join('') : '<p style="text-align:center; color:#666; font-style:italic;">No leads assigned or worked on yet.</p>'}

                    <div class="footer">
                        Generated via NirmaanTech Portal System • ${new Date().toLocaleString()}
                    </div>
                </body>
            </html>
        `);

        reportWindow.document.close();
        reportWindow.focus();
        setTimeout(() => {
            reportWindow.print();
            reportWindow.close();
        }, 500);
    };

    // --- RENDER HELPERS ---
    const renderAuthModal = () => (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4 capitalize">{modalView?.split('-')[0]} Login</h2>
            <form onSubmit={(e) => {
                e.preventDefault();
                const target = e.target as any;
                handleLogin(modalView?.split('-')[0] || '', target.username?.value || '', target.password.value);
            }} className="space-y-4">
                {modalView !== 'admin-auth' && (
                    <input name="username" placeholder="User ID (e.g. T1, F1, V1)" className="w-full p-3 border rounded-lg" required />
                )}
                <input name="password" type="password" placeholder="Password" className="w-full p-3 border rounded-lg" required />
                <button className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-blue-900 transition">Login</button>
            </form>
            {modalView === 'franchise-auth' && !currentUser && (
                <div className="mt-4 pt-4 border-t text-center">
                    <p className="text-sm text-gray-500 mb-2">Just want to check prices?</p>
                    <button type="button" onClick={() => {
                        const pass = prompt("Enter Franchise Price Password");
                        if(pass === FRANCHISE_PASSWORD) { setIsFranchiseView(true); setModalView(null); triggerAlert("Price View Enabled", "success"); }
                        else alert("Wrong Password");
                    }} className="text-accent font-bold hover:underline">Enable Price View Only</button>
                </div>
            )}
        </div>
    );

    const renderCatalog = () => (
        <>
            <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-col gap-4 border border-gray-100 sticky top-16 z-30">
                {/* Row 1: Search */}
                <div className="relative w-full">
                    <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
                    <input 
                        placeholder="Search for products, services, or SKUs..." 
                        className="w-full pl-11 p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none bg-gray-50 text-gray-800"
                        value={filters.search}
                        onChange={e => setFilters({...filters, search: e.target.value})}
                    />
                </div>

                {/* Row 2: Filters */}
                <div className="flex flex-wrap items-center gap-3">
                    {/* City Filter */}
                    <div className="relative flex-grow sm:flex-grow-0 min-w-[140px]">
                        <MapPin size={16} className="absolute left-3 top-3 text-gray-500"/>
                        <select 
                            className="w-full pl-9 p-2.5 border rounded-lg bg-white text-sm focus:ring-2 focus:ring-primary outline-none appearance-none font-medium text-gray-700"
                            value={filters.city}
                            onChange={e => setFilters({...filters, city: e.target.value})}
                        >
                            <option value="All">All Cities</option>
                            {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    {/* Category Filter */}
                    <div className="relative flex-grow sm:flex-grow-0 min-w-[140px]">
                        <Tag size={16} className="absolute left-3 top-3 text-gray-500"/>
                        <select 
                            className="w-full pl-9 p-2.5 border rounded-lg bg-white text-sm focus:ring-2 focus:ring-primary outline-none appearance-none font-medium text-gray-700"
                            value={filters.category}
                            onChange={e => setFilters({...filters, category: e.target.value})}
                        >
                            <option value="All">All Categories</option>
                            {Array.from(new Set(products.map(p => p.category))).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    {/* Sort Filter */}
                    <div className="relative flex-grow sm:flex-grow-0 min-w-[140px]">
                        <ArrowUpDown size={16} className="absolute left-3 top-3 text-gray-500"/>
                        <select 
                            className="w-full pl-9 p-2.5 border rounded-lg bg-white text-sm focus:ring-2 focus:ring-primary outline-none appearance-none font-medium text-gray-700"
                            value={filters.sortBy}
                            onChange={e => setFilters({...filters, sortBy: e.target.value})}
                        >
                            <option value="default">Relevance</option>
                            <option value="price-low-high">Price: Low to High</option>
                            <option value="price-high-low">Price: High to Low</option>
                        </select>
                    </div>
                    
                    {/* Price Range Filter - Compact */}
                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border flex-grow sm:flex-grow-0">
                        <span className="text-xs font-bold text-gray-500 whitespace-nowrap">Max: {currencyFormatter.format(filters.maxPrice)}</span>
                        <input 
                            type="range" 
                            min="0" 
                            max="100000" 
                            step="1000"
                            value={filters.maxPrice} 
                            onChange={e => setFilters({...filters, maxPrice: parseInt(e.target.value)})}
                            className="w-24 h-1.5 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                    </div>
                </div>

                {(isFranchiseView || userRole === 'franchise') && (
                    <div className="border-t pt-2 mt-1">
                        <span className="text-red-600 font-bold px-2 py-1 bg-red-50 rounded border border-red-200 text-xs flex items-center gap-1 w-fit">
                            <Tag size={12}/> Franchise Pricing Active
                        </span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map(product => (
                    <ProductCard 
                        key={product.id} 
                        product={product} 
                        isFranchise={isFranchiseView || userRole === 'franchise'}
                        cartQty={cart[product.id]?.quantity || 0}
                        isAdmin={userRole === 'admin'}
                        onAdd={() => { setSelectedItem(product); setModalView('product-details'); }}
                        onView={() => { setSelectedItem(product); setModalView('product-details'); }}
                    />
                ))}
            </div>
        </>
    );

    const renderDashboard = () => {
        // Admin Dashboard
        if (userRole === 'admin') {
            return (
                <AdminDashboard 
                    users={users} 
                    leads={leads} 
                    products={products}
                    scripts={scripts}
                    setLeads={setLeads}
                    setProducts={setProducts}
                    setScripts={setScripts}
                    setUsers={updateUserState}
                />
            );
        }

        // Vendor Dashboard
        if (userRole === 'vendor' && currentUser) {
            return (
                <VendorDashboard 
                    vendor={currentUser}
                    products={products}
                    setProducts={setProducts}
                />
            );
        }

        // Standard User Dashboard (Telecaller, Franchise, Partner)
        const myLeads = leads.filter(l => {
            if (userRole === 'telecaller') return l.telecallerId === currentUser?.id;
            if (userRole === 'franchise') return l.assignedFranchiseId === currentUser?.id;
            if (userRole === 'partner') return l.assignedPartnerId === currentUser?.id;
            return true;
        });

        // Calculate Metrics
        let totalCalls = 0;
        let totalTalkTimeSeconds = 0;
        
        myLeads.forEach(lead => {
            const myInteractions = lead.contactHistory.filter(h => h.loggedBy === currentUser?.id);
            totalCalls += myInteractions.length;
            totalTalkTimeSeconds += myInteractions.reduce((acc, curr) => acc + curr.callTimeSeconds, 0);
        });

        const interested = myLeads.filter(l => l.currentStatus === 'Interested').length;

        // FRANCHISE TRIAL LOGIC
        let trialWidget = null;
        if (userRole === 'franchise' && currentUser) {
            const isPaid = currentUser.plan === 'paid';
            let daysLeft = 0;
            let percentLeft = 100;

            if (!isPaid) {
                const regDate = new Date(currentUser.registrationDate || new Date().toISOString());
                const today = new Date();
                const diffTime = Math.abs(today.getTime() - regDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                daysLeft = Math.max(0, 30 - diffDays);
                percentLeft = (daysLeft / 30) * 100;
            }

            trialWidget = (
                <div className={`p-4 rounded-xl mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-l-4 shadow-sm ${isPaid ? 'bg-yellow-50 border-yellow-500' : daysLeft < 5 ? 'bg-red-50 border-red-500' : 'bg-emerald-50 border-emerald-500'}`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-full ${isPaid ? 'bg-yellow-100 text-yellow-600' : daysLeft < 5 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                            {isPaid ? <Award size={24}/> : <Calendar size={24}/>}
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 text-lg">
                                {isPaid ? 'Premium Franchise Partner' : `Basic Trial: ${daysLeft} Days Remaining`}
                            </h3>
                            <p className="text-sm text-gray-600">
                                {isPaid ? 'You have unlimited access to all features and special pricing.' : 'Upgrade to Paid Plan for uninterrupted service.'}
                            </p>
                        </div>
                    </div>
                    
                    {!isPaid && (
                        <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
                            <div className="w-full sm:w-48 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${daysLeft < 5 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{width: `${percentLeft}%`}}></div>
                            </div>
                            <a href="tel:+918073126541" className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold shadow hover:bg-blue-800 transition flex items-center gap-2">
                                <PhoneCall size={14}/> Contact Sales to Upgrade
                            </a>
                        </div>
                    )}
                </div>
            );
        }

        return (
            <div className="container mx-auto px-4 py-8">
                {/* TABS */}
                <div className="flex gap-2 mb-6 bg-white p-1 rounded-xl shadow-sm w-fit mx-auto sm:mx-0">
                    <button 
                        onClick={() => setDashboardTab('leads')}
                        className={`px-6 py-2 rounded-lg font-bold text-sm transition ${dashboardTab === 'leads' ? 'bg-primary text-white shadow' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        My Dashboard
                    </button>
                    <button 
                        onClick={() => setDashboardTab('catalog')}
                        className={`px-6 py-2 rounded-lg font-bold text-sm transition ${dashboardTab === 'catalog' ? 'bg-primary text-white shadow' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        Product Catalog
                    </button>
                </div>

                {dashboardTab === 'leads' ? (
                    <>
                        {trialWidget}

                        <div className="bg-white rounded-xl shadow p-6 mb-8">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                                <h2 className="text-2xl font-bold text-gray-800">Dashboard: {currentUser?.name}</h2>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => handleDownloadReport(myLeads, totalCalls, totalTalkTimeSeconds)}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold shadow-md flex items-center gap-2 hover:bg-blue-700 transition text-sm"
                                    >
                                        <Download size={16} /> PDF Report
                                    </button>
                                    <button 
                                        onClick={() => setModalView('add-lead')}
                                        className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold shadow-md flex items-center gap-2 hover:bg-green-700 transition text-sm"
                                    >
                                        <Plus size={16} /> Add Lead
                                    </button>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1"><FileText size={14}/> Assigned Leads</div>
                                    <p className="text-2xl font-bold text-blue-800">{myLeads.length}</p>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1"><Phone size={14}/> Total Calls Made</div>
                                    <p className="text-2xl font-bold text-green-800">{totalCalls}</p>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1"><Clock size={14}/> Total Talk Time</div>
                                    <p className="text-xl font-bold text-purple-800">
                                        {Math.floor(totalTalkTimeSeconds / 60)}m {totalTalkTimeSeconds % 60}s
                                    </p>
                                </div>
                                <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">⭐ Interested</div>
                                    <p className="text-2xl font-bold text-yellow-800">{interested}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow overflow-hidden">
                            <div className="p-6 border-b">
                                <h3 className="text-lg font-bold">My Leads</h3>
                            </div>
                            <LeadTable 
                                leads={myLeads} 
                                userRole={userRole as any}
                                onAction={(id) => {
                                    const lead = leads.find(l => l.leadId === id);
                                    setSelectedItem(lead);
                                    setModalView('call-action');
                                }}
                                onHistory={(id) => {
                                    const lead = leads.find(l => l.leadId === id);
                                    setSelectedItem(lead);
                                    setModalView('lead-history');
                                }}
                            />
                        </div>
                    </>
                ) : (
                    renderCatalog()
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen pb-20">
            <AlertContainer />
            <Header 
                isAdmin={userRole === 'admin'}
                isTelecaller={userRole === 'telecaller'}
                isFranchise={userRole === 'franchise'}
                isPartner={userRole === 'partner'}
                isVendor={userRole === 'vendor'}
                currentUser={currentUser}
                cartCount={cartCount}
                onLogout={handleLogout}
                onOpenAuth={(type) => setModalView(`${type}-auth`)}
                onOpenRegister={() => setModalView('register')}
                onOpenCart={() => setModalView('cart')}
                onOpenOrders={() => setModalView('orders')}
                onHome={handleGoHome}
            />

            {/* MAIN CONTENT SWITCHER */}
            {userRole === 'guest' ? (
                <main className="container mx-auto px-4 py-8">
                    {renderCatalog()}
                </main>
            ) : (
                renderDashboard()
            )}

            {/* MODALS */}
            {modalView === 'franchise-expired' && (
                <ModalWrapper onClose={() => setModalView(null)} maxWidth="max-w-md">
                    <div className="p-8 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
                            <AlertTriangle size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">30-Day Trial Expired</h2>
                        <p className="text-gray-600 mb-6">
                            Your basic 30-day franchise period has ended. To continue accessing your portal and special pricing, kindly upgrade to the Paid Version.
                        </p>
                        <a href="tel:+918073126541" className="bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-900 transition flex items-center gap-2">
                            <PhoneCall size={18} /> Contact Sales: +91-8073126541
                        </a>
                        <button onClick={() => setModalView(null)} className="mt-4 text-gray-500 hover:text-gray-700 text-sm">Cancel</button>
                    </div>
                </ModalWrapper>
            )}

            {modalView && (modalView.endsWith('auth') || modalView === 'register') && (
                <ModalWrapper onClose={() => setModalView(null)} maxWidth="max-w-sm">
                    <AuthModal 
                        initialMode={modalView === 'register' ? 'register' : 'login'}
                        initialRole={modalView.replace('-auth', '') as any}
                        onLogin={handleLogin}
                        onRegister={handleRegister}
                        onClose={() => setModalView(null)}
                    />
                </ModalWrapper>
            )}

            {modalView === 'add-lead' && (
                <ModalWrapper onClose={() => setModalView(null)} maxWidth="max-w-lg">
                    <LeadFormModal 
                        onClose={() => setModalView(null)}
                        onSave={handleUserAddLead}
                        scripts={scripts}
                    />
                </ModalWrapper>
            )}

            {modalView === 'product-details' && selectedItem && (
                <ModalWrapper onClose={() => setModalView(null)} maxWidth="max-w-4xl">
                    <ProductDetails 
                        product={selectedItem} 
                        isFranchise={isFranchiseView || userRole === 'franchise'}
                        onAdd={(qty) => addToCart(selectedItem, qty)}
                    />
                </ModalWrapper>
            )}

            {modalView === 'cart' && (
                <ModalWrapper onClose={() => setModalView(null)} maxWidth="max-w-2xl">
                    <CartView 
                        cart={cart}
                        onUpdateQty={updateCartQty}
                        onRemove={removeFromCart}
                        onCheckout={() => setModalView('checkout')}
                        isFranchise={isFranchiseView || userRole === 'franchise'}
                    />
                </ModalWrapper>
            )}

            {modalView === 'checkout' && (
                <ModalWrapper onClose={() => setModalView(null)} maxWidth="max-w-xl">
                    <CheckoutModal 
                        cart={cart} 
                        telecallers={users.telecallers}
                        partners={users.partners}
                        franchisees={users.franchisees}
                        isFranchise={isFranchiseView || userRole === 'franchise'}
                        onClose={() => setModalView(null)}
                        onOrderPlaced={handleOrderPlaced}
                        currentUser={currentUser}
                        userRole={userRole}
                    />
                </ModalWrapper>
            )}

            {((modalView === 'call-action') || (modalView === 'lead-history')) && selectedItem && (
                <ModalWrapper onClose={() => setModalView(null)} maxWidth="max-w-4xl">
                    <CallActionModal 
                        lead={selectedItem} 
                        scripts={scripts} 
                        onClose={() => setModalView(null)}
                        onLog={handleLeadLog}
                        currentUserRole={userRole}
                        initialMode={modalView === 'lead-history' ? 'history' : 'call'}
                    />
                </ModalWrapper>
            )}
            
            {modalView === 'orders' && (
                <ModalWrapper onClose={() => setModalView(null)} maxWidth="max-w-2xl">
                    <OrdersModal 
                        orders={orders}
                        currentUser={currentUser}
                        userRole={userRole}
                        products={products}
                    />
                </ModalWrapper>
            )}
        </div>
    );
};

export default App;
