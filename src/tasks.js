// Regras da lista de tarefas, sem I/O: o armazenamento fica em store.js.
export function addTask(tasks, title) {
  const clean = String(title ?? '').trim();
  if (!clean) throw new Error('título vazio');
  const id = tasks.reduce((max, t) => Math.max(max, t.id), 0) + 1;
  return [...tasks, { id, title: clean, done: false }];
}

export function completeTask(tasks, id) {
  if (!tasks.some((t) => t.id === id)) throw new Error(`tarefa ${id} não existe`);
  return tasks.map((t) => (t.id === id ? { ...t, done: true } : t));
}

export function listTasks(tasks, { onlyOpen = false } = {}) {
  return onlyOpen ? tasks.filter((t) => !t.done) : tasks;
}

export function removeTask(tasks, id) {
  if (!Number.isInteger(id) || id <= 0) throw new Error('id inválido');
  if (!tasks.some((t) => t.id === id)) throw new Error(`tarefa ${id} não existe`);
  return tasks.filter((t) => t.id !== id);
}
