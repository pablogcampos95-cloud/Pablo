import { useState, useMemo } from "react";
import { motion } from "motion/react";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target, 
  Search,
  Download,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Trophy,
  Activity,
  MoreVertical
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  Cell,
  ComposedChart
} from "recharts";
import { User, QualityRecord } from "../types";
import { calculateRanking, calculatePareto } from "../qualityEngine";
import { generateAiActionPlan, ActionPlan } from "../services/geminiService";

interface DashboardProps {
  raw: any[];
  melted: QualityRecord[];
  user: User;
}

export function DashboardView({ raw, melted, user }: DashboardProps) {
  const [aiPlans, setAiPlans] = useState<ActionPlan[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const stats = useMemo(() => {
    const ranking = calculateRanking(melted);
    const pareto = calculatePareto(melted);
    const errors = [...new Set(melted.filter(r => r.resultado === "NO CUMPLE").map(r => r.idLlamada))].length;
    const totalCalls = [...new Set(melted.map(r => r.idLlamada))].length;
    
    return {
      totalLlamadas: totalCalls,
      tasaDefecto: totalCalls > 0 ? (errors / totalCalls) * 100 : 0,
      pareto: pareto.slice(0, 7),
      ranking: ranking.slice(0, 10),
      topError: pareto[0]?.factor || "Ninguno"
    };
  }, [melted]);

  const triggerAiPlan = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    const comments = melted
      .filter(r => r.resultado === "NO CUMPLE" && r.observaciones)
      .slice(0, 20)
      .map(r => r.observaciones);
      
    const plans = await generateAiActionPlan(stats.pareto, comments);
    setAiPlans(plans);
    setIsGenerating(false);
  };

  return (
    <div className="space-y-10 pb-12">
      {/* Sección de Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-white tracking-tight">Resumen Ejecutivo</h2>
          <p className="text-slate-400 mt-1">Análisis de rendimiento y calidad en tiempo real.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded-xl text-sm font-semibold border border-white/5 transition-all">
            <Download size={16} />
            <span>Exportar Datos</span>
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Activity size={16} />
            <span>Nueva Auditoría</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard 
          title="Auditorías Totales" 
          value={stats.totalLlamadas} 
          subtitle="Registros procesados" 
          icon={Target}
          trend="+5.2%"
          status="up"
        />
        <KpiCard 
          title="Tasa de Defectos" 
          value={`${stats.tasaDefecto.toFixed(1)}%`} 
          subtitle="Anomalías detectadas" 
          icon={AlertTriangle}
          trend="-1.2%"
          status="down"
        />
        <KpiCard 
          title="Calidad Global" 
          value={`${(100 - stats.tasaDefecto).toFixed(1)}%`} 
          subtitle="Índice de cumplimiento" 
          icon={TrendingUp}
          trend="+0.8%"
          status="up"
        />
        <KpiCard 
          title="Factor Crítico" 
          value={stats.topError.split(" ")[0]} 
          subtitle="Principal motivo" 
          icon={Search}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pareto Chart */}
        <div className="lg:col-span-2 glass-card overflow-hidden">
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
            <div>
              <h3 className="font-display font-bold text-lg text-white">Análisis de Pareto</h3>
              <p className="text-xs text-slate-500 font-medium">Distribución de errores por frecuencia acumulada</p>
            </div>
            <div className="flex items-center gap-2">
               <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-xs bg-brand-primary"></div>
                  <span className="text-[10px] font-bold text-slate-400">FRECUENCIA</span>
               </div>
               <div className="flex items-center gap-1.5 ml-3">
                  <div className="w-2.5 h-2.5 rounded-xs bg-brand-secondary"></div>
                  <span className="text-[10px] font-bold text-slate-400">ACUMULADO</span>
               </div>
            </div>
          </div>
          <div className="p-8 h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={stats.pareto}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                <XAxis 
                  dataKey="factor" 
                  tick={{ fill: "#64748b", fontSize: 10, fontWeight: 500 }} 
                  axisLine={false}
                  tickFormatter={(v) => v.length > 15 ? v.substring(0, 15) + '...' : v}
                />
                <YAxis yAxisId="left" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} unit="%" />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.5)" }}
                  itemStyle={{ fontSize: '11px', color: '#fff', fontWeight: 600 }}
                />
                <Bar yAxisId="left" dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                <Line yAxisId="right" type="monotone" dataKey="cumulative" stroke="#c084fc" strokeWidth={3} dot={{ fill: "#c084fc", strokeWidth: 2, r: 4, stroke: "#1e293b" }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Action Plan */}
        <div className="glass-card flex flex-col overflow-hidden">
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-linear-to-br from-brand-primary/10 to-brand-secondary/5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-primary/20 rounded-lg text-brand-primary">
                <Sparkles size={18} />
              </div>
              <h3 className="font-display font-bold text-lg text-white">Estrategia AI</h3>
            </div>
            {!aiPlans.length && (
              <button 
                onClick={triggerAiPlan}
                disabled={isGenerating}
                className="text-[10px] font-bold text-brand-primary hover:text-brand-secondary tracking-widest flex items-center gap-2 group transition-all"
              >
                <span>{isGenerating ? "PROCESANDO..." : "GENERAR PLAN"}</span>
                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>

          <div className="flex-1 p-6 space-y-6 overflow-y-auto max-h-[400px] custom-scrollbar bg-slate-900/20">
            {aiPlans.length > 0 ? (
              aiPlans.map((plan, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={i} 
                  className="space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-4 bg-brand-primary rounded-full"></div>
                    <p className="text-xs font-bold text-white uppercase tracking-wider">{plan.factor}</p>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed font-medium pl-3.5 border-l border-brand-primary/20">{plan.insight}</p>
                  <div className="space-y-2 mt-4 pl-3.5">
                    {plan.recommendations.map((rec, j) => (
                      <div key={j} className="flex gap-2 items-start">
                        <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                        <span className="text-xs text-slate-500 font-medium leading-tight">{rec}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-dashed border-white/10 flex items-center justify-center mb-6 text-slate-700">
                  <Sparkles size={32} />
                </div>
                <h4 className="text-sm font-bold text-slate-500 mb-2 uppercase tracking-widest">Esperando Datos</h4>
                <p className="text-xs text-slate-600 font-medium max-w-[200px]">Haz clic en 'GENERAR PLAN' para obtener recomendaciones de Gemini AI.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ranking Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
               <Trophy size={18} />
             </div>
             <div>
               <h3 className="font-display font-bold text-lg text-white">Ranking de Rendimiento</h3>
               <p className="text-xs text-slate-500 font-medium">Top 10 asesores por puntaje de calidad</p>
             </div>
          </div>
          <button className="text-xs font-bold text-slate-400 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-xl border border-white/10">
            Exportar CSV
          </button>
        </div>

        <div className="overflow-x-auto bg-slate-900/10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5">
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Asesor</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Score</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Auditorías</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Defectos</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {stats.ranking.map((row, idx) => {
                const score = row.score;
                const status = score >= 90 ? "Optimizado" : score >= 80 ? "Estable" : score >= 70 ? "Alerta" : "Crítico";
                const colorClass = score >= 90 ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" : score >= 80 ? "text-brand-primary bg-brand-primary/10 border-brand-primary/20" : score >= 70 ? "text-amber-400 bg-amber-400/10 border-amber-400/20" : "text-rose-400 bg-rose-400/10 border-rose-400/20";
                
                return (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={idx} 
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/5 flex items-center justify-center text-xs font-bold text-slate-400 group-hover:border-brand-primary/30 transition-all">
                          {row.asesor.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                           <span className="text-sm font-bold text-white block">{row.asesor}</span>
                           <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">ID-{idx + 101}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 text-center">
                      <span className="text-sm font-bold text-white">{score.toFixed(1)}%</span>
                    </td>
                    <td className="p-5 text-center">
                      <span className="text-sm font-medium text-slate-400">{row.totalAudits}</span>
                    </td>
                    <td className="p-5 text-center">
                      <span className="text-sm font-medium text-slate-500">{row.defectRate.toFixed(1)}%</span>
                    </td>
                    <td className="p-5 text-right">
                      <span className={`text-[10px] font-bold border px-3 py-1 rounded-lg uppercase tracking-widest ${colorClass}`}>
                        {status}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, subtitle, icon: Icon, trend, status }: any) {
  return (
    <div className="glass-card p-6 relative overflow-hidden group transition-all hover:scale-[1.02] active:scale-[0.98]">
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-brand-primary/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
      
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-all">
          <Icon size={22} />
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg border",
            status === 'up' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"
          )}>
            {status === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend}
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">{title}</h4>
        <div className="text-3xl font-display font-bold text-white tracking-tight">{value}</div>
        <p className="text-[11px] font-medium text-slate-600 mt-1">{subtitle}</p>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
