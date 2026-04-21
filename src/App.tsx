/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BarChart3, 
  Users, 
  History, 
  Database, 
  ShieldCheck, 
  LogOut, 
  LayoutDashboard,
  Bell,
  Search,
  User as UserIcon,
  ChevronRight
} from "lucide-react";
import { User, QualityRecord, StaffingMember } from "./types";
import { Storage } from "./lib/utils";
import { meltData } from "./qualityEngine";

// Sub-componentes
import { DashboardView } from "./components/DashboardView";
import { HistoryView } from "./components/HistoryView";
import { StaffingView } from "./components/StaffingView";
import { UserManagementView } from "./components/UserManagementView";
import { DataManagementView } from "./components/DataManagementView";
import { LoginScreen } from "./components/LoginScreen";

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState("dashboard");
  const [rawData, setRawData] = useState<any[]>([]);
  const [staffing, setStaffing] = useState<StaffingMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Inicializar App
  useEffect(() => {
    const init = async () => {
      const savedUser = Storage.get<User>("current_user");
      if (savedUser) setCurrentUser(savedUser);

      const savedRaw = Storage.get<any[]>("raw_quality_data") || [];
      setRawData(savedRaw);

      const savedStaff = Storage.get<StaffingMember[]>("staffing_data") || [];
      setStaffing(savedStaff);
      
      setIsLoading(false);
    };
    init();
  }, []);

  const handleLogout = () => {
    Storage.clear("current_user");
    setCurrentUser(null);
  };

  const meltedData = useMemo(() => meltData(rawData), [rawData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!currentUser) {
    return <LoginScreen onLogin={(user) => {
      Storage.set("current_user", user);
      setCurrentUser(user);
    }} />;
  }

  const navItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Panel Principal" },
    { id: "history", icon: History, label: "Historial de Reportes" },
    { id: "staffing", icon: Users, label: "Gestión de Personal" },
    { id: "data", icon: Database, label: "Importación de Datos" },
  ];

  if (currentUser.rol === "admin") {
    navItems.push({ id: "users", icon: ShieldCheck, label: "Control de Usuarios" });
  }

  return (
    <div className="min-h-screen flex bg-surface text-slate-200 font-sans bg-mesh">
      {/* Sidebar Moderno */}
      <aside className="w-72 bg-slate-900/50 backdrop-blur-2xl border-r border-white/5 flex flex-col fixed inset-y-0 z-50">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-brand-primary to-brand-secondary flex items-center justify-center shadow-lg shadow-brand-primary/20">
              <BarChart3 className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-white tracking-tight leading-tight">Calidad B2B</h1>
              <p className="text-[10px] text-brand-primary font-bold uppercase tracking-widest opacity-80">Intelligence Portal</p>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavItem 
                key={item.id}
                active={view === item.id} 
                icon={item.icon} 
                label={item.label} 
                onClick={() => setView(item.id)} 
              />
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6">
          <div className="glass-card p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-sm font-bold text-slate-400">
                {currentUser.nombre.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{currentUser.nombre}</p>
                <p className="text-xs text-slate-500 capitalize">{currentUser.rol}</p>
              </div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 text-sm font-semibold text-slate-400 hover:text-rose-400 transition-all py-3 rounded-xl hover:bg-rose-500/10 active:scale-95 border border-transparent hover:border-rose-500/20"
          >
            <LogOut size={16} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="ml-72 flex-1 min-h-screen flex flex-col">
        <header className="h-20 px-8 flex items-center justify-between sticky top-0 z-40 bg-surface/50 backdrop-blur-xl border-b border-white/5">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">App</span>
            <ChevronRight size={14} className="text-slate-700" />
            <span className="font-semibold text-white capitalize">{navItems.find(i => i.id === view)?.label}</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-primary" size={16} />
              <input 
                type="text" 
                placeholder="Buscar métricas..." 
                className="bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs focus:ring-2 focus:ring-brand-primary/20 focus:outline-hidden transition-all w-64"
              />
            </div>
            <button className="p-2.5 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-brand-primary rounded-full border-2 border-surface"></span>
            </button>
          </div>
        </header>

        <section className="p-10 flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {view === "dashboard" && <DashboardView raw={rawData} melted={meltedData} user={currentUser} />}
              {view === "history" && <HistoryView />}
              {view === "staffing" && <StaffingView staffing={staffing} setStaffing={(s) => {
                setStaffing(s);
                Storage.set("staffing_data", s);
              }} />}
              {view === "data" && <DataManagementView onDataLoad={(d) => {
                setRawData(d);
                Storage.set("raw_quality_data", d);
              }} onClear={() => {
                setRawData([]);
                Storage.clear("raw_quality_data");
              }} />}
              {view === "users" && <UserManagementView />}
            </motion.div>
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
}

interface NavItemProps {
  icon: any;
  label: string;
  active?: boolean;
  onClick: () => void;
  key?: string | number;
}

function NavItem({ icon: Icon, label, active, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group",
        active 
          ? "bg-linear-to-r from-brand-primary/20 to-brand-secondary/10 text-brand-primary shadow-inner-border" 
          : "text-slate-500 hover:text-slate-200 hover:bg-white/5"
      )}
    >
      <Icon size={20} className={cn("transition-all", active ? "text-brand-primary scale-110" : "group-hover:scale-110")} />
      <span className={cn("text-sm font-semibold transition-all", active ? "translate-x-1" : "")}>{label}</span>
      {active && (
        <motion.div 
          layoutId="activeNav"
          className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-primary shadow-[0_0_12px_rgba(99,102,241,0.6)]"
        />
      )}
    </button>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
