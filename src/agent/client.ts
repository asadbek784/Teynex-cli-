import { getConfig } from '../config.js';
import type { Message } from '../types.js';

export class AIClient {
  constructor(public model = getConfig().model) {}

  async chat(messages: Message[]): Promise<string> {
    const config = getConfig();
    if (!config.apiKey) throw new Error('No API key configured. Run: teynex setup');
    const res = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${config.apiKey}`,
        'HTTP-Referer': 'https://teynex.local',
        'X-Title': 'Teynex AI Agent'
      },
      body: JSON.stringify({ model: this.model, messages, temperature: 0.15 })
    });
    const body = await res.text();
    if (!res.ok) throw new Error(`Provider ${res.status}: ${body.slice(0, 1200)}`);
    const data = JSON.parse(body);
    return data?.choices?.[0]?.message?.content ?? '';
  }
}
