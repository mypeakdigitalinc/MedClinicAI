'use client';

import React from 'react';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import AIWidget from '@/components/AIWidget';
import Dashboard from '@/components/Dashboard';
import { LogIn, Stethoscope, Calendar, Users, ShieldCheck, Mail, Lock, User, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';

function LoginModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { signIn, signInWithEmail, signUpWithEmail } = useAuth();
  const [isRegister, setIsRegister] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await signUpWithEmail(email, password, name);
      } else {
        await signInWithEmail(email, password);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signIn();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Google sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 lg:p-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">MedClinic AI</span>
          </div>

          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-slate-500 mb-8">
            {isRegister ? 'Join our modern clinic management platform.' : 'Sign in to manage your appointments.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900 ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-slate-50 border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-slate-900 transition-all outline-none"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-900 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-50 border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-slate-900 transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-900 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-slate-900 transition-all outline-none"
                />
              </div>
            </div>

            {error && <p className="text-rose-500 text-xs font-medium ml-1">{error}</p>}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white rounded-2xl py-4 font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {isRegister ? 'Create Account' : 'Sign In'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-slate-400 font-bold tracking-widest">Or continue with</span>
            </div>
          </div>

          <button 
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white border border-slate-200 text-slate-900 rounded-2xl py-4 font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google Account
          </button>

          <p className="mt-8 text-center text-sm text-slate-500">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button 
              onClick={() => setIsRegister(!isRegister)}
              className="text-slate-900 font-bold hover:underline"
            >
              {isRegister ? 'Sign In' : 'Register Now'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function LandingPage() {
  const [isLoginModalOpen, setIsLoginModalOpen] = React.useState(false);
  const { loading } = useAuth();

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
          onClick={() => setIsLoginModalOpen(true)}
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
              onClick={() => setIsLoginModalOpen(true)}
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
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
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
