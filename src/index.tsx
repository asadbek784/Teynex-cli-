#!/usr/bin/env node

const args = process.argv.slice(2);

if (args.includes('--version') || args.includes('-v')) {
  console.log('teynex 1.1.0');
  process.exit(0);
}

if (args.includes('--help') || args.includes('-h')) {
  console.log(`Teynex AI — terminal coding agent\n\nUsage:\n  teynex                  Start the agent\n  teynex setup            Configure an API key\n  teynex config           Show current provider/model\n  teynex doctor           Check Termux/Node/API setup\n  teynex --auto           Autonomous mode\n  teynex "your task"      Run a task immediately\n`);
  process.exit(0);
}

const command = args[0];
if (command === 'setup') {
  const { setupWizard } = await import('./setup.js');
  await setupWizard();
  process.exit(0);
}
if (command === 'config') {
  const { printConfig } = await import('./setup.js');
  printConfig();
  process.exit(0);
}
if (command === 'doctor') {
  const { getConfig } = await import('./config.js');
  const c = getConfig();
  console.log(`Teynex doctor\n\nNode: ${process.version}\nPlatform: ${process.platform}\nProvider: ${c.provider}\nModel: ${c.model}\nAPI key: ${c.apiKey ? '✓ configured' : '✗ missing'}\nBase URL: ${c.baseUrl}`);
  process.exit(c.apiKey ? 0 : 1);
}

const { getConfig } = await import('./config.js');
if (!getConfig().apiKey) {
  const { setupWizard } = await import('./setup.js');
  await setupWizard();
}

const React = (await import('react')).default;
const { render } = await import('ink');
const { App } = await import('./ui/App.js');

const auto = args.includes('--auto');
const task = args.filter(x => x !== '--auto').join(' ').trim();
render(React.createElement(App, { auto, initialTask: task }));
