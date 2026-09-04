#!/usr/bin/env node

import { readFileSync, existsSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { parseArgs } from 'node:util';
import { detectProject } from './project/projectDetector.js';
import { loadConfig } from './config.js';
import { redactSecrets, classifyCommand } from './security.js';
import { runCommand } from './tools/shell.js';
import { runAgentTask, renderPlan } from './agent/agent.js';
import { printBanner, printUsage, printStatus, printSuccess, printFailure, printDoctorReport, printConfigSummary, printPlan, printResult } from './ui/console.js';

function formatReport(project: Awaited<ReturnType<typeof detectProject>>): Array<{ name: string; ok: boolean; detail: string }> {
  return [
    { name: 'Runtime', ok: true, detail: `Node ${process.version}` },
    { name: 'Git', ok: project.git, detail: project.git ? 'Repository detected' : 'Git not detected' },
    { name: 'Project', ok: !!project.root, detail: project.root },
    { name: 'Provider', ok: true, detail: 'Provider config loaded' },
    { name: 'Network', ok: true, detail: 'Local checks only' },
  ];
}

async function runDoctor(projectRoot: string): Promise<void> {
  const project = await detectProject(projectRoot);
  const report = formatReport(project);
  printDoctorReport(report);
  if (project.isNodeProject) {
    printSuccess('Node project detected');
  }
  if (project.isTypeScriptProject) {
    printSuccess('TypeScript project detected');
  }
}

function printConfig(config: ReturnType<typeof loadConfig>): void {
  const summary = {
    provider: config.provider,
    model: config.model,
    theme: config.theme,
    contextLimit: config.contextLimit,
    autoApprove: config.autoApprove,
    shell: config.shell,
  };
  printConfigSummary(summary);
}

async function interactiveLoop(): Promise<void> {
  printBanner();
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  console.log('Type a task or use /help to browse commands.');
  console.log('');

  for await (const line of rl) {
    const message = line.trim();
    if (!message) continue;
    if (message === '/help') {
      printUsage();
      continue;
    }
    if (message === '/status') {
      printStatus('TYNEX ready');
      continue;
    }
    if (message === '/doctor') {
      await runDoctor(process.cwd());
      continue;
    }
    if (message === '/exit') {
      console.log('Goodbye.');
      rl.close();
      return;
    }
    printStatus(`Working on: ${message}`);
    try {
      const result = await runAgentTask(message, process.cwd());
      printPlan(renderPlan(result.plan));
      printResult(result.summary);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      printFailure(msg);
    }
  }
}

async function main(): Promise<void> {
  const args = parseArgs({
    args: process.argv.slice(2),
    allowPositionals: true,
    strict: false,
    options: {
      help: { type: 'boolean', short: 'h' },
      prompt: { type: 'string', short: 'p' },
      doctor: { type: 'boolean' },
      config: { type: 'boolean' },
      json: { type: 'boolean' },
      'no-color': { type: 'boolean' },
      model: { type: 'string' },
      provider: { type: 'string' },
    },
  });

  const config = loadConfig(process.cwd());
  const positionalCommand = args.positionals[0];
  if (args.values.help) {
    printUsage();
    return;
  }

  if (args.values.config || positionalCommand === 'config') {
    printConfig(config);
    return;
  }

  if (args.values.doctor || positionalCommand === 'doctor') {
    await runDoctor(process.cwd());
    return;
  }

  const prompt = typeof args.values.prompt === 'string'
    ? args.values.prompt
    : (positionalCommand === 'doctor' || positionalCommand === 'config' ? '' : args.positionals.join(' '));
  if (typeof prompt === 'string' && prompt.length > 0) {
    const classify = classifyCommand(prompt);
    if (classify === 'DANGEROUS') {
      printFailure('This prompt contains a dangerous command pattern and cannot be executed.');
      return;
    }
    printStatus(`Planning: ${prompt}`);
    try {
      const result = await runAgentTask(prompt, process.cwd());
      printPlan(renderPlan(result.plan));
      printResult(redactSecrets(result.summary));
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      printFailure(redactSecrets(msg));
    }
    return;
  }

  if (process.stdin.isTTY) {
    await interactiveLoop();
    return;
  }

  printUsage();
}

main().catch((error) => {
  console.error('TYNEX failed to start:', error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
