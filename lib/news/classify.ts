import Anthropic from "@anthropic-ai/sdk";
import { getClient, DEFAULT_MODEL } from "@/lib/anthropic/client";
import type { Thesis, Company } from "@/lib/types";
import type { RawNewsItem } from "./provider";

export interface NewsClassification {
  sentiment: "Positivo" | "Neutro" | "Negativo";
  thesisImpact: "Refuerza" | "Neutro" | "Vigilar" | "Invalida";
  category:
    | "Earnings" | "Guidance" | "M&A" | "Regulación"
    | "Management" | "Buyback" | "Macro" | "Insider" | "Filing";
  reasoning: string;
}

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["sentiment", "thesisImpact", "category", "reasoning"],
  properties: {
    sentiment: { type: "string", enum: ["Positivo", "Neutro", "Negativo"] },
    thesisImpact: { type: "string", enum: ["Refuerza", "Neutro", "Vigilar", "Invalida"] },
    category: {
      type: "string",
      enum: [
        "Earnings", "Guidance", "M&A", "Regulación",
        "Management", "Buyback", "Macro", "Insider", "Filing",
      ],
    },
    reasoning: { type: "string", description: "Una frase breve explicando el impacto." },
  },
} as const;

const SYSTEM_PROMPT = `Eres un analista que clasifica noticias por su impacto en una tesis de inversión concreta.

Para cada noticia:
- Asigna sentiment de mercado: Positivo / Neutro / Negativo.
- Asigna thesisImpact en función de la tesis específica que se te da:
  * Refuerza   = corrobora un pilar o catalizador
  * Neutro     = irrelevante para la tesis aunque sea sobre el ticker
  * Vigilar    = no rompe la tesis pero introduce una señal a monitorizar
  * Invalida   = gatilla un punto de invalidación o materializa un riesgo crítico
- Asigna categoría: Earnings / Guidance / M&A / Regulación / Management / Buyback / Macro / Insider / Filing.
- Justifica en UNA frase, en español, citando el aspecto concreto de la tesis o el dato de la noticia.

No inventes hechos que no estén en la noticia. Si la noticia es vaga o no tiene impacto medible, marca Neutro.`;

export interface ClassificationInput {
  item: RawNewsItem;
  company?: Company;
  thesis?: Thesis;
}

/** Classify a single news article. */
export async function classifyNews(
  input: ClassificationInput,
): Promise<NewsClassification> {
  const { item, company, thesis } = input;
  const client = getClient();

  const ctx: string[] = [];
  if (company) {
    ctx.push(`Empresa: ${company.name} (${company.ticker}) — ${company.sector} / ${company.subsector}`);
  } else {
    ctx.push(`Ticker: ${item.ticker}`);
  }
  if (thesis) {
    ctx.push("");
    ctx.push("Tesis vigente:");
    ctx.push(thesis.centralThesis);
    ctx.push(`- Pilares: ${thesis.pillars.join(" · ")}`);
    ctx.push(`- Riesgos: ${thesis.keyRisks.join(" · ")}`);
    ctx.push(`- Catalizadores: ${thesis.catalysts.join(" · ")}`);
    ctx.push(`- Puntos de invalidación: ${thesis.invalidationPoints.join(" · ")}`);
    ctx.push(`- Estado actual: ${thesis.status} · convicción: ${thesis.conviction}`);
  } else {
    ctx.push("(Sin tesis registrada para este ticker — clasifica solo por sentiment y categoría.)");
  }
  ctx.push("");
  ctx.push("Noticia:");
  ctx.push(`Fecha: ${item.date.slice(0, 10)}`);
  ctx.push(`Fuente: ${item.source}`);
  ctx.push(`Título: ${item.title}`);
  if (item.summary && item.summary !== item.title) {
    ctx.push(`Resumen: ${item.summary}`);
  }
  ctx.push("");
  ctx.push("Devuelve SOLO un objeto JSON válido con sentiment, thesisImpact, category y reasoning.");

  const response = await client.messages.create({
    model: DEFAULT_MODEL,
    max_tokens: 512,
    system: SYSTEM_PROMPT,
    thinking: { type: "disabled" },
    output_config: {
      effort: "low",
      format: {
        type: "json_schema",
        name: "NewsClassification",
        schema: SCHEMA,
      },
    },
    messages: [{ role: "user", content: ctx.join("\n") }],
  });

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(`Claude no devolvió JSON válido: ${text.slice(0, 200)}`);
  }
  if (!isClassification(parsed)) {
    throw new Error(`Respuesta no cumple el schema: ${JSON.stringify(parsed).slice(0, 200)}`);
  }
  return parsed;
}

function isClassification(v: unknown): v is NewsClassification {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.sentiment === "string" &&
    typeof o.thesisImpact === "string" &&
    typeof o.category === "string" &&
    typeof o.reasoning === "string"
  );
}
