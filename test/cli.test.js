import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const CLI = path.resolve('src/cli.js');

function setup(tasks) {
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'tarefas-')), 'tarefas.json');
  if (tasks) fs.writeFileSync(file, JSON.stringify(tasks));
  const run = (...args) => spawnSync(process.execPath, [CLI, ...args], { env: { ...process.env, TAREFAS_FILE: file }, encoding: 'utf8' });
  const read = () => JSON.parse(fs.readFileSync(file, 'utf8'));
  return { run, read };
}

const TWO = [{ id: 1, title: 'a', done: false }, { id: 2, title: 'b', done: false }];

test('rm <id> remove a tarefa e imprime "- <id> <título>"', () => {
  const { run, read } = setup(TWO);
  const r = run('rm', '1');
  assert.equal(r.status, 0);
  assert.equal(r.stdout, '- 1 a\n');
  assert.deepEqual(read(), [TWO[1]]);
});

test('rm com id inexistente: erro claro, exit 1, lista intacta', () => {
  const { run, read } = setup(TWO);
  const r = run('rm', '9');
  assert.equal(r.status, 1);
  assert.equal(r.stderr, 'erro: tarefa 9 não existe\n');
  assert.deepEqual(read(), TWO);
});

test('rm sem id: erro "id inválido", exit 1, lista intacta', () => {
  const { run, read } = setup(TWO);
  const r = run('rm');
  assert.equal(r.status, 1);
  assert.equal(r.stderr, 'erro: id inválido\n');
  assert.deepEqual(read(), TWO);
});
