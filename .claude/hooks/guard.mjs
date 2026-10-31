#!/usr/bin/env node
// PreToolUse guard - deterministic guardrails. CLAUDE.md is advice; this is enforcement.
//   deny -> exit 2 + reason on stderr (fed back to Claude)
//   ask  -> exit 0 + JSON {permissionDecision:"ask"}  (user confirms)
// Fail-open: any internal error lets the call through (a broken guard must not brick the session).
// This is a seatbelt against honest mistakes, NOT a security boundary against a determined agent.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const out = (obj) => console.log(JSON.stringify(obj));
const deny = (why) => {
  console.error(`[workflow guard] BLOCKED: ${why}`);
  process.exit(2);
};
// .mcp.json must carry secrets only as ${VAR} references: every env / headers value needs one.
const mcpLiterals = (text) => {
  const j = JSON.parse(text);
  const bad = [];
  for (const [name, s] of Object.entries(j.mcpServers ?? j.servers ?? {})) {
    for (const k of ['env', 'headers']) {
      for (const [key, v] of Object.entries(s?.[k] ?? {})) if (typeof v === 'string' && !/\$\{[A-Za-z_][A-Za-z0-9_]*(:-[^}]*)?\}/.test(v)) bad.push(`${name}.${k}.${key}`);
    }
  }
  return bad;
};
const ask = (why) => {
  out({ hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'ask', permissionDecisionReason: `[workflow guard] ${why}` } });
  process.exit(0);
};

try {
  const input = JSON.parse(fs.readFileSync(0, 'utf8') || '{}');
  const tool = input.tool_name ?? '';
  const ti = input.tool_input ?? {};
  const projectDir = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
  let cfg = {};
  try {
    cfg = JSON.parse(fs.readFileSync(path.join(projectDir, '.claude/workflow.json'), 'utf8'));
  } catch {}
  const protectedBranches = Array.isArray(cfg.protectedBranches) ? cfg.protectedBranches : ['main', 'master'];

  const currentBranch = () => {
    try {
      // symbolic-ref works in repos with no commits yet (rev-parse HEAD does not); empty on detached HEAD
      return execFileSync('git', ['symbolic-ref', '--short', '-q', 'HEAD'], { cwd: input.cwd || projectDir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    } catch {
      return '';
    }
  };

  // ---------------- file edits ----------------
  if (/^(Edit|Write|MultiEdit|NotebookEdit)$/.test(tool)) {
    const fp = ti.file_path || ti.notebook_path || '';
    if (!fp) process.exit(0);
    const rel = path.relative(projectDir, path.resolve(projectDir, fp)).split(path.sep).join('/');
    const base = path.basename(rel);

    if (/^\.env(\..+)?$/.test(base) && !/\.(example|sample|template)$/.test(base))
      deny(`${rel} holds secrets. Document the variable in .env.example and ask the user to set the real value.`);
    if (/\.(pem|key|p12|pfx|keystore|jks)$/i.test(base) || /^id_(rsa|ed25519|ecdsa)/.test(base))
      deny(`${rel} looks like a private key / credential file.`);
    if (rel === '.git' || rel.startsWith('.git/')) deny('Do not edit .git internals; use git commands.');
    if (cfg.blockLockfileEdits !== false && /^(package-lock\.json|yarn\.lock|pnpm-lock\.yaml|bun\.lockb?|Gemfile\.lock|Podfile\.lock|composer\.lock)$/.test(base))
      deny(`${base} is generated. Change dependencies with the package manager (e.g. \`pnpm add\`), never by hand.`);
    if (base === '.mcp.json') {
      let next = null;
      try {
        if (tool === 'Write') next = String(ti.content ?? '');
        else if (tool === 'Edit' || tool === 'MultiEdit') {
          next = fs.readFileSync(path.resolve(projectDir, fp), 'utf8');
          for (const e of tool === 'Edit' ? [ti] : ti.edits ?? []) next = e.replace_all ? next.split(e.old_string).join(e.new_string) : next.replace(e.old_string, () => e.new_string);
        }
      } catch {}
      let bad = [];
      try {
        if (next !== null) bad = mcpLiterals(next);
      } catch {} // not JSON yet: let it through, session-start reports it later
      if (bad.length) deny(`.mcp.json must reference secrets as \${VAR}, never literal values. Literal in: ${bad.join(', ')}. Put the value in the environment (e.g. .env, not committed) and write "\${NAME}".`);
    }
    if (/^\.claude\/(hooks\/|settings(\.local)?\.json$)/.test(rel))
      ask(`${rel} controls the agent's own guardrails. Confirm this edit.`);
    process.exit(0);
  }

  // ---------------- shell commands ----------------
  if (tool === 'Bash') {
    const cmd = String(ti.command ?? '');
    const segments = cmd.split(/&&|\|\||;|\n/).map((s) => s.trim()).filter(Boolean);

    if (/\b(curl|wget)\b[^|]*\|\s*(sudo\s+)?(ba|z|da)?sh\b/.test(cmd)) deny('Piping a download into a shell is not allowed. Download, inspect, then run.');

    // secrets via shell
    if (/\b(cat|less|more|head|tail|bat|nl|strings|xxd|grep|rg|sed|awk)\b[^|;&]*\s["']?(\.\/)?(\S*\/)?\.env(\.(?!example|sample|template)[\w.-]+)?["']?(\s|$)/.test(cmd))
      deny('Reading .env files through the shell is blocked. Use .env.example for variable names.');
    if (/\bgit\s+add\b[^|;&]*\s\.env(\.(?!example|sample|template)[\w.-]+)?(\s|$)/.test(cmd)) deny('Never stage .env files.');

    for (const seg of segments) {
      // peel wrappers so `rtk git push --force` is judged like `git push --force` (RTK's hook and RTK.md make the agent type `rtk ...`)
      let bare = seg;
      for (let prev = null; prev !== bare; ) { prev = bare; bare = bare.replace(/^(?:sudo|command|time|rtk(?:\s+proxy)?)\s+/, ''); }
      const tokens = bare.split(/\s+/);
      const bin = tokens[0];
      const rest = tokens.slice(1);

      if (bin === 'rm') {
        const shortFlags = rest.filter((t) => /^-[a-zA-Z]+$/.test(t)).join('');
        const recursive = /[rR]/.test(shortFlags) || rest.includes('--recursive');
        const targets = rest.filter((t) => !t.startsWith('-'));
        const hot = ['/', '/*', '~', '~/', '$HOME', '$HOME/', '.', './', '..', '../', '*', '.git', './.git'];
        if (recursive && targets.some((t) => hot.includes(t.replace(/["']/g, '')))) deny(`\`${seg}\` would wipe a critical directory.`);
      }

      if (bin === 'git') {
        const sub = rest.find((t) => !t.startsWith('-'));
        const args = rest.slice(rest.indexOf(sub) + 1);
        if ((sub === 'commit' || sub === 'push' || sub === 'merge') && args.includes('--no-verify'))
          deny('--no-verify skips hooks. Fix the underlying failure instead.');

        if (sub === 'push') {
          const flagsOnly = args.filter((t) => t.startsWith('-'));
          const positional = args.filter((t) => !t.startsWith('-'));
          const force = flagsOnly.some((f) => f === '--force' || f === '-f' || (/^-[a-zA-Z]+$/.test(f) && f.includes('f')));
          if (force) deny('Force-push is blocked. If history really must change, ask the user to do it.');
          if (flagsOnly.some((f) => f.startsWith('--force-with-lease'))) ask('Force-push (with lease). Confirm.');
          if (protectedBranches.length) {
            const refs = positional.slice(1).map((r) => r.replace(/^\+?(HEAD:)?(refs\/heads\/)?/, '').replace(/^.*:/, ''));
            const hit = refs.find((r) => protectedBranches.includes(r));
            if (hit) deny(`Pushing to protected branch "${hit}" is blocked. Push a feature branch and open a PR.`);
            if (!refs.length && protectedBranches.includes(currentBranch()))
              deny(`You are on protected branch "${currentBranch()}". Create a feature branch first (git switch -c feat/<slug>).`);
          }
        }

        if (sub === 'commit' && typeof cfg.gitEmail === 'string' && cfg.gitEmail) {
          let email = '';
          try {
            email = execFileSync('git', ['config', 'user.email'], { cwd: input.cwd || projectDir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
          } catch {}
          if (email !== cfg.gitEmail)
            deny(`This repo commits as "${cfg.gitEmail}" (gitEmail in .claude/workflow.json), but git would use "${email || 'nothing'}". Ask the user to run: git config user.email "${cfg.gitEmail}"`);
        }

        if (sub === 'reset' && args.includes('--hard')) ask('git reset --hard discards uncommitted work.');
        if (sub === 'clean' && args.some((a) => /^-[a-zA-Z]*f/.test(a))) ask('git clean -f deletes untracked files.');
        if ((sub === 'checkout' && args.includes('--') ) || (sub === 'restore' && !args.includes('--staged'))) ask('This discards local changes in the working tree.');
        if (sub === 'branch' && args.some((a) => a === '-D' || a === '--force')) ask('Force-deleting a branch.');
        if (sub === 'stash' && ['drop', 'clear'].includes(args[0])) ask('Dropping stashed work.');
      }
    }
  }
} catch {
  // fail-open
}
process.exit(0);
