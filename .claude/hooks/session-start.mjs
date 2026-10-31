#!/usr/bin/env node
// SessionStart: print a short status block. Plain stdout from SessionStart is added to Claude's context.
// Gives a fresh session (local, cloud or CI) instant orientation: branch, dirty files, active spec + next task.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

try {
  const input = JSON.parse(fs.readFileSync(0, 'utf8') || '{}');
  const projectDir = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
  const git = (...a) => {
    try {
      return execFileSync('git', a, { cwd: projectDir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    } catch {
      return null;
    }
  };
  let cfg = {};
  try {
    cfg = JSON.parse(fs.readFileSync(path.join(projectDir, '.claude/workflow.json'), 'utf8'));
  } catch {}
  const specsDir = path.join(projectDir, cfg.specsDir || 'docs/specs');

  const lines = [];
  const branch = git('symbolic-ref', '--short', '-q', 'HEAD') || (git('rev-parse', '--short', 'HEAD') ? 'detached HEAD' : null);
  if (branch) {
    const dirty = (git('status', '--porcelain') || '').split('\n').filter(Boolean).length;
    lines.push(`branch: ${branch}${dirty ? ` (${dirty} uncommitted file${dirty > 1 ? 's' : ''})` : ' (clean)'}`);
  }

  // git identity per repo: warn before the first commit lands under the wrong (global) identity
  if (branch) {
    const local = git('config', '--local', 'user.email');
    const effective = git('config', 'user.email');
    if (typeof cfg.gitEmail === 'string' && cfg.gitEmail && effective !== cfg.gitEmail)
      lines.push(`WARNING git identity: commits would use "${effective || 'nothing'}", this repo expects "${cfg.gitEmail}" (git config user.email "${cfg.gitEmail}")`);
    else if (!local) lines.push(`git identity: no repo-local user.email, commits use the global "${effective || 'nothing'}" (set gitEmail in .claude/workflow.json to enforce one)`);
  }

  // .mcp.json: secrets only as ${VAR}
  try {
    const j = JSON.parse(fs.readFileSync(path.join(projectDir, '.mcp.json'), 'utf8'));
    const bad = [];
    for (const [name, s] of Object.entries(j.mcpServers ?? j.servers ?? {}))
      for (const k of ['env', 'headers']) for (const [key, v] of Object.entries(s?.[k] ?? {})) if (typeof v === 'string' && !/\$\{[A-Za-z_][A-Za-z0-9_]*(:-[^}]*)?\}/.test(v)) bad.push(`${name}.${k}.${key}`);
    if (bad.length) lines.push(`WARNING .mcp.json has literal values (use \${VAR}): ${bad.join(', ')}`);
  } catch {}

  // active spec: pointer file, else newest spec folder that still has open tasks
  const progress = (dir) => {
    try {
      const t = fs.readFileSync(path.join(specsDir, dir, 'tasks.md'), 'utf8').split('\n');
      const open = t.filter((l) => /^- \[ \]/.test(l));
      const done = t.filter((l) => /^- \[x\]/i.test(l)).length;
      return { done, total: done + open.length, next: open[0]?.replace(/^- \[ \]\s*/, '').slice(0, 90) };
    } catch {
      return null;
    }
  };
  let active = null;
  try {
    active = fs.readFileSync(path.join(specsDir, '.active'), 'utf8').trim();
  } catch {}
  if (!active && fs.existsSync(specsDir)) {
    const dirs = fs.readdirSync(specsDir, { withFileTypes: true }).filter((e) => e.isDirectory() && /^\d{3}-/.test(e.name)).map((e) => e.name).sort().reverse();
    active = dirs.find((d) => (progress(d)?.next ?? null) !== null) ?? null;
  }
  if (active && fs.existsSync(path.join(specsDir, active))) {
    const p = progress(active);
    lines.push(`active spec: ${path.relative(projectDir, path.join(specsDir, active))}/` + (p ? ` - tasks ${p.done}/${p.total}${p.next ? `, next: ${p.next}` : ' (all done)'}` : ' - no tasks.md yet'));
  }

  if (lines.length) {
    console.log('[workflow] ' + lines.join('\n[workflow] '));
    console.log('[workflow] lifecycle: /wf-spec -> /wf-plan -> /wf-build -> /wf-review -> /wf-ship  (bugs: /wf-fix; /wf-learn after corrections)');
  }
} catch {
  // stay silent on errors
}
process.exit(0);
