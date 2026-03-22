'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Settings, 
  LogOut, 
  Bell, 
  Search,
  Activity,
  UserCircle
} from 'lucide-react';

export default function Overview() {
  const { user, profile, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold text-indigo-600 flex items-center gap-2">
            <Activity className="w-6 h-6" />
            MedClinic AI
          </h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-indigo-600 bg-indigo-50 rounded-xl font-medium">
            <LayoutDashboard className="w-5 h-5" />
            Overview
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
            <Calendar className="w-5 h-5" />
            Appointments
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
            <Users className="w-5 h-5" />
            Patients
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
            <Settings className="w-5 h-5" />
            Settings
          </a>
        </nav>

        <div className="p-4 border-t border-slate-200">
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search appointments, patients..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">{profile?.displayName || user.email}</p>
                <p className="text-xs text-slate-500 capitalize">{profile?.role}</p>
              </div>
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <UserCircle className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Dashboard Overview</h2>
            <p className="text-slate-500">Welcome back! Here&apos;s what&apos;s happening today.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              { label: 'Total Appointments', value: '12', change: '+2 today', icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'New Patients', value: '4', change: '+1 this week', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Pending Reports', value: '7', change: '3 urgent', icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50' },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${stat.bg}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Stats</span>
                </div>
                <h3 className="text-slate-500 text-sm font-medium mb-1">{stat.label}</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-900">{stat.value}</span>
                  <span className="text-xs font-medium text-emerald-600">{stat.change}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Activity Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Recent Appointments</h3>
              <button className="text-indigo-600 text-sm font-semibold hover:underline">View All</button>
            </div>
            <div className="divide-y divide-slate-100">
              {[
                { name: 'Sarah Johnson', time: '09:00 AM', type: 'Check-up', status: 'Confirmed' },
                { name: 'Michael Chen', time: '10:30 AM', type: 'Follow-up', status: 'Pending' },
                { name: 'Emma Wilson', time: '01:15 PM', type: 'Consultation', status: 'Confirmed' },
              ].map((apt, i) => (
                <div key={i} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500">
                      {apt.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{apt.name}</p>
                      <p className="text-xs text-slate-500">{apt.type} • {apt.time}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    apt.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {apt.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
