import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';
import prompts from 'prompts';
import { AIClient } from './client.js';
import { runTool, toolDefinitions } from '../tools/index.js';
import { getConfig } from '../config.js';
import type { AgentResult, ApprovalFn, Message, ToolCall } from '../types.js';

const SYSTEM = `You are Teynex AI, an autonomous senior software engineer operating inside a terminal project.
You have these tools: ${JSON.stringify(toolDefinitions())}
When you need a tool, output ONLY one JSON object on a single line:
{"tool":"tool_name","args":{...},"reason":"short reason"}
When the task is complete, output normal concise text and do not emit a tool object.
Use at most one tool call per assistant turn. Prefer small, reversible edits.`;

function parseTool(text: string): ToolCall | null {
  try {
    const candidates = [
      text.trim(),
      text.match(/```(?:json)?\s*([\s\S]*?)```/)?.[1] || ''
    ];
    for (const c of candidates) {
      const v = JSON.parse(c);
      if (v && typeof v.tool === 'string' && v.args && typeof v.args === 'object') return v;
    }
  } catch {}
  return null;
}

function logStep(msg: string) {
  console.log(chalk.dim(`[${new Date().toLocaleTimeString()}]`) + ` ${msg}`);
}

export class TeynexAgent {
  private client: AIClient;
  constructor(model?: string) {
    const cfg = getConfig();
    this.client = new AIClient(model || cfg.model);
  }

  async run(task: string, approve: ApprovalFn, onStep?: (n: number, label: string) => void): Promise<AgentResult> {
    const config = getConfig();
    const context = this.projectContext();
    const messages: Message[] = [
      { role: 'system', content: SYSTEM },
      { role: 'user', content: `Project root: ${process.cwd()}\nInitial context:\n${context}\n\nUser task:\n${task}` }
    ];

    for (let step = 1; step <= config.maxSteps; step++) {
      onStep?.(step, 'thinking');
      logStep(chalk.yellow(`Step ${step}: reasoning...`));
      const answer = await this.client.chat(messages);
      const call = parseTool(answer);
      if (!call) {
        logStep(chalk.green('Task complete.'));
        return { text: answer.trim(), steps: step };
      }
      onStep?.(step, call.tool);
      logStep(chalk.blue(`Step ${step}: calling ${call.tool}`));
      try {
        const result = await runTool(call.tool, call.args, approve);
        messages.push({ role: 'assistant', content: answer });
        messages.push({ role: 'tool', name: call.tool, content: result.slice(0, 12000) });
      } catch (e) {
        const msg = `ERROR: ${e instanceof Error ? e.message : 'unknown'}`;
        logStep(chalk.red(msg));
        messages.push({ role: 'assistant', content: answer });
        messages.push({ role: 'tool', name: call.tool, content: msg });
      }
    }

    logStep(chalk.yellow('Step limit reached.'));
    return { text: `Reached the ${config.maxSteps}-step limit.`, steps: config.maxSteps };
  }

  private projectContext() {
    try {
      const files = fs.readdirSync(process.cwd())
        .filter(x => !['.git', 'node_modules', 'dist'].includes(x))
        .slice(0, 80);
      return `Top-level: ${files.join(', ').trim() || '(empty)'}`;
    } catch { return '(unable to inspect directory)'; }
  }
}