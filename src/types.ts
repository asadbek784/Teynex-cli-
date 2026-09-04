export type RiskLevel = 'SAFE' | 'CAUTION' | 'DANGEROUS';

export interface ProjectInfo {
  root: string;
  git: boolean;
  packageManager: string | null;
  languages: string[];
  frameworks: string[];
  entrypoints: string[];
  fileCount: number;
  isNodeProject: boolean;
  isTypeScriptProject: boolean;
  isPythonProject: boolean;
  isGoProject: boolean;
  isRustProject: boolean;
  isJavaProject: boolean;
}

export interface TynexConfig {
  provider: string;
  model: string;
  apiKey?: string;
  baseUrl?: string;
  contextLimit: number;
  theme: 'dark' | 'light' | 'mono' | 'minimal';
  autoApprove: boolean;
  noColor: boolean;
  shell: string;
  lastSessionId?: string;
}

export interface TaskStep {
  id: string;
  title: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'blocked' | 'skipped';
}

export interface SessionRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  prompt: string;
  plan: TaskStep[];
  notes: string[];
}

export interface ShellResult {
  command: string;
  exitCode: number;
  stdout: string;
  stderr: string;
  durationMs: number;
  risk: RiskLevel;
}
