#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

const ILLEGAL_CHARS = /[\s!@#$%^&*()+={}\[\]|\\:;"'<>~`]/;
const EXTERNAL_LINK_REGEX = /\[([^\]]*)\]\((https?:\/\/[^\)]+)\)/g;
const INTERNAL_LINK_REGEX = /\[([^\]]*)\]\((?!https?:\/\/)([^)]+)\)/g;
const WIKILINK_REGEX = /\[\[([^\]]+)\]\]/g;

function showHelp() {
  console.log(`Usage: check-md.js [OPTIONS] PATHS...

Check Markdown files for broken links and invalid filenames.

PATHS...               One or more directories or files to check
                       (directories are scanned recursively for .md files)

OPTIONS:
  -h, --help            Show this help message
  -v, --verbose         Show detailed progress and statistics

EXAMPLES:
  check-md.js openwiki/
  check-md.js openwiki/ references/
  check-md.js openwiki/notes/file.md
  check-md.js folder-1/ file.md folder-2/`);
}

function decodeUrlSpaces(url) {
  return url.replace(/%20/g, ' ');
}

function validateFilename(filename, issues) {
  const name = path.basename(filename);

  if (ILLEGAL_CHARS.test(name)) {
    const found = name.split('').filter(c => ILLEGAL_CHARS.test(c)).join(' ');
    issues.push(`filename has illegal characters: ${found}`);
  }

  if (!filename.endsWith('.md') && name.includes('.')) {
    issues.push('filename has incorrect extension');
  }
}

function extractLinks(content) {
  const externalLinks = [];
  const internalLinks = [];
  const wikilinks = [];

  let match;

  EXTERNAL_LINK_REGEX.lastIndex = 0;
  while ((match = EXTERNAL_LINK_REGEX.exec(content)) !== null) {
    externalLinks.push({ text: match[1], url: match[2], line: getLineNumber(content, match.index) });
  }

  INTERNAL_LINK_REGEX.lastIndex = 0;
  while ((match = INTERNAL_LINK_REGEX.exec(content)) !== null) {
    internalLinks.push({ text: match[1], path: match[2], line: getLineNumber(content, match.index) });
  }

  WIKILINK_REGEX.lastIndex = 0;
  while ((match = WIKILINK_REGEX.exec(content)) !== null) {
    wikilinks.push({ text: match[1], line: getLineNumber(content, match.index) });
  }

  return { externalLinks, internalLinks, wikilinks };
}

function getLineNumber(content, index) {
  return content.substring(0, index).split('\n').length;
}

function checkExternalLink(url) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    const parsed = new URL(url);

    const req = protocol.request({
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname + parsed.search,
      method: 'HEAD',
      timeout: 5000
    }, (res) => {
      resolve({ status: res.statusCode, valid: res.statusCode >= 200 && res.statusCode < 400 });
    });

    req.on('error', () => resolve({ status: 0, valid: false }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ status: 0, valid: false, timeout: true });
    });

    req.end();
  });
}

async function checkFile(filepath, options) {
  const issues = [];
  const filenameIssues = [];

  validateFilename(filepath, filenameIssues);
  if (filenameIssues.length > 0) {
    for (const issue of filenameIssues) {
      issues.push({ type: 'filename', message: issue });
    }
  }

  const content = fs.readFileSync(filepath, 'utf-8');
  const { externalLinks, internalLinks, wikilinks } = extractLinks(content);

  for (const wikilink of wikilinks) {
    issues.push({
      type: 'wikilink',
      message: `illegal wikilink format: [[${wikilink.text}]]`,
      line: wikilink.line
    });
  }

  const fileDir = path.dirname(filepath);

  for (const link of internalLinks) {
    const decodedPath = decodeUrlSpaces(link.path);
    const targetPath = path.isAbsolute(decodedPath)
      ? decodedPath
      : path.resolve(fileDir, decodedPath);

    if (!fs.existsSync(targetPath)) {
      issues.push({
        type: 'broken-link',
        message: `broken internal link: ${link.path}`,
        line: link.line
      });
    }
  }

  for (const link of externalLinks) {
    const result = await checkExternalLink(link.url);
    if (!result.valid) {
      const msg = result.timeout ? 'timeout' : `HTTP ${result.status}`;
      issues.push({
        type: 'broken-external',
        message: `broken external link: ${link.url} (${msg})`,
        line: link.line
      });
    }
  }

  return { filepath, issues };
}

async function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walkDir(fullPath, callback);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      await callback(fullPath);
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const options = { verbose: false, directories: [] };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '-h' || arg === '--help') {
      showHelp();
      process.exit(0);
    } else if (arg === '-v' || arg === '--verbose') {
      options.verbose = true;
    } else if (!arg.startsWith('-')) {
      options.directories.push(arg);
    }
  }

  if (options.directories.length === 0) {
    console.error('Error: No directories provided. Use -h for help.');
    process.exit(1);
  }

  const allResults = [];
  const fileQueue = [];

  for (const target of options.directories) {
    if (fs.existsSync(target) && fs.statSync(target).isFile()) {
      if (target.endsWith('.md')) {
        fileQueue.push(target);
      }
    } else {
      await walkDir(target, async (filepath) => {
        fileQueue.push(filepath);
      });
    }
  }

  let checkedCount = 0;
  for (const filepath of fileQueue) {
    const result = await checkFile(filepath, options);
    allResults.push(result);

    if (result.issues.length > 0) {
      for (const issue of result.issues) {
        const lineInfo = issue.line ? `:${issue.line}` : '';
        console.log(`${filepath}${lineInfo}: ${issue.message}`);
      }
    } else {
      console.log(`[OK] ${filepath}`);
    }

    checkedCount++;
    if (options.verbose) {
      process.stdout.write(`\rChecked: ${checkedCount}/${fileQueue.length} files...`);
    }
  }

  if (options.verbose) {
    console.log('\n');
  }

  const totalIssues = allResults.reduce((sum, r) => sum + r.issues.length, 0);
  console.log(`\n--- Summary ---`);
  console.log(`Total files checked: ${fileQueue.length}`);
  console.log(`Total issues found: ${totalIssues}`);
  if (totalIssues > 0) {
    console.log(`\n--- Issues ---`);
    for (const result of allResults) {
      if (result.issues.length > 0) {
        for (const issue of result.issues) {
          const lineInfo = issue.line ? `:${issue.line}` : '';
          console.log(`${result.filepath}${lineInfo}: ${issue.message}`);
        }
      }
    }
    process.exit(1);
  } else {
    console.log(`All files passed!`);
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
