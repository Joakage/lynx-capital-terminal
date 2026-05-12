import Anthropic from "@anthropic-ai/sdk";
import { getClient, DEFAULT_MODEL } from "./client";
import { getSkill, type SkillRunInput } from "./skills";
import { buildCarteraContext } from "./context";
import { saveRun } from "@/lib/storage/agent-runs";
import type { AgentRunRecord } from "@/lib/storage/agent-runs";

export interface RunSkillResult {
  run: AgentRunRecord;
  cached: { creation: number; read: number; uncached: number };
}

export async function runSkill(
  skillId: string,
  input: SkillRunInput,
): Promise<RunSkillResult> {
  const skill = getSkill(skillId);
  if (!skill) {
    throw new Error(`Skill desconocida: ${skillId}`);
  }
  if (skill.needsTicker && !input.ticker) {
    throw new Error(`La skill '${skillId}' requiere un ticker.`);
  }

  const client = getClient();
  const [carteraContext, userInstructions] = await Promise.all([
    buildCarteraContext(),
    Promise.resolve(skill.buildUserInstructions(input)),
  ]);

  const startedAt = Date.now();

  const response = await client.messages.create({
    model: DEFAULT_MODEL,
    max_tokens: skill.maxTokens ?? 12000,
    system: skill.systemPrompt,
    thinking: skill.adaptiveThinking ? { type: "adaptive" } : { type: "disabled" },
    output_config: skill.effort ? { effort: skill.effort } : undefined,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: carteraContext,
            cache_control: { type: "ephemeral" },
          },
          {
            type: "text",
            text: userInstructions,
          },
        ],
      },
    ],
  });

  const elapsedMs = Date.now() - startedAt;

  const outputText = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n\n");

  const cached = {
    creation: response.usage.cache_creation_input_tokens ?? 0,
    read: response.usage.cache_read_input_tokens ?? 0,
    uncached: response.usage.input_tokens,
  };

  const run: AgentRunRecord = {
    id: `run_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    skillId,
    skillName: skill.name,
    area: skill.area,
    ticker: input.ticker,
    sector: input.sector,
    question: input.question,
    model: response.model,
    startedAt: new Date(startedAt).toISOString(),
    elapsedMs,
    status: response.stop_reason === "refusal" ? "Error" : "Completado",
    stopReason: response.stop_reason ?? "unknown",
    output: outputText,
    usage: {
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      cacheCreationInputTokens: cached.creation,
      cacheReadInputTokens: cached.read,
    },
  };

  await saveRun(run);
  return { run, cached };
}
