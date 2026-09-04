import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { detectProject } from '../project/projectDetector.js';
import { buildPlan, setStepStatus, summarizePlan } from './planner.js';
import { listDirectory } from '../tools/filesystem.js';
import { runCommand } from '../tools/shell.js';
import type { ProjectInfo, TaskStep } from '../types.js';

export async function runAgentTask(prompt: string, root = process.cwd()): Promise<{ summary: string; plan: TaskStep[] }> {
  const project = await detectProject(root);
  const plan = buildPlan(prompt);
  const projectSummary = projectIsReady(project);

  const start = setStepStatus(plan, 'inspect', 'running');
  const projectFiles = listDirectory(root).slice(0, 12);

  let summary = `Detected project at ${project.root}.\n`;
  summary += `Git: ${project.git ? 'enabled' : 'not detected'} | Package manager: ${project.packageManager ?? 'unknown'} | Languages: ${project.languages.join(', ') || 'unclassified'}\n`;
  summary += `Relevant files: ${projectFiles.join(', ') || 'none'}`;

  const updatedInspect = setStepStatus(start, 'inspect', 'completed');
  const identify = setStepStatus(updatedInspect, 'identify', 'running');
  const identifyResult = setStepStatus(identify, 'identify', 'completed');

  if (projectSummary.command) {
    const editPhase = setStepStatus(identifyResult, 'edit', 'running');
    const commandResult = await runCommand(projectSummary.command, root, false);
    if (commandResult.exitCode === 0) {
      const donePlan = setStepStatus(editPhase, 'edit', 'completed');
      const verifyPlan = setStepStatus(donePlan, 'verify', 'running');
      const finalPlan = setStepStatus(verifyPlan, 'verify', 'completed');
      return {
        summary: `${summary}\n\nValidation command: ${projectSummary.command}\nExit code: ${commandResult.exitCode}\n${commandResult.stdout.toString().trim() || 'Command completed successfully.'}`,
        plan: finalPlan,
      };
    }

    const failedPlan = setStepStatus(editPhase, 'edit', 'failed');
    return {
      summary: `${summary}\n\nValidation failed with exit code ${commandResult.exitCode}.\n${commandResult.stderr || commandResult.stdout}`,
      plan: failedPlan,
    };
  }

  const pendingPlan = setStepStatus(identifyResult, 'edit', 'completed');
  return {
    summary: `${summary}\n\nNo validation command was available automatically, so TYNEX recorded the repo state and prepared a task plan.`,
    plan: setStepStatus(pendingPlan, 'verify', 'completed'),
  };
}

function projectIsReady(project: ProjectInfo): { command: string | null } {
  const packageJsonPath = join(project.root, 'package.json');
  if (existsSync(packageJsonPath)) {
    try {
      const pkgJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as { scripts?: Record<string, string> };
      const scripts = pkgJson.scripts ?? {};
      if (scripts.test) return { command: 'npm test' };
      if (scripts.build) return { command: 'npm run build' };
    } catch {
      // ignore malformed package.json and continue without a command
    }
  }
  if (project.isPythonProject) return { command: 'python -m pytest || python -m unittest' };
  return { command: null };
}

export function renderPlan(plan: TaskStep[]): string {
  return summarizePlan(plan);
}
