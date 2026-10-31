import fs from 'node:fs';

export function load(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return [];
  }
}

export function save(file, tasks) {
  fs.writeFileSync(file, JSON.stringify(tasks, null, 2) + '\n');
}
