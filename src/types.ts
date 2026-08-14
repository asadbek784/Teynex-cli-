export type Message = { role: 'system' | 'user' | 'assistant' | 'tool'; content: string; name?: string };

export type ToolCall = {
  tool: string;
  args: Record<string, unknown>;
  reason?: string;
};

export type AgentResult = {
  text: string;
  steps: number;
};

export type ApprovalFn = (command: string) => Promise<boolean>;
