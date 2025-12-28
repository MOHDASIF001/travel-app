import React, { useState, useEffect } from 'react';
import { UserPlus, Users, Trash2, Mail, Building, Plus, X } from 'lucide-react';
import { Button } from './Button';

interface Agent {
    id: string;
    email: string;
    company_name: string;
    created_at: string;
}

interface AdminPanelProps {
    token: string;
    primaryColor: string;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ token, primaryColor }) => {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newAgent, setNewAgent] = useState({ email: '', password: '', company_name: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchAgents = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/admin/agents', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) setAgents(data);
        } catch (err) {
            console.error('Error fetching agents');
        }
    };

    useEffect(() => {
        fetchAgents();
    }, []);

    const handleAddAgent = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await fetch('http://localhost:5000/api/create-agent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newAgent),
            });

            if (response.ok) {
                setShowAddModal(false);
                setNewAgent({ email: '', password: '', company_name: '' });
                fetchAgents();
            } else {
                const data = await response.json();
                setError(data.message || 'Failed to create agent');
            }
        } catch (err) {
            setError('Connection error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAgent = async (id: string) => {
        if (!confirm('Are you sure you want to delete this agent and all their data?')) return;
        try {
            const response = await fetch(`http://localhost:5000/api/admin/agents/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) fetchAgents();
        } catch (err) {
            console.error('Error deleting agent');
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Super Admin Panel</h1>
                    <p className="text-slate-500 font-medium mt-1">Manage agent accounts and billing access</p>
                </div>
                <Button onClick={() => setShowAddModal(true)} className="gap-2 h-14 px-8 text-lg shadow-xl" style={{ backgroundColor: primaryColor }}>
                    <UserPlus className="w-6 h-6" />
                    Create New Agent
                </Button>
            </div>

            <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                            <Users className="w-5 h-5" />
                        </div>
                        <span className="font-black text-slate-900 uppercase tracking-tight">Active Agents</span>
                    </div>
                    <div className="bg-slate-200 px-4 py-1 rounded-full text-[10px] font-black uppercase text-slate-600 tracking-widest">
                        {agents.length} Total Registered
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[2px]">
                                <th className="px-8 py-5">Agency Information</th>
                                <th className="px-8 py-5">Email Address</th>
                                <th className="px-8 py-5">Joined Date</th>
                                <th className="px-8 py-5 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {agents.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-24 text-center">
                                        <div className="flex flex-col items-center opacity-20">
                                            <Users className="w-16 h-16 mb-4" />
                                            <span className="text-xl font-bold uppercase tracking-widest">No agents found</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                agents.map((agent) => (
                                    <tr key={agent.id} className="hover:bg-slate-50/80 transition-all group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-all">
                                                    <Building className="w-6 h-6" />
                                                </div>
                                                <div className="font-black text-slate-900 text-lg leading-tight uppercase tracking-tight">
                                                    {agent.company_name}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-slate-600 font-bold">
                                                <Mail className="w-4 h-4 text-slate-300" />
                                                {agent.email}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-slate-400 font-medium text-sm">
                                            {new Date(agent.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center justify-center">
                                                <button
                                                    onClick={() => handleDeleteAgent(agent.id)}
                                                    className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                                                    title="Delete Agent"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Agent Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[40px] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Create Agent Account</h3>
                                <p className="text-slate-400 text-sm font-medium">Generate access for a new travel partner</p>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleAddAgent} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] ml-1">Company / Agency Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newAgent.company_name}
                                    onChange={e => setNewAgent({ ...newAgent, company_name: e.target.value })}
                                    className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl text-slate-900 font-bold outline-none focus:border-rose-500 focus:bg-white transition-all"
                                    placeholder="e.g. TwinB Holidays"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] ml-1">Agent Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={newAgent.email}
                                    onChange={e => setNewAgent({ ...newAgent, email: e.target.value })}
                                    className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl text-slate-900 font-bold outline-none focus:border-rose-500 focus:bg-white transition-all"
                                    placeholder="agent@example.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] ml-1">Initial Password</label>
                                <input
                                    type="text"
                                    required
                                    value={newAgent.password}
                                    onChange={e => setNewAgent({ ...newAgent, password: e.target.value })}
                                    className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl text-slate-900 font-bold outline-none focus:border-rose-500 focus:bg-white transition-all"
                                    placeholder="Choose a strong password"
                                />
                            </div>

                            {error && <div className="text-rose-500 text-xs font-bold text-center bg-rose-50 p-4 rounded-2xl">{error}</div>}

                            <Button type="submit" disabled={loading} className="w-full h-16 rounded-[24px] gap-2 shadow-xl shadow-rose-500/20" style={{ backgroundColor: primaryColor }}>
                                {loading ? 'Creating...' : <><Plus className="w-5 h-5" /> Activate Agent Access</>}
                            </Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
