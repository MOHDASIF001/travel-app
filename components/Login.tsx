import React, { useState } from 'react';
import { Layout, Lock, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react';

interface LoginProps {
    onLogin: (token: string, user: any) => void;
    primaryColor: string;
}

export const Login: React.FC<LoginProps> = ({ onLogin, primaryColor }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('https://travel-app-production-24d5.up.railway.app/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            if (response.ok) {
                onLogin(data.token, data.user);
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            setError('Connection error. Is the server running?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 font-inter">
            <div className="w-full max-w-md">
                {/* Logo Section */}
                <div className="flex flex-col items-center mb-12">
                    <div className="w-16 h-16 rounded-3xl flex items-center justify-center shadow-2xl mb-6 transform rotate-12" style={{ backgroundColor: primaryColor }}>
                        <Layout className="w-8 h-8 text-white transform -rotate-12" />
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">
                        Itinerary<span style={{ color: primaryColor }}>Pro</span>
                    </h1>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[4px]">SaaS Management Portal</p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-[40px] p-10 shadow-2xl border border-white/10">
                    <div className="mb-8 ">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Agent Sign In</h2>
                        <p className="text-slate-400 font-medium text-sm">Enter your credentials to access your trips.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-rose-500 transition-colors" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-50 border-2 border-slate-100 p-4 pl-12 rounded-2xl text-slate-900 font-bold outline-none focus:border-rose-500 focus:bg-white transition-all"
                                    placeholder="agent@company.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-rose-500 transition-colors" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-50 border-2 border-slate-100 p-4 pl-12 pr-12 rounded-2xl text-slate-900 font-bold outline-none focus:border-rose-500 focus:bg-white transition-all"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-rose-50 border-2 border-rose-100 text-rose-500 p-4 rounded-2xl text-xs font-bold animate-shake">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-16 rounded-[24px] text-white font-black uppercase tracking-[2px] text-xs flex items-center justify-center gap-3 shadow-2xl shadow-rose-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                            style={{ backgroundColor: primaryColor }}
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Enter Dashboard <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                        Contact Super Admin if you lost your access
                    </p>
                </div>
            </div>
        </div>
    );
};
