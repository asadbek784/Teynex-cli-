import { spawn } from 'node:child_process';
import type { ShellResult } from '../types.js';
import { classifyCommand } from '../security.js';

export async function runCommand(command: string, cwd = process.cwd(), allowDangerous = false): Promise<ShellResult> {
  const risk = classifyCommand(command);
  if (risk === 'DANGEROUS' && !allowDangerous) {
    throw new Error(`Command blocked due to safety classification: ${command}`);
  }

  const started = Date.now();
  const shell = process.platform === 'win32' ? 'powershell.exe' : 'bash';
  const shellArgs = process.platform === 'win32' ? ['-NoLogo', '-NoProfile', '-Command', command] : ['-lc', command];

  return await new Promise<ShellResult>((resolve, reject) => {
    const child = spawn(shell, shellArgs, {
      cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env },
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr?.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', (error) => reject(error));
    child.on('close', (code) => {
      resolve({
        command,
        exitCode: code ?? 1,
        stdout,
        stderr,
        durationMs: Date.now() - started,
        risk,
      });
    });
  });
}
