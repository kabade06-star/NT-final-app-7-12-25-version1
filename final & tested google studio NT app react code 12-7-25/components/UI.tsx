
import React from 'react';
import { Menu, X, ShoppingCart, LogOut, User, Shield, Briefcase, Phone, Store, UserPlus } from 'lucide-react';

export const ModalWrapper: React.FC<{
    onClose: () => void;
    children: React.ReactNode;
    maxWidth?: string;
}> = ({ onClose, children, maxWidth = "max-w-lg" }) => {
    return (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6" onClick={onClose}>
            <div className={`bg-white rounded-xl shadow-2xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto transform transition-all relative flex flex-col`} onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-3 right-3 z-10 p-2 bg-gray-100 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-200 transition-colors">
                    <X size={20} />
                </button>
                <div className="flex-1 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

export const AlertContainer: React.FC = () => <div id="alert-container" className="fixed top-16 right-4 z-[100] w-full max-w-sm flex flex-col gap-2 pointer-events-none px-4 sm:px-0"></div>;

export const triggerAlert = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    const container = document.getElementById('alert-container');
    if (!container) return;

    const div = document.createElement('div');
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500'
    };
    div.className = `${colors[type]} text-white px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full pointer-events-auto flex items-center text-sm font-medium`;
    div.innerHTML = `<span>${message}</span>`;
    
    container.appendChild(div);
    
    // Animate in
    requestAnimationFrame(() => {
        div.classList.remove('translate-x-full');
    });

    setTimeout(() => {
        div.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => div.remove(), 300);
    }, 4000);
};

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const styles: Record<string, string> = {
        'Pending': 'bg-gray-100 text-gray-800',
        'Contacted': 'bg-blue-100 text-blue-800',
        'Interested': 'bg-green-100 text-green-800',
        'Not Interested': 'bg-red-100 text-red-800',
        'Follow-Up': 'bg-yellow-100 text-yellow-800',
        'Appointment Scheduled': 'bg-indigo-100 text-indigo-800',
        'Appointment Conducted': 'bg-purple-100 text-purple-800',
        'Cancelled': 'bg-gray-300 text-gray-700',
        'Completed': 'bg-green-600 text-white',
        'Processing': 'bg-blue-500 text-white'
    };
    
    // Normalize status key
    const normalized = Object.keys(styles).find(k => k.toLowerCase() === status.toLowerCase()) || 'Pending';

    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wide ${styles[normalized] || 'bg-gray-100 text-gray-800'}`}>
            {status}
        </span>
    );
};

interface HeaderProps {
    isAdmin: boolean;
    isTelecaller: boolean;
    isFranchise: boolean;
    isPartner: boolean;
    isVendor: boolean;
    currentUser: { name: string } | null;
    cartCount: number;
    onLogout: () => void;
    onOpenAuth: (type: string) => void;
    onOpenRegister: () => void;
    onOpenCart: () => void;
    onOpenOrders: () => void;
    onHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
    isAdmin, isTelecaller, isFranchise, isPartner, isVendor, currentUser, cartCount, 
    onLogout, onOpenAuth, onOpenRegister, onOpenCart, onOpenOrders, onHome 
}) => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    const isLoggedIn = isAdmin || isTelecaller || isFranchise || isPartner || isVendor;
    const roleLabel = isAdmin ? 'Admin' : isTelecaller ? 'Telecaller' : isFranchise ? 'Franchise' : isPartner ? 'Partner' : isVendor ? 'Vendor' : 'Guest';
    const roleColor = isAdmin ? 'bg-admin' : isTelecaller ? 'bg-tele' : isFranchise ? 'bg-franchise' : isPartner ? 'bg-partner' : isVendor ? 'bg-orange-500' : 'bg-gray-500';

    return (
        <header className="bg-primary text-white shadow-lg sticky top-0 z-50">
            <div className="container mx-auto px-4 py-3">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2 cursor-pointer" onClick={onHome}>
                        <div className="bg-white text-primary p-1.5 rounded-lg font-bold text-xl">NT</div>
                        <h1 className="text-xl font-bold hidden sm:block">NirmaanTech</h1>
                        <h1 className="text-lg font-bold sm:hidden">NirmaanTech</h1>
                    </div>

                    <div className="flex items-center space-x-2 sm:space-x-4">
                        {isLoggedIn ? (
                            <>
                                <div className="hidden sm:flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-full">
                                    <span className={`w-2 h-2 rounded-full ${roleColor}`}></span>
                                    <span className="text-xs sm:text-sm font-medium">{roleLabel}: {currentUser?.name || 'Admin'}</span>
                                </div>
                                {/* Mobile User Icon */}
                                <div className="sm:hidden flex items-center justify-center w-8 h-8 rounded-full bg-white/10 text-xs font-bold">
                                    {currentUser?.name?.charAt(0) || 'A'}
                                </div>
                            </>
                        ) : (
                            <div className="hidden lg:flex space-x-2 items-center">
                                <button onClick={() => onOpenAuth('admin')} className="px-3 py-1 text-xs font-medium hover:bg-white/10 rounded transition flex items-center gap-1 opacity-70 hover:opacity-100"><Shield size={12}/> Admin</button>
                                <div className="h-4 w-px bg-white/20 mx-1"></div>
                                <button onClick={() => onOpenAuth('telecaller')} className="px-3 py-1 text-xs font-medium hover:bg-white/10 rounded transition flex items-center gap-1"><Phone size={12}/> Login</button>
                                <button onClick={onOpenRegister} className="px-3 py-1.5 bg-accent text-white rounded text-xs font-bold shadow-md hover:bg-yellow-600 transition flex items-center gap-1 animate-pulse"><UserPlus size={14}/> Register</button>
                            </div>
                        )}

                        <button onClick={onOpenOrders} className="p-2 hover:bg-white/10 rounded-full transition relative" title="Orders">
                            <Briefcase size={20} />
                        </button>
                        
                        <button onClick={onOpenCart} className="p-2 hover:bg-white/10 rounded-full transition relative">
                            <ShoppingCart size={20} />
                            {cartCount > 0 && (
                                <span className="absolute top-0 right-0 bg-accent text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                        
                        <button className="lg:hidden p-1" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
                
                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="lg:hidden pt-4 pb-2 space-y-2 border-t border-white/20 mt-3 animate-fade-in bg-primary absolute top-full left-0 w-full shadow-xl px-4 pb-4">
                        {isLoggedIn ? (
                             <div className="block w-full text-left px-4 py-3 bg-white/10 rounded mb-2">
                                <span className="text-sm font-bold block mb-1">Signed in as {currentUser?.name || 'Admin'}</span>
                                <span className="text-xs opacity-75 uppercase tracking-wide">{roleLabel}</span>
                             </div>
                        ) : null}

                        {!isLoggedIn && (
                            <div className="grid grid-cols-2 gap-2">
                                <button onClick={() => { onOpenAuth('admin'); setIsMenuOpen(false); }} className="text-left px-4 py-3 bg-white/5 hover:bg-white/10 rounded text-sm flex items-center gap-2 col-span-2"><Shield size={14}/> Admin Portal</button>
                                <button onClick={() => { onOpenAuth('login'); setIsMenuOpen(false); }} className="text-left px-4 py-3 bg-white/5 hover:bg-white/10 rounded text-sm flex items-center gap-2"><Phone size={14}/> Login</button>
                                <button onClick={() => { onOpenRegister(); setIsMenuOpen(false); }} className="text-left px-4 py-3 bg-accent hover:bg-yellow-600 text-white rounded text-sm font-bold flex items-center gap-2"><UserPlus size={14}/> Register</button>
                            </div>
                        )}
                        
                        {isLoggedIn && (
                            <button onClick={() => { onLogout(); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-100 rounded text-sm flex items-center gap-2">
                                <LogOut size={16}/> Logout
                            </button>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
};
