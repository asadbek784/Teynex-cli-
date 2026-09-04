import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { isPathSafeWithinRoot } from '../security.js';

export function listDirectory(path: string): string[] {
  const root = resolve(path);
  if (!existsSync(root)) return [];
  return readdirSync(root, { withFileTypes: true }).map((entry) => entry.name);
}

export function readFile(filePath: string): string {
  const resolved = resolve(filePath);
  if (!existsSync(resolved)) {
    throw new Error(`File not found: ${filePath}`);
  }
  return readFileSync(resolved, 'utf8');
}

export function writeFile(filePath: string, content: string, root = process.cwd()): void {
  const resolved = resolve(filePath);
  if (!isPathSafeWithinRoot(resolved, root)) {
    throw new Error(`Refusing to write outside project root: ${filePath}`);
  }
  const dir = resolved.substring(0, resolved.lastIndexOf('/') || resolved.lastIndexOf('\\')) || root;
  if (!existsSync(dir)) {
    throw new Error(`Directory does not exist: ${dir}`);
  }
  writeFileSync(resolved, content, 'utf8');
}

export function searchText(root: string, query: string): string[] {
  const resolvedRoot = resolve(root);
  const results: string[] = [];
  const stack = [resolvedRoot];
  while (stack.length > 0) {
    const current = stack.pop()!;
    if (!existsSync(current)) continue;
    const stat = statSync(current);
    if (stat.isDirectory()) {
      const entries = readdirSync(current, { withFileTypes: true });
      for (const entry of entries) {
        if (['.git', 'node_modules', 'dist', 'build'].includes(entry.name)) continue;
        stack.push(join(current, entry.name));
      }
      continue;
    }
    if (!current.endsWith('.ts') && !current.endsWith('.js') && !current.endsWith('.json') && !current.endsWith('.md') && !current.endsWith('.txt')) continue;
    try {
      const text = readFileSync(current, 'utf8');
      if (text.toLowerCase().includes(query.toLowerCase())) {
        results.push(current);
      }
    } catch {
      // ignore binary or unreadable files
    }
  }
  return results;
}
