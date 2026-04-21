import { QualityRecord } from "./types";

export function getWeight(factor: string): number {
  const match = factor.match(/(\d+\.?\d*)%/);
  return match ? parseFloat(match[1]) : 1;
}

export function meltData(raw: any[]): QualityRecord[] {
  const melted: QualityRecord[] = [];
  
  raw.forEach((row) => {
    const common = {
      idLlamada: String(row["ID de Llamada"] || row["idLlamada"] || ""),
      fecha: String(row["Fecha de la llamada"] || row["fecha"] || ""),
      asesor: String(row["Nombre del asesor"] || row["asesor"] || "").trim().toUpperCase(),
      auditor: String(row["Responsable de la Auditoría"] || row["auditor"] || "").trim().toUpperCase(),
      faltaGrave: !!(row["¿El asesor incurrió en alguna falta grave? (Marcar solo si aplica)"] || row["faltaGrave"]),
      observaciones: String(row["Observaciones de la Gestión"] || row["observaciones"] || ""),
    };

    Object.keys(row).forEach((key) => {
      // Look for factors which usually have percentages or numbering
      if (key.includes("%") || /^\d+\.\d+/.test(key)) {
        const val = String(row[key]?.trim().toUpperCase());
        if (["CUMPLE", "NO CUMPLE", "NO APLICA"].includes(val)) {
          melted.push({
            ...common,
            factor: key,
            resultado: val as any,
          });
        }
      }
    });
  });

  return melted;
}

export function calculateRanking(melted: QualityRecord[]) {
  const groupedByAsesor = melted.reduce((acc, curr) => {
    if (!acc[curr.asesor]) acc[curr.asesor] = [];
    acc[curr.asesor].push(curr);
    return acc;
  }, {} as Record<string, QualityRecord[]>);

  return Object.entries(groupedByAsesor).map(([asesor, records]) => {
    const calls = records.reduce((acc, curr) => {
      if (!acc[curr.idLlamada]) acc[curr.idLlamada] = [];
      acc[curr.idLlamada].push(curr);
      return acc;
    }, {} as Record<string, QualityRecord[]>);

    const callScores = Object.values(calls).map((callRecords) => {
      let totalWeight = 0;
      let earnedWeight = 0;
      let hasCritical = false;

      callRecords.forEach((r) => {
        const w = getWeight(r.factor);
        if (r.resultado !== "NO APLICA") {
          totalWeight += w;
          if (r.resultado === "CUMPLE") earnedWeight += w;
        }
        if (r.faltaGrave) hasCritical = true;
      });

      return hasCritical ? 0 : totalWeight > 0 ? (earnedWeight / totalWeight) * 100 : 100;
    });

    const totalAudits = Object.keys(calls).length;
    const errors = [...new Set(records.filter((r) => r.resultado === "NO CUMPLE").map((r) => r.idLlamada))].length;

    return {
      asesor,
      score: callScores.length ? callScores.reduce((a, b) => a + b, 0) / callScores.length : 0,
      totalAudits,
      defectRate: totalAudits > 0 ? (errors / totalAudits) * 100 : 0,
    };
  }).sort((a, b) => b.score - a.score);
}

export function calculatePareto(melted: QualityRecord[]) {
  const errors = melted.filter((r) => r.resultado === "NO CUMPLE");
  const grouped = errors.reduce((acc, curr) => {
    acc[curr.factor] = (acc[curr.factor] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sorted = Object.entries(grouped)
    .map(([factor, count]) => ({ factor, count }))
    .sort((a, b) => b.count - a.count);

  const total = sorted.reduce((sum, curr) => sum + curr.count, 0);
  let cumulative = 0;

  return sorted.map((item) => {
    cumulative += item.count;
    return {
      ...item,
      percentage: (item.count / total) * 100,
      cumulative: (cumulative / total) * 100,
    };
  });
}
