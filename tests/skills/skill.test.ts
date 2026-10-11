import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const skillPath = resolve(process.cwd(), '.claude/skills/landing-cliente/SKILL.md');
const skill = readFileSync(skillPath, 'utf8');
const [opening, frontmatter, body] = skill.split(/^---\s*$/m);

describe('landing-cliente skill', () => {
  it('has discoverable frontmatter on the first line', () => {
    expect(skill.split(/\r?\n/, 1)[0]).toBe('---');
    expect(opening).toBe('');
    expect(frontmatter).toMatch(/^name: landing-cliente$/m);
    expect(frontmatter).toMatch(/^argument-hint: \[nome-do-cliente\]$/m);

    const description = frontmatter.match(/^description: (.+)$/m)?.[1];
    expect(description).toBeDefined();
    expect(description?.startsWith('Cria ou edita a landing de um cliente no LandingBuilder')).toBe(true);
    expect(description?.length).toBeLessThanOrEqual(1000);
  });

  it('covers the client data and every supported section', () => {
    for (const key of ['site', 'brand', 'business', 'nav', 'sections', 'footer']) {
      expect(body).toContain(`\`${key}\``);
    }
    for (const key of ['colors', 'fonts', 'radius', 'density', 'motion', 'three']) {
      expect(body).toContain(`\`${key}\``);
    }
    for (const section of [
      'hero', 'stats', 'about', 'features', 'showcase3d', 'gallery',
      'offers', 'testimonials', 'faq', 'location', 'contact',
    ]) {
      expect(body).toContain(`\`${section}\``);
    }
  });

  it('keeps client work within the intended boundary and records asset rights', () => {
    expect(body).toContain('`client/content.json`');
    expect(body).toContain('`client/theme.json`');
    expect(body).toContain('`public/client/`');
    expect(body).toContain('`docs/ASSETS.md`');
    expect(body).toContain('nunca editar `src/`');
    expect(body).toMatch(/imagem de terceiros sem autoriza[cç][aã]o registrada/i);
    expect(body).toContain('Desenvolvido por RBrecci');
  });

  it('requires the complete validation loop and an evidence based report', () => {
    for (const command of [
      'npm run validate', 'npm run check:text', 'npm run build',
      'npm run size', 'npm run e2e',
    ]) {
      expect(body).toContain(`\`${command}\``);
    }
    expect(body).toContain('código de saída');
    expect(body).toContain('a confirmar com o cliente');
    expect(body).toContain('o que não foi verificado');
  });

  it('contains none of the prohibited dash characters', () => {
    expect(skill).not.toMatch(/[\u2014\u2013\u2212]/u);
  });
});
