'use client';

import React from 'react';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import AIWidget from '@/components/AIWidget';
import Dashboard from '@/components/Dashboard';
import { LogIn, Stethoscope, Calendar, Users, ShieldCheck } from 'lucide-react';
import Image from 'next/image';

function LandingPage() {
  const { signIn, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Hero Section */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">MedClinic AI</span>
        </div>
        <button 
          onClick={signIn}
          className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-full font-medium hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
        >
          <LogIn className="w-4 h-4" />
          Sign In
        </button>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12 lg:py-20 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6 lg:space-y-8 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            AI-Powered Healthcare
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 leading-[1.1] tracking-tight">
            Modern Clinic <br />
            <span className="text-slate-400 italic">Management.</span>
          </h1>
          <p className="text-lg lg:text-xl text-slate-500 max-w-lg mx-auto lg:mx-0 leading-relaxed">
            Experience the future of healthcare with MedClinic AI. Book appointments via voice, 
            manage schedules with ease, and focus on what matters most: patient care.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 pt-4">
            <button 
              onClick={signIn}
              className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-2xl font-semibold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
            >
              Get Started Now
            </button>
            <div className="flex -space-x-3 items-center">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden relative">
                  <Image 
                    src={`https://picsum.photos/seed/user${i}/100/100`} 
                    alt="User" 
                    fill 
                    className="object-cover" 
                    referrerPolicy="no-referrer"
                  />
                </div>
              ))}
              <span className="pl-6 text-sm font-medium text-slate-500">Trusted by 2,000+ patients</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-4 pt-12">
            <div className="p-8 bg-white rounded-[2rem] shadow-xl shadow-slate-200 border border-slate-100 space-y-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-xl text-slate-900">Smart Booking</h3>
              <p className="text-slate-500 text-sm leading-relaxed">AI-driven conflict resolution and automated slot management.</p>
            </div>
            <div className="p-8 bg-slate-900 rounded-[2rem] shadow-xl shadow-slate-900/10 space-y-4 text-white">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-xl">Doctor Focused</h3>
              <p className="text-slate-300 text-sm leading-relaxed">Streamlined daily schedules and patient status tracking.</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="p-8 bg-emerald-500 rounded-[2rem] shadow-xl shadow-emerald-500/20 space-y-4 text-white">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-xl">Patient First</h3>
              <p className="text-emerald-50 text-sm leading-relaxed">Easy access to history and real-time appointment status.</p>
            </div>
            <div className="p-8 bg-white rounded-[2rem] shadow-xl shadow-slate-200 border border-slate-100 space-y-4">
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-xl text-slate-900">Secure Data</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Role-based access control and encrypted medical records.</p>
            </div>
          </div>
        </div>
      </main>

      <AIWidget />
    </div>
  );
}

function AuthenticatedApp() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !profile) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Dashboard />
      <AIWidget />
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}
