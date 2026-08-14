import React, { useEffect, useState } from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import { TeynexAgent } from '../agent/agent.js';
import { getConfig } from '../config.js';
import * as readline from 'node:readline';

const LOGO = [
'████████████  ███████████  ██   ██ ███████ ██   ██ ███████ ██   ██',
'     ██       ██   ██████  ██   ██ ██      ██   ██ ██      ██   ██',
'     ██       ███████      ███████ █████   ███████ █████   ███████',
'     ██       ██   ██████  ██   ██ ██      ██   ██ ██      ██ ██  ',
'     ██       ███████████  ██   ██ ███████ ██   ██ ███████ ██  ██ '
];

type Line = { kind: 'user'|'agent'|'tool'|'system'; text: string };

export function App({ auto, initialTask = '' }: { auto: boolean; initialTask?: string }) {
  const { exit } = useApp();
  const [input, setInput] = useState('');
  const [lines, setLines] = useState<Line[]>([]);
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState('ready');
  const [model, setModel] = useState(getConfig().model);
  const config = getConfig();

  useEffect(() => {
    setLines([{kind:'system', text:'CLI assistant'}, {kind:'system', text:''}, {kind:'system', text:'Tips:'}, {kind:'system', text:'1. Ask questions, edit files, or run commands.'}, {kind:'system', text:'2. Be specific for the best results.'}, {kind:'system', text:'3. Type /help for more information.'}, {kind:'system', text:''}, {kind:'system', text:'Type /help to get started.'}]);
    if (initialTask) setTimeout(() => void submit(initialTask), 50);
  }, []);

  useInput((ch, key) => {
    if (key.return) { submit(input); return; }
    if (key.backspace || key.delete) { setInput(v => v.slice(0, -1)); return; }
    if (key.ctrl && ch === 'c') { exit(); return; }
    if (ch && !key.ctrl && !key.meta) setInput(v => v + ch);
  });

  const approve = async (command: string) => {
    if (auto || config.autoApprove) return true;
    setLines(v => [...v, {kind:'system', text:`Approve command? ${command} [y/N]` }]);
    return new Promise<boolean>(resolve => {
      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
      rl.question('  > ', answer => { rl.close(); resolve(/^y(es)?$/i.test(answer.trim())); });
    });
  };

  async function submit(raw: string) {
    const text = raw.trim(); if (!text || busy) return;
    setInput('');
    if (text === '/exit' || text === '/quit') { exit(); return; }
    if (text === '/help') { setLines(v => [...v, {kind:'user',text:text},{kind:'system',text:'/help /model /status /clear /exit  —  or type a coding task.'}]); return; }
    if (text === '/clear') { setLines([]); return; }
    if (text === '/status') { setLines(v => [...v,{kind:'user',text},{kind:'system',text:`model=${model} | cwd=${process.cwd()} | maxSteps=${config.maxSteps} | auto=${auto || config.autoApprove}`}]); return; }
    if (text.startsWith('/model ')) { const next=text.slice(7).trim(); if(next) setModel(next); setLines(v=>[...v,{kind:'user',text},{kind:'system',text:`Model set to ${next || model}`}]); return; }
    setLines(v => [...v, {kind:'user',text}, {kind:'tool',text:'Teynex is working…'}]);
    setBusy(true); setStep('starting');
    try {
      const result = await new TeynexAgent(model).run(text, approve, (n,label)=>setStep(`step ${n}: ${label}`));
      setLines(v => [...v, {kind:'agent',text:result.text}, {kind:'system',text:`completed in ${result.steps} step(s)`}]);
    } catch (e) { setLines(v => [...v,{kind:'system',text:`ERROR: ${e instanceof Error ? e.message : String(e)}`}]); }
    finally { setBusy(false); setStep('ready'); }
  }

  return <Box flexDirection="column" paddingX={2} paddingY={1}>
    <Text>teynex:~$</Text>
    <Box flexDirection="column" marginTop={1}>
      {LOGO.map((x,i)=><Text key={i}>{x}</Text>)}
    </Box>
    <Box marginTop={1}><Text>CLI assistant</Text></Box>
    <Text>{'─'.repeat(Math.max(30, Math.min(100, process.stdout.columns ? process.stdout.columns-4 : 80)))}</Text>
    <Box flexDirection="column" marginTop={1}>
      {lines.slice(-18).map((l,i)=><Text key={i}>{l.kind==='user' ? `› ${l.text}` : l.kind==='agent' ? `Teynex: ${l.text}` : l.text}</Text>)}
    </Box>
    <Box marginTop={1}><Text>{busy ? `⟳ ${step}` : 'teynex:~$ '}</Text><Text>{input}</Text><Text>█</Text></Box>
  </Box>;
}
