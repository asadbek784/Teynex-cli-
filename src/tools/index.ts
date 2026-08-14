import fs from 'node:fs/promises';
import path from 'node:path';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import type { ApprovalFn } from '../types.js';

const execAsync = promisify(exec);
const ROOT = process.cwd();

function safePath(p: string) {
  const abs = path.resolve(ROOT, p);
  if (abs !== ROOT && !abs.startsWith(ROOT + path.sep)) throw new Error('Path escapes the project directory.');
  return abs;
}

const SAFE_COMMANDS = /^(pwd|ls(?:\s|$)|find(?:\s|$)|cat(?:\s|$)|head(?:\s|$)|tail(?:\s|$)|grep(?:\s|$)|rg(?:\s|$)|git\s+(status|diff|log|branch)(?:\s|$)|node\s+--version|npm\s+--version|php\s+-v)$/;

export function toolDefinitions() {
  return [
    { name: 'list_files', description: 'List files/directories under a project path.', args: { path: 'string optional' } },
    { name: 'read_file', description: 'Read a UTF-8 text file.', args: { path: 'string' } },
    { name: 'write_file', description: 'Create or overwrite a UTF-8 text file.', args: { path: 'string', content: 'string' } },
    { name: 'edit_file', description: 'Replace one exact text occurrence in a file.', args: { path: 'string', oldText: 'string', newText: 'string' } },
    { name: 'search_files', description: 'Search text recursively in project files.', args: { query: 'string', path: 'string optional' } },
    { name: 'run_command', description: 'Run a shell command in the project. Potentially destructive commands require approval.', args: { command: 'string' } },
    { name: 'git_status', description: 'Get git status.', args: {} },
    { name: 'git_diff', description: 'Get git diff.', args: {} }
  ];
}

export async function runTool(name: string, args: Record<string, unknown>, approve: ApprovalFn): Promise<string> {
  switch (name) {
    case 'list_files': {
      const dir = safePath(String(args.path || '.'));
      const entries = await fs.readdir(dir, { withFileTypes: true });
      return entries.sort((a,b) => a.name.localeCompare(b.name)).map(e => `${e.isDirectory() ? 'DIR ' : 'FILE'} ${e.name}`).join('\n') || '(empty)';
    }
    case 'read_file': {
      return await fs.readFile(safePath(String(args.path)), 'utf8');
    }
    case 'write_file': {
      const p = safePath(String(args.path));
      await fs.mkdir(path.dirname(p), { recursive: true });
      await fs.writeFile(p, String(args.content ?? ''), 'utf8');
      return `Wrote ${path.relative(ROOT, p) || '.'}`;
    }
    case 'edit_file': {
      const p = safePath(String(args.path));
      const oldText = String(args.oldText ?? '');
      const text = await fs.readFile(p, 'utf8');
      const count = text.split(oldText).length - 1;
      if (count !== 1) throw new Error(`Expected exactly one match, found ${count}.`);
      await fs.writeFile(p, text.replace(oldText, String(args.newText ?? '')), 'utf8');
      return `Edited ${path.relative(ROOT, p)}`;
    }
    case 'search_files': {
      const q = String(args.query || '');
      const start = safePath(String(args.path || '.'));
      const { stdout } = await execAsync(`rg -n --hidden --glob '!.git' --glob '!node_modules' ${JSON.stringify(q)} ${JSON.stringify(start)}`, { cwd: ROOT, maxBuffer: 400000 });
      return stdout || '(no matches)';
    }
    case 'run_command': {
      const command = String(args.command || '').trim();
      if (!command) throw new Error('Command is empty.');
      if (!SAFE_COMMANDS.test(command) && !(await approve(command))) return 'Command rejected by user.';
      const { stdout, stderr } = await execAsync(command, { cwd: ROOT, timeout: 120000, maxBuffer: 800000, shell: '/bin/sh' });
      return `${stdout}${stderr ? `\n[stderr]\n${stderr}` : ''}`.trim() || '(command completed with no output)';
    }
    case 'git_status': {
      const { stdout } = await execAsync('git status --short --branch', { cwd: ROOT });
      return stdout || '(clean)';
    }
    case 'git_diff': {
      const { stdout } = await execAsync('git diff --', { cwd: ROOT, maxBuffer: 800000 });
      return stdout || '(no diff)';
    }
    default: throw new Error(`Unknown tool: ${name}`);
  }
}
