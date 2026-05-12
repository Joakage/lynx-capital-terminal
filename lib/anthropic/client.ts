import Anthropic from "@anthropic-ai/sdk";

let cached: Anthropic | null = null;

export function getClient(): Anthropic {
  if (cached) return cached;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY no está configurada. Añádela a .env.local para ejecutar agentes Claude.",
    );
  }
  cached = new Anthropic({ apiKey });
  return cached;
}

export const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-opus-4-7";
