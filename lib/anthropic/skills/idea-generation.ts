import type { SkillDefinition } from "./index";

export const ideaGenerationSkill: SkillDefinition = {
  id: "idea-generation",
  name: "idea-generation",
  area: "Análisis",
  description: "Genera una shortlist de ideas long/short coherentes con el estilo del fondo, evitando solapamientos con la cartera actual.",
  buttonLabel: "Buscar ideas",
  needsTicker: false,
  needsSector: true,
  effort: "high",
  adaptiveThinking: true,
  maxTokens: 14000,
  systemPrompt: `Eres un PM/analista buscando ideas concretas para añadir al pipeline. Conoces el estilo del fondo (mezcla de compounders, deep value, special situations, China recovery, AI hedge, quality defensive). Tus ideas deben ser coherentes con esa filosofía, evitar solapamientos con la cartera actual, y venir con tesis condensada + catalizador + qué pasaría para invalidarla.

Sé concreto: nombres reales, sectores, drivers. Nada de "considera el sector tecnológico".`,

  buildUserInstructions: (input) => {
    const sectorOrTheme = input.sector ?? input.question ?? "cualquier sector / tema";
    return `Genera una shortlist de **5 ideas** (mix de long y short si procede) en: **${sectorOrTheme}**.

Restricciones:
- Evita tickers que ya estén en cartera o en pipeline (los tienes en el contexto).
- Coherente con el estilo del fondo (compounders, deep value, special situations, etc.).
- Cada idea debe ser accionable hoy, no proyectos de 5 años.

# OUTPUT OBLIGATORIO

Para cada una de las 5 ideas:

### Idea N — TICKER (Nombre) — LONG/SHORT
- **Estilo**: Compounder / Deep Value / Special Situation / Turnaround / Quality Defensive / China Recovery / AI Hedge / Growth
- **Tesis en 2 frases**: la primera describe la oportunidad, la segunda el mecanismo por el que se cierra.
- **Driver clave**: el catalizador que mueve el precio en los próximos 6-12 meses.
- **Por qué ahora**: qué ha cambiado para que sea oportuno entrar.
- **Riesgo principal**: el que más probabilidades tiene de romper la tesis.
- **Próximo paso interno**: qué skill ejecutar primero (sector-overview / dcf-model / comps-analysis / initiating-coverage).
- **Convicción inicial**: Alta / Media / Baja.

Al final, **prioriza** las 5 ideas: ¿cuál es la primera por la que empezarías research? Justifica en una línea.`;
  },
};
