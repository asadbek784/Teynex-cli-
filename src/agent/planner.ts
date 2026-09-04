import type { TaskStep } from '../types.js';

export function buildPlan(prompt: string): TaskStep[] {
  const label = prompt.trim() || 'Analyze the repository';
  return [
    { id: 'inspect', title: 'Inspect repository and project context', status: 'pending' },
    { id: 'identify', title: `Understand the request: ${label}`, status: 'pending' },
    { id: 'edit', title: 'Apply the necessary code fix or update', status: 'pending' },
    { id: 'verify', title: 'Validate behavior with the relevant checks', status: 'pending' },
  ];
}

export function setStepStatus(plan: TaskStep[], id: string, status: TaskStep['status']): TaskStep[] {
  return plan.map((step) => (step.id === id ? { ...step, status } : step));
}

export function summarizePlan(plan: TaskStep[]): string {
  return plan.map((step) => `[${step.status === 'completed' ? '✓' : step.status === 'running' ? '→' : ' '}] ${step.title}`).join('\n');
}
