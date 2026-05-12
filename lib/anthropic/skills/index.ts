import { earningsAnalysisSkill } from "./earnings-analysis";
import { thesisTrackerSkill } from "./thesis-tracker";
import { morningNoteSkill } from "./morning-note";
import { valuationReviewerSkill } from "./valuation-reviewer";
import { ideaGenerationSkill } from "./idea-generation";

export type SkillEffort = "low" | "medium" | "high" | "xhigh" | "max";

export interface SkillRunInput {
  ticker?: string;
  sector?: string;
  question?: string;
}

export interface SkillDefinition {
  id: string;
  name: string;
  area: "Análisis" | "Control" | "Reporting" | "Desarrollo de negocio" | "Private Equity / M&A";
  description: string;
  buttonLabel: string;
  needsTicker: boolean;
  needsSector?: boolean;
  systemPrompt: string;
  buildUserInstructions: (input: SkillRunInput) => string;
  effort?: SkillEffort;
  adaptiveThinking?: boolean;
  maxTokens?: number;
}

export const SKILLS: Record<string, SkillDefinition> = {
  "earnings-analysis": earningsAnalysisSkill,
  "thesis-tracker": thesisTrackerSkill,
  "morning-note": morningNoteSkill,
  "valuation-reviewer": valuationReviewerSkill,
  "idea-generation": ideaGenerationSkill,
};

export function getSkill(id: string): SkillDefinition | undefined {
  return SKILLS[id];
}

export const RUNNABLE_SKILL_IDS = Object.keys(SKILLS);
