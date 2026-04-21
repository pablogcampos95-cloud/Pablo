import { useState, useEffect } from "react";
import { ShieldCheck, UserPlus, Trash2, Key, Info, UserCircle, Settings } from "lucide-react";
import { User } from "../types";
import { Storage } from "../lib/utils";
import { motion } from "motion/react";

export function UserManagementView() {
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState({ nombre: "", usuario: "", password: "", rol: "analista" as const });

  useEffect(() => {
    const saved = Storage.get<User[]>("app_users") || [
      { nombre: "Pablo Gutierrez", usuario: "pablo.admin", password: "3100", rol: "admin" }
    ];
    setUsers(saved);
  }, []);

  const addUser = () => {
    if (!newUser.nombre || !newUser.usuario || !newUser.password) return;
    const updated = [...users, newUser];
    setUsers(updated);
    Storage.set("app_users", updated);
    setNewUser({ nombre: "", usuario: "", password: "", rol: "analista" });
  };

  const deleteUser = (username: string) => {
    if (users.length === 1) return alert("Debe quedar al menos un administrador en el sistema.");
    if (!confirm(`¿Estás seguro de que deseas eliminar al usuario ${username}?`)) return;
    const updated = users.filter(u => u.usuario !== username);
    setUsers(updated);
    Storage.set("app_users", updated);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/5 pb-8 mb-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-white tracking-tight">Gestión de Accesos</h2>
          <p className="text-slate-500 mt-2 font-medium">Controla los privilegios y credenciales de los operadores del sistema.</p>
        </div>
        <div className="flex items-center gap-3 mt-6 md:mt-0 text-slate-500 text-xs font-bold uppercase tracking-widest">
           <Settings size={16} />
           <span>Configuración de Seguridad</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Formulario Lateral */}
        <div className="lg:col-span-4">
          <div className="glass-card p-8 sticky top-24">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-brand-primary/20 border border-brand-primary/30 rounded-xl text-brand-primary">
                <UserPlus size={20} />
              </div>
              <h3 className="font-display font-bold text-white text-lg">Nuevo Colaborador</h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nombre Completo</label>
                <input 
                  type="text" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm focus:border-brand-primary/50 focus:outline-hidden transition-all text-white"
                  placeholder="ej. Juan Perez"
                  value={newUser.nombre}
                  onChange={e => setNewUser({...newUser, nombre: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">ID de Usuario</label>
                <input 
                  type="text" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm focus:border-brand-primary/50 focus:outline-hidden transition-all text-white"
                  placeholder="ej. jperez.audit"
                  value={newUser.usuario}
                  onChange={e => setNewUser({...newUser, usuario: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Contraseña de Acceso</label>
                <input 
                  type="password" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm focus:border-brand-primary/50 focus:outline-hidden transition-all text-white"
                  placeholder="••••••••"
                  value={newUser.password}
                  onChange={e => setNewUser({...newUser, password: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Asignación de Rol</label>
                <select 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm focus:border-brand-primary/50 focus:outline-hidden appearance-none cursor-pointer text-slate-300"
                  value={newUser.rol}
                  onChange={e => setNewUser({...newUser, rol: e.target.value as any})}
                >
                  <option value="analista">Analista Quality</option>
                  <option value="supervisor">Supervisor de Operaciones</option>
                  <option value="admin">Administrador General</option>
                </select>
              </div>
              
              <button 
                onClick={addUser}
                className="w-full btn-primary !h-14 flex items-center justify-center gap-2 mt-4"
              >
                <span>Sincronizar Acceso</span>
                <ArrowRightAlt size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Usuarios */}
        <div className="lg:col-span-8 space-y-6">
          <div className="p-5 bg-brand-primary/5 border border-brand-primary/20 rounded-2xl flex items-start gap-4 text-brand-primary/80">
            <Info size={20} className="mt-0.5 shrink-0" />
            <p className="text-xs font-medium leading-relaxed">
              El entorno de gestión es restringido. Solo los usuarios con rol <span className="font-bold underline">admin</span> pueden modificar los permisos de acceso de otros operadores.
            </p>
          </div>

          <div className="glass-card overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5">
                  <th className="p-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Identidad del Nodo</th>
                  <th className="p-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Nivel</th>
                  <th className="p-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((u, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={idx} 
                    className="group hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/5 flex items-center justify-center font-bold text-xs text-slate-400 group-hover:bg-brand-primary/20 group-hover:text-brand-primary transition-all">
                          {u.nombre.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm tracking-tight">{u.nombre}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{u.usuario}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 text-center">
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-lg border tracking-wider transition-colors ${u.rol === 'admin' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-brand-primary/10 text-brand-primary border-brand-primary/20'}`}>
                        {u.rol.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-2.5 text-slate-600 hover:text-white transition-colors">
                          <Settings size={16} />
                        </button>
                        <button 
                          onClick={() => deleteUser(u.usuario)}
                          className="p-2.5 text-slate-600 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function ArrowRightAlt({ size }: { size: number }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
