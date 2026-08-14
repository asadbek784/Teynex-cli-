import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export type ProviderId = 'openrouter' | 'openai' | 'groq' | 'gemini' | 'mistral' | 'custom';

export type TeynexConfig = {
  provider: ProviderId;
  apiKey: string;
  baseUrl: string;
  model: string;
  maxSteps: number;
  autoApprove: boolean;
};

export const CONFIG_DIR = path.join(process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config'), 'teynex');
export const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

const PROVIDERS: Record<ProviderId, { baseUrl: string; model: string }> = {
  openrouter: { baseUrl: 'https://openrouter.ai/api/v1', model: 'google/gemini-2.5-flash-lite' },
  openai: { baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini' },
  groq: { baseUrl: 'https://api.groq.com/openai/v1', model: 'llama-3.3-70b-versatile' },
  gemini: { baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai', model: 'gemini-2.5-flash' },
  mistral: { baseUrl: 'https://api.mistral.ai/v1', model: 'mistral-small-latest' },
  custom: { baseUrl: 'https://example.com/v1', model: 'your-model' }
};

function loadDotEnv() {
  const file = path.join(process.cwd(), '.env');
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m || process.env[m[1]]) continue;
    process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
}

function readSaved(): Partial<TeynexConfig> {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')) as Partial<TeynexConfig>;
  } catch {
    return {};
  }
}

export function providerDefaults(provider: ProviderId) {
  return PROVIDERS[provider] || PROVIDERS.custom;
}

export function getConfig(): TeynexConfig {
  loadDotEnv();
  const saved = readSaved();
  const provider = (process.env.TEYNEX_PROVIDER || saved.provider || 'openrouter') as ProviderId;
  const defaults = providerDefaults(provider);
  return {
    provider,
    apiKey: process.env.TEYNEX_API_KEY || saved.apiKey ||
      (provider === 'openrouter' ? process.env.OPENROUTER_API_KEY : '') ||
      (provider === 'openai' ? process.env.OPENAI_API_KEY : '') ||
      (provider === 'groq' ? process.env.GROQ_API_KEY : '') ||
      (provider === 'gemini' ? process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY : '') ||
      (provider === 'mistral' ? process.env.MISTRAL_API_KEY : '') || '',
    baseUrl: (process.env.TEYNEX_BASE_URL || saved.baseUrl || defaults.baseUrl).replace(/\/$/, ''),
    model: process.env.TEYNEX_MODEL || saved.model || defaults.model,
    maxSteps: Number(process.env.TEYNEX_MAX_STEPS || saved.maxSteps || 16),
    autoApprove: process.env.TEYNEX_AUTO_APPROVE === 'true' || saved.autoApprove === true
  };
}

export function saveConfig(next: Partial<TeynexConfig>) {
  const current = getConfig();
  const merged: TeynexConfig = { ...current, ...next };
  fs.mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(merged, null, 2) + '\n', { mode: 0o600 });
  try { fs.chmodSync(CONFIG_FILE, 0o600); } catch {}
  return merged;
}

export const config = getConfig();
