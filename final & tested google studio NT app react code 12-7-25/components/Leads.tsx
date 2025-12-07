
import React from 'react';
import { Lead, CentralScript } from '../types';
import { StatusBadge } from './UI';
import { PhoneCall, Clock, Calendar, UserCheck, AlertCircle, ChevronRight, MessageSquare, Save, X } from 'lucide-react';

interface LeadCardProps {
    lead: Lead;
    onAction: (leadId: number) => void;
    userRole: 'admin' | 'telecaller' | 'franchise' | 'partner';
}

const LeadCard: React.FC<LeadCardProps> = ({ lead, onAction, userRole }) => {
    const lastContact = lead.contactHistory[lead.contactHistory.length - 1];
    
    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-4 flex flex-col gap-3">
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="font-bold text-gray-900 text-lg">{lead.customerName}</h4>
                    <p className="text-gray-500 text-sm">{lead.customerPhone}</p>
                </div>
                <StatusBadge status={lead.currentStatus} />
            </div>
            
            <div className="flex gap-2 text-xs">
                <span className="bg-gray-100 px-2 py-1 rounded text-gray-600 font-medium">{lead.productRequirement}</span>
                <span className="bg-gray-100 px-2 py-1 rounded text-gray-500">{lead.source}</span>
            </div>

            {lastContact && (
                <div className="bg-gray-50 p-2 rounded text-xs text-gray-600 border border-gray-100">
                    <div className="flex items-center gap-1 mb-1 font-medium text-gray-500">
                        <Clock size={12}/> Last Activity: {lastContact.callDate}
                    </div>
                    <p className="italic line-clamp-2">"{lastContact.comments}"</p>
                </div>
            )}

            <button 
                onClick={() => onAction(lead.leadId)}
                className={`w-full py-2.5 rounded-lg text-white font-bold text-sm shadow flex items-center justify-center gap-2 transition-transform active:scale-95 ${
                    userRole === 'admin' ? 'bg-admin' :
                    userRole === 'telecaller' ? 'bg-tele' :
                    userRole === 'franchise' ? 'bg-franchise' :
                    'bg-partner'
                }`}
            >
                <PhoneCall size={16} /> Dial / Update Status
            </button>
        </div>
    );
};

interface LeadTableProps {
    leads: Lead[];
    onAction: (leadId: number) => void;
    userRole: 'admin' | 'telecaller' | 'franchise' | 'partner';
}

export const LeadTable: React.FC<LeadTableProps> = ({ leads, onAction, userRole }) => {
    return (
        <div className="w-full">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requirement</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Interaction</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {leads.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                                    No leads found matching your criteria.
                                </td>
                            </tr>
                        ) : (
                            leads.map((lead) => {
                                const lastContact = lead.contactHistory[lead.contactHistory.length - 1];
                                return (
                                    <tr key={lead.leadId} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-900">{lead.customerName}</span>
                                                <span className="text-xs text-gray-500">{lead.customerPhone}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{lead.productRequirement}</div>
                                            <div className="text-xs text-gray-500">{lead.source}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <StatusBadge status={lead.currentStatus} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs text-gray-500">
                                                <div className="flex items-center gap-1"><Calendar size={12}/> {lastContact?.callDate}</div>
                                                <div className="flex items-center gap-1 text-gray-400 mt-0.5" title={lastContact?.comments}><span className="truncate max-w-[150px]">{lastContact?.comments}</span></div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button 
                                                onClick={() => onAction(lead.leadId)}
                                                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-white font-medium shadow-sm transition-all ${
                                                    userRole === 'admin' ? 'bg-admin hover:bg-emerald-700' :
                                                    userRole === 'telecaller' ? 'bg-tele hover:bg-pink-700' :
                                                    userRole === 'franchise' ? 'bg-franchise hover:bg-emerald-600' :
                                                    'bg-partner hover:bg-violet-600'
                                                }`}
                                            >
                                                <PhoneCall size={14} /> Dial/Update
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden">
                {leads.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 bg-white rounded-xl border border-dashed">
                        No leads found.
                    </div>
                ) : (
                    leads.map(lead => <LeadCard key={lead.leadId} lead={lead} onAction={onAction} userRole={userRole} />)
                )}
            </div>
        </div>
    );
};

export const CallActionModal: React.FC<{
    lead: Lead;
    scripts: CentralScript[];
    onClose: () => void;
    onLog: (status: string, comments: string, followUp: string, duration: number) => void;
    currentUserRole: string; // T1, F1, P1 prefix logic
}> = ({ lead, scripts, onClose, onLog, currentUserRole }) => {
    const [status, setStatus] = React.useState(lead.currentStatus);
    const [comments, setComments] = React.useState('');
    const [followUp, setFollowUp] = React.useState(lead.contactHistory[lead.contactHistory.length-1]?.nextFollowupDate || '');
    const [isActive, setIsActive] = React.useState(true);
    const [seconds, setSeconds] = React.useState(0);
    const [showLog, setShowLog] = React.useState(false);

    // Prioritize Assigned Script -> Requirement Script -> General Script
    const script = scripts.find(s => s.id === lead.assignedScriptId) || 
                   scripts.find(s => s.category === lead.productRequirement) || 
                   scripts.find(s => s.category === 'General');

    React.useEffect(() => {
        let interval: any;
        if (isActive) {
            interval = setInterval(() => setSeconds(s => s + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [isActive]);

    const handleEndCall = () => {
        setIsActive(false);
        setShowLog(true);
    };

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60).toString().padStart(2, '0');
        const sec = (s % 60).toString().padStart(2, '0');
        return `${m}:${sec}`;
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 sm:bg-white rounded-lg">
            <div className="flex justify-between items-start mb-4 border-b pb-4 bg-white p-4 sm:p-0 sticky top-0 z-10 shadow-sm sm:shadow-none">
                <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-800 leading-tight">{lead.customerName}</h2>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">{lead.productRequirement} • {lead.customerPhone}</p>
                    {lead.assignedScriptId && <span className="text-[10px] bg-purple-100 text-purple-800 px-1 rounded">Script Assigned</span>}
                </div>
                <div className="text-right bg-gray-100 px-3 py-1 rounded-lg">
                    <div className={`text-2xl font-mono font-bold ${isActive ? 'text-red-500 animate-pulse' : 'text-gray-800'}`}>
                        {formatTime(seconds)}
                    </div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wide font-bold">Duration</div>
                </div>
            </div>

            <div className="flex-grow overflow-y-auto px-4 pb-4">
                {/* Script Section */}
                {script && (
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-2 text-blue-800 font-bold text-xs uppercase tracking-wide">
                            <UserCheck size={14}/> {lead.assignedScriptId ? 'Custom Assigned Script' : 'Suggested Script'}
                        </div>
                        <p className="text-blue-900 mb-4 leading-relaxed font-medium text-sm sm:text-base">"{script.mainScript}"</p>
                        {script.subScripts.length > 0 && (
                            <div className="space-y-3">
                                {script.subScripts.map((sub, i) => (
                                    <div key={i} className="flex gap-2 text-sm text-blue-800 bg-white/50 p-2 rounded">
                                        <ChevronRight size={16} className="mt-0.5 flex-shrink-0" />
                                        <span><span className="font-bold block text-xs uppercase opacity-70 mb-0.5">{sub.title}</span> {sub.script}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {!showLog ? (
                    <div className="flex flex-col items-center justify-center py-8 bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 animate-pulse">
                            <PhoneCall size={32} />
                        </div>
                        <p className="text-gray-600 mb-6 font-medium">Call in progress...</p>
                        <button onClick={handleEndCall} className="w-4/5 bg-red-500 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:bg-red-600 active:scale-95 transition flex items-center justify-center gap-2">
                            End Call & Log
                        </button>
                    </div>
                ) : (
                    <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 animate-fade-in shadow-sm">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                            <MessageSquare size={18} className="text-blue-500"/> Log Interaction
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Call Outcome Status</label>
                                <select className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none" value={status} onChange={e => setStatus(e.target.value)}>
                                    {['Pending', 'Contacted', 'Interested', 'Not Interested', 'Follow-Up', 'Appointment Scheduled', 'Cancelled'].map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Next Follow Up</label>
                                <input type="date" className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none" value={followUp} onChange={e => setFollowUp(e.target.value)} />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Notes <span className="text-red-500">*</span></label>
                                <textarea 
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]" 
                                    rows={4}
                                    placeholder="Summarize the conversation..."
                                    value={comments}
                                    onChange={e => setComments(e.target.value)}
                                ></textarea>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 border-t bg-white sticky bottom-0 z-10 flex gap-3">
                <button onClick={onClose} className="flex-1 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold transition">Cancel</button>
                {showLog && (
                    <button 
                        onClick={() => {
                            if (comments.length < 3) return alert("Please enter comments");
                            onLog(status, comments, followUp, seconds);
                        }} 
                        className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-md transition active:scale-95"
                    >
                        Save Log
                    </button>
                )}
            </div>
        </div>
    );
};

export const LeadFormModal: React.FC<{
    onClose: () => void;
    onSave: (data: any) => void;
    scripts: CentralScript[];
}> = ({ onClose, onSave, scripts }) => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const target = e.target as any;
        const data = {
            customerName: target.name.value,
            customerPhone: target.phone.value,
            productRequirement: target.req.value,
            currentStatus: target.status?.value || 'Pending',
            assignedScriptId: target.scriptId?.value ? parseInt(target.scriptId.value) : undefined
        };
        onSave(data);
    };

    return (
        <div className="p-4 sm:p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Add New Lead</h3>
                <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X size={16}/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Customer Name *</label>
                    <input name="name" placeholder="John Doe" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none" required />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Phone Number *</label>
                    <input name="phone" placeholder="10 Digit Mobile" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none" required />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Requirement *</label>
                    <input name="req" placeholder="e.g. Personal Loan, Website" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none" required />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                         <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Initial Status</label>
                         <select name="status" className="w-full p-3 border rounded-lg bg-white">
                            <option value="Pending">Pending</option>
                            <option value="Interested">Interested</option>
                            <option value="Contacted">Contacted</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Assign Script (Opt)</label>
                        <select name="scriptId" className="w-full p-3 border rounded-lg bg-white">
                            <option value="">Auto-Detect</option>
                            {scripts.map(s => (
                                <option key={s.id} value={s.id}>{s.category} - {s.mainScript.substring(0, 15)}...</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="pt-4">
                    <button type="submit" className="w-full py-3.5 bg-primary text-white rounded-xl font-bold shadow-lg hover:bg-blue-800 transition flex items-center justify-center gap-2">
                        <Save size={18} /> Save Lead
                    </button>
                </div>
            </form>
        </div>
    );
};
