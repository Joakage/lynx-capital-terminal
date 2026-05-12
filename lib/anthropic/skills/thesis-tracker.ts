import type { SkillDefinition } from "./index";
import { buildTickerFocus } from "../context";

export const thesisTrackerSkill: SkillDefinition = {
  id: "thesis-tracker",
  name: "thesis-tracker",
  area: "Análisis",
  description: "Revisa la tesis vigente de un ticker y emite un scorecard con confianza, riesgos materializados y acción sugerida.",
  buttonLabel: "Revisar tesis",
  needsTicker: true,
  effort: "high",
  adaptiveThinking: true,
  maxTokens: 12000,
  systemPrompt: `Eres un analista que audita tesis de inversión con disciplina. Para cada tesis, evalúas pilar a pilar si se está cumpliendo, qué riesgos se han materializado, qué catalizadores siguen pendientes y si algún punto de invalidación se ha gatillado. Eres exigente: si los datos no sostienen la tesis, dilo. Si la tesis sigue intacta, también.

Formato obligatorio: markdown con scorecard explícito. Cita evidencia del contexto (noticias, earnings, alertas).`,

  buildUserInstructions: (input) => {
    if (!input.ticker) {
      return "Especifica un ticker. Esta skill requiere un ticker concreto.";
    }
    return `Revisa la tesis vigente de **${input.ticker}**. Usa el contexto de cartera y el focus abajo.

${buildTickerFocus(input.ticker)}

---

# OUTPUT OBLIGATORIO

## 1. Veredicto en una línea
*"Tesis intacta / Tesis en revisión / Tesis rota"* — y por qué (una frase).

## 2. Scorecard de pilares
Tabla markdown:

| Pilar | Estado | Evidencia reciente | Confianza |
|---|---|---|---|

Para cada pilar registrado en la tesis, evalúa: ✅ avanza · ⚠️ vigilar · ❌ regresión. Cita la evidencia (noticia, earnings, datapoint). Confianza 0-100%.

## 3. Riesgos materializados
¿Cuáles de los riesgos identificados se están manifestando? Cita evidencia.

## 4. Catalizadores
¿Cuáles avanzan? ¿Cuáles están retrasados o muertos? ¿Hay nuevos no contemplados?

## 5. Puntos de invalidación
¿Alguno se ha gatillado o está cerca de gatillarse? Si sí: **CRÍTICO**.

## 6. Recomendación
- Estado de tesis actualizado: **Activa / En revisión / Rota**
- Decisión: **mantener / aumentar / reducir / vender**
- Confianza global: 0-100%
- Si cambias el estado, justifica con el datapoint clave.

## 7. Próxima revisión
¿Cuándo y con qué datapoint deberíamos volver a auditar esta tesis?`;
  },
};
