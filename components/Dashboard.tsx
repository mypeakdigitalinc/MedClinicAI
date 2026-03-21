'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useAppointments, AppointmentStatus } from '@/hooks/use-appointments';
import { 
  Calendar, 
  Users, 
  Stethoscope, 
  LogOut, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  User,
  ChevronRight,
  Search,
  Bell,
  LayoutDashboard,
  X as LucideX,
  Menu,
  Trash2,
  Edit,
  List,
  TrendingUp,
  TrendingDown,
  Activity
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar, 
  Cell, 
  PieChart, 
  Pie, 
  Legend 
} from 'recharts';
import { 
  format, 
  isToday, 
  isFuture, 
  addMinutes, 
  startOfHour, 
  setHours, 
  setMinutes,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isSameYear,
  subDays,
  startOfToday,
  endOfToday
} from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Dashboard() {
  const { profile, logout } = useAuth();
  const { 
    appointments, 
    loading, 
    doctors, 
    patients,
    bookAppointment, 
    updateStatus, 
    updateAppointment,
    deleteAppointment,
    updateDoctorProfile, 
    addDoctor, 
    deleteDoctor,
    addPatient,
    updatePatientProfile,
    deletePatient
  } = useAppointments();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  if (loading) return null;

  const filteredAppointments = appointments.filter(app => 
    app.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDoctors = doctors.filter(doc => 
    doc.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPatients = patients.filter(pat => 
    pat.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pat.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const recentNotifications = appointments
    .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
    .slice(0, 5);

  const renderDashboard = () => {
    // ... existing switch logic ...
    switch (activeTab) {
      case 'calendar':
        return <CalendarView 
          appointments={filteredAppointments} 
          role={profile?.role} 
          doctors={doctors}
          patients={patients}
          bookAppointment={bookAppointment}
          updateAppointment={updateAppointment}
          deleteAppointment={deleteAppointment}
          addDoctor={addDoctor}
          addPatient={addPatient}
        />;
      case 'doctors':
        return profile?.role === 'front_desk' ? <DoctorManagement doctors={filteredDoctors} updateDoctorProfile={updateDoctorProfile} addDoctor={addDoctor} deleteDoctor={deleteDoctor} /> : null;
      case 'patients':
        return profile?.role === 'front_desk' ? <PatientManagement patients={filteredPatients} updatePatientProfile={updatePatientProfile} addPatient={addPatient} deletePatient={deletePatient} /> : null;
      case 'overview':
        if (profile?.role === 'front_desk' || profile?.role === 'doctor') {
          return <ClinicOverview appointments={filteredAppointments} doctors={doctors} patients={patients} role={profile?.role} />;
        }
        return <PatientDashboard appointments={filteredAppointments} doctors={doctors} bookAppointment={bookAppointment} />;
      case 'appointments':
        if (profile?.role === 'patient') return <PatientDashboard appointments={filteredAppointments} doctors={doctors} bookAppointment={bookAppointment} />;
        if (profile?.role === 'doctor') return <DoctorDashboard appointments={filteredAppointments} updateStatus={updateStatus} />;
        if (profile?.role === 'front_desk') return <FrontDeskDashboard appointments={filteredAppointments} doctors={doctors} updateStatus={updateStatus} />;
        return null;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden relative">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-72 bg-white border-r border-slate-200 flex flex-col z-50 transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-auto",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
              <Stethoscope className="w-6 h-6" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">MedClinic AI</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-400">
            <LucideX className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <SidebarItem 
            icon={<LayoutDashboard className="w-5 h-5" />} 
            label="Overview" 
            active={activeTab === 'overview'} 
            onClick={() => { setActiveTab('overview'); setIsSidebarOpen(false); }} 
          />
          <SidebarItem 
            icon={<Calendar className="w-5 h-5" />} 
            label="Appointments" 
            active={activeTab === 'calendar'} 
            onClick={() => { setActiveTab('calendar'); setIsSidebarOpen(false); }} 
          />
          {profile?.role === 'front_desk' && (
            <SidebarItem 
              icon={<Stethoscope className="w-5 h-5" />} 
              label="Doctors" 
              active={activeTab === 'doctors'} 
              onClick={() => { setActiveTab('doctors'); setIsSidebarOpen(false); }} 
            />
          )}
          {profile?.role === 'front_desk' && (
            <SidebarItem 
              icon={<Users className="w-5 h-5" />} 
              label="Patients" 
              active={activeTab === 'patients'} 
              onClick={() => { setActiveTab('patients'); setIsSidebarOpen(false); }} 
            />
          )}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden relative">
              <Image 
                src={`https://picsum.photos/seed/${profile?.uid}/100/100`} 
                alt="Avatar" 
                fill 
                className="object-cover" 
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{profile?.displayName}</p>
              <p className="text-xs text-slate-500 capitalize">{profile?.role.replace('_', ' ')}</p>
            </div>
            <button onClick={logout} className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 hover:bg-slate-100 rounded-xl text-slate-900">
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden sm:flex items-center gap-4 bg-slate-100 px-4 py-2 rounded-xl w-64 lg:w-96">
              <Search className="w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search appointments, doctors..." 
                className="bg-transparent border-none text-sm focus:ring-0 w-full" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 lg:gap-4 relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className={cn(
                "p-2.5 rounded-xl transition-colors relative",
                showNotifications ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:bg-slate-100"
              )}
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white" />
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden"
                >
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                    <h4 className="font-bold text-slate-900">Notifications</h4>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recent Activity</span>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {recentNotifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <p className="text-slate-400 text-sm">No new notifications</p>
                      </div>
                    ) : (
                      recentNotifications.map((app) => (
                        <div key={app.id} className="p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                          <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
                              <Calendar className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate">
                                {app.patientName}
                              </p>
                              <p className="text-[10px] text-slate-500">
                                {app.status} with {app.doctorName}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-1">
                                {format(app.startTime, 'MMM d, HH:mm')}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-3 bg-slate-50 text-center">
                    <button className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:text-indigo-700">
                      View All Activity
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="lg:hidden w-10 h-10 rounded-full bg-slate-200 overflow-hidden relative">
              <Image 
                src={`https://picsum.photos/seed/${profile?.uid}/100/100`} 
                alt="Avatar" 
                fill 
                className="object-cover" 
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-8">
          {renderDashboard()}
        </div>
      </main>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
        active 
          ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10" 
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
      )}
    >
      <span className={cn("transition-colors", active ? "text-white" : "text-slate-400 group-hover:text-slate-900")}>
        {icon}
      </span>
      {label}
    </button>
  );
}

function ClinicOverview({ appointments, doctors, patients, role }: any) {
  // 1. Appointments over the last 7 days
  const last7Days = eachDayOfInterval({
    start: subDays(startOfToday(), 6),
    end: endOfToday()
  }).map(date => {
    const count = appointments.filter((a: any) => isSameDay(a.startTime, date)).length;
    return {
      name: format(date, 'EEE'),
      appointments: count
    };
  });

  // 2. Status Distribution
  const statusData = [
    { name: 'Completed', value: appointments.filter((a: any) => a.status === 'Completed').length, color: '#10b981' },
    { name: 'Upcoming', value: appointments.filter((a: any) => a.status === 'Upcoming' || a.status === 'Confirmed' || a.status === 'New').length, color: '#6366f1' },
    { name: 'No Show', value: appointments.filter((a: any) => a.status === 'No Show').length, color: '#f43f5e' },
    { name: 'Checked In', value: appointments.filter((a: any) => a.status === 'Checked In').length, color: '#f59e0b' },
  ].filter(d => d.value > 0);

  // 3. Appointments per Doctor
  const doctorData = doctors.map((d: any) => ({
    name: d.displayName.split(' ').pop(),
    appointments: appointments.filter((a: any) => a.doctorId === d.uid).length
  })).sort((a: any, b: any) => b.appointments - a.appointments).slice(0, 5);

  const todayCount = appointments.filter((a: any) => isToday(a.startTime)).length;
  const yesterdayCount = appointments.filter((a: any) => isSameDay(a.startTime, subDays(new Date(), 1))).length;
  const growth = yesterdayCount === 0 ? 100 : Math.round(((todayCount - yesterdayCount) / yesterdayCount) * 100);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Clinic Overview</h2>
          <p className="text-slate-500 mt-1">Real-time analytics and clinic performance</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Live Data</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-white rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Calendar className="w-6 h-6" />
            </div>
            <div className={cn("flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg", growth >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600")}>
              {growth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(growth)}%
            </div>
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Today&apos;s Appointments</p>
            <h4 className="text-3xl font-black text-slate-900">{todayCount}</h4>
          </div>
        </div>

        <div className="p-6 bg-white rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Total Patients</p>
            <h4 className="text-3xl font-black text-slate-900">{patients.length}</h4>
          </div>
        </div>

        <div className="p-6 bg-white rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <Stethoscope className="w-6 h-6" />
            </div>
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Active Doctors</p>
            <h4 className="text-3xl font-black text-slate-900">{doctors.length}</h4>
          </div>
        </div>

        <div className="p-6 bg-white rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-slate-900 text-white rounded-2xl">
              <Activity className="w-6 h-6" />
            </div>
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Completion Rate</p>
            <h4 className="text-3xl font-black text-slate-900">
              {appointments.length > 0 
                ? Math.round((appointments.filter((a: any) => a.status === 'Completed').length / appointments.length) * 100) 
                : 0}%
            </h4>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-900">Appointment Trends</h3>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Last 7 Days</span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last7Days}>
                <defs>
                  <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '16px', 
                    border: '1px solid #f1f5f9',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="appointments" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorApps)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-900">Status Distribution</h3>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">All Time</span>
          </div>
          <div className="h-[300px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '16px', 
                    border: '1px solid #f1f5f9'
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  iconType="circle"
                  formatter={(value) => <span className="text-xs font-bold text-slate-600">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-900">Top Doctors</h3>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">By Appointments</span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={doctorData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: '#475569', fontSize: 12, fontWeight: 'bold' }}
                  width={80}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '16px', 
                    border: '1px solid #f1f5f9'
                  }}
                />
                <Bar dataKey="appointments" fill="#0f172a" radius={[0, 10, 10, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-xl font-bold text-slate-900">Recent Activity</h3>
          <div className="space-y-6">
            {appointments.slice(0, 5).map((app: any) => (
              <div key={app.id} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{app.patientName}</p>
                    <p className="text-xs text-slate-500">Booked with {app.doctorName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-900">{format(app.startTime, 'MMM d')}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">{format(app.startTime, 'HH:mm')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PatientDashboard({ appointments, doctors, bookAppointment }: any) {
  const [showBooking, setShowBooking] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedTime, setSelectedTime] = useState('09:00');

  const upcoming = appointments.filter((a: any) => isFuture(a.startTime) && a.status !== 'Completed');
  const history = appointments.filter((a: any) => a.status === 'Completed' || a.status === 'No Show');

  const handleBook = async () => {
    // ... existing book logic ...
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-slate-900">Patient Dashboard</h2>
          <p className="text-slate-500 mt-1 text-sm lg:text-base">Manage your health and appointments</p>
        </div>
        <button 
          onClick={() => setShowBooking(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-semibold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10"
        >
          <Plus className="w-5 h-5" />
          Book Appointment
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-6 lg:space-y-8">
          <div className="bg-white p-6 lg:p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">Health Activity</h3>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Appointments per Month</span>
            </div>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Jan', count: 1 },
                  { name: 'Feb', count: 2 },
                  { name: 'Mar', count: appointments.length },
                  { name: 'Apr', count: 0 },
                  { name: 'May', count: 0 },
                  { name: 'Jun', count: 0 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9' }}
                  />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-500" />
              Upcoming Appointments
            </h3>
            <div className="space-y-4">
              {upcoming.length === 0 ? (
                <div className="p-8 lg:p-12 bg-white rounded-3xl border border-dashed border-slate-200 text-center">
                  <p className="text-slate-400 text-sm">No upcoming appointments scheduled.</p>
                </div>
              ) : (
                upcoming.map((app: any) => (
                  <AppointmentCard key={app.id} appointment={app} />
                ))
              )}
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-500" />
              Past History
            </h3>
            <div className="bg-white rounded-3xl border border-slate-200 overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[500px]">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-bold text-slate-900">Doctor</th>
                    <th className="px-6 py-4 font-bold text-slate-900">Date</th>
                    <th className="px-6 py-4 font-bold text-slate-900">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.map((app: any) => (
                    <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{app.doctorName}</td>
                      <td className="px-6 py-4 text-slate-500">{format(app.startTime, 'MMM d, yyyy')}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={app.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="space-y-6 lg:space-y-8">
          <div className="p-6 lg:p-8 bg-slate-900 rounded-[2rem] text-white space-y-6">
            <h3 className="text-xl font-bold">Need help?</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Our AI assistant can help you book appointments, answer questions about clinic hours, or help you find the right doctor.
            </p>
            <div className="pt-4">
              <div className="flex items-center gap-3 p-4 bg-white/10 rounded-2xl">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-sm font-medium">Assistant is Online</span>
              </div>
            </div>
          </div>

          <div className="p-6 lg:p-8 bg-white rounded-[2rem] border border-slate-200 space-y-6">
            <h3 className="text-lg font-bold text-slate-900">Our Doctors</h3>
            <div className="space-y-4">
              {doctors.map((doc: any) => (
                <div key={doc.uid} className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden relative">
                    <Image 
                      src={`https://picsum.photos/seed/${doc.uid}/100/100`} 
                      alt={doc.displayName} 
                      fill 
                      className="object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{doc.displayName}</p>
                    <p className="text-xs text-slate-500">{doc.specialization}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBooking && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl"
          >
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-slate-900">Book Appointment</h3>
              <button onClick={() => setShowBooking(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <LucideX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900">Select Doctor</label>
                <select 
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  className="w-full bg-slate-50 border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-slate-900 transition-all"
                >
                  <option value="">Choose a doctor...</option>
                  {doctors.map((doc: any) => (
                    <option key={doc.uid} value={doc.uid}>{doc.displayName} - {doc.specialization}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-900">Date</label>
                  <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-slate-50 border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-slate-900 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-900">Time</label>
                  <input 
                    type="time" 
                    value={selectedTime}
                    min="09:00"
                    max="17:00"
                    step="900"
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full bg-slate-50 border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-slate-900 transition-all"
                  />
                </div>
              </div>
              <div className="p-4 bg-emerald-50 rounded-2xl flex gap-3 text-emerald-700 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>Appointments are exactly 15 minutes. Operating hours are 9:00 AM to 5:00 PM.</p>
              </div>
              <button 
                onClick={handleBook}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10"
              >
                Confirm Booking
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function DoctorDashboard({ appointments, updateStatus }: any) {
  const today = appointments.filter((a: any) => isToday(a.startTime));
  const pending = today.filter((a: any) => a.status !== 'Completed' && a.status !== 'No Show');

  return (
    <div className="space-y-6 lg:space-y-8">
      <div>
        <h2 className="text-2xl lg:text-3xl font-bold text-slate-900">Doctor Dashboard</h2>
        <p className="text-slate-500 mt-1 text-sm lg:text-base">Your schedule for today, {format(new Date(), 'MMMM d, yyyy')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard icon={<Calendar className="w-5 h-5" />} label="Total Today" value={today.length} color="indigo" />
        <StatCard icon={<Clock className="w-5 h-5" />} label="Pending" value={pending.length} color="amber" />
        <StatCard icon={<CheckCircle2 className="w-5 h-5" />} label="Completed" value={today.length - pending.length} color="emerald" />
        <StatCard icon={<Users className="w-5 h-5" />} label="Patients" value={new Set(today.map((a: any) => a.patientId)).size} color="slate" />
      </div>

      <div className="bg-white rounded-[2rem] lg:rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 lg:p-8 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-xl font-bold text-slate-900">Daily Schedule</h3>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-500">9:00 AM - 5:00 PM</span>
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {today.length === 0 ? (
            <div className="p-12 lg:p-20 text-center">
              <p className="text-slate-400">No appointments scheduled for today.</p>
            </div>
          ) : (
            today.map((app: any) => (
              <div key={app.id} className="p-6 lg:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-6">
                  <div className="text-center w-16 lg:w-20">
                    <p className="text-base lg:text-lg font-bold text-slate-900">{format(app.startTime, 'HH:mm')}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">15 min</p>
                  </div>
                  <div className="hidden sm:block w-px h-12 bg-slate-200" />
                  <div>
                    <p className="text-base lg:text-lg font-bold text-slate-900">{app.patientName}</p>
                    <p className="text-xs lg:text-sm text-slate-500">Routine Checkup</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <StatusBadge status={app.status} />
                  <select 
                    value={app.status}
                    onChange={(e) => updateStatus(app.id, e.target.value as AppointmentStatus)}
                    className="bg-slate-100 border-none rounded-xl px-3 py-1.5 text-xs font-bold text-slate-600 focus:ring-0"
                  >
                    <option value="New">New</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Checked In">Checked In</option>
                    <option value="Completed">Completed</option>
                    <option value="No Show">No Show</option>
                  </select>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function FrontDeskDashboard({ appointments, doctors, updateStatus }: any) {
  const [selectedDoctor, setSelectedDoctor] = useState('all');
  const filtered = selectedDoctor === 'all' ? appointments : appointments.filter((a: any) => a.doctorId === selectedDoctor);

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-slate-900">Front Desk Master View</h2>
          <p className="text-slate-500 mt-1 text-sm lg:text-base">Manage all clinic appointments and check-ins</p>
        </div>
        <div className="w-full sm:w-auto">
          <select 
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
            className="w-full bg-white border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 shadow-sm focus:ring-2 focus:ring-slate-900 transition-all"
          >
            <option value="all">All Doctors</option>
            {doctors.map((doc: any) => (
              <option key={doc.uid} value={doc.uid}>{doc.displayName}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] lg:rounded-[2.5rem] border border-slate-200 overflow-x-auto shadow-sm">
        <table className="w-full text-left min-w-[700px]">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 lg:px-8 py-5 font-bold text-slate-900">Time</th>
              <th className="px-6 lg:px-8 py-5 font-bold text-slate-900">Patient</th>
              <th className="px-6 lg:px-8 py-5 font-bold text-slate-900">Doctor</th>
              <th className="px-6 lg:px-8 py-5 font-bold text-slate-900">Status</th>
              <th className="px-6 lg:px-8 py-5 font-bold text-slate-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((app: any) => (
              <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 lg:px-8 py-6">
                  <p className="font-bold text-slate-900">{format(app.startTime, 'HH:mm')}</p>
                  <p className="text-xs text-slate-500">{format(app.startTime, 'MMM d')}</p>
                </td>
                <td className="px-6 lg:px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-slate-900">{app.patientName}</span>
                  </div>
                </td>
                <td className="px-6 lg:px-8 py-6">
                  <span className="text-slate-600 font-medium">{app.doctorName}</span>
                </td>
                <td className="px-6 lg:px-8 py-6">
                  <StatusBadge status={app.status} />
                </td>
                <td className="px-6 lg:px-8 py-6">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => updateStatus(app.id, 'Checked In')}
                      className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors"
                    >
                      Check In
                    </button>
                    <button 
                      onClick={() => updateStatus(app.id, 'No Show')}
                      className="px-3 py-1.5 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-100 transition-colors"
                    >
                      No Show
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DoctorManagement({ doctors, updateDoctorProfile, addDoctor, deleteDoctor }: any) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<any>(null);
  const [formData, setFormData] = useState({ displayName: '', specialization: '', email: '' });
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDoctors = doctors.filter((d: any) => 
    d.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.email && d.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleEdit = (doc: any) => {
    setEditingDoctor(doc);
    setFormData({ displayName: doc.displayName, specialization: doc.specialization, email: doc.email || '' });
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingDoctor(null);
    setFormData({ displayName: '', specialization: '', email: '' });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (editingDoctor) {
      await updateDoctorProfile(editingDoctor.uid, formData);
    } else {
      await addDoctor(formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (uid: string) => {
    if (confirm('Are you sure you want to delete this doctor?')) {
      await deleteDoctor(uid);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Doctor Management</h2>
          <p className="text-slate-500 mt-1">Manage clinic doctors and their specializations</p>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search doctors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-slate-900 transition-all outline-none"
            />
          </div>
          <button 
            onClick={handleAdd}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10"
          >
            <Plus className="w-5 h-5" />
            Add Doctor
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Doctor</th>
                <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Specialization</th>
                <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Email</th>
                <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDoctors.map((doc: any) => (
                <tr key={doc.uid} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden relative">
                        <Image 
                          src={`https://picsum.photos/seed/${doc.uid}/100/100`} 
                          alt={doc.displayName} 
                          fill 
                          className="object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <span className="font-bold text-slate-900">{doc.displayName}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                      {doc.specialization}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-sm text-slate-500">{doc.email || 'N/A'}</td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(doc)}
                        className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(doc.uid)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredDoctors.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-12 text-center text-slate-400">
                    No doctors found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-2xl font-bold text-slate-900">
                  {editingDoctor ? 'Edit Doctor Profile' : 'Add New Doctor'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-colors">
                  <LucideX className="w-5 h-5" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-900">Display Name</label>
                  <input 
                    type="text" 
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    placeholder="Dr. John Doe"
                    className="w-full bg-slate-50 border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-slate-900 transition-all outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-900">Specialization</label>
                  <input 
                    type="text" 
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    placeholder="Cardiology"
                    className="w-full bg-slate-50 border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-slate-900 transition-all outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-900">Email Address</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john.doe@medclinic.ai"
                    className="w-full bg-slate-50 border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-slate-900 transition-all outline-none"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 bg-slate-100 text-slate-900 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10"
                  >
                    {editingDoctor ? 'Save Changes' : 'Add Doctor'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PatientManagement({ patients, updatePatientProfile, addPatient, deletePatient }: any) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<any>(null);
  const [formData, setFormData] = useState({ displayName: '', email: '' });
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPatients = patients.filter((p: any) => 
    p.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.email && p.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleEdit = (patient: any) => {
    setEditingPatient(patient);
    setFormData({ displayName: patient.displayName, email: patient.email || '' });
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingPatient(null);
    setFormData({ displayName: '', email: '' });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (editingPatient) {
      await updatePatientProfile(editingPatient.uid, formData);
    } else {
      await addPatient(formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (uid: string) => {
    if (confirm('Are you sure you want to delete this patient?')) {
      await deletePatient(uid);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Patient Management</h2>
          <p className="text-slate-500 mt-1">Manage clinic patients and their records</p>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-slate-900 transition-all outline-none"
            />
          </div>
          <button 
            onClick={handleAdd}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10"
          >
            <Plus className="w-5 h-5" />
            Add Patient
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Patient</th>
                <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Email</th>
                <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient: any) => (
                <tr key={patient.uid} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden relative">
                        <Image 
                          src={`https://picsum.photos/seed/${patient.uid}/100/100`} 
                          alt={patient.displayName} 
                          fill 
                          className="object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <span className="font-bold text-slate-900">{patient.displayName}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm text-slate-500">{patient.email || 'N/A'}</td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(patient)}
                        className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(patient.uid)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPatients.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-8 py-12 text-center text-slate-400">
                    No patients found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-2xl font-bold text-slate-900">
                  {editingPatient ? 'Edit Patient Profile' : 'Add New Patient'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-colors">
                  <LucideX className="w-5 h-5" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-900">Display Name</label>
                  <input 
                    type="text" 
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    placeholder="Jane Doe"
                    className="w-full bg-slate-50 border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-slate-900 transition-all outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-900">Email Address</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="jane.doe@example.com"
                    className="w-full bg-slate-50 border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-slate-900 transition-all outline-none"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 bg-slate-100 text-slate-900 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10"
                  >
                    {editingPatient ? 'Save Changes' : 'Add Patient'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CalendarView({ appointments, role, doctors, patients, bookAppointment, updateAppointment, deleteAppointment, addDoctor, addPatient }: any) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'table'>('calendar');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<any>(null);
  
  const [isAddingPatient, setIsAddingPatient] = useState(false);
  const [isAddingDoctor, setIsAddingDoctor] = useState(false);
  const [newPatientData, setNewPatientData] = useState({ displayName: '', email: '' });
  const [newDoctorData, setNewDoctorData] = useState({ displayName: '', specialization: '', email: '' });

  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '09:00',
    duration: '30',
    status: 'New' as AppointmentStatus,
    notes: ''
  });
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const selectedDayAppointments = selectedDay 
    ? appointments.filter((app: any) => isSameDay(app.startTime, selectedDay))
    : [];

  const handleAdd = (date?: Date) => {
    setEditingAppointment(null);
    const targetDate = date || selectedDay || new Date();
    setFormData({
      patientId: '',
      doctorId: '',
      date: format(targetDate, 'yyyy-MM-dd'),
      time: '09:00',
      duration: '30',
      status: 'New',
      notes: ''
    });
    setIsAddingPatient(false);
    setIsAddingDoctor(false);
    setIsModalOpen(true);
  };

  const handleEdit = (app: any) => {
    setEditingAppointment(app);
    setFormData({
      patientId: app.patientId,
      doctorId: app.doctorId,
      date: format(app.startTime, 'yyyy-MM-dd'),
      time: format(app.startTime, 'HH:mm'),
      duration: '30',
      status: app.status,
      notes: app.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this appointment?')) {
      await deleteAppointment(id);
    }
  };

  const handleQuickAddPatient = async () => {
    if (!newPatientData.displayName) return;
    const result = await addPatient(newPatientData);
    if (result) {
      setFormData(prev => ({ ...prev, patientId: result.id }));
      setIsAddingPatient(false);
      setNewPatientData({ displayName: '', email: '' });
    }
  };

  const handleQuickAddDoctor = async () => {
    if (!newDoctorData.displayName || !newDoctorData.specialization) return;
    const result = await addDoctor(newDoctorData);
    if (result) {
      setFormData(prev => ({ ...prev, doctorId: result.id }));
      setIsAddingDoctor(false);
      setNewDoctorData({ displayName: '', specialization: '', email: '' });
    }
  };

  const handleSave = async () => {
    const start = new Date(`${formData.date}T${formData.time}`);
    const end = addMinutes(start, parseInt(formData.duration));
    const patient = patients.find((p: any) => p.uid === formData.patientId);
    const doctor = doctors.find((d: any) => d.uid === formData.doctorId);

    const appointmentData = {
      patientId: formData.patientId,
      patientName: patient?.displayName || 'Unknown Patient',
      doctorId: formData.doctorId,
      doctorName: doctor?.displayName || 'Unknown Doctor',
      startTime: start,
      endTime: end,
      status: formData.status,
      notes: formData.notes
    };

    if (editingAppointment) {
      await updateAppointment(editingAppointment.id, appointmentData);
    } else {
      await bookAppointment(appointmentData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-slate-900">Clinic Appointments</h2>
          <p className="text-slate-500 mt-1 text-sm lg:text-base">Manage and view all clinic schedules</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
            <button 
              onClick={() => setViewMode('calendar')}
              className={cn(
                "p-2 rounded-xl transition-all",
                viewMode === 'calendar' ? "bg-slate-900 text-white" : "text-slate-400 hover:bg-slate-50"
              )}
            >
              <Calendar className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setViewMode('table')}
              className={cn(
                "p-2 rounded-xl transition-all",
                viewMode === 'table' ? "bg-slate-900 text-white" : "text-slate-400 hover:bg-slate-50"
              )}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
          {role === 'front_desk' && (
            <button 
              onClick={() => handleAdd()}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10"
            >
              <Plus className="w-5 h-5" />
              New Appointment
            </button>
          )}
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <div className="space-y-6 lg:space-y-8">
          <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm w-fit">
            <button onClick={prevMonth} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
            <span className="font-bold text-slate-900 min-w-[140px] text-center">
              {format(currentDate, 'MMMM yyyy')}
            </span>
            <button onClick={nextMonth} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2 bg-white rounded-[2rem] lg:rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
              <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="px-2 lg:px-4 py-4 text-center text-[10px] lg:text-xs font-black text-slate-400 uppercase tracking-widest">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {calendarDays.map((day, i) => {
                  const dayAppointments = appointments.filter((app: any) => isSameDay(app.startTime, day));
                  const isCurrentMonth = isSameMonth(day, monthStart);
                  const isTodayDay = isSameDay(day, new Date());
                  const isSelected = selectedDay && isSameDay(day, selectedDay);

                  return (
                    <div 
                      key={i} 
                      onClick={() => setSelectedDay(day)}
                      onDoubleClick={() => role === 'front_desk' && handleAdd(day)}
                      className={cn(
                        "min-h-[80px] lg:min-h-[100px] p-1 lg:p-2 border-r border-b border-slate-100 transition-colors cursor-pointer",
                        !isCurrentMonth && "bg-slate-50/30",
                        isSelected && "bg-slate-900/5 ring-2 ring-inset ring-slate-900/10",
                        !isSelected && "hover:bg-slate-50/50",
                        (i + 1) % 7 === 0 && "border-r-0"
                      )}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className={cn(
                          "w-6 h-6 lg:w-7 h-7 flex items-center justify-center rounded-full text-[10px] lg:text-xs font-bold",
                          isTodayDay ? "bg-slate-900 text-white" : isCurrentMonth ? "text-slate-900" : "text-slate-300"
                        )}>
                          {format(day, 'd')}
                        </span>
                        {dayAppointments.length > 0 && (
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 mr-1" />
                        )}
                      </div>
                      <div className="space-y-0.5 hidden sm:block">
                        {dayAppointments.slice(0, 2).map((app: any) => (
                          <div 
                            key={app.id} 
                            onDoubleClick={(e) => {
                              if (role === 'front_desk') {
                                e.stopPropagation();
                                handleEdit(app);
                              }
                            }}
                            className="px-1.5 py-0.5 bg-slate-100 rounded text-[9px] font-bold text-slate-600 truncate hover:bg-slate-200 transition-colors"
                          >
                            {format(app.startTime, 'HH:mm')}
                          </div>
                        ))}
                        {dayAppointments.length > 2 && (
                          <div className="text-[9px] font-bold text-slate-400 px-1">
                            + {dayAppointments.length - 2}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-6 lg:p-8 bg-white rounded-[2rem] border border-slate-200 shadow-sm min-h-[300px] lg:min-h-[400px]">
                <h3 className="text-lg lg:text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-500" />
                  {selectedDay ? format(selectedDay, 'MMMM d, yyyy') : 'Select a day'}
                </h3>
                
                <div className="space-y-4">
                  {selectedDayAppointments.length === 0 ? (
                    <div className="py-8 lg:py-12 text-center">
                      <p className="text-slate-400 text-sm">No appointments for this day.</p>
                    </div>
                  ) : (
                    selectedDayAppointments.map((app: any) => (
                      <div key={app.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 group hover:bg-white hover:shadow-md transition-all">
                        <div className="flex justify-between items-start">
                          <p className="font-bold text-slate-900 text-sm">{format(app.startTime, 'HH:mm')} - {format(app.endTime, 'HH:mm')}</p>
                          <StatusBadge status={app.status} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Patient</p>
                            <p className="text-xs font-medium text-slate-900 truncate">{app.patientName}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Doctor</p>
                            <p className="text-xs font-medium text-slate-900 truncate">{app.doctorName}</p>
                          </div>
                        </div>
                        {role === 'front_desk' && (
                          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleEdit(app); }}
                              className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleDelete(app.id); }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Date & Time</th>
                  <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Patient</th>
                  <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Doctor</th>
                  <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((app: any) => (
                  <tr key={app.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <p className="font-bold text-slate-900 text-sm">{format(app.startTime, 'MMM d, yyyy')}</p>
                      <p className="text-xs text-slate-500">{format(app.startTime, 'HH:mm')} - {format(app.endTime, 'HH:mm')}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                          <User className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-slate-900 text-sm">{app.patientName}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                          <Stethoscope className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-slate-900 text-sm">{app.doctorName}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-8 py-6 text-right">
                      {role === 'front_desk' && (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleEdit(app)}
                            className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(app.id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-2xl font-bold text-slate-900">
                  {editingAppointment ? 'Edit Appointment' : 'New Appointment'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-colors">
                  <LucideX className="w-5 h-5" />
                </button>
              </div>
              <div className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-bold text-slate-900">Patient</label>
                      <button 
                        onClick={() => setIsAddingPatient(!isAddingPatient)}
                        className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700"
                      >
                        {isAddingPatient ? 'Cancel' : '+ Quick Add'}
                      </button>
                    </div>
                    {isAddingPatient ? (
                      <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-3">
                        <input 
                          type="text" 
                          placeholder="Patient Name"
                          value={newPatientData.displayName}
                          onChange={(e) => setNewPatientData({ ...newPatientData, displayName: e.target.value })}
                          className="w-full bg-white border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <input 
                          type="email" 
                          placeholder="Email (Optional)"
                          value={newPatientData.email}
                          onChange={(e) => setNewPatientData({ ...newPatientData, email: e.target.value })}
                          className="w-full bg-white border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button 
                          onClick={handleQuickAddPatient}
                          className="w-full py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all"
                        >
                          Create Patient
                        </button>
                      </div>
                    ) : (
                      <select 
                        value={formData.patientId}
                        onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                        className="w-full bg-slate-50 border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-slate-900 transition-all outline-none"
                      >
                        <option value="">Select Patient</option>
                        {patients.map((p: any) => (
                          <option key={p.uid} value={p.uid}>{p.displayName}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-bold text-slate-900">Doctor</label>
                      <button 
                        onClick={() => setIsAddingDoctor(!isAddingDoctor)}
                        className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700"
                      >
                        {isAddingDoctor ? 'Cancel' : '+ Quick Add'}
                      </button>
                    </div>
                    {isAddingDoctor ? (
                      <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-3">
                        <input 
                          type="text" 
                          placeholder="Doctor Name"
                          value={newDoctorData.displayName}
                          onChange={(e) => setNewDoctorData({ ...newDoctorData, displayName: e.target.value })}
                          className="w-full bg-white border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <input 
                          type="text" 
                          placeholder="Specialization"
                          value={newDoctorData.specialization}
                          onChange={(e) => setNewDoctorData({ ...newDoctorData, specialization: e.target.value })}
                          className="w-full bg-white border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <input 
                          type="email" 
                          placeholder="Email (Optional)"
                          value={newDoctorData.email}
                          onChange={(e) => setNewDoctorData({ ...newDoctorData, email: e.target.value })}
                          className="w-full bg-white border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button 
                          onClick={handleQuickAddDoctor}
                          className="w-full py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all"
                        >
                          Create Doctor
                        </button>
                      </div>
                    ) : (
                      <select 
                        value={formData.doctorId}
                        onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                        className="w-full bg-slate-50 border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-slate-900 transition-all outline-none"
                      >
                        <option value="">Select Doctor</option>
                        {doctors.map((d: any) => (
                          <option key={d.uid} value={d.uid}>{d.displayName}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-900">Date</label>
                    <input 
                      type="date" 
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full bg-slate-50 border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-slate-900 transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-900">Time</label>
                    <input 
                      type="time" 
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="w-full bg-slate-50 border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-slate-900 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-900">Duration (min)</label>
                    <select 
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="w-full bg-slate-50 border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-slate-900 transition-all outline-none"
                    >
                      <option value="15">15 min</option>
                      <option value="30">30 min</option>
                      <option value="45">45 min</option>
                      <option value="60">60 min</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-900">Status</label>
                    <select 
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as AppointmentStatus })}
                      className="w-full bg-slate-50 border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-slate-900 transition-all outline-none"
                    >
                      <option value="New">New</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Upcoming">Upcoming</option>
                      <option value="Checked In">Checked In</option>
                      <option value="Completed">Completed</option>
                      <option value="No Show">No Show</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-900">Notes</label>
                  <textarea 
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Reason for visit, special instructions..."
                    className="w-full bg-slate-50 border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-slate-900 transition-all outline-none min-h-[100px]"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 bg-slate-100 text-slate-900 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={!formData.patientId || !formData.doctorId}
                    className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editingAppointment ? 'Save Changes' : 'Book Appointment'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AppointmentCard({ appointment }: { appointment: any }) {
  return (
    <div className="p-4 lg:p-6 bg-white rounded-3xl border border-slate-200 flex items-center justify-between hover:shadow-lg hover:shadow-slate-200/50 transition-all group">
      <div className="flex items-center gap-4 lg:gap-6">
        <div className="p-3 lg:p-4 bg-slate-50 rounded-2xl group-hover:bg-slate-900 group-hover:text-white transition-colors">
          <Calendar className="w-5 h-5 lg:w-6 lg:h-6" />
        </div>
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
            <h4 className="font-bold text-slate-900 text-sm lg:text-base">{appointment.doctorName}</h4>
            <span className="hidden sm:block text-xs text-slate-400">•</span>
            <span className="text-[10px] lg:text-xs font-bold text-slate-500 uppercase tracking-wider">Routine Checkup</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs lg:text-sm text-slate-500">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
              {format(appointment.startTime, 'MMM d, yyyy • HH:mm')}
            </div>
            <div className="hidden sm:block w-1.5 h-1.5 bg-slate-200 rounded-full" />
            <StatusBadge status={appointment.status} />
          </div>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-900 transition-colors shrink-0" />
    </div>
  );
}

function StatusBadge({ status }: { status: AppointmentStatus }) {
  const styles = {
    'New': 'bg-blue-50 text-blue-600',
    'Confirmed': 'bg-indigo-50 text-indigo-600',
    'Upcoming': 'bg-emerald-50 text-emerald-600',
    'Checked In': 'bg-amber-50 text-amber-600',
    'Completed': 'bg-slate-100 text-slate-600',
    'No Show': 'bg-rose-50 text-rose-600',
  };

  return (
    <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest", styles[status])}>
      {status}
    </span>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: number, color: string }) {
  const colors: any = {
    indigo: 'bg-indigo-50 text-indigo-600',
    amber: 'bg-amber-50 text-amber-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    slate: 'bg-slate-100 text-slate-600',
  };

  return (
    <div className="p-6 bg-white rounded-3xl border border-slate-200 space-y-4">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", colors[color])}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-black text-slate-900">{value}</p>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
}

function X({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  );
}
