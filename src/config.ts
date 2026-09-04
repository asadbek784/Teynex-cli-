import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import type { TynexConfig } from './types.js';

const defaultConfig: TynexConfig = {
  provider: 'openrouter',
  model: 'openai/gpt-4o-mini',
  contextLimit: 32000,
  theme: 'dark',
  autoApprove: false,
  noColor: false,
  shell: process.platform === 'win32' ? 'powershell' : 'bash',
};

function configPathForUser(): string {
  return join(homedir(), '.tynex', 'config.json');
}

function configPathForProject(projectRoot: string): string {
  return join(projectRoot, '.tynex', 'config.json');
}

export function ensureConfigDirs(projectRoot: string): void {
  const paths = [join(homedir(), '.tynex'), join(projectRoot, '.tynex')];
  for (const p of paths) {
    if (!existsSync(p)) {
      mkdirSync(p, { recursive: true });
    }
  }
}

export function loadConfig(projectRoot = process.cwd()): TynexConfig {
  const cfg: TynexConfig = { ...defaultConfig };
  const userPath = configPathForUser();
  const projectPath = configPathForProject(projectRoot);

  for (const path of [userPath, projectPath]) {
    if (!existsSync(path)) continue;
    try {
      const raw = readFileSync(path, 'utf8');
      const parsed = JSON.parse(raw);
      Object.assign(cfg, parsed);
    } catch {
      // ignore malformed config and continue to defaults
    }
  }

  for (const [key, value] of Object.entries(process.env)) {
    if (!value) continue;
    if (key === 'TYNEX_PROVIDER') cfg.provider = value;
    if (key === 'TYNEX_MODEL') cfg.model = value;
    if (key === 'TYNEX_API_KEY') cfg.apiKey = value;
    if (key === 'TYNEX_BASE_URL') cfg.baseUrl = value;
    if (key === 'TYNEX_CONTEXT_LIMIT') cfg.contextLimit = Number(value) || cfg.contextLimit;
    if (key === 'TYNEX_THEME') cfg.theme = value as TynexConfig['theme'];
    if (key === 'TYNEX_AUTO_APPROVE') cfg.autoApprove = value.toLowerCase() === 'true';
    if (key === 'TYNEX_NO_COLOR') cfg.noColor = value.toLowerCase() === 'true';
  }

  return cfg;
}

export function saveConfig(config: Partial<TynexConfig>, projectRoot = process.cwd()): void {
  ensureConfigDirs(projectRoot);
  const userPath = configPathForUser();
  const projectPath = configPathForProject(projectRoot);

  const safeConfig: Partial<TynexConfig> = { ...config };
  if (!safeConfig.apiKey) delete safeConfig.apiKey;

  const contents = JSON.stringify(safeConfig, null, 2);
  writeFileSync(projectPath, contents, 'utf8');
  writeFileSync(userPath, contents, 'utf8');
}

export function getUserConfigPath(): string {
  return configPathForUser();
}

export function getProjectConfigPath(projectRoot: string): string {
  return configPathForProject(projectRoot);
}
