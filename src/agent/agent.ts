import fs from 'node:fs';
import path from 'node:path';
import { AIClient } from './client.js';
import { runTool, toolDefinitions } from '../tools/index.js';
import { getConfig } from '../config.js';
import type { AgentResult, ApprovalFn, Message, ToolCall } from '../types.js';

const SYSTEM = `You are Teynex AI, an autonomous senior software engineer operating inside a terminal project.
Your job is to inspect the repository, reason carefully, modify files, run validation, and report exactly what changed.
Never invent files or command output. Prefer small, reversible edits. Keep secrets out of source files.
You have these tools: ${JSON.stringify(toolDefinitions())}

TOOL PROTOCOL: When you need a tool, output ONLY one JSON object on a single line:
{"tool":"tool_name","args":{...},"reason":"short reason"}
When the task is complete, output normal concise text and do not emit a tool object.
Use at most one tool call per assistant turn. After a tool result, continue from the evidence.
For code changes, inspect relevant files first, then edit, then run the narrowest useful validation.
`;

function parseTool(text: string): ToolCall | null {
  const candidates = [text.trim(), text.match(/```(?:json)?\s*([\s\S]*?)```/)?.[1] || ''];
  for (const c of candidates) {
    try {
      const v = JSON.parse(c);
      if (v && typeof v.tool === 'string' && v.args && typeof v.args === 'object') return v;
    } catch {}
  }
  return null;
}

export class TeynexAgent {
  private client: AIClient;
  constructor(model = config.model) { this.client = new AIClient(model); }

  async run(task: string, approve: ApprovalFn, onStep?: (n: number, label: string) => void): Promise<AgentResult> {
    const config = getConfig();
    const context = this.projectContext();
    const messages: Message[] = [
      { role: 'system', content: SYSTEM },
      { role: 'user', content: `Project root: ${process.cwd()}\nInitial context:\n${context}\n\nUser task:\n${task}` }
    ];
    for (let step = 1; step <= config.maxSteps; step++) {
      onStep?.(step, 'thinking');
      const answer = await this.client.chat(messages);
      const call = parseTool(answer);
      if (!call) return { text: answer.trim(), steps: step };
      onStep?.(step, `${call.tool}`);
      let result: string;
      try { result = await runTool(call.tool, call.args, approve); }
      catch (e) { result = `ERROR: ${e instanceof Error ? e.message : String(e)}`; }
      messages.push({ role: 'assistant', content: answer });
      messages.push({ role: 'tool', name: call.tool, content: result.slice(0, 12000) });
    }
    return { text: `Reached the ${config.maxSteps}-step limit. Continue the task to let Teynex resume.`, steps: config.maxSteps };
  }

  private projectContext() {
    try {
      const files = fs.readdirSync(process.cwd()).filter(x => !['.git','node_modules','dist'].includes(x)).slice(0, 80);
      return `Top-level entries: ${files.join(', ')}`;
    } catch { return '(unable to inspect directory)'; }
  }
}
