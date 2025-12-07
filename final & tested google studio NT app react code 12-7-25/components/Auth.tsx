
import React, { useState } from 'react';
import { User } from '../types';
import { CITIES } from '../constants';
import { User as UserIcon, Phone, Briefcase, Store, Shield, MapPin, Lock, CreditCard } from 'lucide-react';

interface AuthModalProps {
    initialMode: 'login' | 'register';
    initialRole: string;
    onLogin: (role: string, id: string, pass: string) => void;
    onRegister: (user: User, typeKey: string) => void;
    onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ initialMode, initialRole, onLogin, onRegister, onClose }) => {
    const [mode, setMode] = useState<'login' | 'register'>(initialMode);
    const [role, setRole] = useState(initialRole === 'admin' ? 'admin' : (initialRole || 'telecaller'));
    
    // Register Form State
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        password: '',
        city: 'Bangalore'
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const target = e.target as any;

        if (mode === 'login') {
            const id = target.username?.value;
            const pass = target.password.value;
            onLogin(role, id, pass);
        } else {
            // Registration Logic
            const timestamp = Date.now().toString().slice(-5);
            let prefix = 'U';
            let typeKey = 'telecallers';
            
            if (role === 'vendor') { prefix = 'V'; typeKey = 'vendors'; }
            else if (role === 'franchise') { prefix = 'F'; typeKey = 'franchisees'; }
            else if (role === 'partner') { prefix = 'P'; typeKey = 'partners'; }
            else if (role === 'telecaller') { prefix = 'T'; typeKey = 'telecallers'; }

            const newId = `${prefix}-${timestamp}`;
            
            const newUser: User = {
                id: newId,
                name: formData.name,
                password: formData.password,
                role: role as any,
                phone: formData.phone,
                city: role === 'franchise' || role === 'vendor' ? formData.city : undefined,
                plan: (role === 'vendor' || role === 'franchise') ? 'basic' : undefined, // Default vendors/franchise to basic
                registrationDate: new Date().toISOString().split('T')[0] // Capture Reg Date
            };

            onRegister(newUser, typeKey);
        }
    };

    return (
        <div className="p-0">
            <div className="flex border-b">
                <button 
                    onClick={() => setMode('login')} 
                    className={`flex-1 py-4 text-center font-bold text-sm uppercase tracking-wide transition ${mode === 'login' ? 'text-primary border-b-2 border-primary bg-blue-50' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    Login
                </button>
                <button 
                    onClick={() => { setMode('register'); if(role === 'admin') setRole('telecaller'); }} 
                    className={`flex-1 py-4 text-center font-bold text-sm uppercase tracking-wide transition ${mode === 'register' ? 'text-primary border-b-2 border-primary bg-blue-50' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    Register
                </button>
            </div>

            <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                    {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Role Selection */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Select Role</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {mode === 'login' && <button type="button" onClick={() => setRole('admin')} className={`p-2 rounded text-xs font-bold border flex flex-col items-center gap-1 ${role === 'admin' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 hover:bg-gray-50'}`}><Shield size={16}/> Admin</button>}
                            <button type="button" onClick={() => setRole('telecaller')} className={`p-2 rounded text-xs font-bold border flex flex-col items-center gap-1 ${role === 'telecaller' ? 'bg-pink-500 text-white border-pink-500' : 'bg-white text-gray-600 hover:bg-gray-50'}`}><Phone size={16}/> Telecaller</button>
                            <button type="button" onClick={() => setRole('franchise')} className={`p-2 rounded text-xs font-bold border flex flex-col items-center gap-1 ${role === 'franchise' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-gray-600 hover:bg-gray-50'}`}><UserIcon size={16}/> Franchise</button>
                            <button type="button" onClick={() => setRole('partner')} className={`p-2 rounded text-xs font-bold border flex flex-col items-center gap-1 ${role === 'partner' ? 'bg-violet-500 text-white border-violet-500' : 'bg-white text-gray-600 hover:bg-gray-50'}`}><Briefcase size={16}/> Partner</button>
                            <button type="button" onClick={() => setRole('vendor')} className={`p-2 rounded text-xs font-bold border flex flex-col items-center gap-1 ${role === 'vendor' ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 hover:bg-gray-50'}`}><Store size={16}/> Vendor</button>
                        </div>
                    </div>

                    {mode === 'login' ? (
                        <>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">User ID / Username</label>
                                <div className="relative">
                                    <UserIcon size={18} className="absolute top-3 left-3 text-gray-400" />
                                    <input name="username" placeholder={role === 'admin' ? "Enter Admin Password" : "e.g. T1, F1, V-123"} className="w-full pl-10 p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" required />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Password</label>
                                <div className="relative">
                                    <Lock size={18} className="absolute top-3 left-3 text-gray-400" />
                                    <input name="password" type="password" placeholder="••••••" className="w-full pl-10 p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" required />
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Full Name</label>
                                <input 
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    placeholder="John Doe" 
                                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" 
                                    required 
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Mobile Number</label>
                                <input 
                                    value={formData.phone}
                                    onChange={e => setFormData({...formData, phone: e.target.value})}
                                    placeholder="10 Digit Number" 
                                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" 
                                    required 
                                    type="tel"
                                />
                            </div>
                            
                            {(role === 'franchise' || role === 'vendor') && (
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">City / Location</label>
                                    <div className="relative">
                                        <MapPin size={18} className="absolute top-3 left-3 text-gray-400" />
                                        <select 
                                            value={formData.city}
                                            onChange={e => setFormData({...formData, city: e.target.value})}
                                            className="w-full pl-10 p-2.5 border rounded-lg bg-white focus:ring-2 focus:ring-primary outline-none"
                                        >
                                            {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Create Password</label>
                                <div className="relative">
                                    <Lock size={18} className="absolute top-3 left-3 text-gray-400" />
                                    <input 
                                        type="password"
                                        value={formData.password}
                                        onChange={e => setFormData({...formData, password: e.target.value})}
                                        placeholder="Min 4 chars" 
                                        className="w-full pl-10 p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" 
                                        required 
                                        minLength={4}
                                    />
                                </div>
                            </div>

                            {role === 'vendor' && (
                                <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg text-xs text-orange-800 flex items-start gap-2">
                                    <CreditCard size={16} className="flex-shrink-0 mt-0.5"/>
                                    <div>
                                        <strong>Basic Plan (Free):</strong> You can upload up to 3 products. Upgrade later for unlimited access.
                                    </div>
                                </div>
                            )}
                            
                            {role === 'franchise' && (
                                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-xs text-emerald-800 flex items-start gap-2">
                                    <CreditCard size={16} className="flex-shrink-0 mt-0.5"/>
                                    <div>
                                        <strong>Basic Plan (Trial):</strong> Free access for 30 days. Upgrade to Paid Plan for continued access and unlimited benefits.
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    <button className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-blue-900 transition shadow-lg mt-2">
                        {mode === 'login' ? 'Login' : 'Complete Registration'}
                    </button>
                </form>
            </div>
        </div>
    );
};