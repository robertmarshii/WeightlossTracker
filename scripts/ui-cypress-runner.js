#!/usr/bin/env node
/*
 Watches for UI trigger file and runs Cypress headless with JSON reporter.
 Results are written to cypress/results/last.json and cypress/results/status.json
*/
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const projectRoot = process.cwd();
const triggerFile = path.join(projectRoot, 'app', 'frontend', 'test', 'cypress-trigger.json');
// Write status/results into app/frontend/test so the PHP app can read them
const resultsDir = path.join(projectRoot, 'app', 'frontend', 'test');
const lastJson = path.join(resultsDir, 'last.json');
const statusFile = path.join(resultsDir, 'status.json');
const specsFile = path.join(resultsDir, 'specs.json');

function tailFile(filePath, maxBytes = 8192) {
  try {
    if (!fs.existsSync(filePath)) return null;
    const stat = fs.statSync(filePath);
    const start = Math.max(0, stat.size - maxBytes);
    const fd = fs.openSync(filePath, 'r');
    const buf = Buffer.alloc(stat.size - start);
    fs.readSync(fd, buf, 0, buf.length, start);
    fs.closeSync(fd);
    return buf.toString('utf8');
  } catch { return null; }
}

function formatError(err, extra = {}) {
  const e = err || {};
  const details = {
    name: e.name || null,
    message: e.message || String(e),
    code: e.code || null,
    errno: e.errno || null,
    syscall: e.syscall || null,
    path: e.path || null,
    stack: e.stack || null,
    platform: process.platform,
    nodeVersion: process.version,
    cwd: process.cwd(),
    envPathSample: (process.env.PATH || '').split(require('path').delimiter).slice(0, 6),
    ...extra,
  };
  return details;
}

function writeStatus(obj) {
  try {
    if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir, { recursive: true });
    fs.writeFileSync(statusFile, JSON.stringify(obj, null, 2));
  } catch {}
}

function tailFile(filePath, maxBytes = 8192) {
  try {
    if (!fs.existsSync(filePath)) return null;
    const stat = fs.statSync(filePath);
    const start = Math.max(0, stat.size - maxBytes);
    const fd = fs.openSync(filePath, 'r');
    const buf = Buffer.alloc(stat.size - start);
    fs.readSync(fd, buf, 0, buf.length, start);
    fs.closeSync(fd);
    return buf.toString('utf8');
  } catch { return null; }
}

function formatError(err, extra = {}) {
  const e = err || {};
  const details = {
    name: e.name || null,
    message: e.message || String(e),
    code: e.code || null,
    errno: e.errno || null,
    syscall: e.syscall || null,
    path: e.path || null,
    stack: e.stack || null,
    platform: process.platform,
    nodeVersion: process.version,
    cwd: process.cwd(),
    envPathSample: (process.env.PATH || '').split(require('path').delimiter).slice(0, 6),
    ...extra,
  };
  return details;
}

function scanDirRecursive(startDir, filterFn) {
  const out = [];
  try {
    const entries = fs.readdirSync(startDir, { withFileTypes: true });
    for (const ent of entries) {
      const p = path.join(startDir, ent.name);
      if (ent.isDirectory()) out.push(...scanDirRecursive(p, filterFn));
      else if (ent.isFile() && filterFn(p)) out.push(p);
    }
  } catch {}
  return out;
}

function listSpecs() {
  const roots = [
    path.join(projectRoot, 'cypress', 'e2e'),
    path.join(projectRoot, 'cypress', 'e2e_prod'),
  ];
  const specs = [];
  for (const root of roots) {
    const group = root.includes('e2e_prod') ? 'e2e_prod' : 'e2e';
    const files = scanDirRecursive(root, (p) => /\.cy\.js$/i.test(p));
    files.sort();
    for (const abs of files) {
      const rel = path.relative(projectRoot, abs).replace(/\\/g, '/');
      specs.push({ group, path: rel, name: path.basename(rel) });
    }
  }
  return specs;
}

function writeSpecsFile() {
  try {
    if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir, { recursive: true });
    const specs = listSpecs();
    const payload = { updatedAt: new Date().toISOString(), specs };
    fs.writeFileSync(specsFile, JSON.stringify(payload, null, 2));
    return payload;
  } catch (e) {
    return null;
  }
}

function runCypress(specPattern) {
  return new Promise((resolve) => {
    writeStatus({ state: 'running', startedAt: new Date().toISOString(), spec: specPattern });
    if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir, { recursive: true });

    const args = ['run', '--reporter', 'json', '--reporter-options', `output=${lastJson}`];
    if (specPattern && specPattern !== 'all') {
      args.push('--spec', specPattern);
    }

    // Build candidate commands in order of preference:
    // 1) Local Cypress binary under node_modules/.bin
    // 2) npx cypress (works when PATH/npm is available)
    const localBin = process.platform === 'win32'
      ? path.join(projectRoot, 'node_modules', '.bin', 'cypress.cmd')
      : path.join(projectRoot, 'node_modules', '.bin', 'cypress');
    const hasLocal = fs.existsSync(localBin);

    // Prepare logging
    if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir, { recursive: true });
    const runnerLog = path.join(resultsDir, 'runner.log');
    const logStream = fs.createWriteStream(runnerLog, { flags: 'a' });
    const stamp = () => new Date().toISOString();

    // Helper to wire up process and finalize
    const attach = (proc, meta = {}) => {
      proc.stdout && proc.stdout.on('data', (d) => { try { logStream.write(`[${stamp()}] ${d}`); } catch {} });
      proc.stderr && proc.stderr.on('data', (d) => { try { logStream.write(`[${stamp()}] [err] ${d}`); } catch {} });
      proc.on('close', (code) => {
        let summary = { totalTests: 0, totalPassed: 0, totalFailed: 0 };
        try {
          const data = JSON.parse(fs.readFileSync(lastJson, 'utf8'));
          const runs = data.runs || [];
          runs.forEach((r) => {
            (r.tests || []).forEach((t) => {
              summary.totalTests += 1;
              const state = (t.state || '').toLowerCase();
              if (state === 'passed') summary.totalPassed += 1;
              if (state === 'failed') summary.totalFailed += 1;
            });
          });
        } catch {}

        writeStatus({
          state: 'finished',
          finishedAt: new Date().toISOString(),
          exitCode: code,
          spec: specPattern,
          summary,
          debug: {
            runner: meta.runner || 'spawn',
            command: meta.command || null,
            args: meta.args || null,
            lastLogTail: tailFile(runnerLog),
          },
        });
        try { logStream.end(); } catch {}
        resolve();
      });
    };

    // Try using Cypress Node API first to avoid shell spawn issues on Windows
    const tryNodeApi = async () => {
      try {
        const runnerLog = path.join(resultsDir, 'runner.log');
        const logStream = fs.createWriteStream(runnerLog, { flags: 'a' });
        const stamp = () => new Date().toISOString();
        try { logStream.write(`[${stamp()}] Using Cypress Node API\n`); } catch {}
        // Lazy require so environments without dev deps don't break at load time
        const cypress = require('cypress');
        const runOpts = {
          reporter: 'json',
          reporterOptions: { output: lastJson },
        };
        if (specPattern && specPattern !== 'all') {
          runOpts.spec = specPattern;
        }
        const results = await cypress.run(runOpts);
        // Compute summary directly from results to avoid reading file
        const summary = {
          totalTests: (results && typeof results.totalTests === 'number') ? results.totalTests : 0,
          totalPassed: (results && typeof results.totalPassed === 'number') ? results.totalPassed : 0,
          totalFailed: (results && typeof results.totalFailed === 'number') ? results.totalFailed : 0,
        };
        writeStatus({
          state: 'finished',
          finishedAt: new Date().toISOString(),
          exitCode: results ? results.totalFailed : 1,
          spec: specPattern,
          summary,
          debug: {
            runner: 'node-api',
            lastLogTail: tailFile(runnerLog),
          },
        });
        try { logStream.end(); } catch {}
        resolve();
        return true;
      } catch (e) {
        // Node API unavailable or failed; fall back to shell spawn
        try {
          const runnerLog = path.join(resultsDir, 'runner.log');
          const logStream = fs.createWriteStream(runnerLog, { flags: 'a' });
          const stamp = () => new Date().toISOString();
          const details = formatError(e, { runner: 'node-api', phase: 'init-or-run' });
          logStream.write(`[${stamp()}] Cypress Node API failed: ${details.message}\n`);
          // Provide richer error in status while we fall back to spawn
          writeStatus({ state: 'error', message: 'Cypress Node API failed', details });
          try { logStream.end(); } catch {}
        } catch {}
        return false;
      }
    };

    // Try to spawn using shell and a single command string for maximum Windows compatibility
    const trySpawn = () => {
      const makeCmd = (bin, arr) => {
        const esc = (s) => (/[\s"&|><]/.test(s)) ? `"${s.replace(/"/g, '\\"')}"` : s;
        return [esc(bin), ...arr.map(esc)].join(' ');
      };
      const spawnShellCommand = (cmdStr) => {
        if (process.platform === 'win32') {
          // Use cmd.exe explicitly for maximum compatibility
          return spawn('cmd.exe', ['/d', '/s', '/c', cmdStr]);
        }
        // Use bash -lc on POSIX to mimic interactive shell resolution
        return spawn('bash', ['-lc', cmdStr]);
      };

      if (hasLocal) {
        try {
          const cmd = makeCmd(localBin, args);
          const proc = spawnShellCommand(cmd);
          proc.on('error', (err) => {
            const details = formatError(err, { runner: 'spawn', mode: 'local', command: cmd, bin: localBin, args });
            writeStatus({ state: 'error', message: 'Failed to spawn local Cypress', details, debug: { lastLogTail: tailFile(runnerLog) } });
            try { logStream.write(`[${stamp()}] Local spawn error: ${details.message}\n`); } catch {}
          });
          attach(proc, { runner: 'spawn', command: cmd, args });
          return;
        } catch (e) {
          // fall through to npx
          const details = formatError(e, { runner: 'spawn', mode: 'local-prep', bin: localBin, args });
          try { logStream.write(`[${stamp()}] Local cypress spawn threw: ${details.message}\n`); } catch {}
        }
      }

      const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
      try {
        const cmd = makeCmd(npx, ['cypress', ...args]);
        const proc = spawnShellCommand(cmd);
        proc.on('error', (err) => {
          const details = formatError(err, { runner: 'spawn', mode: 'npx', command: cmd, bin: npx, args });
          writeStatus({ state: 'error', message: 'Failed to spawn Cypress via npx', details, debug: { lastLogTail: tailFile(runnerLog) } });
          try { logStream.write(`[${stamp()}] NPX spawn error: ${details.message}\n`); } catch {}
        });
        attach(proc, { runner: 'spawn', command: cmd, args });
      } catch (e) {
        const details = formatError(e, { runner: 'spawn', phase: 'fatal-start' });
        writeStatus({ state: 'error', message: 'Failed to start Cypress', details, debug: { lastLogTail: tailFile(runnerLog) } });
        try { logStream.write(`[${stamp()}] Fatal spawn exception: ${details.message}\n`); } catch {}
        try { logStream.end(); } catch {}
        resolve();
      }
    };

    // Attempt Node API first, then fallback to spawn
    (async () => {
      const ok = await tryNodeApi();
      if (!ok) {
        // Prefer Node API on Windows; only try spawn if explicitly requested via env
        const allowSpawn = process.platform !== 'win32' || process.env.CYPRESS_RUNNER_ALLOW_SPAWN === '1';
        if (allowSpawn) {
          trySpawn();
        } else {
          writeStatus({
            state: 'error',
            message: 'Node API failed and spawn disabled on Windows',
            details: { note: 'Set CYPRESS_RUNNER_ALLOW_SPAWN=1 to enable shell spawn fallback.' },
          });
          resolve();
        }
      }
    })();
  });
}

function readTrigger() {
  try {
    const raw = fs.readFileSync(triggerFile, 'utf8');
    const data = JSON.parse(raw);
    return data;
  } catch {
    return null;
  }
}

function clearTrigger() {
  try { fs.unlinkSync(triggerFile); } catch {}
}

console.log('[ui-cypress-runner] v2 watcher starting. Using Node API fallback.');
console.log('[ui-cypress-runner] Watching for triggers at', triggerFile);
if (!fs.existsSync(path.dirname(triggerFile))) {
  console.error('[ui-cypress-runner] Trigger directory does not exist yet. Create it by opening the UI once.');
}

writeStatus({ state: 'idle' });
// Emit spec list on startup and every 15s
writeSpecsFile();
setInterval(writeSpecsFile, 15000);

let busy = false;
setInterval(async () => {
  if (busy) return;
  const trig = readTrigger();
  if (!trig) return;
  busy = true;
  const spec = trig.spec || 'all';
  console.log('[ui-cypress-runner] Trigger received -> spec:', spec);
  clearTrigger();
  try {
    await runCypress(spec);
  } catch (e) {
    writeStatus({ state: 'error', message: String(e && e.message || e) });
  } finally {
    busy = false;
  }
}, 1000);
