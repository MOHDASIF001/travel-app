import React, { useState } from 'react';
import { Lock, Save, X, ShieldCheck } from 'lucide-react';
import { Button } from './Button';

interface ChangePasswordProps {
    token: string;
    primaryColor: string;
    onClose: () => void;
}

export const ChangePassword: React.FC<ChangePasswordProps> = ({ token, primaryColor, onClose }) => {
    const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const response = await fetch('https://travel-app-production-24d5.up.railway.app/api/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ oldPassword: passwords.oldPassword, newPassword: passwords.newPassword }),
            });

            if (response.ok) {
                setSuccess(true);
                setTimeout(onClose, 2000);
            } else {
                const data = await response.json();
                setError(data.message || 'Failed to change password');
            }
        } catch (err) {
            setError('Connection error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
            <div className="bg-white rounded-[40px] w-full max-w-md shadow-2xl overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Security Settings</h3>
                        <p className="text-slate-400 text-sm font-medium">Update your account password</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {success ? (
                    <div className="p-12 text-center space-y-4">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShieldCheck className="w-10 h-10" />
                        </div>
                        <h4 className="text-2xl font-black text-slate-900 uppercase">Password Updated!</h4>
                        <p className="text-slate-500 font-medium">Your security settings have been saved.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] ml-1">Current Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                <input
                                    type="password"
                                    required
                                    value={passwords.oldPassword}
                                    onChange={e => setPasswords({ ...passwords, oldPassword: e.target.value })}
                                    className="w-full bg-slate-50 border-2 border-slate-100 p-4 pl-12 rounded-2xl text-slate-900 font-bold outline-none focus:border-rose-500 transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] ml-1">New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                <input
                                    type="password"
                                    required
                                    value={passwords.newPassword}
                                    onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
                                    className="w-full bg-slate-50 border-2 border-slate-100 p-4 pl-12 rounded-2xl text-slate-900 font-bold outline-none focus:border-rose-500 transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] ml-1">Confirm New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                <input
                                    type="password"
                                    required
                                    value={passwords.confirmPassword}
                                    onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                    className="w-full bg-slate-50 border-2 border-slate-100 p-4 pl-12 rounded-2xl text-slate-900 font-bold outline-none focus:border-rose-500 transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {error && <div className="text-rose-500 text-xs font-bold text-center bg-rose-50 p-4 rounded-2xl">{error}</div>}

                        <Button type="submit" disabled={loading} className="w-full h-16 rounded-[24px] gap-2 shadow-xl shadow-rose-500/20" style={{ backgroundColor: primaryColor }}>
                            {loading ? 'Processing...' : <><Save className="w-5 h-5" /> Save New Password</>}
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
};
