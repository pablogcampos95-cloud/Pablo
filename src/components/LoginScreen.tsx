import { useState, FormEvent } from "react";
import { motion } from "motion/react";
import { Lock, Eye, EyeOff, BarChart3, AlertCircle, ArrowRight, Shield } from "lucide-react";
import { User } from "../types";
import { Storage } from "../lib/utils";

interface LoginProps {
  onLogin: (user: User) => void;
}

export function LoginScreen({ onLogin }: LoginProps) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [showP, setShowP] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user.trim() || !pass.trim()) {
      setErr("Por favor, completa todos los campos.");
      return;
    }

    setLoading(true);
    setErr("");

    const users: User[] = Storage.get<User[]>("app_users") || [
      { nombre: "Pablo Gutierrez", usuario: "pablo.admin", password: "3100", rol: "admin" }
    ];

    const found = users.find(u => u.usuario.toLowerCase() === user.trim().toLowerCase() && u.password === pass.trim());

    setTimeout(() => {
      if (found) {
        onLogin(found);
      } else {
        setErr("Usuario o contraseña incorrectos.");
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-surface bg-mesh relative overflow-hidden">
      {/* Elementos Decorativos */}
      <div className="absolute top-[20%] left-[10%] w-64 h-64 bg-brand-primary/20 blur-[100px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-brand-secondary/15 blur-[120px] rounded-full animate-pulse px-2"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 rounded-2xl bg-linear-to-br from-brand-primary to-brand-secondary flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-brand-primary/40 rotate-12"
          >
            <BarChart3 className="text-white" size={32} />
          </motion.div>
          <h1 className="text-4xl font-display font-bold text-white mb-2 tracking-tight">Calidad B2B</h1>
          <p className="text-slate-500 font-medium tracking-wide">Portal de Inteligencia y Analítica</p>
        </div>

        <div className="glass-card p-10">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-1">Bienvenido de nuevo</h2>
            <p className="text-sm text-slate-500">Ingresa tus credenciales para acceder</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Usuario</label>
              <div className="relative group">
                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 transition-colors group-focus-within:text-brand-primary" size={18} />
                <input 
                  type="text" 
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-3.5 text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary focus:outline-hidden transition-all text-white placeholder:text-slate-600"
                  placeholder="ej. pablo.admin"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Contraseña</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 transition-colors group-focus-within:text-brand-primary" size={18} />
                <input 
                  type={showP ? "text" : "password"} 
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-3.5 text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary focus:outline-hidden transition-all text-white placeholder:text-slate-600"
                  placeholder="••••••••"
                />
                <button 
                  type="button" 
                  onClick={() => setShowP(!showP)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors"
                >
                  {showP ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {err && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold"
              >
                <AlertCircle size={16} className="shrink-0" />
                <span>{err}</span>
              </motion.div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full btn-primary h-14 flex items-center justify-center gap-3 disabled:opacity-50 mt-4 group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Entrar al Portal</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-12 text-sm text-slate-600">
          ¿Necesitas ayuda? <a href="#" className="text-brand-primary hover:underline font-semibold">Contacta con Soporte</a>
        </p>
      </motion.div>
    </div>
  );
}
