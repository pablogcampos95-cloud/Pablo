import { useState, useEffect } from "react";
import { History as HistoryIcon, Search, Eye, Trash2, Calendar, User as UserIcon, Clock, Filter, ArrowUpRight } from "lucide-react";
import { Storage, formatDate } from "../lib/utils";
import { motion } from "motion/react";

export function HistoryView() {
  const [snapshots, setSnapshots] = useState<any[]>([]);

  useEffect(() => {
    const saved = Storage.get<any[]>("snapshots") || [];
    setSnapshots(saved.sort((a,b) => b.timestamp.localeCompare(a.timestamp)));
  }, []);

  const deleteSnap = (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar este reporte histórico?")) return;
    const updated = snapshots.filter(s => s.id !== id);
    setSnapshots(updated);
    Storage.set("snapshots", updated);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/5 pb-8 mb-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-white tracking-tight">Historial de Reportes</h2>
          <p className="text-slate-500 mt-2 font-medium">Consulta y gestiona las capturas históricas de rendimiento.</p>
        </div>
        <div className="flex items-center gap-4 mt-6 md:mt-0">
          <div className="relative group">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 transition-colors group-focus-within:text-brand-primary" size={14} />
            <select className="bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-8 text-xs font-bold text-slate-400 focus:outline-hidden appearance-none cursor-pointer hover:bg-white/10 transition-all">
              <option>Todos los periodos</option>
              <option>Última semana</option>
              <option>Último mes</option>
            </select>
          </div>
        </div>
      </div>

      {snapshots.length === 0 ? (
        <div className="glass-card p-24 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-3xl bg-white/[0.02] border border-dashed border-white/10 flex items-center justify-center mb-8 text-slate-700">
            <HistoryIcon size={40} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Sin registros guardados</h3>
          <p className="text-slate-500 max-w-sm font-medium">Los reportes que guardes desde el panel principal aparecerán aquí para tu consulta.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {snapshots.map((snap, idx) => (
            <motion.div 
              key={snap.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-card group overflow-hidden hover:border-brand-primary/30 transition-all"
            >
              <div className="p-6 bg-white/[0.02] border-b border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-brand-primary/20 rounded-md text-brand-primary">
                    <Clock size={14} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{formatDate(snap.timestamp)}</span>
                </div>
                <button 
                  onClick={() => deleteSnap(snap.id)}
                  className="p-1.5 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-md transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              
              <div className="p-8">
                <h3 className="text-xl font-display font-bold text-white mb-2 truncate group-hover:text-brand-primary transition-colors">{snap.name}</h3>
                <div className="flex items-center gap-2 mb-8">
                   <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[8px] font-bold text-slate-400">
                     {snap.createdBy.charAt(0)}
                   </div>
                   <span className="text-xs font-semibold text-slate-500 capitalize">Auditado por {snap.createdBy}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5">
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">Muestra</p>
                    <p className="text-lg font-display font-bold text-white">{snap.stats.totalLlamadas}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5">
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">Defectos</p>
                    <p className="text-lg font-display font-bold text-rose-500">{snap.stats.tasaDefecto?.toFixed(1)}%</p>
                  </div>
                </div>

                <button className="w-full btn-primary !py-3 flex items-center justify-center gap-2 group/btn">
                  <span>Revisar Reporte</span>
                  <ArrowUpRight size={16} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
