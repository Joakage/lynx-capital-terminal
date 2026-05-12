import type { SkillDefinition } from "./index";

export const morningNoteSkill: SkillDefinition = {
  id: "morning-note",
  name: "morning-note",
  area: "Reporting",
  description: "Resumen pre-mercado contextualizado con tu cartera, eventos del día y noticias recientes.",
  buttonLabel: "Morning Note",
  needsTicker: false,
  effort: "medium",
  adaptiveThinking: true,
  maxTokens: 8000,
  systemPrompt: `Eres el analista que prepara la Morning Note del fondo cada mañana. Tu trabajo no es resumir la prensa: es decir qué importa hoy para esta cartera concreta, qué eventos hay que vigilar, qué noticias afectan a posiciones activas, y qué acción debe tomar el PM antes de la apertura.

Formato obligatorio: markdown denso, accionable, sin paja. Cita el ticker afectado en cada bullet.`,

  buildUserInstructions: () => {
    return `Genera la **Morning Note** de hoy para Lynx Capital. Usa todo el contexto de cartera (posiciones, tesis, calendario, noticias, alertas) para construir una nota corta y accionable.

# OUTPUT OBLIGATORIO

## 1. Foco del día (3 prioridades)
Lo más importante para ESTAS posiciones — no comentario macro genérico. Cita el ticker.

## 2. Eventos del día / próximos 48h
Tabla markdown:

| Fecha | Empresa / Macro | Evento | Importancia | Acción sugerida |
|---|---|---|---|---|

Solo eventos que afecten directamente a la cartera o que sean macro de alto impacto (CPI, FOMC, ECB).

## 3. Noticias relevantes overnight / últimas 48h
Para cada noticia que afecte a una posición activa: ticker, una frase de resumen, impacto en tesis (refuerza / vigilar / invalida).

## 4. Alertas a resolver
Cita las alertas del Control Room que requieren acción HOY (no las que pueden esperar).

## 5. Decisión a tomar antes de apertura
1-3 acciones concretas. Si no hay ninguna, dilo: *"Sin acción pre-apertura — mantener exposición."*`;
  },
};
