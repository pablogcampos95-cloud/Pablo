import { GoogleGenAI, Type } from "@google/genai";
import { QualityRecord } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface ActionPlan {
  factor: string;
  count: number;
  insight: string;
  recommendations: string[];
}

export async function generateAiActionPlan(
  paretoData: { factor: string; count: number }[],
  recentComments: string[]
): Promise<ActionPlan[]> {
  try {
    const prompt = `
      Eres un consultor experto en Calidad para Centros de Contacto B2B.
      Basado en los siguientes datos de errores (Pareto) y comentarios recientes de auditores, 
      genera un plan de acción detallado para los 3 errores principales.

      DATOS DE ERRORES:
      ${JSON.stringify(paretoData.slice(0, 5), null, 2)}

      COMENTARIOS DE AUDITORÍA:
      ${recentComments.slice(0, 10).join("\n- ")}

      Devuelve un JSON con el siguiente esquema:
      Type ActionPlan = {
        factor: string;
        count: number;
        insight: string; // Breve análisis de por qué está ocurriendo esto
        recommendations: string[]; // 3-4 pasos accionables para mejorar
      }[]
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              factor: { type: Type.STRING },
              count: { type: Type.NUMBER },
              insight: { type: Type.STRING },
              recommendations: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["factor", "count", "insight", "recommendations"]
          }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Error generating AI action plan:", error);
    return [];
  }
}

export async function analyzeAdvisorPerformance(
  advisorName: string,
  records: QualityRecord[]
): Promise<string> {
  try {
    const summary = records.map(r => `${r.factor}: ${r.resultado} (${r.observaciones})`).join("\n");
    const prompt = `
      Analiza el desempeño de ${advisorName} basado en sus auditorías recientes.
      Identifica fortalezas y áreas críticas de mejora en un tono motivador pero profesional.
      Sé conciso (máximo 150 palabras).
      
      AUDITORÍAS:
      ${summary}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text || "No se pudo generar el análisis.";
  } catch (error) {
    return "Error al conectar con la IA.";
  }
}
