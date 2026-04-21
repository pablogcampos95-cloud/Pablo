/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface QualityRecord {
  idLlamada: string;
  fecha: string;
  asesor: string;
  auditor: string;
  factor: string;
  resultado: "CUMPLE" | "NO CUMPLE" | "NO APLICA";
  faltaGrave: boolean;
  observaciones: string;
}

export interface StaffingMember {
  asesor: string;
  supervisor: string;
  coordinador: string;
  antiguedad: number;
  fechaIngreso: string;
}

export interface User {
  nombre: string;
  usuario: string;
  rol: "admin" | "analista" | "supervisor";
  password?: string;
}

export interface Snapshot {
  id: string;
  name: string;
  timestamp: string;
  createdBy: string;
  stats: {
    totalLlamadas: number;
    tasaDefecto: number;
    topError: string;
  };
  ranking: any[];
}
