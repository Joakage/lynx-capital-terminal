import type { SkillDefinition } from "./index";

export const valuationReviewerSkill: SkillDefinition = {
  id: "valuation-reviewer",
  name: "valuation-reviewer",
  area: "Control",
  description: "Compara fair values vs precio para toda la cartera y prioriza acciones (aumentos, ventas, modelos a actualizar).",
  buttonLabel: "Revisar valoraciones",
  needsTicker: false,
  effort: "high",
  adaptiveThinking: true,
  maxTokens: 14000,
  systemPrompt: `Eres el analista de control que audita las valoraciones del fondo. Tu trabajo: cruzar precio actual con fair value, identificar dislocaciones (positivas y negativas), detectar modelos desactualizados, y priorizar acciones para el PM.

Sé exigente con la lista — no genérico. Cita modelos por su ID. Si un FV es viejo, dilo.`,

  buildUserInstructions: () => {
    return `Audita las valoraciones de toda la cartera usando el contexto de posiciones + modelos.

# OUTPUT OBLIGATORIO

## 1. Resumen del estado
Una línea: ¿cuántos modelos activos? ¿cuántas posiciones con upside >20%? ¿cuántas con downside?

## 2. Tabla de dislocación
Tabla markdown ordenada por |upside|:

| Ticker | Peso | Precio | FV base | Upside | Modelo (ID) | Antigüedad modelo | Acción |
|---|---|---|---|---|---|---|---|

"Acción" debe ser una recomendación clara: aumentar / mantener / reducir / vender / actualizar modelo.

## 3. Top 3 dislocaciones positivas
Para cada una: por qué creemos que está infravalorada, qué catalizador la cerraría, qué peso adicional sería razonable (con guardrails de concentración).

## 4. Top 3 dislocaciones negativas
Para cada una: si el FV se ha quedado obsoleto vs el precio (subir el FV) o si el mercado ha visto algo que nuestro modelo no captura (revisar tesis).

## 5. Modelos a actualizar urgentemente
Cita IDs concretos. Razón (antigüedad, post-earnings, cambio macro).

## 6. Plan de trabajo para el PM
3-5 acciones concretas, priorizadas. Cada una con: skill a ejecutar, ticker objetivo, deadline sugerida.`;
  },
};
