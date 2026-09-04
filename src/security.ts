import { resolve } from 'node:path';
import type { RiskLevel } from './types.js';

const dangerousPatterns = [
  /^\s*rm\s+-rf\b/i,
  /^\s*git\s+reset\s+--hard\b/i,
  /^\s*git\s+clean\s+-fdx\b/i,
  /^\s*format\s+\w+\b/i,
  /^\s*mkfs\b/i,
  /^\s*dd\s+if=/i,
  /^\s*shutdown\b/i,
  /^\s*reboot\b/i,
  /^\s*sudo\s+/i,
];

export function classifyCommand(command: string): RiskLevel {
  const trimmed = command.trim();
  if (!trimmed) return 'SAFE';
  if (dangerousPatterns.some((pattern) => pattern.test(trimmed))) return 'DANGEROUS';
  if (trimmed.startsWith('rm ') || trimmed.startsWith('del ') || trimmed.startsWith('rmdir ')) return 'CAUTION';
  return 'SAFE';
}

export function isPathSafeWithinRoot(targetPath: string, root: string): boolean {
  const resolvedTarget = resolve(targetPath);
  const resolvedRoot = resolve(root);
  return resolvedTarget === resolvedRoot || resolvedTarget.startsWith(resolvedRoot + '\\') || resolvedTarget.startsWith(resolvedRoot + '/');
}

export function redactSecrets(text: string): string {
  return text
    .replace(/(api[_-]?key|token|secret|password)\s*[:=]\s*['\"]?([^\s'\"]+)/gi, '$1=[REDACTED]')
    .replace(/(Authorization:\s*Bearer\s+)([A-Za-z0-9._-]+)/gi, '$1[REDACTED]');
}
