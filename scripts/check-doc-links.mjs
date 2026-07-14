import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const markdownFiles = [];

function collectMarkdownFiles(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      collectMarkdownFiles(fullPath);
    } else if (entry.isFile() && fullPath.endsWith('.md')) {
      markdownFiles.push(fullPath);
    }
  }
}

collectMarkdownFiles(path.join(root, 'docs'));
markdownFiles.push(path.join(root, 'README.md'));

const missing = [];
const markdownLinkPattern = /\]\(([^)]+)\)/g;

for (const filePath of markdownFiles) {
  const source = fs.readFileSync(filePath, 'utf8');
  for (const match of source.matchAll(markdownLinkPattern)) {
    const target = match[1].trim();
    if (/^(?:[a-z]+:|#|\/\/)/i.test(target)) {
      continue;
    }

    const relativePath = target.split('#', 1)[0];
    const resolvedPath = path.resolve(path.dirname(filePath), relativePath);
    if (!fs.existsSync(resolvedPath)) {
      missing.push(path.relative(root, filePath) + ' -> ' + target);
    }
  }
}

if (missing.length > 0) {
  console.error(missing.join('\n'));
  process.exit(1);
}

console.log('Owner docs links OK: ' + markdownFiles.length + ' Markdown files');
