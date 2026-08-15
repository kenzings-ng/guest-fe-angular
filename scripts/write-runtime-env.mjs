import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputIndex = process.argv.indexOf('--output');
const output = outputIndex === -1 ? resolve(root, 'public/env.js') : resolve(root, process.argv[outputIndex + 1]);

if (outputIndex !== -1 && !process.argv[outputIndex + 1]) {
  throw new Error('Missing path after --output.');
}

function readDotEnv() {
  const file = resolve(root, '.env');
  if (!existsSync(file)) return {};

  return Object.fromEntries(
    readFileSync(file, 'utf8')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const index = line.indexOf('=');
        const key = line.slice(0, index).trim();
        const rawValue = line.slice(index + 1).trim();
        const value =
          (rawValue.startsWith('"') && rawValue.endsWith('"')) ||
          (rawValue.startsWith("'") && rawValue.endsWith("'"))
            ? rawValue.slice(1, -1)
            : rawValue;
        return [key, value];
      }),
  );
}

const fileEnv = readDotEnv();
const apiUrl =
  process.env.API_URL ?? fileEnv.API_URL ?? process.env.APP_URL ?? fileEnv.APP_URL;

if (!apiUrl?.trim()) {
  throw new Error('Missing API_URL. Set API_URL in the environment or .env file.');
}

const content = `// Generated at runtime. Do not edit.\nwindow.__env = { apiUrl: ${JSON.stringify(apiUrl)} };\n`;

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, content);
console.log(`[runtime-config] wrote ${output}`);
