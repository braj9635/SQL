import React from 'react';
import { X, User, Mail, Shield, Calendar, CreditCard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const { user } = useAuth();

    if (!isOpen || !user) return null;

    const createdAt = user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="fixed inset-0"
                onClick={onClose}
            />
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative z-10 animate-in zoom-in-95 duration-200">
                <header className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-50 p-2 rounded-xl">
                            <User className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Account Settings</h2>
                            <p className="text-xs text-slate-500">Manage your profile and preferences</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </header>

                <div className="px-6 py-8 space-y-8 max-h-[70vh] overflow-y-auto">
                    {/* Profile Section */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Profile Information</h3>
                        <div className="grid gap-4">
                            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="h-12 w-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                                    {user.email?.[0].toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">{user.email?.split('@')[0]}</p>
                                    <p className="text-xs text-slate-500 capitalize">{user.role || 'User'}</p>
                                </div>
                            </div>

                            <div className="space-y-1 px-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Mail className="w-3 h-3" /> Email Address
                                </label>
                                <p className="text-sm text-slate-700 font-medium">{user.email}</p>
                            </div>

                            <div className="space-y-1 px-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Calendar className="w-3 h-3" /> Joined
                                </label>
                                <p className="text-sm text-slate-700 font-medium">{createdAt}</p>
                            </div>
                        </div>
                    </section>

                    {/* Account Usage */}
                    <section className="space-y-4 pt-2">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Plan & Usage</h3>
                        <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-white p-2 rounded-xl shadow-sm">
                                    <CreditCard className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-indigo-900">Personal Free Plan</p>
                                    <p className="text-xs text-indigo-600/70">Unlimited local queries</p>
                                </div>
                            </div>
                            <button className="text-xs font-bold text-indigo-600 bg-white px-3 py-1.5 rounded-lg shadow-sm hover:bg-white/80 transition-all">
                                Upgrade
                            </button>
                        </div>
                    </section>

                    {/* Security Section */}
                    <section className="space-y-4 pt-2">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Security</h3>
                        <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl border border-slate-100 transition-colors text-left group">
                            <div className="flex items-center gap-3">
                                <Shield className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                                <div>
                                    <p className="text-sm font-bold text-slate-900">Password & Security</p>
                                    <p className="text-xs text-slate-500">Enable 2FA or change password</p>
                                </div>
                            </div>
                            <div className="text-slate-300 group-hover:text-slate-400 transition-colors">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </button>
                    </section>
                </div>

                <footer className="px-6 py-5 bg-slate-50/50 border-t border-slate-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-50 transition-all shadow-sm"
                    >
                        Close
                    </button>
                </footer>
            </div>
        </div>
    );
}
