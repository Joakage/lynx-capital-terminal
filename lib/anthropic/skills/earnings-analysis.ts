import type { SkillDefinition } from "./index";
import { buildTickerFocus } from "../context";

export const earningsAnalysisSkill: SkillDefinition = {
  id: "earnings-analysis",
  name: "earnings-analysis",
  area: "Análisis",
  description: "Analiza los últimos resultados trimestrales: vs consenso, drivers, guidance e impacto en la tesis.",
  buttonLabel: "Analizar resultados",
  needsTicker: true,
  effort: "high",
  adaptiveThinking: true,
  maxTokens: 16000,
  systemPrompt: `Eres un analista senior de equity research en Lynx Capital. Tu trabajo es producir earnings notes accionables que el PM pueda usar inmediatamente para decidir si mantiene, aumenta, reduce o vende una posición. Eres directo, conciso, citas números concretos del contexto, y nunca produces output genérico.

Formato obligatorio: markdown con secciones numeradas. Sin preámbulos. Sin disclaimers genéricos. Cita los datos exactos del contexto (revenue surprise, EPS surprise, guidance, reacción de mercado). No inventes cifras que no estén en el contexto.`,

  buildUserInstructions: async (input) => {
    if (!input.ticker) {
      return "Especifica un ticker. Esta skill requiere un ticker concreto.";
    }
    const focus = await buildTickerFocus(input.ticker);
    return `Analiza los últimos resultados de **${input.ticker}**. Usa el contexto de cartera y el focus del ticker abajo.

${focus}

---

# OUTPUT OBLIGATORIO

Produce una earnings note en markdown con exactamente estas secciones:

## 1. Resumen ejecutivo
Una línea con el veredicto: ¿beat / miss / inline? ¿qué tipo de trimestre? ¿qué hace ahora la posición?

## 2. Lo que sabemos
Tabla markdown con: Revenue vs cons | EPS vs cons | Guidance | Reacción acción. Saca los números del contexto.

## 3. Drivers del trimestre
3-5 bullets sobre qué empujó (o lastró) el resultado: segmentos, márgenes, FX, mix. Sé específico.

## 4. Cambios en guidance
¿Qué dijo el management hacia delante? ¿Es creíble? ¿Implicación para nuestro modelo?

## 5. Impacto en la tesis
- ¿Se refuerzan los pilares de la tesis?
- ¿Algún riesgo se materializa?
- ¿Algún punto de invalidación se gatilla?
- Veredicto: tesis **intacta / vigilar / rota**.

## 6. Recomendación
Una decisión clara entre: **mantener / aumentar / reducir / vender**. Justifica en 2-3 líneas. Si recomiendas cambio de peso, sugiere magnitud.

## 7. Qué vigilar próximas semanas
3 cosas concretas (eventos, datapoints, conferences) que validen o invaliden el next leg.`;
  },
};
