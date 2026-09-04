import readline from 'node:readline';
import { getConfig, providerDefaults, saveConfig, type ProviderId } from './config.js';

const PROVIDERS: ProviderId[] = ['openrouter', 'openai', 'groq', 'gemini', 'mistral', 'custom'];

function ask(question: string, hidden = false): Promise<string> {
  if (!hidden) {
    return new Promise(resolve => {
      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
      rl.question(question, answer => { rl.close(); resolve(answer.trim()); });
    });
  }

  return new Promise(resolve => {
    process.stdout.write(question);
    let answer = '';
    const stdin = process.stdin;
    const wasRaw = Boolean(stdin.isRaw);
    stdin.setRawMode?.(true);
    stdin.resume();
    const onData = (chunk: Buffer) => {
      const text = chunk.toString();
      for (const char of text) {
        if (char === '\r' || char === '\n' || char === '\u0004') {
          stdin.setRawMode?.(wasRaw);
          stdin.off('data', onData);
          process.stdout.write('\n');
          resolve(answer);
          return;
        }
        if (char === '\u0003') {
          stdin.setRawMode?.(wasRaw);
          stdin.off('data', onData);
          process.stdout.write('\n');
          resolve('');
          return;
        }
        if (char === '\u007f') {
          if (answer.length) { answer = answer.slice(0, -1); process.stdout.write('\b \b'); }
        } else if (char >= ' ') {
          answer += char;
          process.stdout.write('*');
        }
      }
    };
    stdin.on('data', onData);
  });
}

export async function setupWizard() {
  const current = getConfig();
  console.log('\nTeynex AI setup\n');
  console.log('Choose your API provider:');
  PROVIDERS.forEach((p, i) => console.log(`  ${i + 1}. ${p}`));
  const pick = await ask(`\nProvider [1-${PROVIDERS.length}] (current: ${current.provider}): `);
  const index = Number(pick) - 1;
  const provider = PROVIDERS[index] || current.provider;
  const defaults = providerDefaults(provider);

  const key = await ask(`API key (saved to ${process.env.XDG_CONFIG_HOME || '~/.config'}/teynex/config.json): `, true);
  const apiKey = key || current.apiKey;
  const model = await ask(`Model [${current.model || defaults.model}]: `) || current.model || defaults.model;
  const baseUrl = await ask(`Base URL [${current.baseUrl || defaults.baseUrl}]: `) || current.baseUrl || defaults.baseUrl;

  saveConfig({ provider, apiKey, model, baseUrl });
  console.log(`\n✓ Teynex is configured for ${provider}`);
  console.log(`  model: ${model}`);
  console.log('  Start with: teynex\n');
}

export function printConfig() {
  const c = getConfig();
  console.log(`provider: ${c.provider}`);
  console.log(`model:    ${c.model}`);
  console.log(`base URL: ${c.baseUrl}`);
  console.log(`api key:  ${c.apiKey ? 'configured' : 'missing'}`);
}
