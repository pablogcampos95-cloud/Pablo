import { useRef, useState, ChangeEvent } from "react";
import { 
  Upload, 
  Trash2, 
  Database, 
  FileSpreadsheet, 
  Info, 
  CheckCircle2,
  AlertCircle,
  FileText,
  FileUp,
  X,
  FileJson
} from "lucide-react";
import * as XLSX from "xlsx";
import { motion } from "motion/react";

interface DataProps {
  onDataLoad: (data: any[]) => void;
  onClear: () => void;
}

export function DataManagementView({ onDataLoad, onClear }: DataProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastStats, setLastStats] = useState<{ count: number; name: string } | null>(null);

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        onDataLoad(data);
        setLastStats({ count: data.length, name: file.name });
        setIsProcessing(false);
      };
      reader.readAsBinaryString(file);
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  const loadDemo = () => {
    const demo = [
      { "ID de Llamada": "C-101", "Nombre del asesor": "JUAN PEREZ", "Responsable de la Auditoría": "AUDITOR 1", "Fecha de la llamada": "2024-05-01", "1.1 Presentación 2.5%": "CUMPLE", "2.1 Sondeo 10%": "NO CUMPLE", "Observaciones de la Gestión": "No saludó adecuadamente." },
      { "ID de Llamada": "C-102", "Nombre del asesor": "MARIA LOPEZ", "Responsable de la Auditoría": "AUDITOR 1", "Fecha de la llamada": "2024-05-01", "1.1 Presentación 2.5%": "CUMPLE", "2.1 Sondeo 10%": "CUMPLE", "Observaciones de la Gestión": "Buena gestión." },
      { "ID de Llamada": "C-103", "Nombre del asesor": "JUAN PEREZ", "Responsable de la Auditoría": "AUDITOR 2", "Fecha de la llamada": "2024-05-02", "1.1 Presentación 2.5%": "NO CUMPLE", "2.1 Sondeo 10%": "NO CUMPLE", "¿El asesor incurrió en alguna falta grave? (Marcar solo si aplica)": "Sí", "Observaciones de la Gestión": "Colgó la llamada." }
    ];
    onDataLoad(demo);
    setLastStats({ count: demo.length, name: "Datos de Demostración" });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/5 pb-8 mb-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-white tracking-tight">Gestión de Datos</h2>
          <p className="text-slate-500 mt-2 font-medium">Importa y sincroniza la información de auditoría del sistema.</p>
        </div>
        <div className="flex items-center gap-3 mt-6 md:mt-0">
          <button 
            onClick={loadDemo}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-6 py-3 rounded-xl text-sm font-bold border border-white/5 transition-all text-slate-300"
          >
            <Database size={16} />
            <span>Cargar Datos Demo</span>
          </button>
          <button 
            onClick={onClear}
            className="flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 px-4 py-3 rounded-xl text-sm font-bold border border-rose-500/20 transition-all text-rose-500"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Zona de Carga */}
        <div className="lg:col-span-7">
          <div 
            onClick={() => fileRef.current?.click()}
            className="glass-card p-16 border-2 border-dashed border-white/10 hover:border-brand-primary/40 hover:bg-brand-primary/5 transition-all cursor-pointer flex flex-col items-center justify-center text-center group relative overflow-hidden h-full min-h-[450px]"
          >
            <div className="relative z-10">
              <div className="w-24 h-24 rounded-3xl bg-linear-to-br from-brand-primary/20 to-brand-secondary/10 flex items-center justify-center mb-8 mx-auto border border-white/5 transition-transform group-hover:scale-110 group-hover:-translate-y-2">
                {isProcessing ? (
                   <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FileUp size={40} className="text-brand-primary" />
                )}
              </div>
              <h3 className="text-2xl font-display font-bold text-white mb-3 tracking-tight">Seleccionar Archivo</h3>
              <p className="text-sm text-slate-500 max-w-xs mx-auto leading-relaxed font-medium">
                Arrastra aquí tus archivos <span className="text-white">Excel (.xlsx)</span> o <span className="text-white">CSV</span> para procesar los indicadores de calidad automáticamente.
              </p>
            </div>
            
            <input 
              type="file" 
              ref={fileRef} 
              onChange={handleFileUpload} 
              className="hidden" 
              accept=".xlsx,.xls,.csv" 
            />

            {isProcessing && (
              <div className="absolute inset-0 bg-surface/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mb-6" />
                <p className="text-sm font-bold text-white tracking-[0.2em] uppercase">Procesando Vectores...</p>
              </div>
            )}
          </div>
        </div>

        {/* Especificaciones */}
        <div className="lg:col-span-5 space-y-8">
          <div className="glass-card p-8">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
              <div className="p-1.5 bg-brand-primary/20 rounded-md text-brand-primary">
                <Info size={14} />
              </div>
              Especificaciones de Formato
            </h4>
            <div className="space-y-6">
              <FormatRule title="ID Llamada" desc="Identificador único del registro (Requerido)" />
              <FormatRule title="Nombre Asesor" desc="Nombre completo o ID del agente (Requerido)" />
              <FormatRule title="Fecha" desc="Formato de fecha válido DD/MM/AAAA (Requerido)" />
              <FormatRule title="Factores" desc="Columnas con peso porcentual (ej. 'Factor 10%')" />
              <FormatRule title="Criterio" desc="Valores: 'CUMPLE', 'NO CUMPLE' o 'NO APLICA'" />
            </div>
          </div>

          <div className="p-6 bg-linear-to-br from-brand-primary/10 to-brand-secondary/5 border border-brand-primary/20 rounded-2xl">
            <div className="flex gap-4">
              <div className="p-3 bg-brand-primary/20 rounded-xl text-brand-primary h-fit">
                <FileJson size={24} />
              </div>
              <div>
                <h5 className="font-bold text-white mb-1">Integración Automática</h5>
                <p className="text-xs text-slate-500 leading-relaxed">El motor de analítica detectará automáticamente los factores de cumplimiento basándose en las cabeceras del archivo.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {lastStats && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 border-emerald-500/20 bg-emerald-500/5 mt-8 shadow-[0_20px_50px_rgba(16,185,129,0.1)]"
        >
          <div className="flex flex-col md:flex-row md:items-center gap-8">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-lg shadow-emerald-500/20">
              <FileSpreadsheet size={32} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <h3 className="text-lg font-bold text-white tracking-tight">Sincronización Exitosa</h3>
              </div>
              <p className="text-sm text-slate-400 font-medium">
                Se han importado <span className="text-emerald-400 font-bold">{lastStats.count}</span> registros desde el archivo <span className="text-white font-semibold underline underline-offset-4">{lastStats.name}</span> al motor de calidad.
              </p>
            </div>
            <button 
              onClick={() => setLastStats(null)}
              className="p-2 text-slate-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function FormatRule({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex gap-4 group">
      <div className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-2 group-hover:scale-150 transition-transform shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
      <div>
        <p className="text-xs font-bold text-white uppercase tracking-wider mb-1">{title}</p>
        <p className="text-xs text-slate-500 font-medium">{desc}</p>
      </div>
    </div>
  );
}
