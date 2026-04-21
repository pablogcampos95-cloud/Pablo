import { useState } from "react";
import { Users, UserPlus, Search, Trash2, Shield, Filter, Map, X, Contact } from "lucide-react";
import { StaffingMember } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface StaffingProps {
  staffing: StaffingMember[];
  setStaffing: (s: StaffingMember[]) => void;
}

export function StaffingView({ staffing, setStaffing }: StaffingProps) {
  const [search, setSearch] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newMember, setNewMember] = useState<StaffingMember>({
    asesor: "",
    supervisor: "",
    coordinador: "",
    antiguedad: 0,
    fechaIngreso: ""
  });

  const handleAdd = () => {
    if (!newMember.asesor.trim() || !newMember.supervisor.trim()) return;
    setStaffing([...staffing, { ...newMember, asesor: newMember.asesor.toUpperCase() }]);
    setNewMember({ asesor: "", supervisor: "", coordinador: "", antiguedad: 0, fechaIngreso: "" });
    setIsAdding(false);
  };

  const removeMember = (asesor: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar a ${asesor}?`)) return;
    setStaffing(staffing.filter(s => s.asesor !== asesor));
  };

  const filtered = staffing.filter(s => 
    s.asesor.toLowerCase().includes(search.toLowerCase()) || 
    s.supervisor.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/5 pb-8 mb-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-white tracking-tight">Estructura del Personal</h2>
          <p className="text-slate-500 mt-2 font-medium">Gestión jerárquica y organización de los nodos operativos.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="btn-primary flex items-center gap-2 mt-6 md:mt-0"
        >
          <UserPlus size={18} />
          <span>Agregar Colaborador</span>
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-8 border-b border-white/5 bg-white/[0.02] flex flex-col md:flex-row md:items-center gap-6">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 transition-colors group-focus-within:text-brand-primary" size={18} />
            <input 
              type="text" 
              placeholder="Buscar colaborador o supervisor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-brand-primary/20 focus:outline-hidden transition-all text-white placeholder:text-slate-600 font-medium"
            />
          </div>
          <div className="flex items-center gap-4">
             <div className="text-right hidden md:block">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Colaboradores Activos</p>
                <p className="text-xl font-display font-bold text-white">{filtered.length}</p>
             </div>
             <button className="p-3.5 bg-white/5 border border-white/10 rounded-xl text-slate-500 hover:text-white transition-all">
                <Filter size={18} />
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s, idx) => (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key={idx} 
              className="p-6 border-r border-b border-white/5 group hover:bg-white/[0.03] transition-all relative"
            >
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-slate-800 to-slate-900 border border-white/5 flex items-center justify-center font-bold text-lg text-slate-400 group-hover:text-brand-primary group-hover:border-brand-primary/30 transition-all shadow-inner">
                  {s.asesor.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wide truncate group-hover:text-brand-primary transition-colors">{s.asesor}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Shield size={12} className="text-slate-600 group-hover:text-brand-secondary transition-colors" />
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest transition-colors group-hover:text-brand-secondary">{s.supervisor}</p>
                  </div>
                </div>
                <button 
                  onClick={() => removeMember(s.asesor)}
                  className="p-2 text-slate-700 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="p-24 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-3xl bg-white/[0.01] border border-dashed border-white/10 flex items-center justify-center mb-6 text-slate-700">
               <Contact size={40} />
            </div>
            <p className="text-slate-500 font-medium italic">No se encontraron colaboradores que coincidan con la búsqueda.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-6 bg-surface/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-card w-full max-w-lg p-10 relative shadow-[0_30px_100px_rgba(0,0,0,0.5)]"
            >
              <button 
                onClick={() => setIsAdding(false)}
                className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white transition-colors"
              >
                 <X size={24} />
              </button>

              <div className="flex items-center gap-4 mb-10">
                 <div className="w-12 h-12 rounded-xl bg-brand-primary/20 flex items-center justify-center text-brand-primary border border-brand-primary/30">
                    <UserPlus size={24} />
                 </div>
                 <div>
                    <h3 className="text-2xl font-display font-bold text-white tracking-tight">Nuevo Colaborador</h3>
                    <p className="text-sm text-slate-500 font-medium">Asigna un nuevo nodo a la estructura operativa.</p>
                 </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Nombre Completo del Asesor</label>
                  <input 
                    type="text" 
                    placeholder="Ej. JUAN MANUEL PEREZ"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary focus:outline-hidden transition-all text-white placeholder:text-slate-600"
                    value={newMember.asesor}
                    onChange={e => setNewMember({...newMember, asesor: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Supervisor Responsable</label>
                  <input 
                    type="text" 
                    placeholder="Ej. LAURA MARTINEZ"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary focus:outline-hidden transition-all text-white placeholder:text-slate-600"
                    value={newMember.supervisor}
                    onChange={e => setNewMember({...newMember, supervisor: e.target.value})}
                  />
                </div>
                <div className="pt-6">
                  <button 
                    onClick={handleAdd}
                    className="w-full btn-primary !h-14 flex items-center justify-center gap-3 text-base shadow-2xl"
                  >
                    <span>Finalizar Registro</span>
                    <UserPlus size={20} />
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
