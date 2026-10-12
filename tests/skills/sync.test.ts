import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const normalizeLineEndings = (text: string) => text.replace(/\r\n/g, '\n');
const claudeSkill = normalizeLineEndings(readFileSync(
  resolve(process.cwd(), '.claude/skills/landing-cliente/SKILL.md'),
  'utf8',
));
const agentsSkill = normalizeLineEndings(readFileSync(
  resolve(process.cwd(), '.agents/skills/landing-cliente/SKILL.md'),
  'utf8',
));
const claudeAgent = normalizeLineEndings(readFileSync(
  resolve(process.cwd(), '.claude/agents/landing-cliente.md'),
  'utf8',
));
const codexAgent = normalizeLineEndings(readFileSync(
  resolve(process.cwd(), '.codex/agents/landing-cliente.toml'),
  'utf8',
));
const [, agentFrontmatter, agentBody] = claudeAgent.split(/^---\s*$/m);
const codexName = codexAgent.match(/^name = "(.*)"$/m)?.[1];
const claudeName = agentFrontmatter.match(/^name: (.*)$/m)?.[1];
const codexDescription = codexAgent.match(/^description = "(.*)"$/m)?.[1];
const claudeDescription = agentFrontmatter.match(/^description: (.*)$/m)?.[1];
const codexInstructions = codexAgent.match(/^developer_instructions = """\n([\s\S]*?)"""$/m)?.[1];

describe('landing-cliente copies stay in sync', () => {
  it('keeps the derived skill identical to the source skill', () => {
    // The Claude copy is the source of truth, and the other copies are derived.
    expect(agentsSkill).toBe(claudeSkill);
  });

  it('keeps the Codex agent name equal to the source agent name', () => {
    expect(codexName).toBeDefined();
    expect(claudeName).toBeDefined();
    expect(codexName).toBe(claudeName);
  });

  it('keeps the Codex agent description equal to the source description', () => {
    expect(codexDescription).toBeDefined();
    expect(claudeDescription).toBeDefined();
    expect(codexDescription).toBe(claudeDescription);
  });

  it('keeps the Codex developer instructions equal to the source body', () => {
    expect(codexInstructions).toBeDefined();
    expect(agentBody).toBeDefined();
    expect(codexInstructions?.trim()).toBe(agentBody?.trim());
  });
});
