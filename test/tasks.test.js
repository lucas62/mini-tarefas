import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addTask, completeTask, listTasks, removeTask } from '../src/tasks.js';

test('addTask gera ids sequenciais e apara o título', () => {
  const t = addTask(addTask([], ' a '), 'b');
  assert.deepEqual(t.map((x) => [x.id, x.title]), [[1, 'a'], [2, 'b']]);
});

test('addTask recusa título vazio', () => {
  assert.throws(() => addTask([], '   '), /título vazio/);
});

test('completeTask marca só a tarefa pedida', () => {
  const t = completeTask(addTask(addTask([], 'a'), 'b'), 2);
  assert.deepEqual(t.map((x) => x.done), [false, true]);
});

test('completeTask recusa id inexistente', () => {
  assert.throws(() => completeTask([], 9), /não existe/);
});

test('listTasks --open esconde as concluídas', () => {
  const t = completeTask(addTask(addTask([], 'a'), 'b'), 1);
  assert.deepEqual(listTasks(t, { onlyOpen: true }).map((x) => x.id), [2]);
});

test('removeTask remove só a tarefa pedida, mesmo concluída', () => {
  const t = completeTask(addTask(addTask([], 'a'), 'b'), 1);
  assert.deepEqual(removeTask(t, 1), [{ id: 2, title: 'b', done: false }]);
});
