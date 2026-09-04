import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { loadConfig, saveConfig } from '../src/config.js';
import { classifyCommand, redactSecrets } from '../src/security.js';
import { detectProject } from '../src/project/projectDetector.js';
import { runCommand } from '../src/tools/shell.js';

test('classifyCommand identifies dangerous commands', () => {
  assert.equal(classifyCommand('rm -rf /tmp/demo'), 'DANGEROUS');
  assert.equal(classifyCommand('npm test'), 'SAFE');
  assert.equal(classifyCommand('git reset --hard'), 'DANGEROUS');
});

test('redactSecrets hides credentials', () => {
  const text = 'Authorization: Bearer abc123\napi_key = "secret-value"';
  const redacted = redactSecrets(text);
  assert.match(redacted, /\[REDACTED\]/);
  assert.doesNotMatch(redacted, /abc123|secret-value/);
});

test('config helpers create settings', () => {
  const root = mkdtempSync(join(tmpdir(), 'tynex-config-'));
  saveConfig({ provider: 'openrouter', model: 'test/model', contextLimit: 16000 }, root);
  const config = loadConfig(root);
  assert.equal(config.provider, 'openrouter');
  assert.equal(config.model, 'test/model');
  assert.equal(config.contextLimit, 16000);
});

test('project detection reads package information', async () => {
  const root = mkdtempSync(join(tmpdir(), 'tynex-project-'));
  writeFileSync(join(root, 'package.json'), JSON.stringify({ name: 'demo', scripts: { test: 'echo ok' } }, null, 2));
  const project = await detectProject(root);
  assert.equal(project.packageManager, 'npm');
  assert.ok(project.isNodeProject);
});

test('shell runner executes safe commands', async () => {
  const result = await runCommand('node -p 1+1');
  assert.equal(result.exitCode, 0);
  assert.match(result.stdout, /2/);
});
