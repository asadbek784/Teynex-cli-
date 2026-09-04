import { EOL } from 'node:os';

export function printBanner(): void {
  console.log('');
  console.log('╭─ TYNEX CLI ───────────────────────────────────────────────╮');
  console.log('│ Autonomous coding agent for terminal workflows             │');
  console.log('╰────────────────────────────────────────────────────────────╯');
  console.log('');
}

export function printUsage(): void {
  console.log('Usage: tynex [options] [prompt]');
  console.log('');
  console.log('Options:');
  console.log('  --prompt, -p  Run a single prompt non-interactively');
  console.log('  --doctor     Run environment and configuration checks');
  console.log('  --config     Display config and provider status');
  console.log('  --json       Emit JSON output');
  console.log('  --help, -h   Display this help message');
  console.log('  --no-color   Disable ANSI colors');
}

export function printStatus(label: string): void {
  console.log(`◉ ${label}`);
}

export function printSuccess(message: string): void {
  console.log(`✓ ${message}`);
}

export function printFailure(message: string): void {
  console.log(`✗ ${message}`);
}

export function printPlan(planText: string): void {
  console.log('');
  console.log('PLAN');
  console.log(planText);
  console.log('');
}

export function printDoctorReport(report: { name: string; ok: boolean; detail: string }[]): void {
  console.log('TYNEX DOCTOR');
  for (const item of report) {
    const prefix = item.ok ? '✓' : '✗';
    console.log(`${prefix} ${item.name}: ${item.detail}`);
  }
}

export function printConfigSummary(config: Record<string, unknown>): void {
  console.log('TYNEX CONFIG');
  for (const [key, value] of Object.entries(config)) {
    if (key.toLowerCase().includes('key')) {
      console.log(`${key}: [REDACTED]`);
    } else {
      console.log(`${key}: ${String(value)}`);
    }
  }
}

export function printResult(summary: string): void {
  console.log('');
  console.log('DONE');
  console.log(summary);
}
