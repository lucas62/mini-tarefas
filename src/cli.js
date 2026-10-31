#!/usr/bin/env node
// Uso: node src/cli.js add "comprar pão" | done 1 | list [--open]
import { addTask, completeTask, listTasks } from './tasks.js';
import { load, save } from './store.js';

const FILE = process.env.TAREFAS_FILE || 'tarefas.json';
const [cmd, ...args] = process.argv.slice(2);
let tasks = load(FILE);

try {
  if (cmd === 'add') {
    tasks = addTask(tasks, args.join(' '));
    save(FILE, tasks);
    console.log(`+ ${tasks.at(-1).id} ${tasks.at(-1).title}`);
  } else if (cmd === 'done') {
    tasks = completeTask(tasks, Number(args[0]));
    save(FILE, tasks);
    console.log(`x ${args[0]}`);
  } else if (cmd === 'list') {
    for (const t of listTasks(tasks, { onlyOpen: args.includes('--open') })) console.log(`${t.done ? '[x]' : '[ ]'} ${t.id} ${t.title}`);
  } else {
    console.log('Uso: add <título> | done <id> | list [--open]');
    process.exitCode = cmd ? 1 : 0;
  }
} catch (e) {
  console.error(`erro: ${e.message}`);
  process.exitCode = 1;
}
