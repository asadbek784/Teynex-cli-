import { existsSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import type { ProjectInfo } from '../types.js';

function walkDirectory(root: string, maxDepth = 3, currentDepth = 0): string[] {
  const result: string[] = [];
  if (currentDepth > maxDepth) return result;
  try {
    const entries = readdirSync(root, { withFileTypes: true });
    for (const entry of entries) {
      if (['.git', 'node_modules', '.next', 'dist', 'build'].includes(entry.name)) continue;
      const fullPath = join(root, entry.name);
      if (entry.isDirectory()) {
        result.push(...walkDirectory(fullPath, maxDepth, currentDepth + 1));
      } else {
        result.push(fullPath);
      }
    }
  } catch {
    // ignore unreadable folders
  }
  return result;
}

export async function detectProject(root = process.cwd()): Promise<ProjectInfo> {
  const resolved = resolve(root);
  const git = existsSync(join(resolved, '.git'));
  let packageManager: string | null = null;
  const languages: string[] = [];
  const frameworks: string[] = [];
  const entrypoints: string[] = [];

  if (existsSync(join(resolved, 'package.json'))) {
    packageManager = existsSync(join(resolved, 'pnpm-lock.yaml')) ? 'pnpm' : existsSync(join(resolved, 'yarn.lock')) ? 'yarn' : 'npm';
  }
  if (existsSync(join(resolved, 'package.json')) || existsSync(join(resolved, 'tsconfig.json')) || existsSync(join(resolved, 'src'))) {
    languages.push('TypeScript');
  }
  if (existsSync(join(resolved, 'pyproject.toml')) || existsSync(join(resolved, 'requirements.txt'))) languages.push('Python');
  if (existsSync(join(resolved, 'go.mod'))) languages.push('Go');
  if (existsSync(join(resolved, 'Cargo.toml'))) languages.push('Rust');
  if (existsSync(join(resolved, 'pom.xml')) || existsSync(join(resolved, 'build.gradle')) || existsSync(join(resolved, 'build.gradle.kts'))) languages.push('Java');

  if (existsSync(join(resolved, 'vite.config.ts')) || existsSync(join(resolved, 'vite.config.js')) || existsSync(join(resolved, 'vite.config.mjs'))) frameworks.push('Vite');
  if (existsSync(join(resolved, 'next.config.js')) || existsSync(join(resolved, 'next.config.mjs')) || existsSync(join(resolved, 'next.config.ts'))) frameworks.push('Next.js');
  if (existsSync(join(resolved, 'src'))) frameworks.push('App');

  const projectFiles = walkDirectory(resolved, 2);
  const fileCount = projectFiles.length;
  const isNodeProject = existsSync(join(resolved, 'package.json')) || existsSync(join(resolved, 'node_modules'));
  const isTypeScriptProject = existsSync(join(resolved, 'tsconfig.json')) || projectFiles.some((file) => file.endsWith('.ts') || file.endsWith('.tsx'));
  const isPythonProject = existsSync(join(resolved, 'pyproject.toml')) || existsSync(join(resolved, 'requirements.txt'));
  const isGoProject = existsSync(join(resolved, 'go.mod'));
  const isRustProject = existsSync(join(resolved, 'Cargo.toml'));
  const isJavaProject = existsSync(join(resolved, 'pom.xml')) || existsSync(join(resolved, 'build.gradle')) || existsSync(join(resolved, 'build.gradle.kts'));

  if (existsSync(join(resolved, 'package.json'))) entrypoints.push('package.json');
  if (existsSync(join(resolved, 'src')) && (existsSync(join(resolved, 'src', 'index.ts')) || existsSync(join(resolved, 'src', 'main.ts')) || existsSync(join(resolved, 'src', 'index.js')))) {
    entrypoints.push('src/index');
  }
  if (!entrypoints.length && existsSync(join(resolved, 'README.md'))) entrypoints.push('README.md');

  return {
    root: resolved,
    git,
    packageManager,
    languages: Array.from(new Set(languages)),
    frameworks: Array.from(new Set(frameworks)),
    entrypoints,
    fileCount,
    isNodeProject,
    isTypeScriptProject,
    isPythonProject,
    isGoProject,
    isRustProject,
    isJavaProject,
  };
}
