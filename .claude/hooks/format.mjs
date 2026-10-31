#!/usr/bin/env node
// PostToolUse (Edit|Write): format the touched file with the project's own formatter.
// Silent and best-effort: uses Biome if configured, else Prettier if installed locally. Never blocks.
// Cross-platform: runs the package's JS entry point with the current Node binary, so it does not depend on
// node_modules/.bin shims (which are .cmd files on Windows).
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

function resolveBin(projectDir, pkg, binName) {
  try {
    const dir = path.join(projectDir, 'node_modules', ...pkg.split('/'));
    const meta = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'));
    const rel = typeof meta.bin === 'string' ? meta.bin : meta.bin?.[binName];
    if (!rel) return null;
    const file = path.join(dir, rel);
    return fs.existsSync(file) ? file : null;
  } catch {
    return null;
  }
}

try {
  const input = JSON.parse(fs.readFileSync(0, 'utf8') || '{}');
  const projectDir = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
  let cfg = {};
  try {
    cfg = JSON.parse(fs.readFileSync(path.join(projectDir, '.claude/workflow.json'), 'utf8'));
  } catch {}
  if (cfg.format === false) process.exit(0);

  const fp = input.tool_input?.file_path;
  if (!fp || fp.includes('node_modules') || !/\.(m?[jt]sx?|json|css|scss|md|mdx|ya?ml|html)$/.test(fp)) process.exit(0);
  const abs = path.resolve(projectDir, fp);
  if (!fs.existsSync(abs)) process.exit(0);

  const hasBiomeCfg = fs.existsSync(path.join(projectDir, 'biome.json')) || fs.existsSync(path.join(projectDir, 'biome.jsonc'));
  let job = null;
  const biome = hasBiomeCfg ? resolveBin(projectDir, '@biomejs/biome', 'biome') : null;
  const prettier = resolveBin(projectDir, 'prettier', 'prettier');
  if (biome) job = [biome, ['format', '--write', abs]];
  else if (prettier) job = [prettier, ['--write', '--log-level', 'silent', abs]];
  if (job) execFileSync(process.execPath, [job[0], ...job[1]], { cwd: projectDir, timeout: 20000, stdio: 'ignore' });
} catch {
  // never block on formatting problems
}
process.exit(0);
